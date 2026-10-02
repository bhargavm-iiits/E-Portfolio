// CH09 Tirumala AR Navigation diorama (KF30): hologram terrain slab, wire grid, glowing box edges, amber route to the summit pin, flagged interpolated gap.
import * as THREE from "three";
import { q, W, H, makeRenderer, renderWithBloom, NOISE, rng, stars } from "./lib.js";

const renderer = makeRenderer(false);
const scene = new THREE.Scene();
scene.background = new THREE.Color("#040916");
const cam = new THREE.PerspectiveCamera(36, W / H, 0.1, 500);
cam.position.set(9.5, 16.5, 32.5); cam.lookAt(1.0, 2.4, -1.0);
stars(scene, { n: 900, r: 200, size: 1.2, seed: 6, opacity: 0.6 });
scene.add(new THREE.HemisphereLight("#7fa6e0", "#050a14", 0.4));
const sun = new THREE.DirectionalLight("#dfeaff", 2.2); sun.position.set(-14, 9, -4); scene.add(sun);
const fill = new THREE.DirectionalLight("#5fb8ff", 0.5); fill.position.set(10, 6, 12); scene.add(fill);

// value noise (CPU) for the heightmap
const P = rng(9); const perm = new Float32Array(1024); for (let i = 0; i < 1024; i++) perm[i] = P();
const hh = (x, y) => perm[((x * 73856093) ^ (y * 19349663)) & 1023];
function vnoise(x, y) { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi; const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  return (hh(xi, yi) * (1 - u) + hh(xi + 1, yi) * u) * (1 - v) + (hh(xi, yi + 1) * (1 - u) + hh(xi + 1, yi + 1) * u) * v; }
function fbm(x, y, o = 6) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < o; i++) { s += a * vnoise(x * f, y * f); f *= 2.03; a *= 0.5; } return s; }
function ridged(x, y) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < 6; i++) { s += a * Math.pow(1 - Math.abs(vnoise(x * f, y * f) * 2 - 1), 2); f *= 2.1; a *= 0.5; } return s; }
const SX = 34, SZ = 20;
const PEAK = new THREE.Vector2(6.5, -6.5);
function height(x, z) {
  const back = THREE.MathUtils.smoothstep(-z, -9, 6); // higher toward the back
  let h = fbm(x * 0.12 + 3, z * 0.12 + 7) * 1.4 + ridged(x * 0.11 + 11, z * 0.13 + 2) * (1.0 + back * 4.2);
  h += 4.2 * Math.exp(-((x - PEAK.x) ** 2 + (z - PEAK.y) ** 2) / 26);
  h += 2.2 * Math.exp(-((x + 6) ** 2 + (z + 7) ** 2) / 30);
  const valley = Math.exp(-((x * 0.35 + z * 0.55 + 1.5) ** 2) / 1.2); h -= valley * 1.2;
  return Math.max(0.15, h * 0.85);
}
// terrain surface
const NX = 220, NZ = 130;
const geo = new THREE.PlaneGeometry(SX, SZ, NX, NZ); geo.rotateX(-Math.PI / 2);
const pos = geo.attributes.position; const cols = new Float32Array(pos.count * 3);
const cLow = new THREE.Color("#12261f"), cMid = new THREE.Color("#2a3d3c"), cHigh = new THREE.Color("#5d6f78"), cSnow = new THREE.Color("#e6eef8");
for (let i = 0; i < pos.count; i++) {
  const x = pos.getX(i), z = pos.getZ(i); const y = height(x, z); pos.setY(i, y);
  const t = y / 6.5; const c = new THREE.Color();
  if (t < 0.3) c.lerpColors(cLow, cMid, t / 0.3); else if (t < 0.6) c.lerpColors(cMid, cHigh, (t - 0.3) / 0.3); else c.lerpColors(cHigh, cSnow, Math.min(1, (t - 0.6) / 0.16));
  cols.set([c.r, c.g, c.b], i * 3);
}
geo.setAttribute("color", new THREE.BufferAttribute(cols, 3)); geo.computeVertexNormals();
scene.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, metalness: 0.05, transparent: true, opacity: 0.94 })));

