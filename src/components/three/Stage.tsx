"use client";
/**
 * The single fixed canvas behind the page (aria-hidden decoration). It renders
 * only while one of its windows (hero, contact band, briefing evidence) is on
 * screen, driven from GSAP's ticker right after Lenis updates the scroll, so
 * the 3D never lags its section by a frame. Under reduced motion it renders
 * only when something changes. Device tiers scale DPR, mirrors, mist and post;
 * PerformanceMonitor lowers DPR on sustained drops. Every shader is compiled
 * up front so scrolling between worlds never hitches.
 */
import { useCallback, useEffect, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { rig } from "@/lib/rig";
import { store, useNexus } from "@/lib/store";
import { windows } from "@/lib/windows";
import { TIERS } from "@/config/quality";
import { precompile, view } from "./view";
import WindowRig from "./WindowRig";
import LightRig from "./LightRig";
import Effects, { composerMaterials } from "./Effects";
import HeroWorld from "./hero/HeroWorld";
import { compileCity } from "./hero/SkyCity";
import CommsWorld from "./comms/CommsWorld";
import BriefWorld from "./brief/BriefWorld";
import { loadExplorer } from "./shared/Explorer";

function anyWindow() {
  if (store.get().briefing) return Boolean(windows.rect("brief"));
  return windows.coverage("hero") > 0 || windows.coverage("comms") > 0;
}

/** Copies the rendered briefing window into its mirror canvas (same task, before the buffer is presented). */
function copyMirror(src: HTMLCanvasElement) {
  const dst = windows.mirror("brief");
  const r = windows.rect("brief");
  if (!dst || !r || !src.clientWidth) return;
  const k = src.width / src.clientWidth;
  const w = Math.max(1, Math.round(r.width * k));
  const h = Math.max(1, Math.round(r.height * k));
  if (dst.width !== w || dst.height !== h) {
    dst.width = w;
    dst.height = h;
  }
  dst.getContext("2d")?.drawImage(src, r.left * k, r.top * k, r.width * k, r.height * k, 0, 0, w, h);
}

/** Frame driver: GSAP ticker → R3F advance (frameloop "never"). */
function Loop({ enabled }: { enabled: boolean }) {
  const advance = useThree((s) => s.advance);
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    if (!enabled) return;
    let sig = "";
    const off = store.subscribe(() => (view.dirty = true));
    const onResize = () => (view.dirty = true);
    window.addEventListener("resize", onResize);
    const tick = (time: number) => {
      if (!anyWindow()) return;
      const s = store.get();
      if (s.reduced) {
        const r = windows.rect(s.briefing ? "brief" : windows.coverage("hero") >= windows.coverage("comms") ? "hero" : "comms");
        const now = r ? `${r.left|0},${r.top|0},${r.width|0},${r.height|0}` : "";
        if (now === sig && !view.dirty) return;
        sig = now;
        view.dirty = false;
      }
      advance(time, true);
      if (view.active === "brief") copyMirror(gl.domElement);
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      off();
      window.removeEventListener("resize", onResize);
    };
  }, [enabled, advance, gl]);
  return null;
}

