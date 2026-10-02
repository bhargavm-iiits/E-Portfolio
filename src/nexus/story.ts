/**
 * The chapter map (MASTER-PROMPT §2.4, Docs/plan.md §4.2). Scroll length in vh;
 * each chapter's progress p runs 0→1 across its length.
 */
export type WorldId = "gate" | "entry" | "hub" | "warp" | "home" | "lab" | "terrain" | "cinema" | "hangar" | "log" | "space";

export interface ChapterDef {
  id: string;
  /** Visible chapter name (live region, HUD). */
  title: string;
  vh: number;
  world: WorldId;
  /** Nav is visible from Home onwards (§7.6). */
  nav: boolean;
  /** Nav item highlighted while this chapter is active. */
  navKey?: "home" | "missions" | "abilities" | "log";
}

export const STORY: ChapterDef[] = [
  { id: "gate", title: "The Gate", vh: 400, world: "gate", nav: false },
  { id: "entry", title: "World Entry", vh: 125, world: "entry", nav: false },
  { id: "hub", title: "The Nexus Hub", vh: 120, world: "hub", nav: false },
  { id: "warp", title: "Warp", vh: 200, world: "warp", nav: false },
  { id: "home", title: "Home", vh: 100, world: "home", nav: true, navKey: "home" },
  { id: "dive", title: "Dive", vh: 100, world: "home", nav: true, navKey: "home" },
  { id: "menu", title: "Select your next mission", vh: 120, world: "space", nav: true, navKey: "missions" },
  { id: "lab", title: "Mission 1 of 4: Game-Based Physics Learning", vh: 160, world: "lab", nav: true, navKey: "missions" },
  { id: "terrain", title: "Mission 2 of 4: Tirumala AR Navigation", vh: 200, world: "terrain", nav: true, navKey: "missions" },
  { id: "cinema", title: "Mission 3 of 4: VR Cinema Platform", vh: 160, world: "cinema", nav: true, navKey: "missions" },
  { id: "hangar", title: "Mission 4 of 4: ISRO Launch Pad Simulation", vh: 160, world: "hangar", nav: true, navKey: "missions" },
  { id: "abilities", title: "Ability Tree", vh: 160, world: "space", nav: true, navKey: "abilities" },
  { id: "log", title: "Player Log", vh: 220, world: "log", nav: true, navKey: "log" },
  { id: "vault", title: "The Vault", vh: 240, world: "space", nav: true, navKey: "missions" },
  { id: "finale", title: "Bhargav M", vh: 120, world: "space", nav: true, navKey: "home" },
];

export const chapterIndex = (id: string) => STORY.findIndex((c) => c.id === id);

/**
 * Scroll-scrubbed transitions INTO each chapter (MASTER-PROMPT §8). Both worlds render during the
 * window and the TransitionPass blends them, so scrolling either way glides instead of cutting.
 * before/after = window in vh on each side of the chapter boundary.
 * Modes: 1 fade · 2 dip (through `dip` colour) · 3 slit doors · 4 radial zoom · 5 iris · 6 push · 7 whip.
 */
export interface TransitionDef { mode: 1 | 2 | 3 | 4 | 5 | 6 | 7; before: number; after: number; dip?: [number, number, number] }
const WHITE: [number, number, number] = [2.4, 2.05, 2.9];
const VIOLET: [number, number, number] = [1.0, 0.62, 2.3];
const BLACK: [number, number, number] = [0, 0, 0];
export const TRANSITIONS: Record<string, TransitionDef> = {
  entry: { mode: 2, before: 55, after: 30, dip: WHITE }, // T04 → T05: white-out, world entry from white
  hub: { mode: 4, before: 35, after: 30, dip: WHITE }, // T05 threshold: radial push through the portal
  warp: { mode: 4, before: 30, after: 25, dip: VIOLET }, // T06/T07: into the second portal
  home: { mode: 2, before: 45, after: 35, dip: VIOLET }, // T09/T10 bloom resolves into the Home vista
  dive: { mode: 1, before: 20, after: 20 }, // same world: copy hands over to the Dive
  menu: { mode: 2, before: 30, after: 30, dip: BLACK }, // T13 visor dive
  lab: { mode: 5, before: 40, after: 25 }, // T15 orb lens opens onto the first mission
  terrain: { mode: 3, before: 30, after: 30 }, // T17 slit doors
  cinema: { mode: 6, before: 25, after: 25 }, // T21 hard push
  hangar: { mode: 7, before: 25, after: 25 }, // T20 whip pan
  abilities: { mode: 4, before: 30, after: 30, dip: VIOLET }, // T22 shrink / logos fly in
  log: { mode: 2, before: 30, after: 30, dip: VIOLET }, // T24 particle torus burst
  vault: { mode: 4, before: 30, after: 30, dip: BLACK }, // T34 world pulls back
  finale: { mode: 2, before: 30, after: 35, dip: WHITE }, // T37 hyperspace to hero
};
