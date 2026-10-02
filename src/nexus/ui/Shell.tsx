"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { director } from "../director";
import { STORY, chapterIndex } from "../story";
import { sound } from "@/lib/sound";

/** Nav jump (§2.5): black cover in, teleport, cover out. Independent of the chapter-driven cover. */
export function jump(target: string | "comms") {
  const el = document.getElementById("nx-cover-nav");
  if (!el || director.reduced) {
    if (target === "comms") director.goEnd(true); else director.go(target, true);
    return;
  }
  gsap.killTweensOf(el);
  gsap.timeline()
    .set(el, { visibility: "visible" })
    .to(el, { opacity: 1, duration: 0.28, ease: "power2.in" })
    .add(() => { if (target === "comms") director.goEnd(true); else director.go(target, true); })
    .to(el, { opacity: 0, duration: 0.45, ease: "power2.out", delay: 0.12 })
    .set(el, { visibility: "hidden" });
}

export function HexLogo({ size = 30, id = "lg" }: { size?: number; id?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" strokeWidth="2.2" aria-hidden="true">
      <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#59B0F0" /><stop offset="1" stopColor="#6853EE" /></linearGradient></defs>
      <path d="M16 2.5 L28 9.3 V22.7 L16 29.5 L4 22.7 V9.3 Z" stroke={`url(#${id})`} />
      <path d="M16 9 L22 12.5 V19.5 L16 23 L10 19.5 V12.5 Z" stroke="#9fd0ff" strokeWidth="1.6" />
    </svg>
  );
}

const NAV = [
  { key: "home", label: "HOME", target: "home" },
  { key: "missions", label: "MISSIONS", target: "menu" },
  { key: "abilities", label: "ABILITIES", target: "abilities" },
  { key: "log", label: "PLAYER LOG", target: "log" },
] as const;

export function Nav({ chapter, outro }: { chapter: number; outro: boolean }) {
  const def = STORY[chapter];
  const show = def.nav || outro;
  const active = outro ? "" : def.navKey ?? "";
  const linksRef = useRef<HTMLDivElement>(null);
  const [bar, setBar] = useState({ left: 0, width: 0, on: false });
  const [sheet, setSheet] = useState(false);
  useLayoutEffect(() => {
    const root = linksRef.current;
    const el = root?.querySelector<HTMLElement>(`[data-key="${active}"]`);
    if (!root || !el) { setBar((b) => ({ ...b, on: false })); return; }
    setBar({ left: el.offsetLeft, width: el.offsetWidth, on: true });
  }, [active]);
  return (
    <>
      <nav className="nx-nav" data-show={show} aria-label="Primary" aria-hidden={!show}>
        <a className="nx-logo" href="#home" onClick={(e) => { e.preventDefault(); jump("home"); }} tabIndex={show ? 0 : -1}>
          <HexLogo /> <span>NEXUS</span>
        </a>
        <div className="nx-links" ref={linksRef}>
          {NAV.map((n) => (
            <button key={n.key} type="button" className="nx-link nx-desk" data-key={n.key} aria-current={active === n.key} tabIndex={show ? 0 : -1} onClick={() => jump(n.target)}>{n.label}</button>
          ))}
          <Link className="nx-link nx-desk" href="/archive" tabIndex={show ? 0 : -1}>ARCHIVE</Link>
          <span className="nx-link-bar nx-desk" style={{ left: bar.left, width: bar.width, opacity: bar.on ? 1 : 0 }} />
          <button type="button" className="nx-pill" tabIndex={show ? 0 : -1} onClick={() => jump("comms")}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 12a8 8 0 0 1 16 0" /><path d="M8 12a4 4 0 0 1 8 0" /><circle cx="12" cy="12" r="1.3" fill="#fff" /><path d="M12 13v7" /></svg>
            COMMS
          </button>
          <button type="button" className="nx-btn-hud nx-btn-icon nx-menu-btn" aria-label="Open menu" aria-expanded={sheet} tabIndex={show ? 0 : -1} onClick={() => setSheet(true)}>
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="#E6ECF5" strokeWidth="2" aria-hidden="true"><path d="M1 1H17M1 7H17M1 13H17" /></svg>
          </button>
        </div>
      </nav>
      {sheet && (
        <div className="nx-sheet" role="dialog" aria-modal="true" aria-label="Menu" onKeyDown={(e) => e.key === "Escape" && setSheet(false)}>
          <button type="button" className="nx-btn-hud nx-btn-icon nx-sheet-close" aria-label="Close menu" onClick={() => setSheet(false)} autoFocus>✕</button>
          {NAV.map((n) => <button key={n.key} type="button" className="nx-sheet-link" onClick={() => { setSheet(false); jump(n.target); }}>{n.label}</button>)}
          <Link className="nx-sheet-link" href="/archive">ARCHIVE</Link>
          <button type="button" className="nx-sheet-link" onClick={() => { setSheet(false); jump("comms"); }}>COMMS</button>
        </div>
      )}
    </>
  );
}

