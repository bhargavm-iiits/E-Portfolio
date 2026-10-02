"use client";
/**
 * NEXUS — the cinematic portfolio (Docs/plan.md §4). One fixed WebGL canvas behind fixed chapter
 * overlays; a tall spacer gives the story its scroll length; Comms follows in normal flow.
 * Full mode: real-time 3D (lazy-loaded engine). Lite (opted in / no WebGL2 / GPU failure):
 * posters rendered from our own 3D scenes, the same DOM content, rest poses, 200 ms fades.
 * The OS reduced-motion setting does not force Lite (Windows ships with it on for many users, and the
 * motion here is driven by the visitor's own scroll); it offers Lite instead. Lite always says why
 * it is on and how to leave it.
 */
import { useEffect, useRef, useState } from "react";
import { director } from "./director";
import { rig } from "./rig";
import { STORY, type WorldId } from "./story";
import { Nav, IntroControls, Boot, CoverLayer, LiveRegion } from "./ui/Shell";
import { GateOverlay, EntryOverlay, HubOverlay, WarpOverlay } from "./chapters/Intro";
import { HomeOverlay, DiveOverlay, MenuOverlay } from "./chapters/Home";
import { LabOverlay, TerrainOverlay, CinemaOverlay, HangarOverlay, CaseFile } from "./chapters/Missions";
import { AbilitiesOverlay, PlayerLogOverlay, VaultOverlay, FinaleOverlay } from "./chapters/Player";
import { Comms } from "./chapters/Comms";

const POSTER: Partial<Record<WorldId, string>> = {
  gate: "/nexus/plates/gate.jpg", entry: "/nexus/plates/entry.jpg", hub: "/nexus/plates/hub.jpg", warp: "/nexus/plates/warp.jpg",
  home: "/nexus/plates/vista.jpg", lab: "/nexus/plates/lab.jpg", terrain: "/nexus/plates/terrain.jpg", cinema: "/nexus/plates/cinema.jpg", hangar: "/nexus/plates/hangar.jpg",
};

type LiteReason = "choice" | "no-webgl2" | "gpu-lost" | "engine-error";

function detectMode(): { mode: "full" | "lite"; reason?: LiteReason } {
  if (document.documentElement.dataset.motion === "reduced") return { mode: "lite", reason: "choice" };
  try {
    const c = document.createElement("canvas");
    if (!c.getContext("webgl2")) return { mode: "lite", reason: "no-webgl2" };
  } catch {
    return { mode: "lite", reason: "no-webgl2" };
  }
  return { mode: "full" };
}

function setMotionChoice(v: "full" | "reduced") {
  try { localStorage.setItem("nexus-motion", v); } catch { /* storage blocked */ }
  location.reload();
}

const LITE_TEXT: Record<LiteReason, string> = {
  choice: "LITE MODE IS ON",
  "no-webgl2": "3D IS OFF · THIS BROWSER HAS NO WEBGL2 (TURN ON HARDWARE ACCELERATION)",
  "gpu-lost": "3D STOPPED · THE GPU CONTEXT WAS LOST",
  "engine-error": "3D FAILED TO START",
};

/** Says why Lite is on and offers the way back; in full mode, offers Lite when the OS asks for reduced motion. */
function ModeChip({ mode, reason }: { mode: "full" | "lite"; reason?: LiteReason }) {
  const [hidden, setHidden] = useState(false);
  const osReduced = typeof document !== "undefined" && document.documentElement.dataset.osReduced === "true";
  const chosen = (() => { try { return localStorage.getItem("nexus-motion"); } catch { return null; } })();
  if (hidden) return null;
  if (mode === "lite") {
    return (
      <div className="nx-mode-chip" role="status">
        <span>{LITE_TEXT[reason ?? "choice"]}</span>
        {reason !== "no-webgl2" && <button type="button" onClick={() => setMotionChoice("full")}>PLAY FULL 3D</button>}
      </div>
    );
  }
  if (!osReduced || chosen === "full") return null;
  return (
    <div className="nx-mode-chip" role="status">
      <span>YOUR SYSTEM ASKS FOR REDUCED MOTION</span>
      <button type="button" onClick={() => setMotionChoice("reduced")}>SWITCH TO LITE</button>
      <button type="button" aria-label="Keep full 3D" onClick={() => { try { localStorage.setItem("nexus-motion", "full"); } catch { /* storage blocked */ } setHidden(true); }}>KEEP 3D</button>
    </div>
  );
}

