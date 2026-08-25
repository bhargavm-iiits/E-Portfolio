"use client";
import { useEffect, useState } from "react";
import { useSmoothScroll } from "@/lib/useSmoothScroll";
import type { Project } from "@/data/portfolio";

import AuroraBackground from "@/components/ui/AuroraBackground";
import Cursor from "@/components/ui/Cursor";
import NavRail from "@/components/ui/NavRail";
import ProjectModal from "@/components/ui/ProjectModal";
import Toast from "@/components/ui/Toast";
import Loader from "@/components/ui/Loader";

import Hero from "@/components/sections/Hero";
import Education from "@/components/sections/Education";
import Experience from "@/components/sections/Experience";
import Achievement from "@/components/sections/Achievement";
import FeaturedProjects from "@/components/sections/FeaturedProjects";
import ProjectGrid from "@/components/sections/ProjectGrid";
import Skills from "@/components/sections/Skills";
import Contact from "@/components/sections/Contact";

export default function PortfolioApp() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  useSmoothScroll();

  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <Cursor />
      <div className="film-grain" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      <AuroraBackground />
      <NavRail />
      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      <Toast />
      <Loader />

      <main id="main-content">
        <div id="scroll-timeline">
          <Hero onCubeSelect={setSelectedProject} />
          <Education />
          <Experience />
          <Achievement />
        </div>

        <FeaturedProjects />
        <ProjectGrid onSelect={setSelectedProject} />
        <Skills />
        <Contact />
      </main>
    </>
  );
}
