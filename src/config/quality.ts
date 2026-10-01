/** Device-aware rendering tiers. */

export type Tier = "high" | "medium" | "low";

export interface TierSettings {
  dpr: [number, number];
  antialias: boolean;
  postfx: boolean;
  /** Bloom render resolution scale. */
  bloomScale: number;
  /** Wet-stone / water mirror resolution (0 = environment-lit only). */
  reflection: number;
  /** Resolution scale of the city seen through the portal. */
  cityScale: number;
  /** Mist billboards. */
  mist: number;
  /** Portal sparks / motes. */
  sparks: number;
  stars: number;
  /** Night-city towers in the contact band. */
  towers: number;
  terrainSegments: number;
}

export const TIERS: Record<Tier, TierSettings> = {
  high: {
    dpr: [1, 1.75],
    antialias: false,
    postfx: true,
    bloomScale: 1,
    reflection: 1024,
    cityScale: 1,
    mist: 150,
    sparks: 260,
    stars: 2400,
    towers: 220,
    terrainSegments: 180,
  },
  medium: {
    dpr: [1, 1.25],
    antialias: false,
    postfx: true,
    bloomScale: 0.5,
    reflection: 512,
    cityScale: 0.75,
    mist: 100,
    sparks: 160,
    stars: 1400,
    towers: 150,
    terrainSegments: 120,
  },
  low: {
    dpr: [1, 1.25],
    antialias: true,
    postfx: false,
    bloomScale: 0.5,
    reflection: 0,
    cityScale: 0.6,
    mist: 60,
    sparks: 90,
    stars: 900,
    towers: 100,
    terrainSegments: 90,
  },
};

export function detectTier(): Tier {
  if (typeof window === "undefined") return "medium";
  const w = window.innerWidth;
  const fine = window.matchMedia("(pointer: fine)").matches;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 8;

  let tier: Tier = w >= 1200 && fine ? "high" : w >= 768 ? "medium" : "low";
  if (cores <= 2 || memory <= 2) tier = "low";
  else if ((cores <= 4 || memory <= 4) && tier === "high") tier = "medium";
  return tier;
}