export default function NexusSite() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"full" | "lite" | null>(null);
  const [liteReason, setLiteReason] = useState<LiteReason | undefined>(undefined);
  const toLite = (r: LiteReason) => { setLiteReason(r); setMode("lite"); };
  const [chapter, setChapter] = useState(0);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [caseSlug, setCase] = useState<string | null>(null);
  const [outro, setOutro] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => { const d = detectMode(); setLiteReason(d.reason); setMode(d.mode); });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!mode) return;
    const lite = mode === "lite";
    document.documentElement.dataset.mode = mode;
    director.init(lite);
    const offCh = director.onChapter((i) => setChapter(i));
    const setScale = () => document.documentElement.style.setProperty("--us", String(Math.min(window.innerWidth / 1280, window.innerHeight / 720)));
    setScale();
    window.addEventListener("resize", setScale);
    const outroEl = document.getElementById("nx-outro");
    let lastOutro = false;
    const outroHook = () => {
      if (outroEl) outroEl.style.opacity = String(rig.outro);
      const o = rig.outro > 0.4;
      if (o !== lastOutro) { lastOutro = o; setOutro(o); }
    };
    let engine: { frame: (t: number, dt: number) => void; resize: () => void; dispose: () => void } | null = null;
    let cancelled = false;
    const onResize = () => engine?.resize();
    if (!lite && canvasRef.current && stageRef.current) {
      const canvas = canvasRef.current, stage = stageRef.current;
      const coarse = matchMedia("(pointer: coarse)").matches;
      const quality = !coarse && (navigator.hardwareConcurrency ?? 4) >= 6 ? "high" : "low";
      import("./engine/Engine").then(async ({ Engine }) => {
        if (cancelled) return;
        const e = new Engine(canvas, { quality, anchorTarget: stage, onProgress: setProgress });
        engine = e;
        window.addEventListener("resize", onResize);
        director.setFrameHook((t, dt) => { e.frame(t, dt); outroHook(); });
        canvas.addEventListener("webglcontextlost", (ev) => { ev.preventDefault(); console.warn("[nexus] WebGL context lost — switching to Lite"); toLite("gpu-lost"); }, { once: true });
        await e.init();
        if (!cancelled) setReady(true);
      }).catch((err) => { console.error("[nexus] 3D engine failed to start — switching to Lite", err); if (!cancelled) toLite("engine-error"); });
    } else {
      director.setFrameHook(() => outroHook());
      rig.ready = true;
      setReady(true);
    }
    const onCase = (ev: Event) => setCase((ev as CustomEvent<string>).detail);
    window.addEventListener("nx:case", onCase);
    if (process.env.NODE_ENV !== "production" || location.search.includes("qa")) {
      (window as unknown as { __nexus: unknown }).__nexus = { director, rig, seek: (id: string, p = 0) => director.go(id, true, p) };
    }
    return () => {
      cancelled = true;
      offCh();
      window.removeEventListener("resize", setScale);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("nx:case", onCase);
      director.setFrameHook(null);
      director.destroy();
      engine?.dispose();
    };
  }, [mode]);

  const a = (id: string) => STORY[chapter]?.id === id;
  const poster = mode === "lite" ? POSTER[STORY[chapter].world] : undefined;
  return (
    <div className="nx" data-chapter={STORY[chapter].id}>
      <canvas ref={canvasRef} className="nx-canvas" aria-hidden="true" style={{ visibility: mode === "lite" ? "hidden" : "visible" }} />
      {mode === "lite" && <div className="nx-poster" style={{ backgroundImage: poster ? `url(${poster})` : "radial-gradient(ellipse at 50% 42%, #08162F, #030B18 70%)" }} />}
      <div ref={stageRef} className="nx-stage">
        <GateOverlay active={a("gate")} />
        <EntryOverlay active={a("entry")} />
        <HubOverlay active={a("hub")} />
        <WarpOverlay active={a("warp")} />
        <HomeOverlay active={a("home")} />
        <DiveOverlay active={a("dive")} />
        <MenuOverlay active={a("menu")} />
        <LabOverlay active={a("lab")} />
        <TerrainOverlay active={a("terrain")} />
        <CinemaOverlay active={a("cinema")} />
        <HangarOverlay active={a("hangar")} />
        <AbilitiesOverlay active={a("abilities")} />
        <PlayerLogOverlay active={a("log")} />
        <VaultOverlay active={a("vault")} />
        <FinaleOverlay active={a("finale")} />
      </div>
      <div id="nx-outro" className="nx-outro-fade" aria-hidden="true" />
      <Nav chapter={chapter} outro={outro} />
      <IntroControls chapter={chapter} />
      <CoverLayer />
      <LiveRegion chapter={chapter} />
      {mode === "full" && <Boot progress={progress} done={ready} onLite={() => toLite("choice")} />}
      {mode && ready && <ModeChip mode={mode} reason={liteReason} />}
      {caseSlug && <CaseFile slug={caseSlug} onClose={() => setCase(null)} />}
      <div id="nx-story" className="nx-story" aria-hidden="true" style={{ height: "2800vh" }} />
      <Comms />
    </div>
  );
}
