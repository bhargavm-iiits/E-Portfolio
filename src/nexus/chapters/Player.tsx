"use client";
/**
 * CH12 Abilities (KF34), CH13 Player Log (KF65), CH14 Vault (KF69 vitrines, KF55 side quests),
 * CH15 Finale (KF36). All copy from src/data/nexus.ts.
 */
import { useRef, useState, type ReactNode } from "react";
import { useScrub, span } from "../ui/useScrub";
import { cover } from "../cover";
import { jump } from "../ui/Shell";
import { openCase } from "./Missions";
import { at, u, um } from "../ui/units";
import { abilities, log, nextObjective, missions, sideQuests, questCategoryLabel, type Ability, type Evidence } from "@/data/nexus";
import { BRAND_PATHS } from "@/data/brandIcons";

/* ───────────── CH12 Abilities ───────────── */
const NODE_POS: Record<string, [number, number]> = {
  csharp: [248, 172], arf: [168, 262], unreal: [156, 350], blender: [206, 440], three: [230, 528],
  rag: [830, 152], python: [853, 236], fastapi: [864, 320], docker: [864, 402], lora: [853, 484], pytorch: [816, 562],
};
const CONNECT: Record<string, string> = {
  unity: "M640 162 V214", csharp: "M455 200 L536 270", arf: "M430 288 L508 318", unreal: "M425 376 L506 370", blender: "M440 462 L520 418", three: "M465 548 L548 452",
  rag: "M822 176 L748 270", python: "M845 258 L770 318", fastapi: "M856 340 L780 364", docker: "M856 422 L780 400", lora: "M845 504 L768 440", pytorch: "M822 586 L742 460",
};
const BRAND_FILL: Partial<Record<Ability["mark"], string>> = { blender: "#F5792A", fastapi: "#61E2EB", docker: "#5aa7ff" };

function Mark({ a }: { a: Ability }) {
  const violet = a.tone === "violet";
  const path = (BRAND_PATHS as Record<string, string>)[a.mark];
  if (path) return <svg viewBox="0 0 24 24" fill={violet ? "#B9A6FF" : BRAND_FILL[a.mark] ?? "#F2F8FF"} aria-hidden="true"><path d={path} /></svg>;
  if (a.mark === "csharp") return <svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M20 2 L36 11 V29 L20 38 L4 29 V11 Z" stroke="#61E2EB" strokeWidth="2.4" /><text x="20" y="25" textAnchor="middle" fontFamily="var(--f-chakra)" fontWeight="700" fontSize="13" fill="#F2F8FF">C#</text></svg>;
  if (a.mark === "arf") return <svg viewBox="0 0 40 40" fill="none" stroke="#61E2EB" strokeWidth="2" aria-hidden="true"><path d="M20 8 L31 14 V26 L20 32 L9 26 V14 Z M9 14 L20 20 L31 14 M20 20 V32" /><path d="M3 10 V3 H10 M30 3 H37 V10 M37 30 V37 H30 M10 37 H3 V30" strokeWidth="2.4" /></svg>;
  if (a.mark === "rag") return <svg viewBox="0 0 40 40" fill="none" stroke="#61E2EB" strokeWidth="2" aria-hidden="true"><ellipse cx="17" cy="10" rx="11" ry="4" /><path d="M6 10 V28 C6 31 28 31 28 28 V10 M6 19 C6 22 28 22 28 19" /><path d="M26 30 L36 30 M32 26 L36 30 L32 34" strokeWidth="2.4" /></svg>;
  return <svg viewBox="0 0 40 40" fill="none" stroke="#B9A6FF" strokeWidth="2" aria-hidden="true"><rect x="4" y="6" width="7" height="28" rx="1.5" /><rect x="15" y="16" width="21" height="7" rx="1.5" /><path d="M11 20 H15" /></svg>;
}

function evidenceTarget(e: Evidence) {
  if (e.kind === "mission") return { tirumala: "terrain", "physics-learning": "lab", "vr-cinema": "cinema", "isro-launch-pad": "hangar" }[e.slug] ?? "menu";
  if (e.kind === "quest") return "vault";
  return "log";
}

