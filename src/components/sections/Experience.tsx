import { experience } from "@/data/portfolio";

export default function Experience() {
  return (
    <section className="scene sequence-scene" id="scene-experience">
      <div className="sticky-wrapper">
        <div className="title-layer center-content">
          <h1 className="hero-title" style={{ fontSize: "8vw" }}>
            PROFESSIONAL
            <br />
            SYNERGY.
          </h1>
        </div>
        <div className="detail-layer align-left">
          <div className="blueprint-box massive-box">
            {experience.map((job, i) => (
              <div
                className={`experience-entry${i < experience.length - 1 ? " separator" : ""}`}
                key={job.company}
              >
                <div className="exp-header">
                  <h3>{job.company}</h3>
                  <span className="mono-tag orange-text d-block">
                    <i className="fa-solid fa-user-gear" /> {job.role}
                  </span>
                  <span className="mono-tag sub d-block">
                    <i className="fa-solid fa-map-pin" /> {job.location}
                  </span>
                </div>
                <div className="terminal-bullets">
                  {job.bullets.map((b, bi) => (
                    <p className="mono-tag" key={bi}>
                      <span className="orange-text">{">"}</span> {b}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
