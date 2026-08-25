"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import dynamic from "next/dynamic";
import { profile } from "@/data/portfolio";
import { useIsFinePointer, useReducedMotion } from "@/lib/useMediaQuery";
import type { Project } from "@/data/portfolio";

const Scene = dynamic(() => import("@/components/three/Scene"), { ssr: false });

const ICON_MAP: Record<string, string> = {
  vr: "fa-solid fa-vr-cardboard",
  brain: "fa-solid fa-brain",
  code: "fa-solid fa-code",
  rocket: "fa-solid fa-rocket",
};

export default function Hero({ onCubeSelect }: { onCubeSelect: (project: Project) => void }) {
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const hasFinePointer = useIsFinePointer();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!hasFinePointer || reducedMotion) return;
    const nameEl = nameRef.current;
    if (!nameEl) return;

    const handleMove = (e: PointerEvent) => {
      const dx = (e.clientX / window.innerWidth - 0.5) * 2;
      const dy = (e.clientY / window.innerHeight - 0.5) * 2;
      gsap.to(nameEl, {
        rotateY: dx * 16,
        rotateX: dy * -10,
        duration: 0.6,
        ease: "power2.out",
        transformPerspective: 900,
      });
    };
    const handleLeave = () => {
      gsap.to(nameEl, { rotateX: 0, rotateY: 0, duration: 0.8, ease: "power2.out" });
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerleave", handleLeave);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerleave", handleLeave);
    };
  }, [hasFinePointer, reducedMotion]);

  return (
    <section className="scene intro-scene" id="scene-intro">
      <div id="webgl-canvas-wrap">
        <Scene onCubeHover={setHoveredProject} onCubeSelect={onCubeSelect} />
      </div>
      <div id="cube-hud" className={hoveredProject ? "visible" : ""}>
        {hoveredProject?.title}
      </div>

      <div className="sticky-wrapper">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="mono-tag eyebrow hero-reveal">
              <i className="fa-solid fa-vr-cardboard orange-text" /> {profile.eyebrow}
            </span>
            <div className="hero-name-wrap hero-reveal">
              <span className="name-glow" aria-hidden="true" />
              <h1 className="hero-name-3d" ref={nameRef}>
                <span className="name-line name-white">{profile.heroName}</span>
              </h1>
            </div>
            <p className="mono-tag tagline hero-reveal">{profile.tagline}</p>
            <p className="bio hero-reveal">{profile.bio}</p>

            <div className="capability-row hero-reveal">
              {profile.capabilities.map((c) => (
                <div className="capability" key={c.label}>
                  <i className={ICON_MAP[c.icon]} />
                  <span className="mono-tag">{c.label}</span>
                </div>
              ))}
            </div>

            <div className="hero-buttons hero-reveal">
              <button
                className="btn-glow magnetic"
                onClick={() => document.getElementById("section-featured")?.scrollIntoView({ behavior: "smooth" })}
              >
                EXPLORE PROJECTS
              </button>
              <a href={profile.github} target="_blank" rel="noopener" className="btn-ghost magnetic">
                <i className="fa-brands fa-github" /> GITHUB
              </a>
            </div>

            <div className="contact-array hero-reveal">
              <a href={`tel:${profile.phone.replace(/\s/g, "")}`} className="mono-tag hover-orange magnetic">
                <i className="fa-solid fa-phone" /> {profile.phone}
              </a>
              <a href={`mailto:${profile.email}`} className="mono-tag hover-orange magnetic">
                <i className="fa-solid fa-envelope" /> {profile.email}
              </a>
              <a href={profile.linkedin} target="_blank" rel="noopener" className="mono-tag hover-orange magnetic">
                <i className="fa-brands fa-linkedin" /> LINKEDIN
              </a>
            </div>
          </div>
        </div>
        <div className="scroll-prompt">
          <span className="mono-tag">
            <i className="fa-solid fa-computer-mouse" /> SCROLL TO EXPLORE
          </span>
          <div className="scroll-line" />
        </div>
      </div>
    </section>
  );
}
