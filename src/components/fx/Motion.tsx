"use client";
/**
 * Quiet reading-view motion (Docs/Game: "the default reading view is quiet"),
 * declared in markup:
 *   data-reveal="type"     technical heading types on (steps), once
 *   data-reveal="stagger"  children rise in one after another, once
 * Nothing loops, nothing scrubs. Under reduced motion everything is simply
 * visible.
 */
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNexus } from "@/lib/store";

gsap.registerPlugin(ScrollTrigger);

const START = "top 88%";

function setupReveals(): () => void {
  const cleanups: (() => void)[] = [];
  const root = document.getElementById("main");
  if (!root) return () => {};

  root.querySelectorAll<HTMLElement>('[data-reveal="type"]').forEach((el) => {
    const tween = gsap.fromTo(
      el,
      { clipPath: "inset(0 100% 0 0)" },
      { clipPath: "inset(0 0% 0 0)", duration: 0.6, ease: "steps(16)", scrollTrigger: { trigger: el, start: START, once: true } }
    );
    cleanups.push(() => {
      tween.scrollTrigger?.kill();
      tween.kill();
      gsap.set(el, { clearProps: "clipPath" });
    });
  });

  root.querySelectorAll<HTMLElement>('[data-reveal="stagger"]').forEach((el) => {
    const st = ScrollTrigger.create({ trigger: el, start: START, once: true, onEnter: () => el.classList.add("is-on") });
    cleanups.push(() => {
      st.kill();
      el.classList.add("is-on");
    });
  });

  ScrollTrigger.refresh();
  return () => cleanups.forEach((fn) => fn());
}

export default function Motion() {
  const reduced = useNexus((s) => s.reduced);
  const configured = useNexus((s) => s.configured);

  useEffect(() => {
    if (!configured) return;
    const root = document.documentElement;
    if (reduced) {
      delete root.dataset.fx;
      return;
    }
    root.dataset.fx = "on";
    const off = setupReveals();
    // Fonts and lazy images change section heights; keep trigger positions true.
    const ro = new ResizeObserver(() => ScrollTrigger.refresh());
    const main = document.getElementById("main");
    if (main) ro.observe(main);
    return () => {
      ro.disconnect();
      off();
      delete root.dataset.fx;
    };
  }, [reduced, configured]);

  return null;
}
