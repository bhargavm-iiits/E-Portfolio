"use client";
/**
 * CH05 Home (KF22), CH06 Dive (KF23–KF25: T11 push + copy out, T12 holo HUD, T13 visor dive)
 * and CH07 VR Main Menu (KF26/KF27: chips, rings, T15 orb lens, T16 labels explode).
 */
import { useEffect, useRef, useState, type CSSProperties } from "react";
import gsap from "gsap";
import { useScrub, span } from "../ui/useScrub";
import { cover } from "../cover";
import { rig } from "../rig";
import { jump } from "../ui/Shell";
import { at, u, um } from "../ui/units";
import { hero } from "@/data/nexus";

function CrossedW({ h }: { h: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 66 42" style={{ height: h, width: "auto", marginRight: "0.03em" }} fill="none" stroke="currentColor" strokeWidth="5.6" strokeLinejoin="miter">
      <path d="M2 1 L17 41 L33 1" /><path d="M25 1 L42 41 L64 1" />
    </svg>
  );
}

const FEATURES = [
  { label: "VR DEVELOPMENT", icon: <><path d="M5 11h22a2 2 0 0 1 2 2v7a3 3 0 0 1-3 3h-5l-2-3h-6l-2 3H6a3 3 0 0 1-3-3v-7a2 2 0 0 1 2-2z" /><circle cx="11" cy="16.5" r="2" /><circle cx="21" cy="16.5" r="2" /><path d="M9 11V8h14v3" /></> },
  { label: "INTERACTIVE DESIGN", icon: <><path d="M16 3 L28 9.5 V22.5 L16 29 L4 22.5 V9.5 Z" /><path d="M4 9.5 L16 16 L28 9.5 M16 16 V29" /></> },
  { label: "XR PROGRAMMING", icon: <path d="M11 9 L4 16 L11 23 M21 9 L28 16 L21 23 M18 6 L14 26" /> },
  { label: "OPTIMIZED PERFORMANCE", icon: <><path d="M18 5c5-2 9-2 9-2s0 4-2 9l-7 7-5-5 5-9z" /><circle cx="20.5" cy="11.5" r="2" /><path d="M13 14l-5 1-3 4 5 1M18 19l-1 5-4 3-1-5" /><path d="M9 23c-2 0-4 2-4 4 2 0 4-2 4-4z" /></> },
];

/** The KF22 copy column (also re-used, aria-hidden, by the Dive as it slides away). */
function HomeCopy({ decorative = false }: { decorative?: boolean }) {
  const Tag = decorative ? "div" : "h1";
  return (
    <div className="hm-copy" aria-hidden={decorative || undefined}>
      <div className="hm-eyebrow">{hero.eyebrow} <span className="hm-rule" /></div>
      <Tag className="hm-h1">
        <span className="hm-create">I CREATE</span>
        <span className="hm-imm"><span className="hm-imm-t">IMMERSIVE</span><span className="hm-band" aria-hidden="true" /></span>
        <span className="hm-worlds"><CrossedW h="0.72em" /><span aria-hidden="true">ORLDS</span><span className="nx-sr">WORLDS</span></span>
      </Tag>
      <div className="hm-tag hm-fade">PLAY • EXPERIENCE • BELIEVE</div>
      <p className="hm-p hm-fade">{hero.description}</p>
      <ul className="hm-feats hm-fade">
        {FEATURES.map((f, i) => (
          <li key={f.label} className="hm-feat" data-div={i > 0}>
            <svg viewBox="0 0 32 32" fill="none" stroke="url(#hm-fg)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{f.icon}</svg>
            <span>{f.label}</span>
          </li>
        ))}
      </ul>
      <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}><defs><linearGradient id="hm-fg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#59B0F0" /><stop offset="1" stopColor="#6853EE" /></linearGradient></defs></svg>
    </div>
  );
}

