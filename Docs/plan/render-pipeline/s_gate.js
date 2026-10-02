// CH01 The Gate plate (KF01/KF02): portal, wet tiled walkway, fog banks, stars, rim particles. Avatar + HUD are composited in the artboard.
import * as THREE from "three";
import { Reflector } from "three/addons/objects/Reflector.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { q, W, H, makeRenderer, renderWithBloom, portalMaterial, glowMaterial, fogMaterial, stars, rng } from "./lib.js";

const renderer = makeRenderer(false);
const scene = new THREE.Scene();
scene.background = new THREE.Color("#02030A");
const cam = new THREE.PerspectiveCamera(35, W / H, 0.1, 2000);
cam.position.set(0, 1.5, 7); cam.lookAt(0, 1.5, -100);

const R = 2.15, PZ = -5, PY = 1.95;
const portal = new THREE.Mesh(new THREE.PlaneGeometry(2 * R, 2 * R), portalMaterial({ mode: 0, twist: 0.9, fil: 0.9, rim: 1.25, core: 0.0, seed: +(q.get("seed") || 2.3), gain: 1.15 }));
portal.position.set(0, PY, PZ); portal.renderOrder = 2; scene.add(portal);
const glow = new THREE.Mesh(new THREE.PlaneGeometry(4 * R, 4 * R), glowMaterial("#7a5cff", { inner: 1.0, tight: 0.04, wide: 0.30, k1: 0.35, k2: 0.06 }));
glow.position.set(0, PY, PZ - 0.02); glow.renderOrder = 1; scene.add(glow);
const ring = new THREE.Mesh(new THREE.TorusGeometry(R * 1.055, 0.03, 12, 200), new THREE.MeshStandardMaterial({ color: "#151826", metalness: 0.9, roughness: 0.35, emissive: "#3a2a7a", emissiveIntensity: 0.25 }));
ring.position.set(0, PY, PZ - 0.04); scene.add(ring);

const pl = new THREE.PointLight("#9a78ff", 22, 0, 2); pl.position.set(0, PY, PZ + 0.6); scene.add(pl);
const pl2 = new THREE.PointLight("#b79bff", 8, 0, 2); pl2.position.set(0, 0.35, PZ + 0.9); scene.add(pl2);
scene.add(new THREE.HemisphereLight("#1d1f45", "#05060d", 0.25));
{ const es = new THREE.Scene(); es.background = new THREE.Color("#020208");
  const d = new THREE.Mesh(new THREE.CircleGeometry(1.15, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color("#8f6dff").multiplyScalar(5.0) }));
  d.position.set(0, 0.9, -8); d.lookAt(0, 0, 0); es.add(d);
  const d2 = new THREE.Mesh(new THREE.RingGeometry(1.1, 1.3, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color("#d8c8ff").multiplyScalar(5.0), side: THREE.DoubleSide }));
  d2.position.copy(d.position); d2.lookAt(0, 0, 0); es.add(d2);
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(es, 0.02).texture; scene.environmentIntensity = 0.6; }

// mirror under translucent tiles = wet reflections
const mirror = new Reflector(new THREE.PlaneGeometry(60, 60), { textureWidth: W, textureHeight: H, color: 0x15151d });
mirror.rotation.x = -Math.PI / 2; mirror.position.y = -0.002; scene.add(mirror);

const rnd = rng(11);
const tileG = new RoundedBoxGeometry(1.94, 0.12, 1.94, 2, 0.025);
const dry = new THREE.MeshStandardMaterial({ color: "#0a0c18", metalness: 0.85, roughness: 0.42, transparent: true, opacity: 0.97 });
const wet = new THREE.MeshStandardMaterial({ color: "#080a16", metalness: 0.9, roughness: 0.16, transparent: true, opacity: 0.82 });
const tiles = [];
const roughTex = (() => { const c = document.createElement("canvas"); c.width = c.height = 256; const x = c.getContext("2d"); x.fillStyle = "#a0a0a0"; x.fillRect(0, 0, 256, 256);
  const rr = rng(77); for (let i = 0; i < 90; i++) { const px = rr() * 256, py = rr() * 256, r = 10 + rr() * 60; const g = x.createRadialGradient(px, py, 0, px, py, r); const v = Math.floor(20 + rr() * 60); g.addColorStop(0, `rgba(${v},${v},${v},0.9)`); g.addColorStop(1, "rgba(160,160,160,0)"); x.fillStyle = g; x.fillRect(px - r, py - r, 2 * r, 2 * r); }
  for (let i = 0; i < 1400; i++) { const v = Math.floor(rr() * 255); x.fillStyle = `rgba(${v},${v},${v},0.25)`; x.fillRect(rr() * 256, rr() * 256, 2, 2); }
  const t = new THREE.CanvasTexture(c); return t; })();
