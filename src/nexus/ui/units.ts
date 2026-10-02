import type { CSSProperties } from "react";

/** One design pixel of the 1280×720 artboards, scaled to the viewport. */
export const u = (n: number) => `calc(var(--u) * ${n})`;
/** A size that never drops below `min` px (legibility on small screens). */
export const um = (n: number, min: number) => `max(${min}px, calc(var(--u) * ${n}))`;
export const X = (px: number) => `${(px / 12.8).toFixed(3)}%`;
export const Y = (px: number) => `${(px / 7.2).toFixed(3)}%`;
/** Absolute placement at artboard coordinates (px of 1280×720). */
export const at = (x: number, y: number, extra: CSSProperties = {}): CSSProperties => ({ position: "absolute", left: X(x), top: Y(y), ...extra });
