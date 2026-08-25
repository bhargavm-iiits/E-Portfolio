import { camera, reducedMotion } from "./scene.js";
import { portalObjects } from "./portal.js";

const { portalRing, disc } = portalObjects;

export function initScroll() {
  const lenis = reducedMotion
    ? null
    : new Lenis({
        duration: 1.3,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
      });

  gsap.registerPlugin(ScrollTrigger);

  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0, 0);
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
      .to(camera.position, { x: 2, y: 0.5, z: 12, ease: "none" }, 0)
      .to(camera.position, { x: portalRing.position.x - 1, y: 0, z: portalRing.position.z + 3, ease: "none" }, 1)
      .to(disc.material, { opacity: 0.05, ease: "none" }, 1.4)
      .to(camera.position, { x: 0, y: 0, z: -2, ease: "none" }, 2)
      .to(camera.position, { x: -2, y: 0.5, z: -14, ease: "none" }, 3)
      .to(camera.position, { x: 2, y: -0.5, z: -22, ease: "none" }, 4);
  }

  // Generic title/detail reveal for every "sequence-scene" section
  gsap.utils.toArray(".sequence-scene").forEach((section) => {
    const titleLayer = section.querySelector(".title-layer");
    const detailLayer = section.querySelector(".detail-layer");
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

  // Simple fade-in-on-enter for grid + skill sections (non sequence-scene)
  gsap.utils.toArray("[data-reveal]").forEach((el) => {
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

  // Skill bar fill on enter
  gsap.utils.toArray(".skill-bar-fill").forEach((el) => {
    const value = el.dataset.value || 0;
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

  return lenis;
}

export function scrollToSelector(selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
}