dry.roughnessMap = roughTex; wet.roughnessMap = roughTex; dry.roughness = 1.0; wet.roughness = 0.6;
for (let ix = -6; ix <= 6; ix++) for (let iz = -3; iz <= 4; iz++) {
  const x = ix * 2, z = PZ + 1 + iz * 2 + 1;
  const walk = Math.abs(x) <= 2;
  if (!walk && rnd() < 0.18) continue;
  const y = (walk ? 0 : -0.05) - 0.06 + (rnd() - 0.5) * 0.02;
  tiles.push({ x, y, z, wet: (walk && rnd() < 0.55) || rnd() < 0.25, tilt: (rnd() - 0.5) * 0.012 });
}
for (const kind of [false, true]) {
  const list = tiles.filter((t) => t.wet === kind);
  const im = new THREE.InstancedMesh(tileG, kind ? wet : dry, list.length);
  const m = new THREE.Matrix4(), e = new THREE.Euler();
  list.forEach((t, i) => { e.set(t.tilt, 0, t.tilt * 0.7); m.makeRotationFromEuler(e); m.setPosition(t.x, t.y, t.z); im.setMatrixAt(i, m); });
  scene.add(im);
}
// cyan seams along the walkway edges and a few cross seams
const seamM = new THREE.MeshBasicMaterial({ color: new THREE.Color("#61E2EB").multiplyScalar(0.75), toneMapped: false });
for (const sx of [-3, 3]) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.01, 16), seamM); s.position.set(sx, 0.005, PZ + 8.5); scene.add(s); }
for (const z of [PZ + 2, PZ + 6, PZ + 10]) { const s = new THREE.Mesh(new THREE.BoxGeometry(6, 0.008, 0.02), new THREE.MeshBasicMaterial({ color: new THREE.Color("#61E2EB").multiplyScalar(0.6), toneMapped: false })); s.position.set(0, 0.004, z); scene.add(s); }

// fog banks left and right (lit toward the portal)
const fogs = [
  [-7.5, 1.0, -3.5, 13, 4.2, 1.1, [0.85, 0.55]], [7.5, 1.0, -3.5, 13, 4.2, 2.7, [0.15, 0.55]],
  [-5.6, 0.6, 0.5, 9, 3.2, 4.4, [0.9, 0.6]], [5.8, 0.6, 0.5, 9, 3.2, 6.1, [0.1, 0.6]],
  [-9, 1.6, -9, 16, 5, 7.3, [0.9, 0.4]], [9, 1.6, -9, 16, 5, 8.8, [0.1, 0.4]],
  [-4.2, 0.2, 3.4, 6, 2.0, 9.9, [0.9, 0.7]], [4.4, 0.2, 3.4, 6, 2.0, 12.4, [0.1, 0.7]],
  [-6.5, 0.3, -6.5, 10, 2.4, 14.2, [0.95, 0.6]], [6.5, 0.3, -6.5, 10, 2.4, 15.7, [0.05, 0.6]],
  [0, 0.15, -9, 22, 1.6, 17.1, [0.5, 0.7]], [-3.8, 0.45, -1.5, 5, 1.6, 18.3, [0.95, 0.6]], [3.9, 0.45, -1.5, 5, 1.6, 19.4, [0.05, 0.6]],
];
for (const [x, y, z, w, h, seed, lp] of fogs) {
  const f = new THREE.Mesh(new THREE.PlaneGeometry(w, h), fogMaterial({ seed, litPos: lp, opacity: 0.92, shadow: "#141a35", lit: "#6c679b" }));
  f.position.set(x, y, z); f.renderOrder = 3; scene.add(f);
}

stars(scene, { n: 1800, r: 600, size: 1.2, seed: 4, opacity: 0.55 });
stars(scene, { n: 260, r: 600, size: 2.1, seed: 9, opacity: 0.8 });

// T01 particle swarm hugging the rim
{
  const n = 300, pos = new Float32Array(n * 3), r2 = rng(21);
  for (let i = 0; i < n; i++) {
    let a = r2() * Math.PI * 2; if (Math.sin(a) < -0.35 && r2() < 0.7) a = Math.PI - a;
    const rr = R * (1.03 + Math.pow(r2(), 2.4) * 0.6);
    pos.set([Math.cos(a) * rr, PY + Math.sin(a) * rr, PZ + (r2() - 0.5) * 1.2], i * 3);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 3.0, sizeAttenuation: false, color: new THREE.Color("#f2ecff").multiplyScalar(1.3), transparent: true, opacity: 0.95, depthWrite: false, toneMapped: false })));
}

renderWithBloom(renderer, scene, cam, { strength: 0.55, radius: 0.32, threshold: 0.9 });