export function AbilitiesOverlay({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [sel, setSel] = useState("pytorch");
  useScrub("abilities", ref, (tl, q) => {
    tl.fromTo(q(".ab-core"), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.12, ease: "back.out(1.6)" }, 0.02);
    // T36 comet fly-in: nodes arrive from the lower left on curved paths
    tl.fromTo(q(".ab-node"), { opacity: 0, x: () => -260, y: () => 220, scale: 0.6 }, { opacity: 1, x: 0, y: 0, scale: 1, duration: 0.14, stagger: 0.012, ease: "power3.out" }, 0.06);
    tl.fromTo(q(".ab-link"), { opacity: 0 }, { opacity: 1, duration: 0.08, stagger: 0.01 }, 0.18);
    tl.fromTo(q(".ab-tip"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.06 }, 0.26);
    tl.to(q(".ab-fade"), { opacity: 0, duration: 0.05 }, 0.92);
    return (p) => {
      cover.black(1 - span(p, 0, 0.06));
      cover.violet(Math.pow(span(p, 0.93, 1), 1.3));
    };
  }, 0.5);
  const cur = abilities.find((a) => a.id === sel) ?? abilities[0];
  const left = (NODE_POS[cur.id]?.[0] ?? 0) < 640 && cur.id !== "unity";
  return (
    <section ref={ref} data-ch="abilities" className="nx-ch" id="abilities" data-active={active} aria-labelledby="ab-h">
      <h2 id="ab-h" className="ab-fade hud-micro" style={at(40, 86, { margin: 0, fontWeight: 400, fontSize: um(12, 11), letterSpacing: ".3em", color: "#A5BFD3" })}>ABILITY TREE</h2>
      <div className="ab-fade" style={{ position: "absolute", inset: 0 }}>
        <svg className="hud-svg ab-core" viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid meet" aria-hidden="true" style={{ transformOrigin: "50% 50%" }}>
          <defs>
            <linearGradient id="ab-cone" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#61E2EB" stopOpacity=".42" /><stop offset="1" stopColor="#61E2EB" stopOpacity="0" /></linearGradient>
            <radialGradient id="ab-core-g" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#E8FBFF" /><stop offset=".45" stopColor="#7FE6FF" /><stop offset="1" stopColor="#1b6a9a" stopOpacity="0" /></radialGradient>
          </defs>
          <g stroke="#BFEFFF" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 6px rgba(191,239,255,.6))" }}>
            <path className="ab-streak" d="M150 40 L250 140 M1130 40 L1030 140 M60 250 L200 290 M1220 250 L1080 290 M40 470 L180 440 M1240 470 L1100 440 M330 0 L380 80 M950 0 L900 80" strokeWidth="5" strokeOpacity=".38" />
            <path d="M90 140 L190 205 M1190 140 L1090 205 M110 640 L230 560 M1170 640 L1050 560" strokeWidth="3" strokeOpacity=".24" />
          </g>
          <g stroke="#2f5d8a" strokeOpacity=".35" fill="none"><path d="M640 600 L-200 720 M640 600 L160 720 M640 600 L400 720 M640 600 L880 720 M640 600 L1120 720 M640 600 L1480 720" /></g>
          <path d="M520 600 L600 300 H680 L760 600 Z" fill="url(#ab-cone)" />
          <ellipse cx="640" cy="612" rx="214" ry="52" fill="#060b18" stroke="#1e3a5c" strokeWidth="2" />
          <g fill="none" stroke="#61E2EB" style={{ filter: "drop-shadow(0 0 5px rgba(97,226,235,.9))" }}>
            <ellipse className="ab-pulse" cx="640" cy="604" rx="178" ry="40" strokeWidth="3" strokeOpacity=".9" strokeDasharray="70 18 40 18" />
            <ellipse cx="640" cy="602" rx="134" ry="30" strokeWidth="2" strokeOpacity=".8" />
            <ellipse cx="640" cy="600" rx="96" ry="21" strokeWidth="5" strokeDasharray="40 10" />
          </g>
          <ellipse cx="640" cy="599" rx="62" ry="14" fill="url(#ab-core-g)" />
          <g fill="none">
            <circle cx="640" cy="352" r="112" stroke="#6E7FD8" strokeWidth="1.4" strokeOpacity=".7" />
            <circle className="ab-spin" cx="640" cy="352" r="132" stroke="#8EA0FF" strokeWidth="6" strokeOpacity=".75" strokeDasharray="210 40 130 60 160 229" />
            <circle className="ab-spin-r" cx="640" cy="352" r="146" stroke="#61E2EB" strokeOpacity=".5" strokeDasharray="3 7" />
            <g className="ab-emblem" style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,.6))" }}>
              <path d="M640 290 L694 321 V383 L640 414 L586 383 V321 Z" stroke="#F2F8FF" strokeWidth="11" />
              <path d="M640 296 V310 M688 324 L676 331 M688 380 L676 373 M640 408 V394 M592 380 L604 373 M592 324 L604 331" stroke="#04060d" strokeWidth="5" />
            </g>
          </g>
          <g stroke="#9FD0FF" strokeOpacity=".5" fill="none">
            {abilities.map((a) => <path key={a.id} className="ab-link" d={CONNECT[a.id]} stroke={a.id === sel ? (a.tone === "violet" ? "#B9A6FF" : "#61E2EB") : undefined} strokeOpacity={a.id === sel ? 1 : 0.5} strokeWidth={a.id === sel ? 1.8 : 1} />)}
          </g>
        </svg>
        {abilities.map((a) => {
          const isCore = a.id === "unity";
          const pos = NODE_POS[a.id] ?? [532, 96];
          const on = a.id === sel;
          return (
            <button key={a.id} type="button" className="ab-node nx-hit" data-core={isCore} data-on={on} data-tone={a.tone}
              style={at(pos[0], pos[1], isCore ? { width: u(216), height: u(64) } : {})}
              onMouseEnter={() => setSel(a.id)} onFocus={() => setSel(a.id)} onClick={() => setSel(a.id)} aria-pressed={on} aria-describedby={on ? "ab-tip" : undefined}>
              <span className="ab-mark"><Mark a={a} /></span>
              <span><span className="ab-label">{a.label}</span><span className="ab-role">{a.role}</span></span>
            </button>
          );
        })}
        <div id="ab-tip" role="tooltip" className="ab-tip glass" data-tone={cur.tone} style={left ? { position: "absolute", left: "3.1%", bottom: "3%", width: u(240) } : { position: "absolute", right: "1.25%", bottom: "3%", width: u(222) }}>
          <div className="hud-micro" style={{ fontSize: um(9.5, 9), letterSpacing: ".14em", color: cur.tone === "violet" ? "#B9A6FF" : "#61E2EB" }}>{cur.label.toUpperCase()} · {cur.role}</div>
          <p>{cur.blurb}</p>
          <div className="ab-ev">{cur.usedIn.map((e) => <button key={e.label} type="button" className="chip nx-hit" data-log={e.kind === "log"} onClick={() => jump(evidenceTarget(e))}>{e.label}</button>)}</div>
        </div>
      </div>
    </section>
  );
}

