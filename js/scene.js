import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

const canvas = document.getElementById("webgl-canvas");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile = window.matchMedia("(max-width: 768px)").matches;

export const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x05060f, 0.012);

export const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  500
);
camera.position.set(0, 0, 18);

export const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: !isMobile,
  alpha: true,
  powerPreference: "high-performance",
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.outputColorSpace = THREE.SRGBColorSpace;

export const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

let bloomPass = null;
if (!isMobile && !reducedMotion) {
  bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.8,
    0.5,
    0.85
  );
  composer.addPass(bloomPass);
}
composer.addPass(new OutputPass());

window.addEventListener("resize", () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  composer.setSize(w, h);
  if (bloomPass) bloomPass.setSize(w, h);
});

const updateFns = [];
export function onFrame(fn) {
  updateFns.push(fn);
}

const clock = new THREE.Clock();
let running = true;

document.addEventListener("visibilitychange", () => {
  running = document.visibilityState === "visible";
  if (running) clock.getDelta();
});

function loop() {
  requestAnimationFrame(loop);
  if (!running) return;
  const dt = clock.getDelta();
  const t = clock.getElapsedTime();
  for (const fn of updateFns) fn(dt, t);
  composer.render();
}

export function startRenderLoop() {
  loop();
}

export { reducedMotion, isMobile };
