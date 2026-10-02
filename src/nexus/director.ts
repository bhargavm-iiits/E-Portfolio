"use client";
/**
 * The director (MASTER-PROMPT §2.3): one Lenis instance driven by the GSAP ticker. Every tick it
 * maps the scroll position to (chapter, p), scrubs the active chapter's overlay timeline, drives
 * the shared transition cover, then renders the engine — one RAF for everything, no React state per frame.
 */
import gsap from "gsap";
import Lenis from "lenis";
import { rig } from "./rig";
import { STORY, TRANSITIONS, chapterIndex } from "./story";
import { cover } from "./cover";

type ProgressFn = (p: number) => void;
interface Reg { fn: ProgressFn; rest: number }
type ChapterListener = (index: number) => void;

class Director {
  private lenis: Lenis | null = null;
  private offsets: number[] = [];
  private lengths: number[] = [];
  private storyEnd = 0;
  private fns = new Map<string, Reg>();
  private listeners = new Set<ChapterListener>();
  private frameHook: ((time: number, dt: number) => void) | null = null;
  private tick = (time: number, deltaMs: number) => this.update(time, deltaMs / 1000);
  private last = -1;
  private lastY = 0;
  private vhPx = 1;
  private shown = new Map<number, number>();
  private els: (HTMLElement | null)[] = [];
  reduced = false;

  init(reduced: boolean) {
    this.reduced = reduced;
    this.measure();
    if (!reduced) {
      this.lenis = new Lenis({ lerp: 0.075, wheelMultiplier: 0.9, touchMultiplier: 1.4, smoothWheel: true });
      this.lenis.on("scroll", () => undefined);
    }
    gsap.ticker.add(this.tick);
    gsap.ticker.lagSmoothing(0);
    window.addEventListener("resize", this.onResize);
    const hash = location.hash.replace("#", "");
    if (hash && chapterIndex(hash) >= 0) requestAnimationFrame(() => this.go(hash, true));
  }

  destroy() {
    gsap.ticker.remove(this.tick);
    window.removeEventListener("resize", this.onResize);
    this.lenis?.destroy();
    this.lenis = null;
  }

  private onResize = () => {
    this.measure();
    this.lenis?.resize();
  };

  /** Chapter lengths in px from their vh budget (touch devices use 30 vh per reference second → ×0.75). */
  measure() {
    const vh = window.innerHeight / 100, touch = matchMedia("(pointer: coarse)").matches;
    this.vhPx = vh * (touch ? 0.75 : 1);
    this.els = [];
    let y = 0;
    this.offsets = [];
    this.lengths = [];
    for (const c of STORY) {
      const len = c.vh * vh * (touch ? 0.75 : 1);
      this.offsets.push(y);
      this.lengths.push(len);
      y += len;
    }
    this.storyEnd = y;
    const spacer = document.getElementById("nx-story");
    if (spacer) spacer.style.height = `${y + window.innerHeight}px`;
  }

  /** A chapter overlay's scrub callback. In Lite (reduced motion) it is called once with its rest pose. */
  register(id: string, fn: ProgressFn, rest = 0.5) {
    const reg = { fn, rest };
    this.fns.set(id, reg);
    if (this.reduced) fn(rest);
    return () => { if (this.fns.get(id) === reg) this.fns.delete(id); };
  }

  private call(i: number, p: number) {
    const r = this.fns.get(STORY[i].id);
    if (!r) return;
    r.fn(this.reduced ? r.rest : p);
  }

  onChapter(fn: ChapterListener) {
    this.listeners.add(fn);
    fn(rig.chapter);
    return () => this.listeners.delete(fn);
  }

  /** The engine renders inside the same tick, after the rig is updated. */
  setFrameHook(fn: ((time: number, dt: number) => void) | null) {
    this.frameHook = fn;
  }

