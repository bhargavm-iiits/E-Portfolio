/**
 * The NEXUS engine: one WebGL renderer behind all DOM and the chapter worlds.
 * Two world composers (A, B) each render a world with its own bloom into an HDR buffer; a final
 * TransitionPass blends them by the scroll-scrubbed rig.trans.t, then tone-maps (OutputPass).
 * Outside a transition window only A renders and the blend is a straight copy.
 * The render loop only reads the rig (written by the director) — no React state per frame.
 * Worlds are built lazily (current + next), shaders are pre-compiled off the critical path,
 * and worlds far behind are disposed.
 */
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { rig } from "../rig";
import { STORY, type WorldId } from "../story";
import type { World, WorldContext, FrameCtx } from "./types";
import { transitionMaterial } from "./transition";
import { buildGate } from "./worlds/gate";
import { buildEntry } from "./worlds/entry";
import { buildCity } from "./worlds/city";
import { buildHome } from "./worlds/home";
import { buildSpace } from "./worlds/space";
import { buildLab } from "./worlds/lab";
import { buildTerrain } from "./worlds/terrain";
import { buildCinema } from "./worlds/cinema";
import { buildHangar } from "./worlds/hangar";
import { buildLog } from "./worlds/log";

const BUILDERS: Record<WorldId, (ctx: WorldContext) => World> = {
  gate: buildGate,
  entry: buildEntry,
  hub: (c) => buildCity(c, "hub"),
  warp: (c) => buildCity(c, "warp"),
  home: buildHome,
  space: buildSpace,
  lab: buildLab,
  terrain: buildTerrain,
  cinema: buildCinema,
  hangar: buildHangar,
  log: buildLog,
};
const WITH_CHARACTER: WorldId[] = ["gate", "home", "log"];

/** QA hook: timings land in window.__perf only when a test page has created that array. */
const trace = (msg: string) => (globalThis as { __perf?: string[] }).__perf?.push(msg);

export interface EngineOptions {
  quality: "high" | "low";
  /** DOM element that receives published CSS custom properties (screen anchors). */
  anchorTarget: HTMLElement;
  onProgress?: (p: number) => void;
}

/** One world → HDR buffer: background pass, optional foreground layer (depth-cleared), bloom. */
class WorldComposer {
  readonly composer: EffectComposer;
  private bg: RenderPass;
  private fg: RenderPass;
  private bloom: UnrealBloomPass;
  constructor(renderer: THREE.WebGLRenderer) {
    this.composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType }));
    this.composer.renderToScreen = false;
    const dummy = new THREE.Scene(), cam = new THREE.PerspectiveCamera();
    this.bg = new RenderPass(dummy, cam);
    this.fg = new RenderPass(dummy, cam);
    this.fg.clear = false;
    this.fg.clearDepth = true;
    this.fg.enabled = false;
    this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.6, 0.4, 0.8);
    this.composer.addPass(this.bg);
    this.composer.addPass(this.fg);
    this.composer.addPass(this.bloom);
  }
  /** Renders the world; none of the passes swap, so the result stays in readBuffer. */
  render(world: World, dt: number) {
    this.bg.scene = world.scene;
    this.bg.camera = world.camera;
    if (world.fg) { this.fg.enabled = true; this.fg.scene = world.fg.scene; this.fg.camera = world.fg.camera; }
    else this.fg.enabled = false;
    this.bloom.strength = world.bloom.strength;
    this.bloom.radius = world.bloom.radius;
    this.bloom.threshold = world.bloom.threshold;
    this.composer.render(dt);
    return this.composer.readBuffer.texture;
  }
  setSize(w: number, h: number, dpr: number) { this.composer.setPixelRatio(dpr); this.composer.setSize(w, h); }
  dispose() { this.composer.dispose(); this.bloom.dispose(); }
}

