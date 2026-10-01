"use client";
/**
 * The director: page motion for the NEXUS layout.
 *
 * - Ordinary document scrolling (Lenis smoothing in full motion, native under
 *   reduced motion). No sticky stages: the default reading view stays quiet.
 * - The hero's scroll progress feeds a gentle camera dolly (`rig.heroScroll`).
 * - `navigate()` scrolls to a section below the fixed header and moves focus.
 * - ENTER THE NEXUS is an optional, skippable entry with explicit states
 *   (idle → activating → approaching → crossing → arrived; Docs/Game §6):
 *   emitters energise, the camera approaches the aperture along the
 *   explorer–spire axis, crosses into the city seen through it, and the page
 *   arrives at the missions with focus on their heading. Esc / SKIP jumps to
 *   the arrival; reduced motion goes there directly.
 */
import gsap from "gsap";
import Lenis from "lenis";
import { rig } from "./rig";
import { store, type EntryState } from "./store";

type Handler = () => void;
type DirectorEvent = "entry" | "arrive";

const HERO_REST = { emit: 0.35, glow: 0.25, sparks: 0, entry: 0, cityPush: 0, exposure: 1, radial: 0 };

class Director {
  private lenis: Lenis | null = null;
  private reduced = false;
  private cleanup: (() => void)[] = [];
  private entryTl: gsap.core.Timeline | null = null;
  private handlers = new Map<DirectorEvent, Set<Handler>>();

  /* ── lifecycle ── */

