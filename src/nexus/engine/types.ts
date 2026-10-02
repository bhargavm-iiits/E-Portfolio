import type * as THREE from "three";

export interface FrameCtx {
  /** Chapter id currently on screen (a world can serve several chapters). */
  chapter: string;
  /** Progress 0→1 within that chapter. */
  p: number;
  time: number;
  dt: number;
  /** Scroll velocity, ±60. */
  vel: number;
  pointer: { x: number; y: number };
  menuYaw: number;
  width: number;
  height: number;
}

export interface WorldContext {
  renderer: THREE.WebGLRenderer;
  /** The optimised player character (GLB scene), or null until it has loaded / in Lite. */
  character: () => THREE.Object3D | null;
  quality: "high" | "low";
  /** Lets a world publish screen-space anchors (CSS custom properties) for its DOM overlay. */
  publish: (vars: Record<string, string>) => void;
}

export interface World {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  /** Optional second layer drawn on top after a depth clear (Home: foreground over the vista). */
  fg?: { scene: THREE.Scene; camera: THREE.PerspectiveCamera };
  bloom: { strength: number; radius: number; threshold: number };
  exposure: number;
  update(f: FrameCtx): void;
  resize(w: number, h: number): void;
  /** Called once the character GLB arrives (worlds that show the player). */
  attachCharacter?(c: THREE.Object3D): void;
  dispose(): void;
}
