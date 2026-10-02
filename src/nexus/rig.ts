/**
 * The rig: plain mutable numbers written by the director (scroll) and by the
 * UI (hover), read by the render loop. No React state changes per frame.
 */
import { STORY } from "./story";

export const rig = {
  /** Index into STORY of the chapter under the viewport. */
  chapter: 0,
  /** Progress 0→1 per chapter. */
  p: new Float32Array(STORY.length),
  /** Smoothed scroll velocity (px per frame, clamped ±60). */
  vel: 0,
  /** Pointer in NDC (-1..1), eased. */
  pointer: { x: 0, y: 0, tx: 0, ty: 0 },
  /** Hovered menu chip x offset from the cube in px (CH07: the cube turns toward it). */
  menuYaw: 0,
  /** Past the story into the normal-flow Comms section (0→1 fade). */
  outro: 0,
  /** Active chapter transition (both worlds render; the TransitionPass blends a→b by t). */
  trans: { on: false, a: 0, b: 1, t: 0, pa: 1, pb: 0, mode: 1, dip: [0, 0, 0] as [number, number, number] },
  /** Engine state readable by the DOM. */
  ready: false,
  loadProgress: 0,
};

if (typeof window !== "undefined") {
  window.addEventListener(
    "pointermove",
    (e) => {
      rig.pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      rig.pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
    },
    { passive: true },
  );
}
