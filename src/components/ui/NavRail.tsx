"use client";
import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "scene-intro", label: "INTRO" },
  { id: "scene-edu", label: "EDU" },
  { id: "scene-experience", label: "WORK" },
  { id: "section-featured", label: "PROJECTS" },
  { id: "scene-achievements", label: "AWARDS" },
  { id: "section-grid", label: "ALL WORK" },
  { id: "section-skills", label: "SKILLS" },
  { id: "section-contact", label: "CONTACT" },
];

export default function NavRail() {
  const [active, setActive] = useState("scene-intro");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { threshold: 0.4 }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav id="nav-rail" aria-label="Section navigation">
      {SECTIONS.map((s) => (
        <button
          key={s.id}
          className={`nav-dot${active === s.id ? " active" : ""}`}
          aria-label={`Go to ${s.label}`}
          onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" })}
        >
          <span>{s.label}</span>
        </button>
      ))}
    </nav>
  );
}
