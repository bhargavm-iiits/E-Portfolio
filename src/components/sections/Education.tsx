import { education } from "@/data/portfolio";

export default function Education() {
  return (
    <section className="scene sequence-scene" id="scene-edu">
      <div className="sticky-wrapper">
        <div className="title-layer center-content">
          <span className="mono-tag orange-tag">SECTOR // 01</span>
          <h1 className="hero-title" style={{ fontSize: "8vw" }}>
            ACADEMIC CORE.
          </h1>
        </div>
        <div className="detail-layer align-right">
          <div className="blueprint-box rich-box">
            {education.map((e, i) => (
              <div className={`data-row${i < education.length - 1 ? " separator" : ""}`} key={e.school}>
                <div className="data-col">
                  <span className="mono-tag">
                    <i className="fa-solid fa-building-columns orange-text" /> {e.school}
                  </span>
                  <span className="mono-tag sub">{e.period}</span>
                </div>
                <div className="data-col right">
                  <span className="orange-text">{e.degree}</span>
                  <span className="mono-tag">{e.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
