/**
 * The rig is a plain mutable object: GSAP (the director) writes it, the R3F
 * render loop reads it. No React state is involved per frame.
 */
export const rig = {
  /* hero */
  /** 0 at rest → 1 once the hero has scrolled out of view (gentle camera dolly). */
  heroScroll: 0,
  /** ENTER THE NEXUS camera path: 0 hero pose → 1 at the aperture plane. */
  entry: 0,
  /** Extra travel of the camera inside the city seen through the aperture (crossing). */
  cityPush: 0,
  /** Portal emitter intensity: idle ≈ 0.35, energised 1. */
  emit: 0.35,
  /** The explorer's headset / spine emblem. */
  glow: 0.25,
  /** Activation sparks around the aperture. */
  sparks: 0,

  /* post */
  exposure: 1,
  radial: 0,

  /* briefing dioramas (driven when a briefing opens) */
  m01: 0,
  m02: 0,
  m04: 0,
};

export type Rig = typeof rig;

/** Live physics-lab readouts (M02), written by the 3D sim, read by the DOM overlay. */
export const lab = { v: 0, s: 0, t: 0 };

/** Pointer position in NDC (-1..1), shared by parallax consumers. */
export const pointer = { x: 0, y: 0 };

if (typeof window !== "undefined") {
  window.addEventListener(
    "pointermove",
    (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    },
    { passive: true }
  );
}
