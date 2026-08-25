import { featuredProjects } from "@/data/portfolio";

export default function FeaturedProjects() {
  return (
    <section id="section-featured" className="static-section">
      <div className="section-heading" data-reveal>
        <span className="mono-tag orange-tag">SECTOR // 04</span>
        <h2>FEATURED PROJECTS.</h2>
      </div>
      <div id="featured-projects-text">
        {featuredProjects.map((p, i) => (
          <article
            className={`featured-entry${i < featuredProjects.length - 1 ? " separator" : ""}`}
            data-reveal
            key={p.id}
            style={{ "--card-color": p.color } as React.CSSProperties}
          >
            <span className="mono-tag orange-tag">{p.tag}</span>
            <h3>{p.title}</h3>
            <p className="abstract" style={{ borderColor: p.color }}>
              {p.abstract}
            </p>
            <div className="tech-stack-row">
              {p.tech.map((t) => (
                <span key={t} className="glow-edge" style={{ borderColor: p.color, color: p.color }}>
                  {t}
                </span>
              ))}
            </div>
            <div className="terminal-bullets">
              {p.bullets.map((b, bi) => (
                <p className="mono-tag" key={bi}>
                  <span className="orange-text">{">"}</span> {b}
                </p>
              ))}
            </div>
            <div className="project-links">
              <a href={p.github} target="_blank" rel="noopener" className="hover-orange magnetic">
                <i className="fa-brands fa-github" /> SOURCE
              </a>
              {p.live && (
                <a href={p.live} target="_blank" rel="noopener" className="hover-orange magnetic">
                  <i className="fa-solid fa-up-right-from-square" /> LIVE
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
