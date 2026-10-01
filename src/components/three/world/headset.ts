/** Procedural VR headset geometry (the floating headset in the M03 cinema dome). */
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/** Shell + strap + rear pad, modelled around a head centre at y ≈ 1.67. */
export function buildHeadsetGeometry() {
  const shell = new THREE.BoxGeometry(0.22, 0.12, 0.13, 2, 2, 2);
  shell.translate(0, 1.67, -0.1);
  const strap = new THREE.TorusGeometry(0.118, 0.016, 6, 24);
  strap.rotateX(Math.PI / 2);
  strap.translate(0, 1.685, 0.0);
  const pad = new THREE.BoxGeometry(0.1, 0.06, 0.03);
  pad.translate(0, 1.7, 0.118);
  const g = mergeGeometries([shell.toNonIndexed(), strap.toNonIndexed(), pad.toNonIndexed()], false)!;
  [shell, strap, pad].forEach((p) => p.dispose());
  return g;
}

/** Emissive strips: the visor (front) and the rear pad light. */
export function buildHeadsetLightsGeometry() {
  const visor = new THREE.BoxGeometry(0.2, 0.022, 0.01);
  visor.translate(0, 1.675, -0.168);
  const rear = new THREE.BoxGeometry(0.07, 0.012, 0.01);
  rear.translate(0, 1.7, 0.135);
  const g = mergeGeometries([visor.toNonIndexed(), rear.toNonIndexed()], false)!;
  [visor, rear].forEach((p) => p.dispose());
  return g;
}