export function IntroControls({ chapter }: { chapter: number }) {
  const intro = chapter < chapterIndex("home");
  const [on, setOn] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && rigIntro()) jump("home"); };
    const rigIntro = () => document.documentElement.dataset.intro === "true";
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => { document.documentElement.dataset.intro = String(intro); }, [intro]);
  const toggle = async () => {
    if (sound.isEnabled) { sound.disable(); setOn(false); } else { await sound.enable(); setOn(true); }
  };
  return (
    <div className="nx-intro-ctl" data-show={intro}>
      <button type="button" className="nx-btn-hud nx-btn-icon" aria-label={on ? "Sound on — turn off" : "Sound off — turn on"} aria-pressed={on} onClick={toggle} tabIndex={intro ? 0 : -1}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#61E2EB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" />{on ? <path d="M16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12" /> : <path d="M17 9l4 6M21 9l-4 6" />}</svg>
      </button>
      <button type="button" className="nx-btn-hud" onClick={() => jump("home")} tabIndex={intro ? 0 : -1}>SKIP INTRO ›</button>
    </div>
  );
}

export function Boot({ progress, done, onLite }: { progress: number; done: boolean; onLite: () => void }) {
  const [slow, setSlow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setSlow(true), 8000); return () => clearTimeout(t); }, []);
  const n = Math.round(progress * 100);
  return (
    <div className="nx-boot" data-done={done} aria-hidden={done} role="status" aria-label={done ? undefined : `Loading ${n}%`}>
      <div className="nx-boot-poster" />
      <div className="nx-boot-tl">
        <div className="hud-title" style={{ fontSize: "max(13px, calc(var(--u) * 17))" }}>ACTIVATION <span style={{ opacity: 0.8 }}>[01]</span></div>
        <div className="hud-micro" style={{ fontSize: 10.5 }}>PLAYER // BHARGAV M</div>
        {[0.4, 0.6, 0.75].map((k, i) => <div key={i} className="nx-boot-bar"><i style={{ width: `${Math.min(1, progress / k) * 100}%` }} /></div>)}
      </div>
      <div className="nx-boot-br">
        <div className="nx-boot-count">{String(n).padStart(3, "0")}</div>
        <div className="hud-micro" style={{ fontSize: 10 }}>GEOMETRY · TEXTURES · SHADERS</div>
      </div>
      {slow && !done && <button type="button" className="nx-btn-hud nx-boot-lite" onClick={onLite}>ENTER LITE</button>}
    </div>
  );
}

export function CoverLayer() {
  return (
    <div className="nx-cover" aria-hidden="true">
      <div id="nx-cover-white" />
      <div id="nx-cover-violet" />
      <div id="nx-cover-doors" />
      <div id="nx-cover-black" />
      <div id="nx-cover-nav" style={{ background: "#000" }} />
    </div>
  );
}

export function LiveRegion({ chapter }: { chapter: number }) {
  return <div className="nx-sr" aria-live="polite">{STORY[chapter].title}</div>;
}