/* ───────────── CH05 Home ───────────── */
export function HomeOverlay({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useScrub("home", ref, (tl, q) => {
    tl.fromTo(q(".hm-rule"), { scaleX: 0 }, { scaleX: 1, duration: 0.08, ease: "power2.out" }, 0.02);
    tl.fromTo(q(".hm-eyebrow"), { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0.01);
    tl.fromTo(q(".hm-create"), { opacity: 0, letterSpacing: ".8em" }, { opacity: 1, letterSpacing: ".42em", duration: 0.1, ease: "power2.out" }, 0.03);
    tl.fromTo(q(".hm-imm-t"), { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.1, ease: "power2.inOut" }, 0.06);
    tl.fromTo(q(".hm-band"), { xPercent: -120, opacity: 1 }, { xPercent: 520, opacity: 0, duration: 0.12, ease: "power1.inOut" }, 0.08);
    tl.fromTo(q(".hm-worlds"), { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.1, ease: "power2.inOut" }, 0.09);
    tl.fromTo(q(".hm-fade"), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.08, stagger: 0.03, ease: "power2.out" }, 0.13);
    tl.fromTo(q(".hm-cue, .hm-rail"), { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0.22);
    return (p) => cover.violet(1 - span(p, 0, 0.08));
  }, 0.6);
  return (
    <section ref={ref} data-ch="home" className="nx-ch" id="home" data-active={active} aria-label="Home">
      <HomeCopy />
      <div className="hm-rail" aria-hidden="true"><i /><b /><i /></div>
      <svg className="hm-panel-line" viewBox="0 0 420 80" aria-hidden="true"><path d="M0 14 H310 L338 42 H420" fill="none" stroke="rgba(138,124,240,.55)" /><path d="M0 14 H96" stroke="#8A7CF0" strokeWidth="2" /></svg>
      <button type="button" className="hm-cue nx-hit" onClick={() => jump("dive")}>
        <svg width="14" height="20" viewBox="0 0 14 20" fill="none" stroke="#A5BFD3" strokeWidth="1.3" aria-hidden="true"><rect x="1" y="1" width="12" height="18" rx="6" /><path className="nx-wheel" d="M7 5v4" /></svg>
        SCROLL TO EXPLORE —
      </button>
    </section>
  );
}

/* ───────────── CH06 Dive ───────────── */
export function DiveOverlay({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useScrub("dive", ref, (tl, q) => {
    // T11: copy slides left 1.6× faster than the scene and the left edge clips it
    tl.fromTo(q(".dv-copy"), { x: 0, opacity: 1 }, { x: () => -window.innerWidth * 0.18 * 1.6, opacity: 0, duration: 0.42, ease: "power1.in" }, 0);
    // T12: holo rings draw around the head, data panels pop in
    tl.set(q(".dv-ring"), { strokeDasharray: "1 1", strokeDashoffset: 1 }, 0);
    tl.to(q(".dv-ring"), { strokeDashoffset: 0, duration: 0.18, stagger: 0.02, ease: "power2.out" }, 0.42);
    tl.fromTo(q(".dv-rings"), { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0.42);
    tl.fromTo(q(".dv-panel"), { scaleY: 0, opacity: 0 }, { scaleY: 1, opacity: 1, duration: 0.08, stagger: 0.03, ease: "back.out(1.4)" }, 0.5);
    tl.to(q(".dv-panel, .dv-rings"), { opacity: 0, duration: 0.06 }, 0.78);
    // T13: goggle mask closes in, then black (cut on maximum motion)
    tl.fromTo(q(".dv-mask"), { scale: 3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.18, ease: "power2.in" }, 0.74);
    return (p) => cover.black(Math.pow(span(p, 0.9, 1), 1.2));
  }, 0.62);
  return (
    <section ref={ref} data-ch="dive" className="nx-ch" data-active={active} aria-label="Entering the headset">
      <div className="dv-copy"><HomeCopy decorative /></div>
      <svg className="dv-rings" viewBox="-300 -300 600 600" aria-hidden="true">
        <g fill="none" stroke="#DDEBFF" style={{ filter: "drop-shadow(0 0 5px rgba(160,200,255,.9))" }}>
          <circle className="dv-ring" pathLength={1} r="168" strokeWidth="1.2" strokeOpacity=".55" />
          <path className="dv-ring" pathLength={1} d="M-144 -87 A168 168 0 0 1 -80 -148" strokeWidth="7" strokeOpacity=".85" />
          <path className="dv-ring" pathLength={1} d="M144 87 A168 168 0 0 1 95 138" strokeWidth="7" strokeOpacity=".85" />
          <circle r="210" strokeWidth="10" strokeDasharray="1.5 9" strokeOpacity=".5" />
          <circle className="dv-ring" pathLength={1} r="246" strokeWidth="1.4" strokeOpacity=".6" />
          <path className="dv-ring" pathLength={1} d="M-210 -52 A246 246 0 0 1 -80 -234" strokeWidth="4" strokeOpacity=".9" />
          <path className="dv-ring" pathLength={1} d="M240 -52 A246 246 0 0 0 120 -232" strokeWidth="2" strokeOpacity=".7" />
          <circle className="dv-ring" pathLength={1} r="292" strokeOpacity=".38" />
        </g>
      </svg>
      <div className="dv-panel holo-lite" style={at(118, 46, { width: u(330), height: u(474), transformOrigin: "50% 0" })}>
        <svg viewBox="0 0 330 474" width="100%" height="100%" aria-hidden="true">
          <g fill="none" stroke="#CFE2FF" strokeOpacity=".8">
            <path d="M22 28 H182 M22 42 H142 M22 56 H166" strokeWidth="3" />
            <circle cx="122" cy="216" r="62" strokeWidth="1.4" /><circle cx="122" cy="216" r="44" />
            <path d="M122 154 A62 62 0 1 1 64 238" strokeWidth="5" />
            <circle cx="92" cy="374" r="36" strokeWidth="1.2" /><path d="M92 338 A36 36 0 1 1 58 386" strokeWidth="5" />
            <path d="M154 424 V384 M172 424 V358 M190 424 V394 M208 424 V340 M226 424 V372 M244 424 V350 M262 424 V402 M280 424 V366" strokeWidth="7" />
          </g>
          <g fontFamily="var(--f-micro)" fontSize="11" fill="#E8F1FF"><text x="22" y="94">MISSIONS · 04</text><text x="22" y="110">ABILITIES · 12</text><text x="122" y="220" textAnchor="middle" fontSize="15">BOOT</text><text x="182" y="454">SYSTEM LOAD</text></g>
        </svg>
      </div>
      <div className="dv-panel holo-lite" style={at(902, 64, { width: u(270), height: u(436), transformOrigin: "50% 0" })}>
        <svg viewBox="0 0 270 436" width="100%" height="100%" aria-hidden="true">
          <g fill="none" stroke="#CFE2FF" strokeOpacity=".8">
            <path d="M28 40 H208 M28 60 H158 M28 80 H228 M28 100 H118" strokeWidth="3" />
            <path d="M38 266 A120 120 0 0 1 248 196" strokeWidth="2" />
            <path d="M28 316 H244 M28 336 H198 M28 356 H228 M28 376 H158" strokeWidth="2.4" />
            <path d="M28 412 H238" strokeWidth="6" />
          </g>
          <g fontFamily="var(--f-micro)" fontSize="11" fill="#E8F1FF"><text x="28" y="136">PLAYER LOG · 04</text><text x="28" y="152">SIDE QUESTS · 07</text><text x="28" y="296">HEADSET · LINKED</text></g>
        </svg>
      </div>
      <svg className="dv-mask" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <path fillRule="evenodd" fill="#020206" d="M-400 -400 H2000 V1300 H-400 Z M180 140 C 180 80 300 50 520 50 C 700 50 760 120 760 220 L 760 560 C 760 700 660 780 520 780 C 360 780 300 700 250 640 C 200 580 180 520 180 440 Z M1420 140 C 1420 80 1300 50 1080 50 C 900 50 840 120 840 220 L 840 560 C 840 700 940 780 1080 780 C 1240 780 1300 700 1350 640 C 1400 580 1420 520 1420 440 Z" />
      </svg>
    </section>
  );
}

/* ───────────── CH07 VR Main Menu ───────────── */
const CHIPS = [
  { id: "xr", label: "XR / VR / AR", x: 290, y: 190, w: 262, h: 60, fs: 26, rot: "rotateY(16deg) rotateZ(4deg)", target: "vault" },
  { id: "game", label: "GAME DESIGN", x: 258, y: 357, w: 268, h: 60, fs: 26, rot: "rotateY(16deg)", target: "vault" },
  { id: "sim", label: "3D & SIMULATION", x: 345, y: 490, w: 250, h: 54, fs: 23, rot: "rotateY(16deg) rotateZ(-6deg)", target: "vault" },
  { id: "projects", label: "PROJECTS", x: 920, y: 232, w: 196, h: 56, fs: 25, rot: "rotateY(-16deg) rotateZ(-5deg)", target: "lab" },
  { id: "experience", label: "EXPERIENCE", x: 990, y: 358, w: 236, h: 58, fs: 25, rot: "rotateY(-16deg)", target: "log" },
  { id: "about", label: "ABOUT", x: 905, y: 492, w: 190, h: 56, fs: 25, rot: "rotateY(-16deg) rotateZ(5deg)", target: "log" },
  { id: "contact", label: "CONTACT", x: 638, y: 550, w: 206, h: 44, fs: 17, rot: "none", target: "comms" },
] as const;
const CUBE = { x: 0.494 * 1280, y: 0.486 * 720 };

export function MenuOverlay({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<string>("projects");
  const [lines, setLines] = useState<CSSProperties[]>([]);
  useEffect(() => {
    const layout = () => {
      const W = window.innerWidth, H = window.innerHeight, U = Math.min(W / 1280, H / 720);
      const cx = (CUBE.x / 1280) * W, cy = (CUBE.y / 720) * H;
      setLines(CHIPS.map((c) => {
        const x = (c.x / 1280) * W, y = (c.y / 720) * H, dx = x - cx, dy = y - cy, a = Math.atan2(dy, dx);
        const start = 146 * U, end = Math.hypot(dx, dy) - ((c.w / 2) * Math.abs(Math.cos(a)) + (c.h / 2) * Math.abs(Math.sin(a)) + 8) * U;
        return { left: cx + Math.cos(a) * start, top: cy + Math.sin(a) * start, width: Math.max(0, end - start), transform: `rotate(${(a * 180) / Math.PI}deg)` };
      }));
    };
    layout();
    window.addEventListener("resize", layout);
    return () => window.removeEventListener("resize", layout);
  }, []);
  useEffect(() => {
    const c = CHIPS.find((x) => x.id === hover);
    rig.menuYaw = c ? c.x - CUBE.x : 0;
  }, [hover]);
  useScrub("menu", ref, (tl, q) => {
    tl.fromTo(q(".mn-mask"), { scale: 1, opacity: 1 }, { scale: 1.6, opacity: 0, duration: 0.12, ease: "power2.out" }, 0.02);
    tl.fromTo(q(".mn-rings"), { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.12, ease: "power2.out" }, 0.04);
    tl.fromTo(q(".mn-chip-w"), { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.1, stagger: 0.02, ease: "back.out(1.6)" }, 0.08);
    tl.fromTo(q(".mn-line"), { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0.16);
    // T15: chips drift outward and blur while the cube becomes an orb lens onto the first mission
    tl.to(q(".mn-chip-w"), { scale: 1.25, opacity: 0, filter: "blur(6px)", duration: 0.2, ease: "power2.in" }, 0.7);
    tl.to(q(".mn-line, .mn-rings, .mn-hint, .mn-nose"), { opacity: 0, duration: 0.12 }, 0.68);
    tl.fromTo(q(".mn-orb"), { scale: 0.12 }, { scale: 3.2, duration: 0.28, ease: "power3.in" }, 0.72);
    tl.fromTo(q(".mn-orb"), { opacity: 0 }, { opacity: 1, duration: 0.06 }, 0.72);
    return (p) => cover.black(1 - span(p, 0, 0.07));
  }, 0.35);
  const go = (target: string) => {
    const root = ref.current;
    if (!root) return;
    const chips = root.querySelectorAll<HTMLElement>(".mn-chip-w");
    const W = window.innerWidth, H = window.innerHeight;
    gsap.to(chips, {
      x: (i: number) => ((CHIPS[i].x / 1280) * W - W * 0.494) * 1.4,
      y: (i: number) => ((CHIPS[i].y / 720) * H - H * 0.486) * 1.4,
      scale: 2.4, opacity: 0, filter: "blur(8px)", duration: 0.5, ease: "power2.in",
      onComplete: () => { jump(target); gsap.set(chips, { clearProps: "x,y,filter" }); },
    });
  };
  return (
    <section ref={ref} data-ch="menu" className="nx-ch" id="missions" data-active={active} aria-labelledby="menu-h">
      <h2 id="menu-h" className="mn-hint hud-micro" style={{ position: "absolute", left: 0, right: 0, top: "12.8%", textAlign: "center", margin: 0, fontWeight: 400, fontSize: um(11, 10), letterSpacing: ".32em", color: "#A5BFD3" }}>SELECT YOUR NEXT MISSION</h2>
      {lines.map((l, i) => <div key={CHIPS[i].id} className="mn-line" data-on={hover === CHIPS[i].id} style={l} />)}
      <svg className="mn-rings" viewBox="-160 -160 320 320" aria-hidden="true">
        <g fill="none" stroke="#61E2EB" style={{ filter: "drop-shadow(0 0 4px rgba(97,226,235,.8))" }}>
          <circle r="104" strokeWidth="1.3" strokeOpacity=".75" />
          <circle className="mn-spin-a" r="128" strokeWidth="2.4" strokeOpacity=".85" strokeDasharray="150 50 90 60 120 334" />
          <circle className="mn-spin-b" r="141" strokeWidth="7" strokeDasharray="1 8" strokeOpacity=".45" />
          <path className="mn-spin-b" d="M-76 -92 A120 120 0 0 1 -32 -114 M76 92 A120 120 0 0 1 32 114" strokeWidth="5" strokeOpacity=".9" />
        </g>
      </svg>
      <nav aria-label="Menu" className="mn-chips">
        {CHIPS.map((c) => (
          <div key={c.id} className="mn-chip-w" style={at(c.x - c.w / 2, c.y - c.h / 2, { width: u(c.w), height: u(c.h) })}>
            <button type="button" className="mn-chip nx-hit" data-on={hover === c.id} style={{ fontSize: um(c.fs, 13), transform: `perspective(900px) ${c.rot}${hover === c.id ? " translateY(-4px)" : ""}` }}
              onMouseEnter={() => setHover(c.id)} onFocus={() => setHover(c.id)} onClick={() => go(c.target)} aria-label={`${c.label}`}>
              <span className="corner-tl" /><span className="corner-br" />
              {c.id === "contact" && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E6ECF5" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3.2" fill="#E6ECF5" /></svg>}
              {c.label}
            </button>
          </div>
        ))}
      </nav>
      <div className="mn-orb" aria-hidden="true" />
      <svg className="mn-nose" viewBox="0 0 1280 720" preserveAspectRatio="xMidYMax meet" aria-hidden="true"><path d="M360 720 C 430 640, 520 588, 640 586 C 760 588, 850 640, 920 720 Z" fill="#05050d" /></svg>
      <div className="mn-vignette" aria-hidden="true" />
      <svg className="mn-mask dv-mask" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <path fillRule="evenodd" fill="#020206" d="M-400 -400 H2000 V1300 H-400 Z M180 140 C 180 80 300 50 520 50 C 700 50 760 120 760 220 L 760 560 C 760 700 660 780 520 780 C 360 780 300 700 250 640 C 200 580 180 520 180 440 Z M1420 140 C 1420 80 1300 50 1080 50 C 900 50 840 120 840 220 L 840 560 C 840 700 940 780 1080 780 C 1240 780 1300 700 1350 640 C 1400 580 1420 520 1420 440 Z" />
      </svg>
      <div className="mn-hint hud-micro" style={{ position: "absolute", left: 0, right: 0, bottom: u(18), textAlign: "center", fontSize: um(10, 10), letterSpacing: ".2em", color: "#8f9cc0" }}>HOVER A CHIP · CLICK TO TRAVEL · SCROLL TO ENTER MISSION 01</div>
    </section>
  );
}
