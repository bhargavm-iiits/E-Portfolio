"use client";
import { useSyncExternalStore } from "react";
import type { SectionId } from "@/config/site";
import type { Tier } from "@/config/quality";

/** ENTER THE NEXUS state machine (Docs/Game master prompt §6). */
export type EntryState = "idle" | "activating" | "approaching" | "crossing" | "arrived";

export interface NexusState {
  /** Section whose middle band is on screen (IntersectionObserver). */
  active: SectionId;
  /** Open briefing slug, or null. */
  briefing: string | null;
  /** Effective reduced-motion flag (system OR manual toggle). */
  reduced: boolean;
  /** Manual override from the header toggle; null follows the system setting. */
  reducedManual: boolean | null;
  sound: boolean;
  tier: Tier;
  webgl: "pending" | "ok" | "off";
  entry: EntryState;
  /** Ability node under hover / focus / selection. */
  ability: string;
  /** Physics lab level being previewed (0-4). */
  labLevel: number;
  /** Cinema screen mode. */
  cinemaMode: "mono" | "sbs";
  menuOpen: boolean;
  /** The contact terminal is revealed. */
  terminalOpen: boolean;
  /** Environment detection finished (tier, WebGL, motion). */
  configured: boolean;
  /** The 3D stage may mount (after first paint; on first interaction on phones). */
  stageRequested: boolean;
}

type Listener = () => void;

const initial: NexusState = {
  active: "world",
  briefing: null,
  reduced: false,
  reducedManual: null,
  sound: false,
  tier: "medium",
  webgl: "pending",
  entry: "idle",
  ability: "unity",
  labLevel: 0,
  cinemaMode: "mono",
  menuOpen: false,
  terminalOpen: false,
  configured: false,
  stageRequested: false,
};

let state: NexusState = initial;
const listeners = new Set<Listener>();

export const store = {
  get: () => state,
  set(patch: Partial<NexusState>) {
    let changed = false;
    for (const key in patch) {
      const k = key as keyof NexusState;
      if (!Object.is(state[k], patch[k])) {
        changed = true;
        break;
      }
    }
    if (!changed) return;
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

/** Subscribe a component to one slice of the store. */
export function useNexus<T>(selector: (s: NexusState) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(state),
    () => selector(initial)
  );
}
