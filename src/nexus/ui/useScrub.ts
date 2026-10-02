"use client";
import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { director } from "../director";

/**
 * Binds a chapter overlay to the scroll: `build` authors a paused GSAP timeline on a 0→1 axis
 * (positions are chapter progress); the director scrubs it every frame while the chapter is active.
 * `build` may return an extra per-frame callback (counters, the transition cover, CSS vars).
 */
export function useScrub(
  id: string,
  ref: RefObject<HTMLElement | null>,
  build: (tl: gsap.core.Timeline, q: (sel: string) => Element[]) => ((p: number) => void) | void,
  rest = 0.5,
) {
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    let extra: ((p: number) => void) | void = undefined;
    let tl: gsap.core.Timeline | null = null;
    const ctx = gsap.context(() => {
      tl = gsap.timeline({ paused: true, defaults: { ease: "none", duration: 0.1 } });
      extra = build(tl, gsap.utils.selector(root));
      tl.set({}, {}, 1);
    }, root);
    const off = director.register(id, (p) => {
      tl?.progress(p);
      if (extra) extra(p);
    }, rest);
    return () => {
      off();
      ctx.revert();
    };
    // the timeline is authored once per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
}

/** Linear remap of p from [a,b] to [0,1], clamped. */
export const span = (p: number, a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)));
