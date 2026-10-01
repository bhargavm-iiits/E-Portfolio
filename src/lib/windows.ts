"use client";
/**
 * 3D windows. One fixed canvas renders behind the page; DOM elements register
 * as "windows" onto its scenes (the hero, the contact band, the briefing's
 * evidence frame). Each frame the stage picks the visible window and projects
 * that scene so it composes exactly inside the element's rectangle — the 3D
 * scrolls with its section like an image would, with one WebGL context.
 * Free of three.js imports (DOM code uses it).
 */
import { useCallback } from "react";

export type WindowId = "hero" | "comms" | "brief";

export interface WindowRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

const elements = new Map<WindowId, HTMLElement>();
/** 2D canvases that show a window's pixels where the window sits under opaque UI (the briefing dialog). */
const mirrors = new Map<WindowId, HTMLCanvasElement>();

export const windows = {
  bind(id: WindowId, el: HTMLElement | null) {
    if (el) elements.set(id, el);
    else elements.delete(id);
  },
  bindMirror(id: WindowId, el: HTMLCanvasElement | null) {
    if (el) mirrors.set(id, el);
    else mirrors.delete(id);
  },
  mirror(id: WindowId) {
    const el = mirrors.get(id);
    return el?.isConnected ? el : null;
  },
  /** Visible rect in viewport px, or null when off screen / unbound. */
  rect(id: WindowId): WindowRect | null {
    const el = elements.get(id);
    if (!el || !el.isConnected) return null;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return null;
    if (r.bottom <= 0 || r.top >= window.innerHeight || r.right <= 0 || r.left >= window.innerWidth) return null;
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  },
  /** Fraction of the viewport the window covers (for picking the active one). */
  coverage(id: WindowId): number {
    const r = this.rect(id);
    if (!r) return 0;
    const h = Math.min(r.top + r.height, window.innerHeight) - Math.max(r.top, 0);
    const w = Math.min(r.left + r.width, window.innerWidth) - Math.max(r.left, 0);
    return Math.max(0, h) * Math.max(0, w);
  },
};

/** Ref callback that registers a mirror canvas for a window. */
export function useMirror(id: WindowId) {
  return useCallback(
    (el: HTMLCanvasElement | null) => {
      windows.bindMirror(id, el);
    },
    [id]
  );
}

/** Ref callback that registers an element as a 3D window. */
export function useWindow(id: WindowId) {
  return useCallback(
    (el: HTMLElement | null) => {
      windows.bind(id, el);
    },
    [id]
  );
}
