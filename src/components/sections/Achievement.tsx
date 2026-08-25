import { achievement } from "@/data/portfolio";

export default function Achievement() {
  return (
    <section className="scene sequence-scene" id="scene-achievements">
      <div className="sticky-wrapper">
        <div className="title-layer center-content">
          <span className="mono-tag orange-tag">AWARDS // HACKATHONS</span>
          <h1 className="hero-title" style={{ fontSize: "8vw" }}>
            IDEAVERSE
            <br />
            2026.
          </h1>
        </div>
        <div className="detail-layer center-content">
          <div className="blueprint-box rich-box highlight-box" style={{ margin: "auto" }}>
            <span className="orange-text subtitle-highlight" style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
              <i className="fa-solid fa-trophy" /> {achievement.highlight}
            </span>
            <div className="terminal-bullets padding-top">
              {achievement.bullets.map((b, i) => (
                <p className="mono-tag" key={i}>
                  <span className="orange-text">{">"}</span> {b}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