// wire grid following the surface
{
  const pts = [], step = 1.7;
  for (let gx = -SX / 2; gx <= SX / 2 + 0.01; gx += step) for (let z = -SZ / 2; z < SZ / 2; z += 0.15) { pts.push(gx, height(gx, z) + 0.03, z, gx, height(gx, z + 0.15) + 0.03, z + 0.15); }
  for (let gz = -SZ / 2; gz <= SZ / 2 + 0.01; gz += step) for (let x = -SX / 2; x < SX / 2; x += 0.15) { pts.push(x, height(x, gz) + 0.03, gz, x + 0.15, height(x + 0.15, gz) + 0.03, gz); }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  scene.add(new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: new THREE.Color("#8fe9ff").multiplyScalar(1.1), transparent: true, opacity: 0.32, toneMapped: false })));
}
// slab skirt + glowing box edges
{
  const skirtM = new THREE.MeshStandardMaterial({ color: "#0b1d2c", roughness: 0.6, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
  const edge = (ax, fixed, len, along) => {
    const n = 200, verts = [], idx = [];
    for (let i = 0; i <= n; i++) { const t = -len / 2 + (len * i) / n; const x = along === "x" ? t : fixed, z = along === "x" ? fixed : t; const y = height(x, z); verts.push(x, y, z, x, -0.9, z); if (i < n) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3)); g.setIndex(idx); g.computeVertexNormals(); scene.add(new THREE.Mesh(g, skirtM));
    const top = []; for (let i = 0; i < n; i++) { const t0 = -len / 2 + (len * i) / n, t1 = -len / 2 + (len * (i + 1)) / n; const x0 = along === "x" ? t0 : fixed, z0 = along === "x" ? fixed : t0, x1 = along === "x" ? t1 : fixed, z1 = along === "x" ? fixed : t1; top.push(x0, height(x0, z0) + 0.02, z0, x1, height(x1, z1) + 0.02, z1); }
    const tg = new THREE.BufferGeometry(); tg.setAttribute("position", new THREE.Float32BufferAttribute(top, 3)); scene.add(new THREE.LineSegments(tg, new THREE.LineBasicMaterial({ color: new THREE.Color("#7fe6ff").multiplyScalar(1.8), toneMapped: false })));
  };
  edge("x", SZ / 2, SX, "x"); edge("x", -SZ / 2, SX, "x"); edge("z", SX / 2, SZ, "z"); edge("z", -SX / 2, SZ, "z");
  const bright = new THREE.MeshBasicMaterial({ color: new THREE.Color("#7fe6ff").multiplyScalar(1.7), toneMapped: false });
  const bar = (x, z, lx, lz) => { const m = new THREE.Mesh(new THREE.BoxGeometry(lx || 0.08, 0.08, lz || 0.08), bright); m.position.set(x, -0.9, z); scene.add(m); };
  bar(0, SZ / 2, SX + 0.08, 0); bar(0, -SZ / 2, SX + 0.08, 0); bar(SX / 2, 0, 0, SZ); bar(-SX / 2, 0, 0, SZ);
  for (const [x, z] of [[-SX / 2, SZ / 2], [SX / 2, SZ / 2], [-SX / 2, -SZ / 2], [SX / 2, -SZ / 2]]) { const hgt = height(x, z) + 0.9; const m = new THREE.Mesh(new THREE.BoxGeometry(0.06, hgt, 0.06), bright); m.position.set(x, -0.9 + hgt / 2, z); scene.add(m); }
  // base glow plate
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(SX + 6, SZ + 6), new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `varying vec2 vUv; void main(){ vec2 p=abs(vUv-.5)*2.; float dx=max(p.x-.85,0.), dy=max(p.y-.77,0.); float d=length(vec2(dx,dy)); float edge=max(p.x*1.0, p.y*1.1); float g=exp(-pow((max(p.x/.85,p.y/.77)-1.)/.035,2.))*.32; gl_FragColor=vec4(vec3(.3,.8,1.)*g,1.); }` }));
  glow.rotation.x = -Math.PI / 2; glow.position.y = -0.88; scene.add(glow);
}
// grid floor (BG11)
{
  const g = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.ShaderMaterial({ transparent: true, depthWrite: false,
    vertexShader: `varying vec3 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `varying vec3 vW; void main(){ vec2 c=vW.xz/2.6; vec2 f=abs(fract(c)-.5); float l=1.-smoothstep(.0,.035,min(f.x,f.y)*2.); float fade=exp(-length(vW.xz)/60.); gl_FragColor=vec4(vec3(.17,.43,.62)*1.1, l*.38*fade); }` }));
  g.rotation.x = -Math.PI / 2; g.position.y = -0.92; scene.add(g);
}
// route spline along the surface: start ring (front-left) → summit pin
function surfaceCurve(pts, lift = 0.12) { return new THREE.CatmullRomCurve3(pts.map(([x, z]) => new THREE.Vector3(x, height(x, z) + lift, z))); }
const routePts = [[-8.5, 5.8], [-7.2, 4.2], [-5.2, 3.6], [-3.4, 2.2], [-1.6, 1.2], [0.2, 0.8], [1.6, -0.4], [2.4, -1.8], [3.6, -2.6], [4.8, -3.8], [5.6, -5.0], [6.3, -6.2]];
const route = surfaceCurve(routePts, 0.16);
const amber = (k) => new THREE.MeshBasicMaterial({ color: new THREE.Color("#FFB45A").multiplyScalar(k), toneMapped: false });
// split: interpolated gap (flagged, dashed) between t 0.42–0.55
const sub = (a, b) => new THREE.CatmullRomCurve3(Array.from({ length: 40 }, (_, i) => route.getPoint(a + ((b - a) * i) / 39)));
scene.add(new THREE.Mesh(new THREE.TubeGeometry(sub(0, 0.42), 200, 0.09, 8), amber(2.6)));
scene.add(new THREE.Mesh(new THREE.TubeGeometry(sub(0.55, 1), 200, 0.09, 8), amber(2.6)));
for (let t = 0.42; t < 0.55; t += 0.018) { const d = new THREE.Mesh(new THREE.TubeGeometry(sub(t, Math.min(t + 0.009, 0.55)), 8, 0.08, 6), amber(1.6)); scene.add(d); }
{ // flag at the gap
  const p = route.getPoint(0.485); const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.4), amber(1.4)); pole.position.set(p.x, p.y + 0.7, p.z); scene.add(pole);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.42), amber(2.0)); fl.position.set(p.x + 0.36, p.y + 1.18, p.z); fl.material.side = THREE.DoubleSide; scene.add(fl);
}
// secondary cyan paths
const cyan = new THREE.MeshBasicMaterial({ color: new THREE.Color("#8fefff").multiplyScalar(1.3), toneMapped: false });
scene.add(new THREE.Mesh(new THREE.TubeGeometry(surfaceCurve([[-15, 2.5], [-12, 2.2], [-9.5, 3.0], [-7.6, 2.4]], 0.1), 100, 0.07, 6), cyan));
scene.add(new THREE.Mesh(new THREE.TubeGeometry(surfaceCurve([[-6, 9.6], [-4.5, 7.8], [-2.2, 6.4], [0.5, 5.2], [3.5, 4.6], [6, 3.4], [9, 3.0]], 0.1), 160, 0.05, 6), cyan));
scene.add(new THREE.Mesh(new THREE.TubeGeometry(surfaceCurve([[-2.5, -1.5], [-1.6, -3.4], [-1.2, -5.2], [-0.4, -7.0]], 0.08), 80, 0.05, 6), cyan));
// start ring
{ const p = route.getPoint(0); const r = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.06, 8, 48), amber(2.4)); r.rotation.x = -Math.PI / 2; r.position.set(p.x, p.y + 0.02, p.z); scene.add(r);
  const r2 = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.025, 6, 48), amber(1.2)); r2.rotation.x = -Math.PI / 2; r2.position.copy(r.position); scene.add(r2); }
// summit pin
{ const p = route.getPoint(1); const g = new THREE.Group(); g.position.set(p.x, p.y + 1.35, p.z);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 16), amber(2.2)); g.add(head);
  const tipm = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.8, 24), amber(2.2)); tipm.rotation.x = Math.PI; tipm.position.y = -0.5; g.add(tipm);
  const hole = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 12), new THREE.MeshBasicMaterial({ color: "#3a1c05" })); hole.position.z = 0.32; g.add(hole);
  scene.add(g);
  const rip = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.03, 6, 48), amber(1.6)); rip.rotation.x = -Math.PI / 2; rip.position.set(p.x, p.y + 0.05, p.z); scene.add(rip); }

renderWithBloom(renderer, scene, cam, { strength: 0.75, radius: 0.45, threshold: 0.7 });