function Precompile({ onDone, offscreen }: { onDone: () => void; offscreen: boolean }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    let cancelled = false;
    const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms));
    const run = async () => {
      // The explorer's materials should compile with everything else.
      await Promise.race([loadExplorer().catch(() => null), wait(6000)]);
      await wait(60);
      if (cancelled) return;
      precompile.active = true;
      const hidden: THREE.Object3D[] = [];
      scene.traverse((o) => {
        if (!o.visible) {
          hidden.push(o);
          o.visible = true;
        }
      });
      // Programs are keyed by their output: compile the variants actually used —
      // into the composer's linear target (post on) and into the city's target.
      const probe = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType });
      const prev = gl.getRenderTarget();
      gl.setRenderTarget(offscreen ? probe : null);
      const main = gl.compileAsync(scene, camera);
      gl.setRenderTarget(probe);
      const city = compileCity(gl);
      // the composer's own passes (bloom chain, merged effect pass) on full-screen quads
      const passScene = new THREE.Scene();
      const quad = new THREE.PlaneGeometry(2, 2);
      for (const m of composerMaterials()) passScene.add(new THREE.Mesh(quad, m));
      const passes = passScene.children.length ? gl.compileAsync(passScene, camera) : Promise.resolve();
      gl.setRenderTarget(prev);
      probe.dispose();
      const jobs = [main, city, passes];
      hidden.forEach((o) => (o.visible = false));
      precompile.active = false;
      try {
        await Promise.race([Promise.all(jobs), wait(8000)]);
      } catch {
        /* compile errors surface in the console; keep going */
      }
      // three builds each program's uniform / attribute tables lazily on first draw
      // (one synchronous query per uniform); build them now, a few per task.
      const programs = (gl.info.programs ?? []) as unknown as { getUniforms: () => unknown; getAttributes: () => unknown }[];
      for (let i = 0; i < programs.length && !cancelled; i++) {
        programs[i].getUniforms();
        programs[i].getAttributes();
        if (i % 3 === 2) await wait(0);
      }
      if (cancelled) return;
      view.dirty = true;
      onDone();
      store.set({ webgl: "ok" });
    };
    const id = window.setTimeout(run, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [gl, scene, camera, onDone, offscreen]);
  return null;
}

function ExposureSync() {
  const gl = useThree((s) => s.gl);
  useFrame(() => {
    gl.toneMappingExposure = rig.exposure;
  });
  return null;
}

/** Run n when the main thread is idle (bounded), so heavy mounts land in separate tasks. */
function whenIdle(fn: () => void, timeout = 400) {
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
  if (w.requestIdleCallback) {
    const id = w.requestIdleCallback(fn, { timeout });
    return () => w.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(fn, 60);
  return () => window.clearTimeout(id);
}

export default function Stage() {
  const tierName = useNexus((s) => s.tier);
  const tier = TIERS[tierName];
  const [dpr, setDpr] = useState(tier.dpr[1]);
  const [compiled, setCompiled] = useState(false);
  const onCompiled = useCallback(() => setCompiled(true), []);
  // Mount the worlds one per task (hero, contact band, briefing dioramas), then\n  // pre-compile everything.
  const [phase, setPhase] = useState(0);
  const DONE = 3;
  useEffect(() => {
    if (phase >= DONE) return;
    return whenIdle(() => setPhase((p) => p + 1));
  }, [phase]);

  return (
    <Canvas
      dpr={[tier.dpr[0], dpr]}
      gl={{ antialias: tier.antialias, powerPreference: "high-performance", stencil: false, alpha: false }}
      camera={{ fov: 30, near: 0.1, far: 1400, position: [0, 2.4, 14] }}
      frameloop="never"
      onCreated={({ gl }) => {
        // The first-use error check calls getProgramParameter, which blocks the main
        // thread until each program links; keep it for development only.
        gl.debug.checkShaderErrors = process.env.NODE_ENV !== "production";
        gl.setClearColor("#030910");
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1;
      }}
    >
      <Loop enabled={compiled} />
      <PerformanceMonitor
        flipflops={4}
        onDecline={() => setDpr((d) => Math.max(tier.dpr[0], d - 0.25))}
        onIncline={() => setDpr((d) => Math.min(tier.dpr[1], d + 0.25))}
        onFallback={() => setDpr(tier.dpr[0])}
      />
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={1.6} position={[0, 6, -4]} scale={[12, 2, 1]} color="#cfe0ff" />
        <Lightformer form="rect" intensity={2.4} position={[6, 1, 2]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} color="#4bdcfd" />
        <Lightformer form="rect" intensity={2.4} position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} color="#8b6cff" />
        <Lightformer form="ring" intensity={1.2} position={[0, 0, -8]} scale={4} color="#dff2ff" />
      </Environment>

      <WindowRig />
      <LightRig />
      <HeroWorld tier={tier} />
      {phase >= 1 && <CommsWorld tier={tier} />}
      {phase >= 2 && <BriefWorld segments={tier.terrainSegments} />}

      {tier.postfx ? <Effects tier={tier} /> : <ExposureSync />}
      {phase >= DONE && <Precompile onDone={onCompiled} offscreen={tier.postfx} />}
    </Canvas>
  );
}
