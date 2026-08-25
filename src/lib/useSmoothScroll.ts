"use client";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { cameraTarget, portalDiscOpacity } from "@/lib/cameraRig";
import { PORTAL_POSITION } from "@/lib/constants";
import { useReducedMotion } from "@/lib/useMediaQuery";

gsap.registerPlugin(ScrollTrigger);

export function useSmoothScroll() {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    let lenis: Lenis | null = null;
    let rafId: number;

    if (!reducedMotion) {
      lenis = new Lenis({
        duration: 1.3,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
      lenis.on("scroll", ScrollTrigger.update);
      const raf = (time: number) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    }

    // Camera fly-through: hero -> through the portal -> settle as backdrop
    if (!reducedMotion) {
      const tlCamera = gsap.timeline({
        scrollTrigger: {
          trigger: "#scroll-timeline",
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });
      tlCamera
        .to(cameraTarget, { x: 2, y: 0.5, z: 12, ease: "none" }, 0)
        .to(cameraTarget, { x: PORTAL_POSITION.x - 1, y: 0, z: PORTAL_POSITION.z + 3, ease: "none" }, 1)
        .to(portalDiscOpacity, { value: 0.05, ease: "none" }, 1.4)
        .to(cameraTarget, { x: 0, y: 0, z: -2, ease: "none" }, 2)
        .to(cameraTarget, { x: -2, y: 0.5, z: -14, ease: "none" }, 3)
        .to(cameraTarget, { x: 2, y: -0.5, z: -22, ease: "none" }, 4);
    }

    // Generic title/detail reveal for every "sequence-scene" section
    gsap.utils.toArray<HTMLElement>(".sequence-scene").forEach((section) => {
      const titleLayer = section.querySelector<HTMLElement>(".title-layer");
      const detailLayer = section.querySelector<HTMLElement>(".detail-layer");
      if (!titleLayer || !detailLayer) return;

      if (reducedMotion) {
        gsap.set([titleLayer, detailLayer], { opacity: 1, y: 0 });
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: 1 },
      });
      tl.fromTo(titleLayer, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 2, ease: "power2.out" })
        .to(titleLayer, { duration: 1.5 })
        .to(titleLayer, { opacity: 0, y: -40, duration: 1.2, ease: "power2.in" })
        .fromTo(detailLayer, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 2, ease: "power2.out" })
        .to(detailLayer, { duration: 3 })
        .to(detailLayer, { opacity: 0, y: -40, duration: 1.2, ease: "power2.in" });
    });

    // Fade-in-on-enter for static sections
    gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
      if (reducedMotion) {
        gsap.set(el, { opacity: 1, y: 0 });
        return;
      }
      gsap.fromTo(
        el,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        }
      );
    });

    // Skill bar fill
    gsap.utils.toArray<HTMLElement>(".skill-bar-fill").forEach((el) => {
      const value = el.dataset.value || "0";
      if (reducedMotion) {
        el.style.width = value + "%";
        return;
      }
      gsap.fromTo(
        el,
        { width: "0%" },
        {
          width: value + "%",
          duration: 1.2,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%" },
        }
      );
    });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      lenis?.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [reducedMotion]);
}