/* ───────────── CH13 Player Log ───────────── */
const LOG_POS: [number, number, number, "pink" | "cyan" | "amber"][] = [[40, 112, 280, "pink"], [960, 98, 288, "cyan"], [40, 470, 300, "pink"], [986, 286, 262, "amber"]];
export function PlayerLogOverlay({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useScrub("log", ref, (tl, q) => {
    tl.set(q(".lg-rib"), { strokeDasharray: "1 1", strokeDashoffset: 1 }, 0);
    tl.to(q(".lg-rib"), { strokeDashoffset: 0, duration: 0.25, stagger: 0.03, ease: "power2.out" }, 0.16);
    tl.fromTo(q(".lg-entry"), { opacity: 0, clipPath: "inset(0 0 100% 0)", y: 10 }, { opacity: 1, clipPath: "inset(0 0 0% 0)", y: 0, duration: 0.1, stagger: 0.12, ease: "power2.out" }, 0.22);
    tl.fromTo(q(".lg-obj"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.06 }, 0.78);
    tl.fromTo(q(".lg-h"), { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0.04);
    tl.to(q(".lg-fade"), { opacity: 0, duration: 0.05 }, 0.92);
    return (p) => {
      cover.violet(1 - span(p, 0, 0.07));
      cover.black(Math.pow(span(p, 0.93, 1), 1.4));
    };
  }, 0.85);
  const kinds: Record<string, string> = { education: "EDUCATION", work: "", achievement: "ACHIEVEMENT" };
  return (
    <section ref={ref} data-ch="log" className="nx-ch" id="log" data-active={active} aria-labelledby="lg-h">
      <div className="lg-fade" style={{ position: "absolute", inset: 0 }}>
        <svg className="lg-ribbons" aria-hidden="true">
          <defs>
            <linearGradient id="rp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FF5FD2" /><stop offset="1" stopColor="#8A6CFF" /></linearGradient>
            <linearGradient id="rc" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#61E2EB" /><stop offset="1" stopColor="#4E84EB" /></linearGradient>
          </defs>
          <g className="lg-anchor-l" style={{ filter: "drop-shadow(0 0 6px #FF5FD2) drop-shadow(0 0 14px rgba(255,95,210,.6))" }}>
            <path className="lg-rib" pathLength={1} d="M0 0 C -22 78, -82 188, -232 246" stroke="url(#rp)" strokeWidth="8" fill="none" strokeLinecap="round" />
            <path className="lg-rib" pathLength={1} d="M0 0 C -2 -72, 28 -122, 68 -142" stroke="url(#rp)" strokeWidth="2" fill="none" strokeDasharray="6 6" />
            <path className="lg-rib" pathLength={1} d="M-52 98 C -22 128, 28 148, 88 148" stroke="url(#rp)" strokeWidth="2" fill="none" />
          </g>
          <g className="lg-anchor-r" style={{ filter: "drop-shadow(0 0 6px #61E2EB) drop-shadow(0 0 14px rgba(97,226,235,.6))" }}>
            <path className="lg-rib" pathLength={1} d="M0 0 C 68 -50, 158 -180, 358 -240" stroke="url(#rc)" strokeWidth="8" fill="none" strokeLinecap="round" />
            <path className="lg-rib" pathLength={1} d="M78 -100 C 68 -160, 68 -220, 78 -248" stroke="url(#rc)" strokeWidth="2" fill="none" />
            <path className="lg-rib" pathLength={1} d="M178 -190 C 158 -270, 98 -360, 68 -398" stroke="url(#rc)" strokeWidth="2" fill="none" />
          </g>
        </svg>
        <h2 id="lg-h" className="lg-h hud-micro" style={at(40, 84, { margin: 0, fontWeight: 400, fontSize: um(12, 11), letterSpacing: ".3em", color: "#A5BFD3" })}>PLAYER LOG</h2>
        <ol className="lg-list">
          {log.map((e, i) => {
            const [x, y, w, tone] = LOG_POS[i] ?? LOG_POS[0];
            const right = x > 640;
            return (
              <li key={e.code} className="lg-entry glass" data-tone={tone} style={right ? { position: "absolute", right: `${((1280 - x - w) / 12.8).toFixed(2)}%`, top: `${(y / 7.2).toFixed(2)}%`, width: u(w) } : at(x, y, { width: u(w) })}>
                <div className="lg-meta"><span>{e.code}{kinds[e.kind] ? (kinds[e.kind] === e.code ? "" : ` · ${kinds[e.kind]}`) : ` · ${e.role.toUpperCase()}`}</span><span>{e.period}{e.where ? ` · ${e.where.toUpperCase()}` : ""}</span></div>
                <div className="lg-org">{e.org}</div>
                {e.kind !== "work" && <div className="lg-role">{e.role}</div>}
                {e.desc.slice(0, e.kind === "work" && e.code === "LOG 02" ? 1 : 2).map((d) => <p key={d}>{d}</p>)}
                {e.badge && <div className="lg-badge">{e.badge}</div>}
              </li>
            );
          })}
        </ol>
        <div className="lg-obj"><span />NEXT OBJECTIVE · {nextObjective.toUpperCase()}</div>
      </div>
    </section>
  );
}

/* ───────────── CH14 Vault ───────────── */
const DOMAIN: Record<string, string[]> = { "physics-learning": ["game"], tirumala: ["xr"], "vr-cinema": ["xr"], "isro-launch-pad": ["sim"] };
const PLATE: Record<string, string> = { "physics-learning": "lab", tirumala: "terrain", "vr-cinema": "cinema", "isro-launch-pad": "hangar" };

function Vitrine({ children, style, className = "", dim }: { children: ReactNode; style: React.CSSProperties; className?: string; dim: boolean }) {
  return (
    <article className={`vt ${className}`} data-dim={dim} style={style}>
      <div className="vt-depth" /><div className="vt-glass" />
      {children}
    </article>
  );
}

export function VaultOverlay({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [domain, setDomain] = useState("all");
  const [cat, setCat] = useState<"all" | "ai" | "web">("all");
  useScrub("vault", ref, (tl, q) => {
    // T35 vitrines rise and fade in, staggered
    tl.fromTo(q(".vt"), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.1, stagger: 0.04, ease: "power2.out" }, 0.04);
    tl.fromTo(q(".vt-node"), { opacity: 0 }, { opacity: 1, duration: 0.06 }, 0.18);
    tl.fromTo(q(".vt-filter"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.06 }, 0.14);
    tl.to(q(".vt-stage"), { opacity: 0, y: -30, duration: 0.07, ease: "power2.in" }, 0.5);
    // T27 side-quest cards materialise
    tl.fromTo(q(".sq-stage"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.02 }, 0.56);
    tl.fromTo(q(".sq-card"), { opacity: 0, scale: 0.94, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.08, stagger: 0.015, ease: "power2.out" }, 0.57);
    tl.to(q(".sq-stage"), { opacity: 0, duration: 0.04 }, 0.94);
    return (p) => {
      cover.black(1 - span(p, 0, 0.05));
      cover.white(Math.pow(span(p, 0.95, 1), 1.3));
    };
  }, 0.3);
  const ms = missions;
  const big = ms.find((m) => m.slug === "physics-learning") ?? ms[0];
  const side = ms.filter((m) => m !== big);
  const isDim = (slug: string) => domain !== "all" && !(DOMAIN[slug] ?? []).includes(domain);
  const quests = sideQuests.filter((s) => cat === "all" || s.category === cat);
  return (
    <section ref={ref} data-ch="vault" className="nx-ch" id="vault" data-active={active} aria-labelledby="vt-h">
      <div className="vt-stage" style={{ position: "absolute", inset: 0 }}>
        <h2 id="vt-h" className="hud-micro" style={at(40, 84, { margin: 0, fontWeight: 400, fontSize: um(12, 11), letterSpacing: ".3em", color: "#A5BFD3" })}>THE VAULT · ALL MISSIONS</h2>
        <svg className="hud-svg vt-node" viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          <g fill="none" strokeLinecap="round" strokeWidth="2.4" style={{ filter: "drop-shadow(0 0 5px currentColor)" }}>
            <path d="M210 676 C 260 640, 300 640, 330 612" stroke="#FF5FD2" color="#FF5FD2" strokeOpacity=".8" />
            <path d="M470 676 C 520 650, 600 620, 640 380" stroke="#61E2EB" color="#61E2EB" strokeOpacity=".8" />
            <path d="M690 676 C 700 640, 700 600, 702 584" stroke="#8A6CFF" color="#8A6CFF" strokeOpacity=".8" />
          </g>
        </svg>
        <Vitrine className="vt-big" dim={isDim(big.slug)} style={at(96, 116, { width: u(520), height: u(496), transform: "perspective(1400px) rotateY(16deg)", transformOrigin: "0 50%" })}>
          <div className="vt-bar" style={{ height: u(58) }}><span className="corner-tl" style={{ borderWidth: 3 }} /><span className="corner-br" style={{ borderWidth: 3 }} /><h3 style={{ fontSize: um(25, 15) }}>{big.title}</h3></div>
          <div className="vt-body">
            <div className="vt-tiles">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <figure><img src="/nexus/plates/lab.jpg" alt="Lab render: pedestal with the glass cube" style={{ objectPosition: "50% 60%" }} /><figcaption>Physics</figcaption></figure>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <figure><img src="/nexus/plates/lab.jpg" alt="Lab render: molecules and the gold cube" style={{ objectPosition: "18% 40%", transform: "scale(1.4)" }} /><figcaption>Kinematics</figcaption></figure>
            </div>
            <div className="vt-info">
              <div className="vt-info-h">Game design</div>
              <p>{big.summary}</p>
              <div className="vt-chips">{big.system.map((s) => <span key={s} className="chip">{s.toUpperCase()}</span>)}</div>
            </div>
          </div>
          <div className="vt-btns">
            <button type="button" className="nx-hit" onClick={() => openCase(big.slug)}>◎ CASE FILE</button>
            {big.source && <a className="nx-hit" href={big.source} target="_blank" rel="noreferrer">SOURCE ↗</a>}
            <span>{big.structure?.length ?? 0} PROJECTS</span>
          </div>
        </Vitrine>
        <div className="vt-badge vt-node" style={at(620, 352)}>C#</div>
        {side.map((m, i) => (
          <Vitrine key={m.slug} className="vt-small" dim={isDim(m.slug)} style={at(700, [104, 290, 476][i] ?? 476, { width: u(470), height: u(170), transform: "perspective(1400px) rotateY(-14deg)", transformOrigin: "100% 50%" })}>
            <div className="vt-bar vt-bar-s"><span className="corner-tl" /><h3 style={{ fontSize: um(18, 13) }}>{m.title}</h3></div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="vt-img" src={`/nexus/plates/${PLATE[m.slug]}.jpg`} alt={m.image.alt} />
            <p className="vt-sum">{m.summary}</p>
            <button type="button" className="vt-tag nx-hit" onClick={() => openCase(m.slug)}>{m.code} · {m.tag} ›</button>
          </Vitrine>
        ))}
        <div className="vt-filter" role="group" aria-label="Filter missions by domain">
          <span className="hud-micro">FILTER</span>
          {[["all", "ALL"], ["xr", "XR / VR / AR"], ["game", "GAME DESIGN"], ["sim", "3D & SIMULATION"]].map(([k, l]) => (
            <button key={k} type="button" className="vt-f nx-hit" aria-pressed={domain === k} onClick={() => setDomain(k)}>{l}</button>
          ))}
        </div>
      </div>
      <div className="sq-stage" style={{ position: "absolute", inset: 0, visibility: "hidden" }}>
        <div className="sq-head" style={at(90, 92, { right: "7%", display: "flex", justifyContent: "space-between", alignItems: "center" })}>
          <h3 className="hud-micro" style={{ margin: 0, fontWeight: 400, fontSize: um(12, 11), letterSpacing: ".3em", color: "#A5BFD3" }}>SIDE QUESTS · {String(sideQuests.length).padStart(2, "0")}</h3>
          <div role="group" aria-label="Filter side quests" style={{ display: "flex", gap: 8 }}>
            {([["all", "ALL"], ["ai", "AI/ML"], ["web", "WEB"]] as const).map(([k, l]) => <button key={k} type="button" className="vt-f nx-hit" aria-pressed={cat === k} onClick={() => setCat(k)}>{l}</button>)}
          </div>
        </div>
        <ul className="sq-grid" style={at(90, 140, { width: u(1100) })}>
          {quests.map((s, i) => (
            <li key={s.id} className="sq-card" data-light={i % 3 === 0}>
              <span className="sq-menu" aria-hidden="true" />
              <div className="sq-cat" data-cat={s.category}>{questCategoryLabel[s.category]}</div>
              <h4>{s.title}</h4>
              <p>{s.kind}</p>
              <div className="sq-stack">{s.stack.join(" · ")}</div>
              <div className="sq-row">
                <a className="nx-hit" href={s.source} target="_blank" rel="noreferrer">SOURCE</a>
                {s.note && <span>{s.note}</span>}
                {s.live ? <a className="sq-go nx-hit" href={s.live} target="_blank" rel="noreferrer" aria-label={`Open ${s.title} live`}>↗</a> : <a className="sq-go nx-hit" href={s.source} target="_blank" rel="noreferrer" aria-label={`Open ${s.title} on GitHub`}>→</a>}
              </div>
            </li>
          ))}
          <li className="sq-card" data-light="false">
            <div className="sq-cat">ARCHIVE</div>
            <h4>More on GitHub</h4>
            <p>Every repository, including the mission sources.</p>
            <div className="sq-stack">github.com/bhargavm-iiits</div>
            <div className="sq-row"><a className="nx-hit" href="https://github.com/bhargavm-iiits" target="_blank" rel="noreferrer">OPEN</a><a className="sq-go nx-hit" href="https://github.com/bhargavm-iiits" target="_blank" rel="noreferrer" aria-label="Open GitHub">→</a></div>
          </li>
        </ul>
      </div>
    </section>
  );
}

/* ───────────── CH15 Finale ───────────── */
export function FinaleOverlay({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useScrub("finale", ref, (tl, q) => {
    // T37 settle: the hero text resolves from a radial zoom; T25 reticle on the CTA
    tl.fromTo(q(".fn-name"), { opacity: 0, scale: 0.92, filter: "blur(8px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.12, ease: "power3.out" }, 0.04);
    tl.fromTo(q(".fn-in"), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.08, stagger: 0.03, ease: "power2.out" }, 0.1);
    tl.fromTo(q(".fn-reticle"), { opacity: 0, scale: 1.4 }, { opacity: 1, scale: 1, duration: 0.03 }, 0.26).to(q(".fn-reticle"), { opacity: 0, duration: 0.03 }, 0.3);
    tl.fromTo(q(".fn-deco"), { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0.08);
    return (p) => cover.white(1 - span(p, 0, 0.08));
  }, 0.6);
  return (
    <section ref={ref} data-ch="finale" className="nx-ch" id="finale" data-active={active} aria-labelledby="fn-h">
      <svg className="hud-svg fn-deco" viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g fill="none" stroke="#2A3A55"><g className="fn-arc"><circle cx="1152" cy="50" r="168" /><circle cx="1152" cy="50" r="200" /><path d="M1030 165 L1060 145 M1236 214 L1218 190" /></g><g className="fn-arc-r"><circle cx="128" cy="600" r="150" /><circle cx="128" cy="600" r="182" /><path d="M22 460 L38 482 M270 520 L248 532" /></g></g>
      </svg>
      <div className="fn-rail fn-deco" style={{ left: u(33) }}><i /><b /><i /></div>
      <div className="fn-rail fn-deco" style={{ right: u(33) }}><i /><b /><i /></div>
      <div className="fn-main">
        <h2 id="fn-h" className="fn-name">BHARGAV M</h2>
        <div className="fn-role fn-in">UNITY • XR • AR/VR • GAME DEVELOPMENT</div>
        <div className="fn-div fn-in" />
        <p className="fn-body fn-in">Creating interactive worlds through immersive technology</p>
        <div className="fn-in" style={{ position: "relative", marginTop: u(30) }}>
          <button type="button" className="nx-cta nx-hit" style={{ width: u(253), minWidth: 220, height: u(50), minHeight: 46 }} onClick={() => jump("menu")}>
            <span style={{ fontSize: um(16, 14), letterSpacing: ".04em" }}>EXPLORE PORTFOLIO <span className="arr">→</span></span>
          </button>
          <svg className="fn-reticle" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="28" fill="none" stroke="#61E2EB" strokeWidth="1.5" /><path d="M32 0 V10 M32 54 V64 M0 32 H10 M54 32 H64" stroke="#61E2EB" strokeWidth="1.5" /></svg>
        </div>
      </div>
      <div className="fn-dots fn-deco" aria-hidden="true"><i data-on="true" /><i /><i /></div>
      <button type="button" className="fn-down nx-hit hud-micro" onClick={() => jump("comms")}>ESTABLISH CONTACT ↓</button>
    </section>
  );
}
