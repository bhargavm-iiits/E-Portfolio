// CH08 Game-Based Physics Learning lab (KF28): circular sci-fi lab, ceiling ring light, consoles, pedestal rings, glass cube w/ atom, molecules, gold cube + energy beam.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { q, W, H, makeRenderer, renderWithBloom, rng, stars } from "./lib.js";

const renderer = makeRenderer(false);
const scene = new THREE.Scene();
scene.background = new THREE.Color("#060a16");
const cam = new THREE.PerspectiveCamera(52, W / H, 0.1, 400);
cam.position.set(0, 3.1, 9.5); cam.lookAt(0, 2.1, 0);
stars(scene, { n: 900, r: 120, size: 1.4, seed: 2, opacity: 0.75 });
{
  const es = new THREE.Scene(); es.add(new THREE.Mesh(new THREE.SphereGeometry(20, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, vertexShader: `varying vec3 vP; void main(){ vP=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`, fragmentShader: `varying vec3 vP; void main(){ vec3 c=mix(vec3(.05,.06,.09),vec3(.55,.62,.75),smoothstep(-.2,.8,vP.y)); c+=vec3(1.)*smoothstep(.85,.95,vP.y)*2.; gl_FragColor=vec4(c,1.); }` })));
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(es, 0.04).texture; scene.environmentIntensity = 0.55;
}
scene.add(new THREE.HemisphereLight("#cfdcf0", "#1a1f2c", 0.45));
const key = new THREE.DirectionalLight("#ffffff", 1.4); key.position.set(0, 10, 4); scene.add(key);

const grey = new THREE.MeshStandardMaterial({ color: "#7d8696", roughness: 0.45, metalness: 0.35 });
const greyD = new THREE.MeshStandardMaterial({ color: "#3d4452", roughness: 0.5, metalness: 0.4 });
const dark = new THREE.MeshStandardMaterial({ color: "#1b2030", roughness: 0.35, metalness: 0.5 });
const cyanE = (k = 2) => new THREE.MeshBasicMaterial({ color: new THREE.Color("#7fe6ff").multiplyScalar(k), toneMapped: false });
const whiteE = (k = 3) => new THREE.MeshBasicMaterial({ color: new THREE.Color("#eaf6ff").multiplyScalar(k), toneMapped: false });

