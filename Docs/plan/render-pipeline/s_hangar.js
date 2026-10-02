// CH11 ISRO Launch Pad Simulation hangar (KF32): launch vehicle with strap-ons, lattice gantry + orange arms, crane, tanks, crates, cyan strip lights, floor rings.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { q, W, H, makeRenderer, renderWithBloom, rng } from "./lib.js";

const renderer = makeRenderer(false);
const scene = new THREE.Scene();
scene.background = new THREE.Color("#0b0e14");
scene.fog = new THREE.Fog("#141922", 55, 140);
const cam = new THREE.PerspectiveCamera(46, W / H, 0.1, 400);
cam.position.set(5, 9.2, 38); cam.lookAt(0.8, 11.8, 0);
{
  const es = new THREE.Scene(); es.add(new THREE.Mesh(new THREE.SphereGeometry(20, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, vertexShader: `varying vec3 vP; void main(){ vP=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`, fragmentShader: `varying vec3 vP; void main(){ vec3 c=mix(vec3(.04,.05,.07),vec3(.45,.5,.58),smoothstep(-.2,.9,vP.y)); c+=vec3(.3,.8,.9)*smoothstep(.97,1.,abs(vP.x))*.8; gl_FragColor=vec4(c,1.); }` })));
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(es, 0.04).texture; scene.environmentIntensity = 0.9;
}
scene.add(new THREE.HemisphereLight("#b9c6d8", "#151a22", 0.95));
const spot = new THREE.SpotLight("#fff2e0", 2600, 0, 0.45, 0.6, 2); spot.position.set(-6, 32, 14); spot.target.position.set(0, 6, 0); scene.add(spot, spot.target);
const spot2 = new THREE.SpotLight("#cfe8ff", 1400, 0, 0.5, 0.7, 2); spot2.position.set(14, 26, 10); spot2.target.position.set(2, 8, 0); scene.add(spot2, spot2.target);
const R = rng(13);
const white = new THREE.MeshStandardMaterial({ color: "#eef0f2", roughness: 0.35, metalness: 0.1 });
const orange = new THREE.MeshStandardMaterial({ color: "#d9822b", roughness: 0.45, metalness: 0.2 });
const ochre = new THREE.MeshStandardMaterial({ color: "#c98f3a", roughness: 0.5, metalness: 0.4 });
const steel = new THREE.MeshStandardMaterial({ color: "#8b929c", roughness: 0.45, metalness: 0.7 });
const concrete = new THREE.MeshStandardMaterial({ color: "#5d636c", roughness: 0.85, metalness: 0.05 });
const panel = new THREE.MeshStandardMaterial({ color: "#262b34", roughness: 0.55, metalness: 0.5 });
const panel2 = new THREE.MeshStandardMaterial({ color: "#1b1f27", roughness: 0.6, metalness: 0.5 });
const cyanE = (k = 2) => new THREE.MeshBasicMaterial({ color: new THREE.Color("#7fe6ff").multiplyScalar(k), toneMapped: false });

