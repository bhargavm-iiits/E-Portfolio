"use client";
/**
 * /archive — the daylight side of the portal (KF43–KF46, KF53): light glass, fast and conventional.
 * Missions carousel (T39: 0.6 s slides, swipe, arrow keys), side quests, tech tiles (T43 hover tint).
 */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { missions, sideQuests, abilities } from "@/data/nexus";
import { BRAND_PATHS } from "@/data/brandIcons";
import { HexLogo } from "./ui/Shell";

const PLATE: Record<string, string> = { "physics-learning": "lab", tirumala: "terrain", "vr-cinema": "cinema", "isro-launch-pad": "hangar" };
const ORDER = ["physics-learning", "tirumala", "vr-cinema", "isro-launch-pad"];
const DETAIL: Record<string, [string, keyof (typeof missions)[number]]> = {
  "physics-learning": ["Core mechanic", "coreMechanic"], tirumala: ["Challenge", "challenge"], "vr-cinema": ["Core mechanic", "coreMechanic"], "isro-launch-pad": ["Context", "context"],
};
const TINT: Record<string, string> = { blender: "#F5792A", unity: "#222222", unreal: "#0E1128", csharp: "#68217A", python: "#3776AB", pytorch: "#EE4C2C", docker: "#2496ED", fastapi: "#009688", three: "#049EF4" };

export default function Archive() {
  const list = ORDER.map((s) => missions.find((m) => m.slug === s)).filter(Boolean) as typeof missions;
  const [i, setI] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const touch = useRef(0);
  const go = (d: number) => {
    const el = cardRef.current;
    const n = (i + d + list.length) % list.length;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) { setI(n); return; }
    gsap.to(el, { xPercent: -d * 8, opacity: 0, filter: "blur(6px)", duration: 0.25, ease: "power3.in", onComplete: () => {
      setI(n);
      gsap.fromTo(el, { xPercent: d * 8, opacity: 0, filter: "blur(6px)" }, { xPercent: 0, opacity: 1, filter: "blur(0px)", duration: 0.35, ease: "power3.out" });
    } });
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  useEffect(() => {
    gsap.fromTo(".ar-in", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: "power3.out" });
  }, []);
  const m = list[i];
  const [dh, dk] = DETAIL[m.slug];
  const prev = list[(i - 1 + list.length) % list.length], next = list[(i + 1) % list.length];
  return (
    <div className="ar">
      <div className="ar-bg" aria-hidden="true" />
      <nav className="ar-nav ar-in" aria-label="Archive">
        <Link href="/" className="ar-logo"><HexLogo size={32} id="ar-lg" /><span>NEXUS</span></Link>
        <div className="ar-links">
          <a href="#missions" aria-current="true">Missions</a><a href="#quests">Side Quests</a><a href="#tech">Tech</a>
          <Link href="/" className="ar-back">Back to NEXUS ↗</Link>
        </div>
      </nav>
      <main>
        <section id="missions" className="ar-carousel ar-in" aria-roledescription="carousel" aria-label="Missions">
          <div className="ar-peek ar-peek-l" aria-hidden="true"><span>{prev.title}</span></div>
          <div className="ar-peek ar-peek-r" aria-hidden="true"><em>{next.tag}</em><span>{next.title}</span></div>
          <div ref={cardRef} className="ar-card" aria-roledescription="slide" aria-label={`Mission ${i + 1} of ${list.length}`}
            onTouchStart={(e) => (touch.current = e.touches[0].clientX)} onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - touch.current; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); }}>
            <div className="ar-card-top"><span className="ar-mini"><HexLogo size={22} id="ar-lg2" /> NEXUS</span><span className="ar-count">Mission {i + 1} / {list.length} ›</span></div>
            <div className="ar-left">
              <span className="ar-pill">{m.tag.toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}</span>
              <h1>{m.title}</h1>
              <div className="ar-stack">{m.system.slice(0, 3).join(" • ")}</div>
              <p>{m.summary}</p>
              <div className="ar-cta-row">
                {m.source ? <a className="ar-cta" href={m.source} target="_blank" rel="noreferrer">Learn More</a> : <Link className="ar-cta" href={`/#${PLATE[m.slug]}`}>Learn More</Link>}
                <svg width="74" height="12" viewBox="0 0 74 12" fill="none" stroke="#5070CC" strokeWidth="1.6" aria-hidden="true"><path d="M0 6 H72 M66 1 L72 6 L66 11" /></svg>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="ar-img" src={`/nexus/plates/${PLATE[m.slug]}.jpg`} alt={m.image.alt} />
            <div className="ar-detail"><h2>{dh}</h2><p>{String(m[dk] ?? m.summary)}</p></div>
          </div>
          <button type="button" className="ar-arrow ar-arrow-l" aria-label="Previous mission" onClick={() => go(-1)}>‹</button>
          <button type="button" className="ar-arrow ar-arrow-r" aria-label="Next mission" onClick={() => go(1)}>›</button>
          <div className="ar-dots" role="tablist" aria-label="Missions">
            {list.map((x, k) => <button key={x.slug} type="button" role="tab" aria-selected={k === i} aria-label={x.title} onClick={() => go(k - i)}><span /></button>)}
          </div>
        </section>
        <section id="quests" className="ar-sec ar-in" aria-labelledby="ar-q">
          <h2 id="ar-q">Side quests</h2>
          <ul className="ar-grid">
            {sideQuests.map((s) => (
              <li key={s.id} className="ar-tile"><a href={s.live ?? s.source} target="_blank" rel="noreferrer">
                <em>{s.category === "ai" ? "AI/ML" : "WEB"}</em><strong>{s.title}</strong><span>{s.kind}</span><small>{s.stack.join(" · ")}</small>
              </a></li>
            ))}
          </ul>
        </section>
        <section id="tech" className="ar-sec ar-in" aria-labelledby="ar-t">
          <h2 id="ar-t">Tech stack</h2>
          <ul className="ar-tech">
            {abilities.map((a) => {
              const path = (BRAND_PATHS as Record<string, string>)[a.mark];
              return (
                <li key={a.id} style={{ ["--tint" as string]: TINT[a.mark] ?? "#5070CC" }}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">{path ? <path d={path} fill="currentColor" /> : <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="currentColor">{a.label.slice(0, 3)}</text>}</svg>
                  <span>{a.label}</span><small>{a.role}</small>
                </li>
              );
            })}
          </ul>
        </section>
        <div className="ar-end"><Link href="/#home" className="ar-cta">Re-enter the NEXUS →</Link></div>
      </main>
    </div>
  );
}
