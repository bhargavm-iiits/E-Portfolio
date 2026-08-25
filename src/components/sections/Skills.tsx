import { skills } from "@/data/portfolio";

const ICON_MAP: Record<string, string> = {
  brain: "fa-solid fa-brain",
  vr: "fa-solid fa-vr-cardboard",
  language: "fa-solid fa-language",
  wave: "fa-solid fa-wave-square",
  code: "fa-solid fa-code",
};

export default function Skills() {
  return (
    <section id="section-skills" className="static-section">
      <div className="section-heading" data-reveal>
        <span className="mono-tag orange-tag">SECTOR // 06</span>
        <h2>SYSTEM CAPABILITIES.</h2>
      </div>
      <div className="blueprint-box massive-box center-box" data-reveal>
        <div className="skills-grid">
          {skills.map((s) => (
            <div className="skill-row" key={s.label}>
              <span className="orange-text mono-tag">
                <i className={ICON_MAP[s.icon]} /> {s.label}
              </span>
              <p className="mono-tag sub">{s.detail}</p>
              <div className="skill-bar-track">
                <div className="skill-bar-fill" data-value={s.value} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
