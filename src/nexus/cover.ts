/**
 * The transition cover (MASTER-PROMPT §8.0): one fixed layer stack above the chapter overlays.
 * World switches happen while it is opaque. Only the active chapter drives it (the director
 * resets it on every chapter change), so values never fight.
 *  - white:  the white-out ramp (T04, T05 threshold, T09 bloom)
 *  - violet: violet core bloom (warp exit T10, T23)
 *  - black:  visor / hard cut (T13, T21)
 *  - doors:  centre-slit door split (T17) — 0 open … 1 closed
 */
type Layer = "white" | "violet" | "black";
const state: Record<Layer | "doors", number> = { white: 0, violet: 0, black: 0, doors: 0 };

function el(id: string) {
  return typeof document === "undefined" ? null : document.getElementById(id);
}

const ENABLED = false;

function setOpacity(layer: Layer, o: number) {
  if (!ENABLED) o = 0;
  const v = Math.round(Math.min(1, Math.max(0, o)) * 1000) / 1000;
  if (state[layer] === v) return;
  state[layer] = v;
  const e = el(`nx-cover-${layer}`);
  if (e) {
    e.style.opacity = String(v);
    e.style.visibility = v > 0 ? "visible" : "hidden";
  }
}

export const cover = {
  white: (o: number) => setOpacity("white", o),
  violet: (o: number) => setOpacity("violet", o),
  black: (o: number) => setOpacity("black", o),
  doors(k: number) {
    if (!ENABLED) k = 0;
    const v = Math.round(Math.min(1, Math.max(0, k)) * 1000) / 1000;
    if (state.doors === v) return;
    state.doors = v;
    const root = el("nx-cover-doors");
    if (!root) return;
    root.style.visibility = v > 0 ? "visible" : "hidden";
    root.style.setProperty("--k", String(v));
  },
  reset() {
    setOpacity("white", 0);
    setOpacity("violet", 0);
    setOpacity("black", 0);
    cover.doors(0);
  },
};
