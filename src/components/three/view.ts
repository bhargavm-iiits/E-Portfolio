/**
 * Per-frame state of the windowed stage, shared by the 3D components (no
 * React state per frame). Written by WindowRig at the start of every frame.
 */
import * as THREE from "three";
import type { WindowId } from "@/lib/windows";

export const view = {
  /** The window being rendered this frame (null: nothing visible, nothing drawn). */
  active: null as WindowId | null,
  /** Animation time in seconds; frozen under reduced motion. */
  time: 0,
  /** Frame delta (s), clamped; 0 under reduced motion. */
  dt: 0,
  /** Set by anything that changes the picture outside the normal loop (loads, store changes). */
  dirty: true,
  /** Main camera view-projection, for screen-space lookups that must also work inside mirror passes. */
  viewProj: new THREE.Matrix4(),
};

/** Visible this frame, or during shader pre-compilation. */
export const precompile = { active: false };

export function isActive(id: WindowId) {
  return view.active === id || precompile.active;
}