  private update(time: number, dt: number) {
    this.lenis?.raf(time * 1000);
    const y = this.lenis ? this.lenis.scroll : window.scrollY;
    const v = (y - this.lastY) / Math.max(1, dt * 60);
    this.lastY = y;
    rig.vel += (Math.max(-60, Math.min(60, v)) - rig.vel) * 0.2;
    let i = 0;
    while (i < STORY.length - 1 && y >= this.offsets[i + 1]) i++;
    const p = Math.min(1, Math.max(0, (y - this.offsets[i]) / this.lengths[i]));
    rig.outro = Math.min(1, Math.max(0, (y - this.storyEnd) / window.innerHeight));
    if (i !== this.last) {
      const prev = this.last;
      if (prev >= 0 && Math.abs(prev - i) > 1) { rig.p[prev] = prev < i ? 1 : 0; this.call(prev, rig.p[prev]); }
      this.last = i;
      rig.chapter = i;
      cover.reset();
      this.listeners.forEach((fn) => fn(i));
    }
    rig.p[i] = p;
    // transition window around the nearest boundary (Docs/plan.md §4.3: nothing cuts)
    const tr = rig.trans;
    tr.on = false;
    const win = (b: number) => {
      const d = TRANSITIONS[STORY[b].id];
      if (!d) return null;
      const lo = this.offsets[b] - d.before * this.vhPx, hi = this.offsets[b] + d.after * this.vhPx;
      return y > lo && y < hi ? { d, t: (y - lo) / (hi - lo) } : null;
    };
    const w = (i > 0 && win(i)) || (i < STORY.length - 1 && win(i + 1)) || null;
    if (w) {
      const b = i > 0 && win(i) ? i : i + 1, a = b - 1;
      tr.on = true; tr.a = a; tr.b = b; tr.t = w.t; tr.mode = w.d.mode; tr.dip = w.d.dip ?? [0, 0, 0];
      tr.pa = Math.min(1, Math.max(0, (y - this.offsets[a]) / this.lengths[a]));
      tr.pb = Math.min(1, Math.max(0, (y - this.offsets[b]) / this.lengths[b]));
      rig.p[a] = tr.pa; rig.p[b] = tr.pb;
      this.call(a, tr.pa);
      this.call(b, tr.pb);
    } else {
      this.call(i, p);
    }
    this.fadeOverlays(i);
    this.frameHook?.(time, Math.min(dt, 0.1));
  }

  /** Crossfade chapter overlays across the transition window (outgoing fades before the midpoint, incoming after). */
  private fadeOverlays(i: number) {
    const tr = rig.trans, want = new Map<number, number>();
    const sm = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    if (tr.on) { want.set(tr.a, 1 - sm(0.12, 0.5, tr.t)); want.set(tr.b, sm(0.5, 0.88, tr.t)); }
    else want.set(i, 1);
    for (const [k] of this.shown) if (!want.has(k)) this.styleOverlay(k, 0);
    for (const [k, o] of want) this.styleOverlay(k, o);
    this.shown = want;
  }

  private styleOverlay(i: number, o: number) {
    let el = this.els[i];
    if (el === undefined || (el && !el.isConnected)) { el = document.querySelector<HTMLElement>(`[data-ch="${STORY[i].id}"]`); this.els[i] = el; }
    if (!el) return;
    const v = Math.round(o * 1000) / 1000;
    if (el.dataset.o === String(v)) return;
    el.dataset.o = String(v);
    el.style.opacity = String(v);
    el.style.visibility = v > 0.002 ? "visible" : "hidden";
  }

  /** Scroll to a chapter (optionally to progress p within it). */
  go(id: string, immediate = false, p = 0) {
    const i = chapterIndex(id);
    if (i < 0) return;
    const target = this.offsets[i] + this.lengths[i] * p + 1;
    if (this.lenis) this.lenis.scrollTo(target, { immediate, duration: immediate ? 0 : 1.6, easing: (t: number) => 1 - Math.pow(1 - t, 3) });
    else window.scrollTo({ top: target, behavior: immediate ? "auto" : "smooth" });
  }

  /** Scroll to the normal-flow content after the story (Comms). */
  goEnd(immediate = false) {
    const el = document.getElementById("comms");
    if (!el) return;
    if (this.lenis) this.lenis.scrollTo(el, { immediate, duration: 1.6 });
    else el.scrollIntoView({ behavior: immediate ? "auto" : "smooth" });
  }

  /** ENTER THE NEXUS: autoplay at the reference pace (40 vh per reference second) until Home. */
  autoplay() {
    const i = chapterIndex("home");
    const target = this.offsets[i] + 1;
    const y = this.lenis ? this.lenis.scroll : window.scrollY;
    const secs = Math.max(2, (target - y) / ((window.innerHeight / 100) * 40));
    if (this.lenis) this.lenis.scrollTo(target, { duration: secs, easing: (t: number) => t });
    else window.scrollTo({ top: target, behavior: "smooth" });
  }

  get scrollY() {
    return this.lenis ? this.lenis.scroll : window.scrollY;
  }
}

export const director = new Director();
