"use client";
import { useMemo, useState, type PointerEvent } from "react";
import { projects, categoryLabel, type Project, type ProjectCategory } from "@/data/portfolio";

const FILTERS: { key: "all" | ProjectCategory; label: string }[] = [
  { key: "all", label: "ALL WORK" },
  { key: "ar-vr", label: "AR / VR" },
  { key: "ai-ml", label: "AI / ML" },
  { key: "web", label: "WEB" },
];

function handleTilt(e: PointerEvent<HTMLElement>) {
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  const px = (e.clientX - rect.left) / rect.width - 0.5;
  const py = (e.clientY - rect.top) / rect.height - 0.5;
  card.style.transform = `perspective(700px) rotateX(${-py * 8}deg) rotateY(${px * 8}deg) translateY(-6px)`;
}

function resetTilt(e: PointerEvent<HTMLElement>) {
  e.currentTarget.style.transform = "";
}

export default function ProjectGrid({ onSelect }: { onSelect: (project: Project) => void }) {
  const [filter, setFilter] = useState<"all" | ProjectCategory>("all");

  const list = useMemo(
    () => (filter === "all" ? projects : projects.filter((p) => p.category === filter)),
    [filter]
  );

  return (
    <section id="section-grid" className="static-section">
      <div className="section-heading" data-reveal>
        <span className="mono-tag orange-tag">SECTOR // 05</span>
        <h2>ALL PROJECTS.</h2>
      </div>
      <div id="project-grid-wrap" data-reveal>
        <div className="filter-tabs" role="tablist" aria-label="Filter projects">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`filter-tab${filter === f.key ? " active" : ""}`}
              role="tab"
              aria-selected={filter === f.key}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="project-grid">
          {list.map((p) => (
            <article
              key={p.id}
              className="project-card magnetic"
              tabIndex={0}
              role="button"
              aria-label={`View ${p.title} details`}
              style={{ "--card-color": p.color } as React.CSSProperties}
              onPointerMove={handleTilt}
              onPointerLeave={resetTilt}
              onClick={() => onSelect(p)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(p);
                }
              }}
            >
              <span className="card-cat mono-tag">{categoryLabel[p.category]}</span>
              <h3>{p.title}</h3>
              <p className="card-abstract">{p.abstract}</p>
              <div className="tech-stack-row mini">
                {p.tech.slice(0, 3).map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <div className="card-footer">
                <i className="fa-brands fa-github" />
                {p.live && <i className="fa-solid fa-up-right-from-square" />}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