// floor: glossy dark disc + panel rings
const floor = new THREE.Mesh(new THREE.CircleGeometry(14, 96), new THREE.MeshStandardMaterial({ color: "#2a303d", roughness: 0.22, metalness: 0.55 })); floor.rotation.x = -Math.PI / 2; scene.add(floor);
for (const r of [3.2, 5.6, 8.5, 11]) { const ring = new THREE.Mesh(new THREE.RingGeometry(r, r + 0.03, 128), cyanE(r < 4 ? 1.8 : 0.7)); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.005; scene.add(ring); }
// walls: open-top cylinder of panels with light strips
{
  const R = 13, segs = 28;
  for (let i = 0; i < segs; i++) {
    const a = (i / segs) * Math.PI * 2; if (Math.abs(Math.sin(a / 2)) < 0.18 && Math.cos(a) > 0.9) continue;
    const p = new THREE.Mesh(new RoundedBoxGeometry(2.7, 5.2, 0.3, 2, 0.05), i % 2 ? grey : greyD); p.position.set(Math.sin(a) * R, 2.6, -Math.cos(a) * R); p.lookAt(0, 2.6, 0); scene.add(p);
    const s = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 0.05), cyanE(1.2)); s.position.set(Math.sin(a) * (R - 0.2), 4.4, -Math.cos(a) * (R - 0.2)); s.lookAt(0, 4.4, 0); scene.add(s);
  }
  // ceiling ring light (big white arc)
  const ceil = new THREE.Mesh(new THREE.TorusGeometry(9.5, 0.18, 12, 160), whiteE(3.5)); ceil.rotation.x = Math.PI / 2; ceil.position.y = 7.6; scene.add(ceil);
  const ceilFrame = new THREE.Mesh(new THREE.TorusGeometry(9.5, 0.5, 12, 160), dark); ceilFrame.rotation.x = Math.PI / 2; ceilFrame.position.y = 7.9; scene.add(ceilFrame);
  const upper = new THREE.Mesh(new THREE.CylinderGeometry(13.4, 13.4, 1.2, 64, 1, true), new THREE.MeshStandardMaterial({ color: "#4a5262", roughness: 0.5, metalness: 0.4, side: THREE.BackSide })); upper.position.y = 5.8; scene.add(upper);
  const strip = new THREE.Mesh(new THREE.TorusGeometry(13.1, 0.05, 6, 160), cyanE(2)); strip.rotation.x = Math.PI / 2; strip.position.y = 5.3; scene.add(strip);
}
// consoles / desks left and right
function desk(x, z, rot) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot;
  const top = new THREE.Mesh(new RoundedBoxGeometry(4.2, 0.12, 1.2, 2, 0.04), grey); top.position.y = 1.0; g.add(top);
  const body = new THREE.Mesh(new RoundedBoxGeometry(4.0, 0.95, 1.0, 2, 0.05), greyD); body.position.y = 0.5; g.add(body);
  const lip = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.03, 0.03), cyanE(1.6)); lip.position.set(0, 0.95, 0.52); g.add(lip);
  for (const mx of [-1.1, 1.0]) { const mon = new THREE.Mesh(new RoundedBoxGeometry(1.1, 0.7, 0.06, 2, 0.02), dark); mon.position.set(mx, 1.5, -0.3); mon.rotation.x = -0.12; g.add(mon); const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.6), cyanE(0.7)); scr.position.set(mx, 1.5, -0.26); scr.rotation.x = -0.12; g.add(scr); }
  const flask = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.35, 16), new THREE.MeshPhysicalMaterial({ color: "#9fd8ff", transparent: true, opacity: 0.5, roughness: 0.05 })); flask.position.set(1.7, 1.24, 0.1); g.add(flask);
  scene.add(g);
}
desk(-7.6, -3.2, 0.62); desk(7.6, -3.2, -0.62); desk(-9.6, 1.5, 1.2); desk(9.6, 1.5, -1.2);
// central pedestal with emitter rings
{
  const tiers = [[2.6, 0.25, 0], [2.0, 0.3, 0.25], [1.4, 0.35, 0.55]];
  tiers.forEach(([r, h, y]) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.04, h, 96), dark); c.position.y = y + h / 2; scene.add(c); const rr = new THREE.Mesh(new THREE.TorusGeometry(r * 0.96, 0.03, 6, 128), cyanE(2.6)); rr.rotation.x = Math.PI / 2; rr.position.y = y + h + 0.005; scene.add(rr); });
  const disc = new THREE.Mesh(new THREE.CircleGeometry(1.1, 64), cyanE(1.2)); disc.rotation.x = -Math.PI / 2; disc.position.y = 0.91; scene.add(disc);
}
// side emitter pads
for (const sx of [-5.4, 5.4]) { const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.3, 0.2, 64), dark); pad.position.set(sx, 0.1, 2.2); scene.add(pad); for (const r of [0.5, 0.85, 1.15]) { const rr = new THREE.Mesh(new THREE.TorusGeometry(r, 0.025, 6, 64), cyanE(2.2)); rr.rotation.x = Math.PI / 2; rr.position.set(sx, 0.21, 2.2); scene.add(rr); } const gl = new THREE.Mesh(new THREE.CircleGeometry(0.45, 32), cyanE(1.4)); gl.rotation.x = -Math.PI / 2; gl.position.set(sx, 0.215, 2.2); scene.add(gl); }

// floating glass cube with an atom inside (the suite's "v · s · t" object)
const glass = new THREE.MeshPhysicalMaterial({ color: "#a9dcff", metalness: 0, roughness: 0.04, transparent: true, opacity: 0.32, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false });
{
  const g = new THREE.Group(); g.position.set(0, 2.25, 0); g.rotation.set(0.35, 0.6, 0.12); scene.add(g);
  g.add(new THREE.Mesh(new RoundedBoxGeometry(1.5, 1.5, 1.5, 3, 0.06), glass));
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.5, 1.5, 1.5)), new THREE.LineBasicMaterial({ color: new THREE.Color("#bfefff").multiplyScalar(1.6), toneMapped: false })); g.add(edges);
  const nuc = new THREE.Mesh(new THREE.SphereGeometry(0.13, 24, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color("#ff5a6e").multiplyScalar(2), toneMapped: false })); g.add(nuc);
  [0, 1.05, 2.1].forEach((a) => { const o = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.012, 6, 96), cyanE(2.4)); o.scale.set(1, 0.42, 1); o.rotation.set(Math.PI / 2, a, 0); g.add(o); const e = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 8), cyanE(4)); e.position.set(Math.cos(a) * 0.5, Math.sin(a) * 0.2, 0); g.add(e); });
}
// velocity arrow along a track (feature beat)
{ const track = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.03, 0.08), cyanE(1.2)); track.position.set(0.4, 1.22, 1.3); scene.add(track);
  const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.26, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color("#FFB45A").multiplyScalar(2.5), toneMapped: false })); arrow.rotation.z = -Math.PI / 2; arrow.position.set(2.3, 1.22, 1.3); scene.add(arrow);
  const shaft = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.035, 0.035), new THREE.MeshBasicMaterial({ color: new THREE.Color("#FFB45A").multiplyScalar(2.5), toneMapped: false })); shaft.position.set(1.45, 1.22, 1.3); scene.add(shaft); }