export class Engine {
  readonly renderer: THREE.WebGLRenderer;
  private compA: WorldComposer;
  private compB: WorldComposer;
  private final: EffectComposer;
  private blend = transitionMaterial();
  /** Tiny HDR target for warm-up draws (same program variant as the world composers). */
  /** True while a world is posed for warm-up: its screen anchors must not reach the DOM. */
  private muted = false;
  private warmRT = new THREE.WebGLRenderTarget(16, 16, { type: THREE.HalfFloatType });
  private worlds = new Map<WorldId, World>();
  private character: THREE.Object3D | null = null;
  private ctx: WorldContext;
  private size = { w: 1, h: 1 };
  private dpr = 1;
  private maxDpr: number;
  private frameTimes: number[] = [];
  private lastBuildCheck = -1;
  private disposed = false;
  private building = false;

  constructor(private canvas: HTMLCanvasElement, private opts: EngineOptions) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: opts.quality === "high", powerPreference: "high-performance", alpha: false, stencil: false });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // shader status checks are synchronous GPU round-trips; keep them for development only
    this.renderer.debug.checkShaderErrors = process.env.NODE_ENV !== "production";
    this.maxDpr = opts.quality === "high" ? 1.5 : 1;
    this.dpr = Math.min(window.devicePixelRatio || 1, this.maxDpr);
    this.renderer.setPixelRatio(this.dpr);
    this.compA = new WorldComposer(this.renderer);
    this.compB = new WorldComposer(this.renderer);
    this.final = new EffectComposer(this.renderer, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType }));
    this.final.addPass(new ShaderPass(this.blend));
    this.final.addPass(new OutputPass());
    const anchors = opts.anchorTarget;
    this.ctx = {
      renderer: this.renderer,
      character: () => this.character,
      quality: opts.quality,
      publish: (vars) => { if (!this.muted) for (const k in vars) anchors.style.setProperty(k, vars[k]); },
    };
  }

  /** Builds the first world, loads the character; resolves when the Gate can be shown. */
  async init() {
    this.resize();
    this.opts.onProgress?.(0.1);
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    const charUrl = this.opts.quality === "high" ? "/nexus/character.glb" : "/nexus/character-lite.glb";
    const charP = loader.loadAsync(charUrl, (e) => { if (e.total) this.opts.onProgress?.(0.1 + 0.6 * (e.loaded / e.total)); }).then((g) => {
      this.character = g.scene;
      for (const [id, w] of this.worlds) if (WITH_CHARACTER.includes(id)) w.attachCharacter?.(g.scene);
    }).catch(() => { /* the worlds render without the player */ });
    const gate = this.ensure("gate");
    await this.renderer.compileAsync(gate.scene, gate.camera).catch(() => undefined);
    this.opts.onProgress?.(0.75);
    await charP;
    await this.prepare("gate", gate);
    // first full frame (world composer, bloom, blend, output) before the Boot screen lifts
    this.frameInner(0, 1 / 60);
    this.opts.onProgress?.(1);
    rig.ready = true;
  }

  private ensure(id: WorldId): World {
    let w = this.worlds.get(id);
    if (!w) {
      const t0 = performance.now();
      w = BUILDERS[id](this.ctx);
      trace(`build ${id} ${(performance.now() - t0).toFixed(0)}ms`);
      w.resize(this.size.w, this.size.h);
      if (this.character && WITH_CHARACTER.includes(id)) w.attachCharacter?.(this.character);
      this.worlds.set(id, w);
    }
    return w;
  }

  /**
   * Make a world's first on-screen frames cheap. Shader programs depend on the render target (tone
   * mapping / output colour space differ between the canvas and the HDR buffers the world composers
   * draw into) and on the lights visible at draw time, so: pose the world as each chapter it serves
   * at p = 0 / .5 / 1, compile that pose against an HDR target in parallel (KHR_parallel_shader_compile),
   * then draw it offscreen, one pose per frame — that builds the exact program
   * variants and uploads textures and buffers. Without this, the first frame of a chapter compiled
   * synchronously (0.2–1.2 s freezes).
   */
  private async prepare(id: WorldId, w: World) {
    const alive = () => !this.disposed && this.worlds.get(id) === w;
    const frame = () => new Promise<void>((res) => requestAnimationFrame(() => res()));
    const poses: Array<[number, number]> = [];
    STORY.forEach((c, i) => { if (c.world === id) for (const p of [0, 0.5, 1]) poses.push([i, p]); });
    for (const [idx, p] of poses) {
      await frame();
      if (!alive()) return;
      this.pose(w, idx, p);
      await this.compile(w);
      await frame();
      if (!alive()) return;
      this.warm(w, idx, p);
    }
  }

  /** Parallel (non-blocking) compile of the program variants the world needs as currently posed, for HDR targets. */
  private compile(w: World) {
    const r = this.renderer, prev = r.getRenderTarget();
    r.setRenderTarget(this.warmRT);
    const jobs = [r.compileAsync(w.scene, w.camera)];
    if (w.fg) jobs.push(r.compileAsync(w.fg.scene, w.fg.camera));
    r.setRenderTarget(prev);
    return Promise.all(jobs).catch(() => undefined);
  }

  /** Pose a world as chapter `idx` at progress p without publishing its screen anchors. */
  private pose(w: World, idx: number, p: number) {
    this.muted = true;
    try { w.update(this.ctxFor(idx, p, performance.now() / 1000, 0)); } finally { this.muted = false; }
  }

  private warm(w: World, idx: number, p: number) {
    const culled: THREE.Object3D[] = [];
    this.pose(w, idx, p);
    // objects outside this pose's view would otherwise upload on their first real frame
    const uncull = (o: THREE.Object3D) => { if (o.frustumCulled) { o.frustumCulled = false; culled.push(o); } };
    w.scene.traverse(uncull);
    w.fg?.scene.traverse(uncull);
    // through the B composer at full size: the exact path a transition uses (the driver does
    // size/target-specific work on first use that a tiny target does not cover). B is only read
    // during a transition, and every transition frame re-renders it before the blend.
    try {
      this.compB.render(w, 0);
    } finally {
      for (const o of culled) o.frustumCulled = true;
    }
  }

  /** Keep the worlds of the neighbouring chapters built (story order, not world order: `space` recurs) and drop the rest. */
  private manage(chapter: number) {
    if (chapter === this.lastBuildCheck || this.building) return;
    this.lastBuildCheck = chapter;
    const near = (r: number) => new Set(STORY.slice(Math.max(0, chapter - r), chapter + r + 1).map((c) => c.world));
    const keep = near(2);
    for (const [id, w] of this.worlds) if (!keep.has(id)) { w.dispose(); this.worlds.delete(id); }
    // the next two chapters' worlds first (a short chapter must not be the only warm-up window), then the previous one
    const next = [STORY[chapter + 1]?.world, STORY[chapter + 2]?.world, STORY[chapter - 1]?.world].find((id) => id && !this.worlds.has(id));
    if (next) {
      this.building = true;
      const run = () => {
        if (this.disposed) return;
        const w = this.ensure(next);
        const t0 = performance.now();
        this.prepare(next, w).finally(() => {
          trace(`prepared ${next} in ${(performance.now() - t0).toFixed(0)}ms`);
          this.building = false;
          this.lastBuildCheck = -1;
        });
      };
      const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
      if (ric) ric(run, { timeout: 600 }); else setTimeout(run, 60);
    }
  }

  resize() {
    const w = Math.max(1, this.canvas.clientWidth), h = Math.max(1, this.canvas.clientHeight);
    this.size = { w, h };
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setSize(w, h, false);
    this.compA.setSize(w, h, this.dpr);
    this.compB.setSize(w, h, this.dpr);
    this.final.setPixelRatio(this.dpr);
    this.final.setSize(w, h);
    this.blend.uniforms.uAspect.value = w / h;
    for (const wld of this.worlds.values()) wld.resize(w, h);
  }

  /** One frame: called from the GSAP ticker after the director has updated the rig. */
  frame(time: number, dt: number) {
    if (this.disposed || !rig.ready) return;
    const t0 = performance.now();
    try { this.frameInner(time, dt); } finally {
      const ms = performance.now() - t0;
      if (ms > 40) trace(`frame ${ms.toFixed(0)}ms ch=${STORY[rig.chapter].id} trans=${rig.trans.on ? `${STORY[rig.trans.a].id}>${STORY[rig.trans.b].id}` : "-"}`);
    }
  }

  private frameInner(time: number, dt: number) {
    const ch = rig.chapter;
    this.manage(ch);
    rig.pointer.x += (rig.pointer.tx - rig.pointer.x) * Math.min(1, dt * 4);
    rig.pointer.y += (rig.pointer.ty - rig.pointer.y) * Math.min(1, dt * 4);
    const u = this.blend.uniforms;
    const tr = rig.trans;
    // a transition only blends when both worlds are built (neighbours are prebuilt on idle)
    const live = tr.on && this.worlds.has(STORY[tr.a].world) && this.worlds.has(STORY[tr.b].world);
    if (!live) {
      const world = this.ensure(STORY[ch].world);
      world.update(this.ctxFor(ch, rig.p[ch], time, dt));
      u.tA.value = this.compA.render(world, dt);
      u.uMode.value = 0;
      u.uEA.value = world.exposure;
    } else {
      // render the chapter that is losing the screen first, so the dominant one publishes its anchors last
      const domIsB = tr.t >= 0.5;
      const wa = this.ensure(STORY[tr.a].world), wb = this.ensure(STORY[tr.b].world);
      const order: Array<["a" | "b", World, number, number]> = domIsB
        ? [["a", wa, tr.a, tr.pa], ["b", wb, tr.b, tr.pb]]
        : [["b", wb, tr.b, tr.pb], ["a", wa, tr.a, tr.pa]];
      let first = true;
      for (const [slot, w, idx, p] of order) {
        // one world can serve both chapters (Vault → Finale): it is re-posed per render, spin/lerps advance once
        const sameWorld = wa === wb;
        w.update(this.ctxFor(idx, p, time, sameWorld && !first ? 0 : dt));
        const tex = (slot === "a" ? this.compA : this.compB).render(w, dt);
        if (slot === "a") { u.tA.value = tex; u.uEA.value = w.exposure; }
        else { u.tB.value = tex; u.uEB.value = w.exposure; }
        first = false;
      }
      u.uMode.value = tr.mode;
      u.uT.value = tr.t;
      (u.uDip.value as THREE.Vector3).set(tr.dip[0], tr.dip[1], tr.dip[2]);
    }
    this.renderer.toneMappingExposure = 1;
    this.final.render(dt);
    this.adapt(dt);
  }

  private ctxFor(idx: number, p: number, time: number, dt: number): FrameCtx {
    return { chapter: STORY[idx].id, p, time, dt, vel: rig.vel, pointer: rig.pointer, menuYaw: rig.menuYaw, width: this.size.w, height: this.size.h };
  }

  /**
   * Drop the pixel ratio when frames average > 22 ms over ~2 s (§12). Raising it again needs five
   * good windows in a row: every change reallocates all render targets (a hitch of its own), so the
   * ratio must not flip-flop.
   */
  private goodWindows = 0;
  private adapt(dt: number) {
    this.frameTimes.push(dt);
    if (this.frameTimes.length < 120) return;
    const avg = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    this.frameTimes = [];
    if (avg > 0.022 && this.dpr > 0.75) { this.goodWindows = 0; this.dpr = Math.max(0.75, this.dpr - 0.25); this.resize(); return; }
    this.goodWindows = avg < 0.012 ? this.goodWindows + 1 : 0;
    if (this.goodWindows >= 5 && this.dpr < Math.min(window.devicePixelRatio || 1, this.maxDpr)) { this.goodWindows = 0; this.dpr = Math.min(this.maxDpr, this.dpr + 0.25); this.resize(); }
  }

  dispose() {
    this.disposed = true;
    for (const w of this.worlds.values()) w.dispose();
    this.worlds.clear();
    this.compA.dispose();
    this.compB.dispose();
    this.final.dispose();
    this.blend.dispose();
    this.warmRT.dispose();
    this.renderer.dispose();
  }
}
