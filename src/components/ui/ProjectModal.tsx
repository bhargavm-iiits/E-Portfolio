"use client";
import { useEffect } from "react";
import type { Project } from "@/data/portfolio";
import { categoryLabel } from "@/data/portfolio";

export default function ProjectModal({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  useEffect(() => {
    document.body.classList.toggle("modal-open", Boolean(project));
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [project, onClose]);

  return (
    <div
      id="project-modal"
      className={project ? "open" : ""}
      aria-live="polite"
      style={{ "--card-color": project?.color } as React.CSSProperties}
    >
      {project && (
        <>
          <div className="modal-backdrop" onClick={onClose} />
          <div
            className="modal-panel"
            role="dialog"
            aria-modal="true"
            aria-label={`${project.title} details`}
          >
            <button className="modal-close magnetic" aria-label="Close" onClick={onClose}>
              &times;
            </button>
            <span className="card-cat mono-tag">{categoryLabel[project.category]}</span>
            <h2>{project.title}</h2>
            <p className="card-abstract">{project.abstract}</p>
            <div className="tech-stack-row">
              {project.tech.map((t) => (
                <span key={t} className="glow-edge" style={{ borderColor: project.color, color: project.color }}>
                  {t}
                </span>
              ))}
            </div>
            <div className="terminal-bullets">
              {project.bullets.map((b, i) => (
                <p key={i} className="mono-tag">
                  <span className="orange-text">{">"}</span> {b}
                </p>
              ))}
            </div>
            <div className="project-links">
              <a href={project.github} target="_blank" rel="noopener" className="hover-orange magnetic">
                <i className="fa-brands fa-github" /> SOURCE
              </a>
              {project.live && (
                <a href={project.live} target="_blank" rel="noopener" className="hover-orange magnetic">
                  <i className="fa-solid fa-up-right-from-square" /> LIVE DEMO
                </a>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
