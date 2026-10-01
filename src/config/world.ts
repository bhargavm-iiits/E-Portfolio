/**
 * World-space layout (units ≈ metres) for the three scenes the page looks
 * into: the hero (portal world), the contact band (night city across the
 * water) and the briefing's evidence window (one mission diorama). They share
 * one canvas and one scene graph, so each sits at its own origin far from the
 * others; only the active one is visible.
 */
export type Vec3 = [number, number, number];

/** 01 WORLD — composition measured on the reference (Docs/Game screenshot §4). */
export const HERO = {
  origin: [0, 0, 0] as Vec3,
  /** Aperture centre, inner radius, ring body radii, yaw (radians: we see the ring a little from the right). */
  portal: { pos: [0, 4.0, -8] as Vec3, aperture: 3.1, inner: 3.2, outer: 4.55, yaw: -0.2 },
  /** The explorer, seen from behind on the ledge tip. */
  explorer: { pos: [0, 0, -2] as Vec3, height: 1.8 },
  /** Rest camera: low, behind the explorer; the portal sits at `frame` (fractions of the window). */
  camera: { p: [0, 2.4, 14] as Vec3, t: [0, 4.0, -8] as Vec3, fov: 32 },
  /** Where the portal axis lands inside the hero window (wide / portrait). */
  frame: { wide: [0.71, 0.455] as [number, number], tall: [0.5, 0.31] as [number, number] },
};

/** 05 COMMS — a wide night panorama. */
export const COMMS = {
  origin: [0, 0, 6000] as Vec3,
  /** Horizon at ~62% of the band height, as in the reference. */
  camera: { p: [0, 4.2, 0] as Vec3, t: [0, 7.55, -60] as Vec3, fov: 26 },
  /** The explorer on a shore rock (local to origin), small and centre-right. */
  explorer: { pos: [5.4, 0.3, -32.3] as Vec3, height: 1.8 },
  moon: { pos: [144, 79, -480] as Vec3, radius: 12 },
};

/** Mission briefing diorama stage. */
export const BRIEF = {
  origin: [6000, 0, 0] as Vec3,
  /** Camera pose per diorama kind (local to origin). */
  views: {
    terrain: { p: [0.6, 8.2, 14.2] as Vec3, t: [0.2, 0.1, -0.4] as Vec3, fov: 34 },
    lab: { p: [0.4, 3.4, 8.6] as Vec3, t: [0, 1.0, -0.6] as Vec3, fov: 36 },
    cinema: { p: [0, 3.4, 9.2] as Vec3, t: [0, 1.6, -2.4] as Vec3, fov: 40 },
    hangar: { p: [4.2, 3.0, 9.4] as Vec3, t: [0, 2.6, 0] as Vec3, fov: 36 },
  },
};

/** Demo velocities (m/s) for the five M02 level pads — illustrative, not project data. */
export const LEVEL_VELOCITY = [1.0, 1.6, 2.2, 0.8, 1.3];
