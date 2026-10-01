"use client";
/**
 * 02 MISSIONS (screenshot §5): three image-first mission frames — media inset,
 * title, calm summary, a specific category tag and a VIEW BRIEF text action
 * sharing one bottom row. The additional ISRO mission and the side builds
 * follow, so every project is reachable from the default browsing view.
 */
import { useEffect, useState } from "react";
import { extraMissions, primaryMissions, questCategoryLabel, sideQuests, type Mission } from "@/data/nexus";
import { openBriefing } from "@/lib/nav";
import { Icon } from "@/components/hud/Icons";
import HudFrame, { RailHead } from "@/components/hud/HudFrame";

function MissionMedia({ m, wide = false }: { m: Mission; wide?: boolean }) {
  return (
    <div className={`mission__media${wide ? " mission__media--wide" : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={m.image.src} alt={m.image.alt} loading="lazy" decoding="async" width={960} height={600} />
      <span className="mission__code" aria-hidden="true">
        M{m.code.slice(-2)}
      </span>
    </div>
  );
}

function BriefAction({ m }: { m: Mission }) {
  return (
    <button type="button" className="text-action mission__brief" onClick={() => openBriefing(m.slug)}>
      VIEW BRIEF <Icon.arrowRight size={16} />
      <span className="sr-only">: {m.title}</span>
    </button>
  );
}

function MissionCard({ m }: { m: Mission }) {
  return (
    <HudFrame as="article" className="mission" cut={[0, 16, 0, 16]} inset={5} accents={["tl", "br"]} dots aria-labelledby={`mission-${m.slug}`}>
      <MissionMedia m={m} />
      <div className="mission__body">
        <h3 id={`mission-${m.slug}`} className="mission__title">
          {m.title}
        </h3>
        <p className="mission__summary">{m.summary}</p>
      </div>
      <div className="mission__foot">
        <span className="tag">{m.tag}</span>
        <BriefAction m={m} />
      </div>
    </HudFrame>
  );
}

function ExtraMission({ m }: { m: Mission }) {
  return (
    <HudFrame as="article" className="mission mission--wide" cut={[0, 16, 0, 16]} inset={5} accents={["tr", "bl"]} aria-labelledby={`mission-${m.slug}`}>
      <MissionMedia m={m} wide />
      <div className="mission__wide-body">
        <p className="t-meta">ADDITIONAL MISSION // {m.code}</p>
        <h3 id={`mission-${m.slug}`} className="mission__title">
          {m.title}
        </h3>
        <p className="mission__summary">{m.summary}</p>
        {m.context && <p className="mission__context">{m.context}</p>}
        <div className="mission__foot">
          <span className="tag">{m.tag}</span>
          <BriefAction m={m} />
        </div>
      </div>
    </HudFrame>
  );
}

function SideBuilds() {
  const [flash, setFlash] = useState<string | null>(null);

  // Ability-tree evidence links land here and highlight the build.
  useEffect(() => {
    const onQuest = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      const el = document.getElementById(`build-${id}`);
      if (!el) return;
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      el.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
      setFlash(id);
      window.setTimeout(() => setFlash(null), 1800);
    };
    window.addEventListener("nexus:quest", onQuest);
    return () => window.removeEventListener("nexus:quest", onQuest);
  }, []);

  return (
    <div className="builds" aria-labelledby="builds-title">
      <div className="builds__head">
        <h3 id="builds-title" className="t-meta builds__title">
          SIDE BUILDS <span>· {sideQuests.length} AI/ML &amp; WEB PROJECTS</span>
        </h3>
      </div>
      <ul className="builds__grid">
        {sideQuests.map((q) => (
          <li key={q.id} id={`build-${q.id}`} className="build" data-flash={flash === q.id}>
            <p className="build__kind t-meta">
              {questCategoryLabel[q.category]} · {q.kind}
            </p>
            <h4 className="build__title">{q.title}</h4>
            <p className="build__stack">{q.stack.join(" · ")}</p>
            {q.note && <p className="build__note">{q.note}</p>}
            <p className="build__links">
              <a href={q.source} target="_blank" rel="noopener noreferrer" className="text-action">
                SOURCE <Icon.external size={13} />
                <span className="sr-only"> for {q.title} (GitHub, opens in a new tab)</span>
              </a>
              {q.live && (
                <a href={q.live} target="_blank" rel="noopener noreferrer" className="text-action">
                  LIVE <Icon.external size={13} />
                  <span className="sr-only"> demo of {q.title} (opens in a new tab)</span>
                </a>
              )}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Missions() {
  return (
    <section id="missions" className="missions" data-section="missions" aria-labelledby="missions-title">
      <svg className="section-edge" viewBox="0 0 1000 24" preserveAspectRatio="none" aria-hidden="true">
        <path d="M 0 23 H 30 L 52 1 H 1000" />
      </svg>
      <div className="wrap">
        <RailHead id="missions-title" title="SELECT YOUR NEXT MISSION" sub="REAL PROJECTS. TANGIBLE IMPACT." />
        <ul className="mission-grid" data-reveal="stagger">
          {primaryMissions.map((m) => (
            <li key={m.slug}>
              <MissionCard m={m} />
            </li>
          ))}
        </ul>
        {extraMissions.map((m) => (
          <ExtraMission key={m.slug} m={m} />
        ))}
        <SideBuilds />
      </div>
    </section>
  );
}
