"use client";
/**
 * NEXUS orchestrator: device tier, WebGL support, motion preference, the
 * director lifecycle, active-section tracking and sound. Every piece of
 * content is semantic HTML; the canvas behind it is decoration seen through
 * the hero, the contact band and the briefing's evidence window.
 */
import { Component, useEffect, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { detectTier } from "@/config/quality";
import type { SectionId } from "@/config/site";
import { store, useNexus } from "@/lib/store";
import { director } from "@/lib/director";
import { sound } from "@/lib/sound";

import SiteHeader, { MobileMenu } from "@/components/site/SiteHeader";
import ContactTerminal from "@/components/site/ContactTerminal";
import Motion from "@/components/fx/Motion";
import Hero from "@/components/sections/Hero";
import Missions from "@/components/sections/Missions";
import AbilityTree from "@/components/sections/AbilityTree";
import PlayerLog from "@/components/sections/PlayerLog";
import Comms from "@/components/sections/Comms";
import MissionBriefing from "@/components/briefing/MissionBriefing";

const Stage = dynamic(() => import("@/components/three/Stage"), { ssr: false });

class StageBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    store.set({ webgl: "off" });
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Cheap capability check only: creating a probe WebGL context blocks the main
 * thread while the GPU process spins up, so the real context is created later,
 * at idle, by the stage — whose error boundary falls back to the posters.
 */
function supportsWebGL() {
  try {
    if (new URLSearchParams(window.location.search).get("webgl") === "off") return false;
    return typeof window.WebGL2RenderingContext !== "undefined";
  } catch {
    return false;
  }
}

function readManualMotion(): boolean | null {
  try {
    const v = localStorage.getItem("nexus-motion");
    return v === "reduced" ? true : v === "full" ? false : null;
  } catch {
    return null;
  }
}

export default function NexusApp() {
  const webgl = useNexus((s) => s.webgl);
  const reduced = useNexus((s) => s.reduced);
  const tier = useNexus((s) => s.tier);
  const configured = useNexus((s) => s.configured);
  const stageRequested = useNexus((s) => s.stageRequested);

  // One-time environment detection.
  useEffect(() => {
    const sys = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => store.set({ reduced: store.get().reducedManual ?? sys.matches });
    store.set({ tier: detectTier(), reducedManual: readManualMotion(), webgl: supportsWebGL() ? "pending" : "off" });
    apply();
    store.set({ configured: true });
    sys.addEventListener("change", apply);
    const unsubscribe = store.subscribe(apply);
    if (process.env.NODE_ENV !== "production") (window as unknown as { __nexus: unknown }).__nexus = { director, store };
    return () => {
      sys.removeEventListener("change", apply);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!configured) return;
    document.documentElement.dataset.motion = reduced ? "reduced" : "full";
    director.init(reduced);
    return () => director.destroy();
  }, [reduced, configured]);

  useEffect(() => {
    document.documentElement.dataset.webgl = webgl;
  }, [webgl]);
  useEffect(() => {
    document.documentElement.dataset.tier = tier;
  }, [tier]);

  // The 3D stage loads after first paint. Phones (low tier) keep the poster and
  // load it on their first interaction, or at once when opened mid-page.
  useEffect(() => {
    if (!configured || webgl === "off" || store.get().stageRequested) return;
    const request = () => store.set({ stageRequested: true });
    if (store.get().tier !== "low" || window.scrollY > 0) {
      // After load, when the main thread is idle: the poster (a render of the
      // same scene) carries first paint, and the live world fades in over it.
      const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
      let idle = 0;
      const go = () => {
        idle = w.requestIdleCallback ? w.requestIdleCallback(request, { timeout: 1500 }) : window.setTimeout(request, 300);
      };
      if (document.readyState === "complete") go();
      else window.addEventListener("load", go, { once: true });
      return () => {
        window.removeEventListener("load", go);
        if (w.cancelIdleCallback) w.cancelIdleCallback(idle);
        else window.clearTimeout(idle);
      };
    }
    const events = ["pointerdown", "touchstart", "wheel", "keydown", "scroll"] as const;
    const once = () => {
      request();
      events.forEach((ev) => window.removeEventListener(ev, once));
    };
    events.forEach((ev) => window.addEventListener(ev, once, { passive: true }));
    return () => events.forEach((ev) => window.removeEventListener(ev, once));
  }, [configured, webgl]);

  // Active section: whichever section crosses the viewport's upper third.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) store.set({ active: (e.target as HTMLElement).dataset.section as SectionId });
      },
      { rootMargin: "-35% 0px -60% 0px" }
    );
    document.querySelectorAll<HTMLElement>("[data-section]").forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // Sound (opt-in) + Esc to skip the entry.
  useEffect(() => {
    const offEntry = director.on("entry", () => sound.riser());
    const onOver = (e: PointerEvent) => {
      if ((e.target as HTMLElement | null)?.closest("a[href], button")) sound.tick();
    };
    const onKey = (e: KeyboardEvent) => {
      const s = store.get();
      if (e.key === "Escape" && s.entry !== "idle" && s.entry !== "arrived" && !s.briefing) director.skipEntry();
    };
    document.addEventListener("pointerover", onOver);
    document.addEventListener("keydown", onKey);
    return () => {
      offEntry();
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <>
      <a className="skip-link" href="#missions">
        Skip to missions
      </a>
      <div id="stage" className="stage" aria-hidden="true">
        {configured && stageRequested && webgl !== "off" && (
          <StageBoundary>
            <Stage />
          </StageBoundary>
        )}
      </div>
      <SiteHeader />
      <MobileMenu />

      <main id="main">
        <Hero />
        <Missions />
        <div className="lower-band">
          <div className="lower wrap">
            <AbilityTree />
            <PlayerLog />
          </div>
        </div>
        <Comms />
      </main>

      <MissionBriefing />
      <ContactTerminal />
      <div id="entry-veil" className="entry-veil" aria-hidden="true" />
      <p className="sr-only" role="status" aria-live="polite" id="entry-status" />
      <Motion />
    </>
  );
}