// gold tetrahedron molecule (left) and blue tetra molecule
const gold = new THREE.MeshStandardMaterial({ color: "#f2b94a", metalness: 0.8, roughness: 0.25, emissive: "#6a3b00", emissiveIntensity: 0.4 });
const blueS = new THREE.MeshStandardMaterial({ color: "#4aa3ff", metalness: 0.3, roughness: 0.2, emissive: "#0b3c8a", emissiveIntensity: 0.5 });
function molecule(pos, scale, mat, mat2) {
  const g = new THREE.Group(); g.position.copy(pos); g.scale.setScalar(scale); g.rotation.set(0.3, 0.5, 0.1);
  const v = [[1, 1, 1], [-1, -1, 1], [-1, 1, -1], [1, -1, -1]].map((p) => new THREE.Vector3(...p).multiplyScalar(0.6));
  v.forEach((p, i) => { const s = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 16), i === 0 && mat2 ? mat2 : mat); s.position.copy(p); g.add(s); });
  const bm = new THREE.MeshStandardMaterial({ color: "#e8eef8", metalness: 0.4, roughness: 0.3 });
  for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) { const a = v[i], b = v[j]; const len = a.distanceTo(b); const c = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, len, 8), bm); c.position.copy(a).add(b).multiplyScalar(0.5); c.lookAt(b); c.rotateX(Math.PI / 2); g.add(c); }
  scene.add(g);
}
molecule(new THREE.Vector3(-3.4, 1.7, 1.2), 1.0, blueS, gold);
molecule(new THREE.Vector3(-1.9, 2.5, -0.6), 0.75, gold);
// blue hex crystal
{ const c = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), new THREE.MeshPhysicalMaterial({ color: "#3d7dff", roughness: 0.1, transparent: true, opacity: 0.7, clearcoat: 1, emissive: "#1d3d9a", emissiveIntensity: 0.6 })); c.position.set(2.1, 2.3, 0.2); c.rotation.set(0.4, 0.3, 0.2); scene.add(c);
  const ce = new THREE.LineSegments(new THREE.EdgesGeometry(c.geometry), new THREE.LineBasicMaterial({ color: new THREE.Color("#9fd0ff").multiplyScalar(1.5), toneMapped: false })); ce.position.copy(c.position); ce.rotation.copy(c.rotation); scene.add(ce); }
// gold cube right + orange energy beam to a glowing sphere
{ const gc = new THREE.Mesh(new RoundedBoxGeometry(0.95, 0.95, 0.95, 2, 0.05), new THREE.MeshPhysicalMaterial({ color: "#f5c04a", metalness: 0.2, roughness: 0.15, transparent: true, opacity: 0.75, emissive: "#a86a00", emissiveIntensity: 0.6 })); gc.position.set(4.3, 1.7, 0.6); gc.rotation.set(0.3, 0.5, 0.1); scene.add(gc);
  const sph = new THREE.Mesh(new THREE.SphereGeometry(0.38, 32, 24), new THREE.MeshBasicMaterial({ color: new THREE.Color("#FFB45A").multiplyScalar(2.2), toneMapped: false })); sph.position.set(1.1, 1.85, 1.0); scene.add(sph);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.1, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color("#FFB45A").multiplyScalar(3), toneMapped: false })); beam.position.set(2.7, 1.78, 0.8); beam.rotation.z = Math.PI / 2 - 0.05; scene.add(beam);
  const orbit = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.015, 6, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color("#FFB45A").multiplyScalar(2), toneMapped: false })); orbit.position.copy(gc.position); orbit.rotation.set(Math.PI / 2.4, 0, 0.2); scene.add(orbit); }
// small green sphere (KF28) + five level pads (feature beat)
{ const gs = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color("#5dff8a").multiplyScalar(1.5), toneMapped: false })); gs.position.set(0.2, 1.2, 1.0); scene.add(gs); }
for (let i = 0; i < 5; i++) { const a = -0.9 + i * 0.45; const p = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.06, 6), i < 3 ? cyanE(1.8) : new THREE.MeshStandardMaterial({ color: "#2a3346", metalness: 0.5, roughness: 0.3 })); p.position.set(Math.sin(a) * 4.1, 0.04, Math.cos(a) * 4.1 - 0.8); scene.add(p); }

renderWithBloom(renderer, scene, cam, { strength: 0.45, radius: 0.35, threshold: 0.88 });