  init(reduced: boolean) {
    this.destroy();
    this.reduced = reduced;
    if (!reduced) {
      this.lenis = new Lenis({ lerp: 0.12, smoothWheel: true, wheelMultiplier: 0.95 });
      const raf = (time: number) => this.lenis?.raf(time * 1000);
      // Prioritised: scroll updates before the 3D stage renders in the same tick.
      gsap.ticker.add(raf, false, true);
      gsap.ticker.lagSmoothing(0);
      this.cleanup.push(() => gsap.ticker.remove(raf));
    }
    const onScroll = () => this.trackHero();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    this.cleanup.push(() => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    });
    this.trackHero();
  }

  destroy() {
    this.cleanup.forEach((fn) => fn());
    this.cleanup = [];
    this.entryTl?.kill();
    this.entryTl = null;
    this.lenis?.destroy();
    this.lenis = null;
    Object.assign(rig, HERO_REST);
  }

  on(event: DirectorEvent, fn: Handler) {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(fn);
    return () => this.handlers.get(event)?.delete(fn);
  }

  private emit(event: DirectorEvent) {
    this.handlers.get(event)?.forEach((fn) => fn());
  }

  get isReduced() {
    return this.reduced;
  }

  /* ── scroll ── */

  private trackHero() {
    const hero = document.getElementById("world");
    if (!hero) return;
    const h = hero.offsetHeight || window.innerHeight;
    rig.heroScroll = this.reduced ? 0 : Math.min(1, Math.max(0, window.scrollY / h));
  }

  private headerOffset() {
    const header = document.getElementById("site-header");
    return (header?.offsetHeight ?? 0) + 8;
  }

  /** Freeze page scroll while a dialog or the entry is active. */
  lock(on: boolean) {
    if (on) {
      this.lenis?.stop();
      document.documentElement.classList.add("is-locked");
    } else {
      this.lenis?.start();
      document.documentElement.classList.remove("is-locked");
    }
  }

  /** Scroll to a section (or element) below the fixed header, optionally focusing its heading. */
  navigate(target: string | HTMLElement, opts: { focus?: boolean; immediate?: boolean } = {}) {
    const el = typeof target === "string" ? document.getElementById(target.replace(/^#/, "")) : target;
    if (!el) return;
    const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY - (el.id === "world" ? 0 : this.headerOffset()));
    const focus = () => {
      if (!opts.focus) return;
      const heading = el.querySelector<HTMLElement>("h1, h2, h3") ?? el;
      if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    };
    if (this.reduced || !this.lenis || opts.immediate) {
      this.lenis?.scrollTo(top, { immediate: true, force: true });
      window.scrollTo({ top, behavior: "auto" });
      focus();
      return;
    }
    const distance = Math.abs(top - window.scrollY);
    this.lenis.scrollTo(top, {
      duration: Math.min(1.6, 0.6 + distance / 2600),
      easing: (x) => 1 - Math.pow(1 - x, 3),
      onComplete: focus,
    });
  }

  /* ── ENTER THE NEXUS ── */

  private setEntry(entry: EntryState) {
    store.set({ entry });
    document.documentElement.dataset.entry = entry;
  }

  playEntry() {
    if (store.get().entry !== "idle") return; // no duplicate starts
    if (this.reduced || store.get().webgl !== "ok") {
      this.navigate("#missions", { focus: true });
      return;
    }
    const veil = document.getElementById("entry-veil");
    const copy = document.getElementById("hero-copy");
    const hud = document.getElementById("hero-hud");
    const header = document.getElementById("site-header");
    const cta = document.getElementById("enter-cta");

    // The entry plays inside the hero: bring it fully into view first.
    if (window.scrollY > 2) {
      this.lenis?.scrollTo(0, { immediate: true, force: true });
      window.scrollTo(0, 0);
      this.trackHero();
    }
    this.lock(true);
    this.emit("entry");
    cta?.setAttribute("data-state", "engaged");

    const tl = gsap.timeline({
      onComplete: () => this.finishEntry(),
    });
    this.entryTl = tl;

    // 0–150 ms · acknowledge
    tl.call(() => this.setEntry("activating"), [], 0);
    // 150–500 ms · energise the ring emitters and the explorer's headset
    tl.to(rig, { emit: 1, glow: 1, duration: 0.35, ease: "power2.out" }, 0.15);
    tl.to(rig, { sparks: 1, duration: 0.6, ease: "power2.out" }, 0.2);
    // 500–1400 ms · approach the aperture along the explorer–spire axis
    tl.call(() => this.setEntry("approaching"), [], 0.5);
    tl.to(rig, { entry: 0.78, duration: 0.95, ease: "power2.in" }, 0.5);
    if (copy) tl.to(copy, { xPercent: -6, opacity: 0, filter: "blur(4px)", duration: 0.45, ease: "power2.in" }, 0.5);
    if (hud) tl.to(hud, { opacity: 0, duration: 0.3, ease: "none" }, 0.55);
    if (header) tl.to(header, { opacity: 0.25, duration: 0.3, ease: "none" }, 0.55);
    tl.to(rig, { radial: 0.18, duration: 0.6, ease: "power2.in" }, 0.85);
    // 1450–2000 ms · cross: the aperture edge passes the frame, the city fills it
    tl.call(() => this.setEntry("crossing"), [], 1.45);
    tl.to(rig, { entry: 1, duration: 0.3, ease: "none" }, 1.45);
    tl.to(rig, { cityPush: 1, duration: 0.75, ease: "power1.inOut" }, 1.6);
    // a soft fade to the page's dark (no flash), then arrive at the missions underneath
    if (veil) tl.to(veil, { opacity: 1, duration: 0.35, ease: "power1.in" }, 1.95);
    tl.call(() => this.arrive(), [], 2.32);
    if (veil) tl.to(veil, { opacity: 0, duration: 0.45, ease: "sine.out" }, 2.36);
  }

  /** Under the veil: reset the hero, jump to the missions, focus their heading. */
  private arrive() {
    const copy = document.getElementById("hero-copy");
    const hud = document.getElementById("hero-hud");
    const header = document.getElementById("site-header");
    Object.assign(rig, HERO_REST);
    for (const el of [copy, hud, header]) if (el) gsap.set(el, { clearProps: "opacity,transform,filter" });
    document.getElementById("enter-cta")?.removeAttribute("data-state");
    this.lock(false);
    this.navigate("#missions", { focus: true, immediate: true });
    this.setEntry("arrived");
    this.emit("arrive");
  }

  private finishEntry() {
    this.entryTl = null;
    if (store.get().entry === "arrived") window.setTimeout(() => this.setEntry("idle"), 400);
  }

  /** SKIP / Esc: go straight to the arrival state. */
  skipEntry() {
    const tl = this.entryTl;
    if (!tl) return;
    const veil = document.getElementById("entry-veil");
    tl.kill();
    this.entryTl = null;
    if (veil) gsap.to(veil, { opacity: 0, duration: 0.3 });
    this.arrive();
    this.finishEntry();
  }
}

export const director = new Director();
