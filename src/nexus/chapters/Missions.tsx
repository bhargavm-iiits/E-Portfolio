"use client";
/**
 * CH08–CH11 mission overlays (KF28 / KF30 / in-language cinema / KF32) and the case-file dialog
 * (KF57 layout, T29 door swing). All copy comes from src/data/nexus.ts.
 */
import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useScrub, span } from "../ui/useScrub";
import { cover } from "../cover";
import { jump } from "../ui/Shell";
import { at, u, um } from "../ui/units";
import { missionBySlug, type Mission } from "@/data/nexus";
import { trapFocus } from "@/lib/focusTrap";

export const openCase = (slug: string) => window.dispatchEvent(new CustomEvent("nx:case", { detail: slug }));

const ORDER = [
  { chapter: "lab", slug: "physics-learning" },
  { chapter: "terrain", slug: "tirumala" },
  { chapter: "cinema", slug: "vr-cinema" },
  { chapter: "hangar", slug: "isro-launch-pad" },
];

function Footer({ m, index, children }: { m: Mission; index: number; children?: ReactNode }) {
  const prev = index === 0 ? "menu" : ORDER[index - 1].chapter;
  const next = index === ORDER.length - 1 ? "abilities" : ORDER[index + 1].chapter;
  return (
    <>
      <div className="ms-foot-shade" />
      <div className="ms-foot ms-in">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span className="tag">MISSION {m.code}</span><span className="ms-kicker">{m.tag}</span></div>
        {children ?? <div className="hud-micro ms-hudlines">{m.hud.map((h) => <div key={h}>{h}</div>)}</div>}
      </div>
      <div className="ms-actions ms-in">
        <button type="button" className="ms-round nx-hit" aria-label={index === 0 ? "Back to the mission menu" : "Previous mission"} onClick={() => jump(prev)}>←</button>
        <span className="hud-micro" style={{ fontSize: 11, letterSpacing: ".14em", color: "#A5BFD3" }}>{index + 1} / {ORDER.length}</span>
        <button type="button" className="ms-round nx-hit" aria-label={index === ORDER.length - 1 ? "Next: Abilities" : "Next mission"} onClick={() => jump(next)}>→</button>
        {m.source && <a className="ms-ghost nx-hit" href={m.source} target="_blank" rel="noreferrer">SOURCE ↗</a>}
        {m.live && <a className="ms-live nx-hit" href={m.live} target="_blank" rel="noreferrer">▶ LIVE DEMO</a>}
        <button type="button" className="nx-cta nx-hit" onClick={() => openCase(m.slug)}><span style={{ fontSize: 13, letterSpacing: ".1em", padding: "0 22px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" fill="#fff" /></svg>OPEN CASE FILE</span></button>
      </div>
    </>
  );
}

function Title({ m, color = "#EAF6FF", glow = "rgba(127,230,255,.55)", top = 128, stack }: { m: Mission; color?: string; glow?: string; top?: number; stack?: string }) {
  return (
    <div className="ms-title ms-in" style={{ top: `${(top / 7.2).toFixed(2)}%` }}>
      <h2 style={{ color, textShadow: `0 0 18px ${glow}, 0 0 2px rgba(255,255,255,.7)` }}>{m.title}</h2>
      <div className="ms-stack" style={{ textShadow: `0 0 12px ${glow}` }}>{stack ?? m.system.join(" • ")}</div>
    </div>
  );
}

function enter(tl: gsap.core.Timeline, q: (s: string) => Element[]) {
  tl.fromTo(q(".ms-title"), { opacity: 0, y: 18, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.12, ease: "power2.out" }, 0.03);
  tl.fromTo(q(".ms-foot, .ms-actions"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.1, ease: "power2.out" }, 0.08);
  // T27 glass cards materialise
  tl.fromTo(q(".ms-card"), { opacity: 0, scale: 0.94, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.12, stagger: 0.04, ease: "power2.out" }, 0.22);
  tl.to(q(".ms-in, .ms-card"), { opacity: 0, duration: 0.05 }, 0.9);
}

/* ───────────── CH08 Physics lab ───────────── */
export function LabOverlay({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const m = missionBySlug("physics-learning")!;
  useScrub("lab", ref, (tl, q) => {
    enter(tl, q);
    return (p) => cover.doors(Math.pow(span(p, 0.9, 1), 1.3));
  }, 0.5);
  return (
    <section ref={ref} data-ch="lab" className="nx-ch" data-active={active} aria-labelledby="lab-h">
      <div className="ms-top-shade" />
      <Title m={m} stack="Unity • C# • Game design" />
      <span id="lab-h" className="nx-sr">Mission 1 of 4: {m.title}</span>
      <div className="ms-card holo ms-panel-l" style={at(34, 222, { width: u(330), height: u(204), padding: `${u(14)} ${u(16)}` })}>
        <div className="ms-card-h">Straight-line kinematics</div>
        <div className="ms-card-p">Learners push velocity, displacement and time and watch the motion respond.</div>
        <svg viewBox="0 0 296 96" style={{ width: "100%", height: u(96), marginTop: u(8) }} aria-hidden="true">
          <path d="M18 6 V84 H290" fill="none" stroke="#9fe8ff" strokeOpacity=".7" />
          <g fill="#61E2EB" fillOpacity=".75"><rect x="34" y="60" width="16" height="24" /><rect x="58" y="48" width="16" height="36" /><rect x="82" y="36" width="16" height="48" /><rect x="106" y="24" width="16" height="60" /></g>
          <g fill="#FFB45A" fillOpacity=".85"><rect x="150" y="70" width="16" height="14" /><rect x="174" y="58" width="16" height="26" /><rect x="198" y="40" width="16" height="44" /><rect x="222" y="18" width="16" height="66" /></g>
          <path d="M150 74 Q 200 70 250 14" fill="none" stroke="#ff7a8a" strokeWidth="2" />
          <g fontFamily="var(--f-micro)" fontSize="10" fill="#D7F4FF"><text x="4" y="12">v</text><text x="66" y="96">v(t)</text><text x="188" y="96">s(t)</text><text x="280" y="96">t</text></g>
        </svg>
      </div>
      <div className="ms-card holo ms-panel-r" style={{ position: "absolute", right: "2.656%", top: "31.39%", width: u(330), height: u(196), padding: `${u(14)} ${u(16)}` }}>
        <div className="ms-card-h">Suite · 5 Unity projects</div>
        <svg viewBox="0 0 296 140" style={{ width: "100%", height: u(140), marginTop: u(6) }} aria-hidden="true">
          <path d="M40 40 L110 74 L176 34 L232 80 L268 40 M110 74 L150 118" fill="none" stroke="#9fe8ff" strokeOpacity=".7" strokeWidth="1.4" />
          <g fill="#dfe9f5" stroke="#61E2EB" strokeWidth="1.5"><circle cx="40" cy="40" r="9" /><circle cx="110" cy="74" r="11" /><circle cx="176" cy="34" r="9" /><circle cx="232" cy="80" r="9" /><circle cx="268" cy="40" r="8" /><circle cx="150" cy="118" r="8" /></g>
          <g fontFamily="var(--f-micro)" fontSize="8.5" fill="#D7F4FF"><text x="10" y="22">TEACHING</text><text x="78" y="100">MOTION</text><text x="150" y="16">VELOCITY</text><text x="206" y="104">SPEED</text><text x="238" y="22">LINEAR</text><text x="164" y="132">HUB</text></g>
        </svg>
      </div>
      <div className="ms-card chip" style={at(726, 372, { fontSize: um(13, 11), letterSpacing: ".12em", padding: `${u(6)} ${u(12)}`, background: "rgba(14,30,60,.6)", boxShadow: "0 0 16px rgba(97,226,235,.3)" })}>v · s · t</div>
      <Footer m={m} index={0} />
    </section>
  );
}

/* ───────────── CH09 Tirumala ───────────── */
export function TerrainOverlay({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const m = missionBySlug("tirumala")!;
  useScrub("terrain", ref, (tl, q) => {
    enter(tl, q);
    tl.fromTo(q(".tr-start"), { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0.3);
    tl.fromTo(q(".tr-gap"), { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.06, ease: "back.out(2)" }, 0.47);
    tl.fromTo(q(".tr-pin"), { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0.55);
    tl.to(q(".tr-start, .tr-gap, .tr-pin"), { opacity: 0, duration: 0.05 }, 0.9);
    return (p) => {
      cover.doors(1 - span(p, 0, 0.1));
      cover.black(Math.pow(span(p, 0.95, 1), 1.5));
    };
  }, 0.62);
  return (
    <section ref={ref} data-ch="terrain" className="nx-ch nx-anchors" data-active={active} aria-labelledby="terrain-h">
      <div className="ms-top-shade" style={{ height: "34%" }} />
      <Title m={m} top={92} color="#CDEBFF" glow="rgba(127,210,255,.6)" />
      <span id="terrain-h" className="nx-sr">Mission 2 of 4: {m.title}</span>
      <div className="ms-card holo" style={at(52, 262, { width: u(236), padding: `${u(10)} ${u(12)}`, transform: "perspective(900px) rotateY(18deg)", borderRadius: 6 })}>
        <div className="hud-micro" style={{ display: "flex", justifyContent: "space-between", fontSize: um(9.5, 9), color: "#61E2EB" }}><span>LOCALISATION</span><span>OFFLINE</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: u(12), marginTop: u(10) }}>
          {[1, 0].map((k) => <svg key={k} viewBox="0 0 46 46" style={{ width: u(46) }} fill="none" stroke="#9fe8ff" strokeWidth="1.4" aria-hidden="true"><circle cx="23" cy="23" r="19" strokeOpacity=".4" /><path d={k ? "M23 4 A19 19 0 1 1 6 31" : "M23 4 A19 19 0 0 1 40 30"} strokeWidth="3.5" /></svg>)}
          <svg viewBox="0 0 56 50" style={{ width: u(56) }} fill="none" stroke="#9fe8ff" strokeWidth="1.2" aria-hidden="true"><path d="M8 14 L28 4 L48 14 V36 L28 46 L8 36 Z M8 14 L28 24 L48 14 M28 24 V46" /></svg>
        </div>
        <div className="hud-micro" style={{ display: "flex", gap: u(22), marginTop: u(4), fontSize: um(9, 9), color: "#BFE4FF" }}><span>VIO</span><span>GPS · KALMAN</span></div>
        <div className="hud-micro" style={{ marginTop: u(6), fontSize: um(9, 9), color: "#9EC9DC" }}>+ COMPASS + LANDMARKS</div>
      </div>
      <div className="ms-card holo" style={{ position: "absolute", right: "4.06%", top: "35%", width: u(236), padding: `${u(10)} ${u(12)}`, transform: "perspective(900px) rotateY(-18deg)", borderRadius: 6 }}>
        <div className="hud-micro" style={{ display: "flex", justifyContent: "space-between", fontSize: um(9.5, 9), color: "#61E2EB" }}><span>ROUTING · A*</span><span>STEPS ROUTE</span></div>
        <svg viewBox="0 0 210 62" style={{ width: "100%", height: u(62), marginTop: u(8) }} aria-hidden="true"><path d="M2 58 L30 52 L60 46 L86 40 L104 30 M130 24 L160 14 L206 4" fill="none" stroke="#FFB45A" strokeWidth="2" /><path d="M104 30 L130 24" stroke="#FFB45A" strokeWidth="2" strokeDasharray="3 4" /><path d="M2 60 H208" stroke="#9fe8ff" strokeOpacity=".4" /></svg>
        <div className="hud-micro" style={{ fontSize: um(9, 9), lineHeight: 1.6, color: "#BFE4FF" }}>ELEVATION PROFILE · ILLUSTRATIVE<br />TURN INSTRUCTIONS · VOICE<br />POI · LANDMARK RECOGNITION</div>
      </div>
      <div className="tr-start anchor-label" style={{ left: "var(--sx, 18%)", top: "var(--sy, 62%)" }}>ALIPIRI <span>· START</span></div>
      <div className="tr-pin anchor-label" style={{ left: "var(--px, 67%)", top: "var(--py, 28%)" }}>TIRUMALA</div>
      <div className="tr-gap" style={{ position: "absolute", left: "var(--fx, 48%)", top: "var(--fy, 54%)", transform: "translate(calc(-100% - 40px), 30px)" }}>
        <div className="tr-gap-card">
          <div className="tr-gap-h">1.17 KM INTERPOLATED</div>
          <div className="tr-gap-p">Missing from OpenStreetMap · bridged with a flagged connector</div>
        </div>
      </div>
      <Footer m={m} index={1}><div className="ms-summary">{m.summary}</div></Footer>
    </section>
  );
}

/* ───────────── CH10 VR Cinema ───────────── */
export function CinemaOverlay({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const m = missionBySlug("vr-cinema")!;
  useScrub("cinema", ref, (tl, q) => {
    enter(tl, q);
    tl.fromTo(q(".cn-lock"), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.05, stagger: 0.03 }, 0.38);
    return (p) => cover.black(Math.max(1 - span(p, 0, 0.05), Math.pow(span(p, 0.94, 1), 1.4)));
  }, 0.6);
  return (
    <section ref={ref} data-ch="cinema" className="nx-ch" data-active={active} aria-labelledby="cinema-h">
      <div className="ms-top-shade" style={{ height: "32%", background: "linear-gradient(180deg, rgba(7,6,26,1) 0%, rgba(7,6,26,.8) 50%, rgba(7,6,26,0))" }} />
      <Title m={m} top={88} color="#E2DBFF" glow="rgba(154,124,255,.6)" />
      <span id="cinema-h" className="nx-sr">Mission 3 of 4: {m.title}</span>
      {[["ARGON2", 70, 290], ["JWT", 470, 330], ["AES", 330, 560]].map(([l, x, y]) => <div key={l as string} className="cn-lock chip" style={at(x as number, y as number, { letterSpacing: ".12em", background: "rgba(8,14,34,.7)" })}>{l}</div>)}
      <article className="ms-card glass" style={{ position: "absolute", right: "3.1%", top: "44.7%", width: u(404), padding: `${u(18)} ${u(20)}`, boxShadow: "inset 0 1px 0 rgba(255,255,255,.12), 0 20px 60px rgba(0,0,0,.45), 0 0 0 1px rgba(154,124,255,.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="hud-micro" style={{ fontSize: 10, letterSpacing: ".16em", color: "#9a7cff" }}>MISSION {m.code}</span>
          <span className="cn-pill">{m.tag}</span>
        </div>
        <h3 className="ms-card-title">{m.title}</h3>
        <p className="ms-card-body">{m.summary}</p>
        <div className="hud-micro ms-hudlines" style={{ marginTop: u(10) }}>{m.hud.map((h) => <div key={h}>{h}</div>)}</div>
        {m.context && <div className="ms-card-note">{m.context}</div>}
      </article>
      <Footer m={m} index={2}><div className="hud-micro" style={{ fontSize: 10.5, letterSpacing: ".1em", color: "#A5BFD3" }}>BUILT IN-LANGUAGE · NO FOOTAGE REFERENCE</div></Footer>
    </section>
  );
}

/* ───────────── CH11 ISRO hangar ───────────── */
export function HangarOverlay({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const m = missionBySlug("isro-launch-pad");
  useScrub("hangar", ref, (tl, q) => {
    tl.fromTo(q(".hg-plaque"), { opacity: 0, x: (i: number) => (i ? 40 : -40) }, { opacity: 1, x: 0, duration: 0.14, stagger: 0.08, ease: "power3.out" }, 0.08);
    tl.fromTo(q(".ms-foot, .ms-actions"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.1 }, 0.1);
    tl.to(q(".hg-plaque, .ms-foot, .ms-actions"), { opacity: 0, duration: 0.05 }, 0.9);
    return (p) => cover.black(Math.max(1 - span(p, 0, 0.05), Math.pow(span(p, 0.92, 1), 1.4)));
  }, 0.5);
  if (!m) return null;
  return (
    <section ref={ref} data-ch="hangar" className="nx-ch" data-active={active} aria-labelledby="hangar-h">
      <div className="ms-top-shade" style={{ height: "18%" }} />
      <div className="hg-plaque" style={at(58, 140, { transform: "perspective(900px) rotateY(20deg) rotateZ(-2.5deg)", transformOrigin: "0 50%" })}>
        <span className="corner-tl" style={{ borderWidth: 3 }} />
        <div className="hg-plaque-t">{m.system.join(" • ")}</div>
      </div>
      <div className="hg-plaque" style={at(760, 362, { transform: "perspective(900px) rotateY(-16deg)", transformOrigin: "100% 50%" })}>
        <span className="corner-br" style={{ borderWidth: 3 }} />
        <h2 id="hangar-h" className="hg-plaque-t" style={{ margin: 0 }}>{m.title}</h2>
      </div>
      <Footer m={m} index={3}>
        <div className="ms-summary">{m.context}</div>
        <div className="hud-micro ms-hudlines" style={{ display: "flex", gap: 14 }}>{m.hud.map((h) => <span key={h}>{h}</span>)}</div>
      </Footer>
    </section>
  );
}

/* ───────────── case file (T29 door swing) ───────────── */
export function CaseFile({ slug, onClose }: { slug: string; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const m = missionBySlug(slug);
  const plate = { "physics-learning": "lab", tirumala: "terrain", "vr-cinema": "cinema", "isro-launch-pad": "hangar" }[slug] ?? "lab";
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".cf-side-l", { rotateY: 75, opacity: 0 }, { rotateY: 0, opacity: 1, duration: 0.45, ease: "power3.out" });
      gsap.fromTo(".cf-side-r", { rotateY: -75, opacity: 0 }, { rotateY: 0, opacity: 1, duration: 0.45, ease: "power3.out" });
      gsap.fromTo(".cf-win", { scale: 0.92, opacity: 0, filter: "blur(6px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.45, ease: "power3.out" });
      gsap.fromTo(".cf-shade", { opacity: 0 }, { opacity: 1, duration: 0.3 });
    }, el);
    const release = trapFocus(el);
    return () => { release(); ctx.revert(); };
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  if (!m) return null;
  return (
    <div ref={ref} className="cf" role="dialog" aria-modal="true" aria-labelledby="cf-title" data-lenis-prevent>
      <div className="cf-shade" onClick={onClose} />
      <div className="cf-grid">
        <aside className="cf-side cf-side-l glass">
          <div className="cf-k">BRIEF</div>
          <div className="hud-micro ms-hudlines">{m.hud.map((h) => <div key={h}>{h}</div>)}</div>
          {m.objective && <><div className="cf-k">OBJECTIVE</div><p>{m.objective}</p></>}
          <div className="cf-k">SYSTEM</div>
          <div className="cf-chips">{m.system.map((s) => <span key={s} className="chip">{s}</span>)}</div>
        </aside>
        <div className="cf-win">
          <div className="cf-bar"><span>{m.tag}</span><button type="button" className="nx-btn-hud nx-btn-icon" onClick={onClose} aria-label="Close case file" autoFocus>✕</button></div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/nexus/plates/${plate}.jpg`} alt={m.image.alt} />
          <div className="cf-win-body">
            <div className="hud-micro" style={{ color: "#61E2EB", letterSpacing: ".16em" }}>MISSION {m.code}</div>
            <h2 id="cf-title">{m.title}</h2>
            <p>{m.summary}</p>
            <div className="cf-links">
              {m.source && <a className="ms-ghost" href={m.source} target="_blank" rel="noreferrer">SOURCE ↗</a>}
              {m.live && <a className="ms-live" href={m.live} target="_blank" rel="noreferrer">▶ LIVE DEMO</a>}
              {m.related?.map((r) => <a key={r.href} className="ms-ghost" href={r.href} target="_blank" rel="noreferrer" title={r.note}>{r.label} ↗</a>)}
            </div>
            <div className="hud-micro" style={{ color: "#7E8AA6", marginTop: 8 }}>RENDER · ILLUSTRATIVE (OUR 3D SCENE)</div>
          </div>
        </div>
        <aside className="cf-side cf-side-r glass">
          {m.coreMechanic && <><div className="cf-k">CORE MECHANIC</div><p>{m.coreMechanic}</p></>}
          {m.challenge && <><div className="cf-k" style={{ color: "#FFB45A" }}>CHALLENGE</div><p>{m.challenge}</p></>}
          {m.result && <><div className="cf-k">RESULT</div><p>{m.result}</p></>}
          {m.context && <><div className="cf-k">CONTEXT</div><p>{m.context}</p></>}
          {m.structure && <><div className="cf-k">STRUCTURE</div><ul>{m.structure.map((s) => <li key={s.href}><a href={s.href} target="_blank" rel="noreferrer">{s.label} ↗</a></li>)}</ul></>}
        </aside>
      </div>
    </div>
  );
}
