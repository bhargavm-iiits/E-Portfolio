"use client";
/**
 * CH01–CH04 overlays: the Gate HUD (T01 boot, T04 white-out), World Entry HUD (T05),
 * the Nexus Hub title (T06) and the Warp HUD (T07, T09/T10 bloom). The 3D lives in the engine.
 */
import { useRef } from "react";
import { useScrub, span } from "../ui/useScrub";
import { cover } from "../cover";
import { director } from "../director";
import { at, u, um } from "../ui/units";

const NS = { vectorEffect: "non-scaling-stroke" as const };

function Frame({ variant }: { variant: "gate" | "entry" }) {
  const d = variant === "gate"
    ? "M48 30 H556 L568 40 H712 L724 30 H1232 L1250 48 V318 L1244 324 V396 L1250 402 V672 L1232 690 H724 L712 680 H568 L556 690 H48 L30 672 V402 L36 396 V324 L30 318 V48 Z"
    : "M44 30 H440 L452 42 H828 L840 30 H1236 L1250 44 V676 L1236 690 H840 L828 678 H452 L440 690 H44 L30 676 V44 Z";
  return (
    <svg className="hud-svg f-frame" viewBox="0 0 1280 720" preserveAspectRatio="none" aria-hidden="true">
      <g fill="none" stroke={variant === "gate" ? "#61E2EB" : "#5FE0F0"} style={{ filter: "drop-shadow(0 0 4px rgba(97,226,235,.6))" }}>
        <path className="ln draw" pathLength={1} d={d} strokeWidth={variant === "gate" ? 1.2 : 1.5} strokeOpacity={variant === "gate" ? 0.55 : 0.85} {...NS} />
        <path className="ln draw" pathLength={1} d="M30 104 V48 L48 30 H128" strokeWidth={2.6} {...NS} />
        <path className="ln draw" pathLength={1} d="M1250 104 V48 L1232 30 H1152" strokeWidth={2.6} {...NS} />
        <path className="ln draw" pathLength={1} d="M30 616 V672 L48 690 H128" strokeWidth={2.6} {...NS} />
        <path className="ln draw" pathLength={1} d="M1250 616 V672 L1232 690 H1152" strokeWidth={2.6} {...NS} />
      </g>
      <path d="M24 353 L17 360 L24 367 Z M1256 353 L1263 360 L1256 367 Z" fill="#61E2EB" fillOpacity={0.85} />
    </svg>
  );
}

