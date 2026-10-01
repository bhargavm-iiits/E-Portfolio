"use client";
/**
 * 04 PLAYER LOG (screenshot §7): education, experience and achievement rows on
 * a left hex-icon rail, right-aligned dates, clear titles, calm prose and thin
 * separators. Amber is reserved for the trophy and the award badge.
 */
import { log, nextObjective, type LogEntry } from "@/data/nexus";
import { Icon } from "@/components/hud/Icons";
import HudFrame from "@/components/hud/HudFrame";

const ICON: Record<LogEntry["kind"], (p: { size?: number }) => React.ReactElement> = {
  education: Icon.cap,
  work: Icon.briefcase,
  achievement: Icon.trophy,
};

function HexIcon({ kind }: { kind: LogEntry["kind"] }) {
  const I = ICON[kind];
  return (
    <span className="log-hex" data-kind={kind} aria-hidden="true">
      <svg viewBox="0 0 100 115" className="log-hex__frame">
        <path d="M50 3 97 30v55L50 112 3 85V30z" />
      </svg>
      <I size={24} />
    </span>
  );
}

export default function PlayerLog() {
  return (
    <section id="log" className="lower__cell" data-section="log" aria-labelledby="log-title">
      <HudFrame className="panel panel--log" cut={[0, 22, 0, 22]} inset={6} accents={["tr", "bl"]} dots>
        <header className="panel__head panel__head--rule">
          <h2 id="log-title" className="t-heading" tabIndex={-1} data-reveal="type">
            PLAYER LOG
          </h2>
          <p className="t-meta">JOURNEY. MILESTONES. WHAT’S NEXT.</p>
        </header>

        <ol className="timeline">
          {log.map((e) => (
            <li key={e.code} className="timeline__row" data-kind={e.kind}>
              <HexIcon kind={e.kind} />
              <div className="timeline__body">
                <div className="timeline__top">
                  <h3 className="timeline__org">{e.org}</h3>
                  <p className="timeline__period">{e.period}</p>
                </div>
                <p className="timeline__role">
                  {e.role}
                  {e.where && <span className="timeline__where"> · {e.where}</span>}
                </p>
                {e.badge && (
                  <p className="award-badge">
                    {e.badge} <Icon.chevron size={12} />
                  </p>
                )}
                {e.desc.map((d) => (
                  <p key={d} className="timeline__desc">
                    {d}
                  </p>
                ))}
              </div>
            </li>
          ))}
        </ol>

        <p className="next-objective">
          <span className="t-meta">NEXT OBJECTIVE //</span> {nextObjective}
        </p>
      </HudFrame>
    </section>
  );
}