// hangar shell: floor, back wall panels, side walls, cyan strips
{ const f = new THREE.Mesh(new THREE.PlaneGeometry(120, 80), new THREE.MeshStandardMaterial({ color: "#3b4048", roughness: 0.6, metalness: 0.2 })); f.rotation.x = -Math.PI / 2; scene.add(f);
  for (let x = -40; x <= 40; x += 4) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.01, 80), new THREE.MeshStandardMaterial({ color: "#2b3037" })); l.position.set(x, 0.005, 0); scene.add(l); }
  for (let x = -36; x <= 36; x += 6) for (let y = 0; y < 34; y += 6.5) { const p = new THREE.Mesh(new RoundedBoxGeometry(5.8, 6.3, 0.6, 2, 0.08), (x / 6 + y / 6.5) % 2 ? panel : panel2); p.position.set(x, y + 3.2, -14 - R() * 0.4); scene.add(p); }
  for (const sx of [-1, 1]) { for (let z = -14; z < 20; z += 6) for (let y = 0; y < 30; y += 6.5) { const p = new THREE.Mesh(new RoundedBoxGeometry(0.6, 6.3, 5.8, 2, 0.08), panel); p.position.set(sx * 26, y + 3.2, z); scene.add(p); } }
  // strip lights: horizontal on back wall, vertical slits on side walls, ceiling bars
  [[-20, 13.5, 14], [21, 19, 12], [-26, 7, 8], [24, 6.5, 10]].forEach(([x, y, w]) => { const s = new THREE.Mesh(new THREE.BoxGeometry(w, 0.22, 0.1), cyanE(2.6)); s.position.set(x, y, -13.5); scene.add(s); });
  for (const sx of [-1, 1]) for (const z of [-6, 2, 10]) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3.4, 0.25), cyanE(2.4)); s.position.set(sx * 25.6, 5.2, z); scene.add(s); }
  for (let x = -18; x <= 18; x += 12) { const c = new THREE.Mesh(new THREE.BoxGeometry(6, 0.2, 0.5), new THREE.MeshBasicMaterial({ color: new THREE.Color("#e8f4ff").multiplyScalar(3), toneMapped: false })); c.position.set(x, 33, 0); scene.add(c); }
  const floorStrip = new THREE.Mesh(new THREE.BoxGeometry(48, 0.06, 0.12), cyanE(2)); floorStrip.position.set(0, 0.05, -12.5); scene.add(floorStrip);
  for (const sx of [-1, 1]) { const st = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 30), cyanE(1.6)); st.position.set(sx * 24.5, 0.05, 2); scene.add(st); }
}
// launch platform with railings and stairs
{
  const plat = new THREE.Mesh(new RoundedBoxGeometry(17, 2.2, 11, 2, 0.1), concrete); plat.position.set(1, 1.1, 0); scene.add(plat);
  const deck = new THREE.Mesh(new THREE.BoxGeometry(10, 1.2, 7), concrete); deck.position.set(1, 2.8, -0.5); scene.add(deck);
  for (let x = -7.3; x <= 9.3; x += 0.8) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9), steel); p.position.set(x, 2.65, 5.4); scene.add(p); }
  const rail = new THREE.Mesh(new THREE.BoxGeometry(16.6, 0.06, 0.06), steel); rail.position.set(1, 3.1, 5.4); scene.add(rail);
  for (let i = 0; i < 9; i++) { const st = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 0.5), steel); st.position.set(-5.5 - i * 0.15, 2.1 - i * 0.24, 6.0 + i * 0.42); st.rotation.y = 0.35; scene.add(st); }
  for (let i = 0; i < 9; i++) { const st = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 0.5), steel); st.position.set(8.0 + i * 0.15, 2.1 - i * 0.24, 6.0 + i * 0.42); st.rotation.y = -0.35; scene.add(st); }
  // hazard stripes on the front edge
  for (let i = 0; i < 24; i++) { const h = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.3, 0.02), new THREE.MeshStandardMaterial({ color: i % 2 ? "#e2b43a" : "#141414", roughness: 0.6 })); h.position.set(-7 + i * 0.7, 0.3, 5.52); h.rotation.z = 0.6; scene.add(h); }
  // floor teleport rings
  for (const [x, z, r] of [[-11, 8, 2.2], [14, 9, 1.8]]) for (const k of [0.55, 0.8, 1]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(r * k, 0.04, 6, 96), cyanE(2.2)); ring.rotation.x = Math.PI / 2; ring.position.set(x, 0.06, z); scene.add(ring); }
}
// launch vehicle: core stage w/ orange band, ogive fairing, two strap-on boosters
const RX = 0, RY = 3.4;
{
  const lathe = (pts, mat) => new THREE.Mesh(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), 64), mat);
  const core = lathe([[0, 0], [1.05, 0], [1.05, 7.5], [1.05, 7.5]], white); core.position.set(RX, RY, 0); scene.add(core);
  const band = lathe([[1.07, 0], [1.07, 6.2]], orange); band.position.set(RX, RY + 7.5, 0); scene.add(band);
  const upper = lathe([[1.05, 0], [1.05, 3.4]], white); upper.position.set(RX, RY + 13.7, 0); scene.add(upper);
  const fair = lathe([[1.05, 0], [1.35, 0.6], [1.35, 3.2], [1.2, 4.6], [0.85, 5.6], [0.4, 6.3], [0.0, 6.6]], white); fair.position.set(RX, RY + 17.1, 0); scene.add(fair);
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.33), new THREE.MeshBasicMaterial({ color: "#e0782a" })); flag.position.set(RX + 0.2, RY + 19.6, 1.37); scene.add(flag);
  for (const sx of [-1, 1]) {
    const b = lathe([[0, 0], [0.62, 0], [0.62, 9.6], [0.5, 10.6], [0.25, 11.4], [0.0, 11.7]], white); b.position.set(RX + sx * 1.75, RY, 0.2); scene.add(b);
    const n = lathe([[0.64, 0], [0.64, 0.5]], new THREE.MeshStandardMaterial({ color: "#2a2d33", metalness: 0.6, roughness: 0.4 })); n.position.set(RX + sx * 1.75, RY + 4.0, 0.2); scene.add(n);
    const noz = lathe([[0.3, 0], [0.5, -0.7]], steel); noz.position.set(RX + sx * 1.75, RY, 0.2); scene.add(noz);
  }
  const eng = lathe([[0.4, 0], [0.7, -0.8]], steel); eng.position.set(RX, RY, 0); scene.add(eng);
}
// lattice structures
function lattice(x, z, w, d, h, mat, levels) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const col = (cx, cz) => { const c = new THREE.Mesh(new THREE.BoxGeometry(0.18, h, 0.18), mat); c.position.set(cx, h / 2, cz); g.add(c); };
  col(-w / 2, -d / 2); col(w / 2, -d / 2); col(-w / 2, d / 2); col(w / 2, d / 2);
  const step = h / levels;
  for (let i = 0; i <= levels; i++) { const y = i * step; for (const [lx, lz, len, rotY] of [[0, d / 2, w, 0], [0, -d / 2, w, 0], [w / 2, 0, d, Math.PI / 2], [-w / 2, 0, d, Math.PI / 2]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(len, 0.1, 0.1), mat); b.position.set(lx, y, lz); b.rotation.y = rotY; g.add(b); }
    if (i < levels) { for (const [lx, lz, len, rotY] of [[0, d / 2, w, 0], [0, -d / 2, w, 0], [w / 2, 0, d, Math.PI / 2], [-w / 2, 0, d, Math.PI / 2]]) { const diag = Math.hypot(len, step); const b = new THREE.Mesh(new THREE.BoxGeometry(diag, 0.07, 0.07), mat); b.position.set(lx, y + step / 2, lz); b.rotation.set(0, rotY, Math.atan2(step, len) * (i % 2 ? 1 : -1)); g.add(b); } } }
  scene.add(g); return g;
}
lattice(5.3, -1.2, 3.0, 3.0, 25, steel, 14); // service gantry (right)
lattice(-5.6, -3.0, 1.6, 1.6, 21, ochre, 13); // crane tower (left)
{ // gantry arms (orange) reaching to the vehicle + crane jib
  for (const [y, len] of [[11.5, 3.6], [16.2, 3.3], [20.4, 3.0]]) { const a = new THREE.Mesh(new THREE.BoxGeometry(len, 0.5, 1.0), orange); a.position.set(5.3 - len / 2 - 0.6, y, -0.3); scene.add(a); const tr = new THREE.Mesh(new THREE.BoxGeometry(len, 0.05, 1.0), steel); tr.position.set(a.position.x, y + 0.28, -0.3); scene.add(tr); }
  const jib = new THREE.Mesh(new THREE.BoxGeometry(7, 0.6, 0.6), orange); jib.position.set(-3.6, 21.6, -3.0); scene.add(jib);
  const cw = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 1.0), concrete); cw.position.set(-7.4, 21.2, -3.0); scene.add(cw);
  const top = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.2, 3.4), panel); top.position.set(5.3, 25.6, -1.2); scene.add(top);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4), steel); mast.position.set(5.3, 28.2, -1.2); scene.add(mast);
}
// fuel tanks (left) and crates (right) + cables
{
  for (const [x, z] of [[-14.5, 3.5], [-14.5, 0.2]]) { const t = new THREE.Mesh(new THREE.CapsuleGeometry(1.4, 6, 8, 24), new THREE.MeshStandardMaterial({ color: "#a9aeb6", roughness: 0.4, metalness: 0.6 })); t.rotation.z = Math.PI / 2; t.position.set(x, 1.9, z); scene.add(t); for (const bx of [-2.2, 0, 2.2]) { const b = new THREE.Mesh(new THREE.TorusGeometry(1.42, 0.08, 6, 32), steel); b.rotation.y = Math.PI / 2; b.position.set(x + bx, 1.9, z); scene.add(b); } }
  const crateM = new THREE.MeshStandardMaterial({ color: "#5b616b", roughness: 0.6, metalness: 0.4 });
  for (let i = 0; i < 9; i++) { const c = new THREE.Mesh(new RoundedBoxGeometry(1.4, 1.4, 1.4, 2, 0.06), crateM); c.position.set(13 + (i % 3) * 1.5, 0.7 + Math.floor(i / 6) * 1.42, 4 + Math.floor(i / 3) % 2 * 1.5); scene.add(c); }
  const cableM = new THREE.MeshStandardMaterial({ color: "#121418", roughness: 0.5 });
  for (let k = 0; k < 4; k++) { const pts = []; for (let i = 0; i <= 12; i++) pts.push(new THREE.Vector3(-12 + i * 1.6, 0.08, 7 + Math.sin(i * 0.8 + k) * 1.2 + k * 0.5)); scene.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.07, 6), cableM)); }
}
renderWithBloom(renderer, scene, cam, { strength: 0.55, radius: 0.4, threshold: 0.8 });