/* ───────────── CH01 The Gate ───────────── */
export function GateOverlay({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLDivElement>(null);
  useScrub("gate", ref, (tl, q) => {
    tl.set(q(".draw"), { strokeDasharray: "1 1", strokeDashoffset: 1 }, 0);
    tl.to(q(".g-enter"), { opacity: 0, y: 14, duration: 0.07 }, 0.18);
    // T01 HUD boot (C1 2.3–4.0 s → p .23–.40)
    tl.fromTo(q(".g-arcs"), { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.04, ease: "power2.out" }, 0.24);
    tl.to(q(".draw"), { strokeDashoffset: 0, duration: 0.05, ease: "power2.inOut", stagger: 0.004 }, 0.235);
    tl.fromTo(q(".g-mod"), { opacity: 0 }, { opacity: 1, duration: 0.03 }, 0.25);
    tl.fromTo(q(".g-title"), { opacity: 0 }, { opacity: 1, duration: 0.004, repeat: 4, yoyo: true }, 0.34);
    tl.fromTo(q(".g-bar i"), { scaleX: 0 }, { scaleX: (i: number) => [0.4, 0.6, 0.75][i % 3], duration: 0.025, stagger: 0.004 }, 0.34);
    tl.fromTo(q(".g-lbl"), { opacity: 0 }, { opacity: 1, duration: 0.01, stagger: 0.006 }, 0.36);
    // T04: HUD shuts down while the bloom rises (8.8–9.1 s)
    tl.to(q(".g-hud"), { opacity: 0, duration: 0.03 }, 0.89);
    return (p) => {
      const t = p * 9.9;
      if (countRef.current) countRef.current.textContent = String(Math.round(span(t, 3.4, 3.6) * 3)).padStart(3, "0");
      cover.white(Math.pow(span(t, 8.9, 9.9), 1.4));
    };
  }, 0.3);
  return (
    <section ref={ref} data-ch="gate" className="nx-ch" data-active={active} aria-labelledby="gate-h">
      <h2 id="gate-h" className="nx-sr">The Gate</h2>
      <div className="g-hud">
        <div className="g-mod" style={{ position: "absolute", inset: 0 }}>
          <Frame variant="gate" />
        </div>
        <svg className="hud-svg g-arcs" viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid meet" aria-hidden="true" style={{ transformOrigin: "50% 45%" }}>
          <defs><linearGradient id="arcL" gradientUnits="userSpaceOnUse" x1="0" y1="205" x2="0" y2="449"><stop offset="0" stopColor="#61E2EB" stopOpacity="0" /><stop offset=".5" stopColor="#61E2EB" /><stop offset="1" stopColor="#61E2EB" stopOpacity="0" /></linearGradient></defs>
          <g fill="none" stroke="#61E2EB" style={{ filter: "drop-shadow(0 0 4px rgba(97,226,235,.7))" }}>
            <path d="M271.4 137 A415 415 0 0 0 271.4 517" strokeWidth="1.2" strokeOpacity=".7" />
            <path d="M241 213 A415 415 0 0 0 241 441" stroke="url(#arcL)" strokeWidth="5" />
            <path d="M244 147 A435 435 0 0 0 244 507" strokeOpacity=".45" strokeDasharray="2 9" />
            <path d="M1008.6 137 A415 415 0 0 1 1008.6 517" strokeWidth="1.2" strokeOpacity=".7" />
            <path d="M1039 213 A415 415 0 0 1 1039 441" stroke="url(#arcL)" strokeWidth="5" />
            <path d="M1036 147 A435 435 0 0 1 1036 507" strokeOpacity=".45" strokeDasharray="2 9" />
            <path d="M225 327 H292 M1055 327 H988" strokeWidth="1.2" strokeOpacity=".8" />
          </g>
          <circle cx="292" cy="327" r="2.5" fill="#61E2EB" /><circle cx="988" cy="327" r="2.5" fill="#61E2EB" />
          <g fontFamily="var(--f-micro)" fontSize="10" fill="#61E2EB" fillOpacity=".8">
            <text className="g-lbl" x="196" y="214">[01]</text><text className="g-lbl" x="168" y="331">[02]</text><text className="g-lbl" x="196" y="448">[03]</text>
            <text className="g-lbl" x="1058" y="214">[01]</text><text className="g-lbl" x="1086" y="331">[02]</text><text className="g-lbl" x="1058" y="448">[03]</text>
          </g>
        </svg>
        <div style={at(56, 46, { display: "flex", flexDirection: "column", gap: 4 })}>
          <div className="hud-title g-title" style={{ fontSize: um(17, 13) }}>ACTIVATION <span style={{ opacity: 0.8 }}>[01]</span></div>
          <div className="hud-micro" style={{ fontSize: um(10.5, 10), color: "#78D8EF" }}>PLAYER // BHARGAV M</div>
          <div className="hud-micro" style={{ fontSize: um(10.5, 10), color: "#4FADC5" }}>CLASS // UNITY · XR DEVELOPER</div>
          <div className="g-mod" style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 6 }}>
            {[0, 1, 2].map((i) => <div key={i} className="g-bar nx-boot-bar"><i style={{ width: "100%", transformOrigin: "0 50%" }} /></div>)}
          </div>
        </div>
        <div className="g-mod hud-micro" style={{ position: "absolute", right: u(58), top: u(104), display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, fontSize: um(10, 9) }}>
          <div>BUILD 2026.10</div><div>UNITY 6 · URP</div><div>NODE 13.55N 80.02E</div><div>LINK · STABLE</div>
        </div>
        <div className="g-mod" style={at(60, 580, { display: "flex", flexDirection: "column", gap: u(9) })}>
          {["SYNC", "SIGNAL", "LINK"].map((l, i) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: u(10) }}>
              <span style={{ width: u(12), height: 1.5, background: "#61E2EB" }} />
              <span className="g-bar" style={{ width: u(110), height: 3, background: "rgba(97,226,235,.15)", display: "block" }}><i style={{ display: "block", height: "100%", background: "#61E2EB", transformOrigin: "0 50%", width: `${[40, 60, 75][i]}%` }} /></span>
              <span className="hud-micro" style={{ fontSize: um(9.5, 9) }}>{l}</span>
            </div>
          ))}
        </div>
        <div className="g-mod" style={{ position: "absolute", right: u(64), bottom: u(96), display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <div ref={countRef} className="hud-title" style={{ fontSize: um(28, 20), lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>000</div>
          <div className="hud-micro" style={{ fontSize: um(10, 9), marginTop: 4 }}>0/003</div>
        </div>
      </div>
      <div className="g-enter" style={{ position: "absolute", left: 0, right: 0, top: "85.8%", display: "flex", flexDirection: "column", alignItems: "center", gap: u(10) }}>
        <button type="button" className="nx-cta nx-hit" onClick={() => director.autoplay()} style={{ minHeight: 44 }}>
          <span style={{ fontSize: um(14, 13), letterSpacing: ".1em", background: "rgba(27,38,52,.78)" }}>ENTER THE NEXUS <span className="arr">→</span></span>
        </button>
        <div className="hud-micro" style={{ fontSize: um(10, 10), letterSpacing: ".28em", color: "#D9CCF5", textShadow: "0 1px 6px rgba(0,0,0,.8)", display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="12" height="16" viewBox="0 0 12 16" fill="none" stroke="#C5B0ED" strokeWidth="1.2" aria-hidden="true"><rect x="1" y="1" width="10" height="14" rx="5" /><path className="nx-wheel" d="M6 4v3" /></svg>
          SCROLL TO ACTIVATE
        </div>
      </div>
    </section>
  );
}

/* ───────────── CH02 World Entry ───────────── */
export function EntryOverlay({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const blocksRef = useRef<HTMLDivElement>(null);
  useScrub("entry", ref, (tl, q) => {
    tl.set(q(".draw"), { strokeDasharray: "1 1", strokeDashoffset: 0 }, 0);
    // reboot glitch (3 frames of slice offsets)
    tl.fromTo(q(".e-hud"), { opacity: 0, x: -6 }, { opacity: 1, x: 6, duration: 0.012 }, 0.03).to(q(".e-hud"), { x: -4, duration: 0.012 }).to(q(".e-hud"), { x: 0, duration: 0.012 });
    tl.fromTo(q(".e-hub"), { opacity: 0, y: 8 }, { opacity: 0.85, y: 0, duration: 0.14, ease: "power2.out" }, 0.32);
    // HUD expands 1→1.12 and its edges fade (p .65–.90)
    tl.to(q(".e-hud"), { scale: 1.12, opacity: 0.35, duration: 0.25, ease: "power1.in" }, 0.65);
    tl.to(q(".e-hub"), { opacity: 0, duration: 0.08 }, 0.82);
    return (p) => {
      cover.white(Math.max(1 - span(p, 0, 0.12), Math.pow(span(p, 0.9, 1), 1.2)));
      const el = blocksRef.current;
      if (el) { const n = Math.round(4 + span(p, 0.05, 0.9) * 20); el.style.setProperty("--n", String(n)); }
    };
  }, 0.5);
  return (
    <section ref={ref} data-ch="entry" className="nx-ch" data-active={active} aria-labelledby="entry-h">
      <h2 id="entry-h" className="nx-sr">World Entry</h2>
      <div className="e-hub" style={{ position: "absolute", left: 0, right: 0, top: "25.3%", textAlign: "center", fontFamily: "var(--f-hud)", fontWeight: 600, fontSize: um(15, 12), letterSpacing: ".14em", color: "#D9E6FF", textShadow: "0 0 10px rgba(150,170,255,.8)" }}>THE NEXUS HUB</div>
      <div className="e-hud" style={{ position: "absolute", inset: 0, transformOrigin: "50% 50%", WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, #000 60%, rgba(0,0,0,.4) 100%)" }}>
        <Frame variant="entry" />
        <svg className="hud-svg" viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          <g fill="none" stroke="#5FE0F0" style={{ filter: "drop-shadow(0 0 3px rgba(97,226,235,.7))" }}>
            <path d="M452 50 H828" strokeOpacity=".8" />
            <path d="M452 46 H828" strokeWidth="6" strokeDasharray="1 8.4" strokeOpacity=".55" />
            <path d="M452 45 H829" strokeWidth="10" strokeDasharray="1.4 73.8" strokeOpacity=".9" />
            <path d="M1192 228 V474" strokeOpacity=".6" /><path d="M1186 228 V474" strokeWidth="8" strokeDasharray="1 9" strokeOpacity=".5" />
            <path d="M88 300 V500" strokeOpacity=".45" /><path d="M94 300 V500" strokeWidth="8" strokeDasharray="1 11" strokeOpacity=".4" />
            <path d="M496 652 H784 M496 646 V652 M784 646 V652" strokeWidth="1.3" strokeOpacity=".9" />
          </g>
          <g fontFamily="var(--f-micro)" fontSize="10" fill="#78D8EF" textAnchor="middle"><text x="527" y="38">20</text><text x="602" y="38">40</text><text x="678" y="38">60</text><text x="753" y="38">80</text><text x="828" y="38">100</text></g>
          <g fill="#61E2EB" fontFamily="var(--f-micro)" fontSize="11"><text x="1178" y="333">»</text><text x="1178" y="413">»</text></g>
        </svg>
        <div style={at(48, 46, { display: "flex", flexDirection: "column", gap: u(6) })}>
          <div className="hud-title" style={{ fontSize: um(17, 13), color: "#78D8EF", padding: `${u(5)} ${u(10)}`, border: "1.2px solid rgba(95,224,240,.8)" }}>WORLD ENTRY - [02]</div>
          {[["SYNC", 0.79], ["GRID", 0.57], ["LINK", 0.89]].map(([l, w]) => (
            <div key={l as string} style={{ display: "flex", alignItems: "center", gap: u(8) }}>
              <span className="hud-micro" style={{ width: u(32), fontSize: um(9.5, 9) }}>{l}</span>
              <span style={{ width: u(150), height: 3, background: "rgba(97,226,235,.15)" }}><i style={{ display: "block", height: "100%", width: `${(w as number) * 100}%`, background: "#61E2EB" }} /></span>
            </div>
          ))}
          <div style={{ marginTop: u(10), width: u(184), border: "1px solid rgba(95,224,240,.6)" }}>
            <div className="hud-micro" style={{ fontSize: um(9.5, 9), color: "#CFF7FA", padding: `${u(3)} ${u(8)}`, background: "rgba(97,226,235,.14)" }}>LINK STATUS</div>
            {[["PORTAL", "STABLE"], ["AVATAR", "SYNCED"], ["REALM", "NEXUS HUB"], ["MISSIONS", "04"], ["LOG", "04 ENTRIES"], ["COMMS", "OPEN"]].map(([k, v]) => (
              <div key={k} className="hud-micro" style={{ display: "flex", justifyContent: "space-between", fontSize: um(9.5, 9), padding: `${u(1.5)} ${u(8)}`, color: "#9EE9F5" }}><span>{k}</span><span>{v}</span></div>
            ))}
          </div>
        </div>
        <div style={{ position: "absolute", right: u(44), top: u(46), display: "flex", flexDirection: "column", alignItems: "flex-end", gap: u(4) }}>
          <div className="hud-title" style={{ fontSize: um(15, 12), color: "#78D8EF", padding: `${u(5)} ${u(12)}`, border: "1.2px solid rgba(95,224,240,.8)" }}>NEXUS SECURE</div>
          {["SESSION · GUEST", "MODE · FULL ENTRY", "BUILD 2026.10", "RENDER · THREE r185"].map((l) => <div key={l} className="hud-micro" style={{ fontSize: um(9.5, 9), color: "#9EE9F5" }}>{l}</div>)}
        </div>
        <div style={at(91, 597, { display: "flex", alignItems: "center", gap: u(10) })}>
          <svg width="56" height="56" viewBox="0 0 56 56" style={{ width: u(56), height: u(56) }} aria-hidden="true"><circle cx="28" cy="28" r="27" fill="none" stroke="#5FE0F0" strokeOpacity=".6" /><path d="M28 1 A27 27 0 1 1 1 28" fill="none" stroke="#5FE0F0" strokeWidth="3" /><text x="28" y="33" textAnchor="middle" fontFamily="var(--f-chakra)" fontWeight="600" fontSize="14" fill="#CFF7FA">131°</text></svg>
          <div className="hud-micro" style={{ fontSize: um(9, 9), lineHeight: 2.2, color: "#9EE9F5" }}>HEADING · 131°<br />PLANE · PORTAL</div>
        </div>
        <div ref={blocksRef} style={{ position: "absolute", right: u(66), bottom: u(70), display: "flex", flexDirection: "column", alignItems: "flex-end", gap: u(6), ["--n" as string]: 4 }}>
          <div className="hud-micro" style={{ fontSize: um(9, 9), color: "#9EE9F5" }}>LOADING · WORLD 02</div>
          <div className="e-blocks" style={{ display: "grid", gridTemplateColumns: "repeat(24, 1fr)", gap: u(1.2), width: u(268), height: u(16) }}>
            {Array.from({ length: 24 }, (_, i) => <i key={i} style={{ background: "#61E2EB", opacity: `calc(.18 + .72 * clamp(0, var(--n) - ${i}, 1))` }} />)}
          </div>
        </div>
        <div className="hud-display" style={{ position: "absolute", left: 0, right: 0, top: "84.2%", textAlign: "center", fontSize: um(32, 22) }}>WORLD ENTRY</div>
      </div>
    </section>
  );
}

/* ───────────── CH03 The Nexus Hub ───────────── */
export function HubOverlay({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useScrub("hub", ref, (tl, q) => {
    const U = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
    tl.fromTo(q(".h-br-l"), { x: 255 * U }, { x: 0, duration: 0.28, ease: "power3.out" }, 0.02);
    tl.fromTo(q(".h-br-r"), { x: -255 * U }, { x: 0, duration: 0.28, ease: "power3.out" }, 0.02);
    tl.fromTo(q(".h-title"), { opacity: 0, letterSpacing: ".3em" }, { opacity: 1, letterSpacing: ".12em", duration: 0.26, ease: "power2.out" }, 0.06);
    tl.fromTo(q(".h-tag"), { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.06, ease: "back.out(2)", stagger: 0.03 }, 0.2);
    tl.to(q(".h-fade"), { opacity: 0, duration: 0.08 }, 0.84);
    return (p) => cover.violet(Math.max(1 - span(p, 0, 0.06), Math.pow(span(p, 0.9, 1), 1.3)));
  }, 0.4);
  return (
    <section ref={ref} data-ch="hub" className="nx-ch" data-active={active} aria-labelledby="hub-h">
      <div className="h-fade" style={{ position: "absolute", inset: 0 }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: "3%", display: "flex", justifyContent: "center", alignItems: "center", gap: u(80) }}>
          <svg className="h-br-l" width="20" height="78" viewBox="0 0 20 78" style={{ width: u(20), height: u(78), filter: "drop-shadow(0 0 6px #78D8EF)" }} aria-hidden="true"><path d="M18 2 H3 V76 H18" fill="none" stroke="#78D8EF" strokeWidth="3" /></svg>
          <h2 id="hub-h" className="h-title" style={{ margin: 0, fontFamily: "var(--f-hud)", fontWeight: 700, fontSize: um(38, 22), letterSpacing: ".12em", color: "#78D8EF", textShadow: "0 0 14px rgba(120,216,239,.75), 0 0 2px rgba(255,255,255,.6)", whiteSpace: "nowrap" }}>THE NEXUS HUB</h2>
          <svg className="h-br-r" width="20" height="78" viewBox="0 0 20 78" style={{ width: u(20), height: u(78), filter: "drop-shadow(0 0 6px #78D8EF)" }} aria-hidden="true"><path d="M2 2 H17 V76 H2" fill="none" stroke="#78D8EF" strokeWidth="3" /></svg>
        </div>
        <div className="h-tag hud-title" style={at(806, 168, { fontSize: um(18, 13), color: "#78D8EF" })}>[09</div>
        <div className="h-tag hud-micro" style={at(302, 100, { fontSize: um(11, 10), letterSpacing: ".14em", color: "#9EE9F5" })}>SECTOR 09</div>
        <div className="h-tag hud-micro" style={at(948, 138, { fontSize: um(11, 10), letterSpacing: ".14em", color: "#9EE9F5" })}>GATE · 02</div>
        <div className="hud-micro" style={{ position: "absolute", left: 0, right: 0, bottom: u(34), display: "flex", justifyContent: "center", alignItems: "center", gap: 10, fontSize: um(10, 10), letterSpacing: ".28em", color: "#CFE9F5", textShadow: "0 1px 6px rgba(0,0,0,.9)" }}>
          <span style={{ width: 40, height: 1, background: "rgba(120,216,239,.6)" }} />APPROACHING PORTAL<span style={{ width: 40, height: 1, background: "rgba(120,216,239,.6)" }} />
        </div>
      </div>
    </section>
  );
}

/* ───────────── CH04 Warp ───────────── */
export function WarpOverlay({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useScrub("warp", ref, (tl, q) => {
    tl.set(q(".draw"), { strokeDasharray: "1 1", strokeDashoffset: 0 }, 0);
    tl.fromTo(q(".w-hud"), { opacity: 0 }, { opacity: 0.7, duration: 0.06 }, 0.04);
    tl.fromTo(q(".w-title"), { opacity: 0 }, { opacity: 0.6, duration: 0.1 }, 0.45);
    // T09: the reticle brackets expand past the frame edges, streaks fade
    tl.to(q(".w-ret"), { scale: 1.9, opacity: 0, duration: 0.18, ease: "power2.in" }, 0.62);
    tl.to(q(".w-hud"), { opacity: 0, duration: 0.1 }, 0.66);
    return (p) => cover.violet(Math.max(1 - span(p, 0, 0.06), Math.pow(span(p, 0.78, 0.96), 1.1)));
  }, 0.3);
  return (
    <section ref={ref} data-ch="warp" className="nx-ch" data-active={active} aria-labelledby="warp-h">
      <h2 id="warp-h" className="nx-sr">Warp</h2>
      <div className="w-hud" style={{ position: "absolute", inset: 0 }}>
        <Frame variant="entry" />
        <div style={at(48, 46)}><div className="hud-title" style={{ fontSize: um(17, 13), color: "#78D8EF", padding: `${u(5)} ${u(10)}`, border: "1.2px solid rgba(95,224,240,.8)" }}>WORLD ENTRY - [02]</div></div>
        <div style={{ position: "absolute", right: u(44), top: u(46) }}><div className="hud-title" style={{ fontSize: um(15, 12), color: "#78D8EF", padding: `${u(5)} ${u(12)}`, border: "1.2px solid rgba(95,224,240,.8)" }}>NEXUS SECURE</div></div>
        <div className="hud-micro" style={at(60, 600, { fontSize: um(9.5, 9), lineHeight: 2, color: "#9EE9F5" })}>HEADING · 138°<br />MODE · HYPERSPACE</div>
      </div>
      <svg className="hud-svg w-ret" viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid meet" aria-hidden="true" style={{ transformOrigin: "50% 50%" }}>
        <g fill="none" stroke="#61E2EB" style={{ filter: "drop-shadow(0 0 4px rgba(97,226,235,.8))" }}>
          <circle cx="640" cy="360" r="300" strokeWidth="1.2" strokeOpacity=".65" />
          <path d="M790 100 A300 300 0 0 1 900 210" strokeWidth="10" strokeOpacity=".75" />
          <circle cx="640" cy="360" r="300" strokeWidth="7" strokeDasharray="1 30" strokeOpacity=".6" />
          <path d="M640 52 L634 64 H646 Z M640 668 L634 656 H646 Z" />
          <path d="M318 165 A372 372 0 0 0 318 555" strokeWidth="2.6" strokeOpacity=".85" transform="rotate(-4 640 360)" />
          <path d="M962 165 A372 372 0 0 1 962 555" strokeWidth="2.6" strokeOpacity=".85" transform="rotate(4 640 360)" />
        </g>
      </svg>
      <div className="hud-display w-title" style={{ position: "absolute", left: 0, right: 0, top: "84.2%", textAlign: "center", fontSize: um(32, 22) }}>WORLD ENTRY</div>
    </section>
  );
}
