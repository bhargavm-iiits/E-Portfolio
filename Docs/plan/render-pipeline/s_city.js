// BG05 neon megacity: variants hub (KF10, second portal over the avenue), warp (KF12 corridor), se (KF15/KF18 rooftop portal).
import * as THREE from "three";
import { Reflector } from "three/addons/objects/Reflector.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { q, W, H, makeRenderer, renderWithBloom, portalMaterial, glowMaterial, mechRing, windowMaterial, skyGradient, rng, stars } from "./lib.js";

const v = q.get("v") || "hub";
const renderer = makeRenderer(false);
const scene = new THREE.Scene();
const FOG = v === "se" ? "#1a1838" : "#16203A";
const FD = v === "se" ? 0.0028 : 0.0034;
scene.fog = new THREE.FogExp2(FOG, FD);
const cam = new THREE.PerspectiveCamera(v === "se" ? 40 : 45, W / H, 0.5, 6000);
skyGradient(scene, v === "se"
  ? [[-0.05, "#1a1838"], [0.05, "#221f48"], [0.25, "#120f2c"], [0.6, "#06060f"]]
  : [[-0.05, "#16203A"], [0.06, "#1b2a44"], [0.3, "#0d1628"], [0.7, "#050912"]], 5000);
stars(scene, { n: 700, r: 4000, size: 1.1, seed: 12, opacity: 0.5, spread: [1, 0.6] });
scene.add(new THREE.HemisphereLight("#2a3d66", "#07080f", 0.5));
{ const es = new THREE.Scene(); es.add(new THREE.Mesh(new THREE.SphereGeometry(20, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, vertexShader: `varying vec3 vP; void main(){ vP=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`, fragmentShader: `varying vec3 vP; void main(){ vec3 c=mix(vec3(.02,.03,.06),vec3(.18,.22,.4),smoothstep(-.3,.5,vP.y)); c+=vec3(.5,.35,1.)*pow(max(dot(vP,vec3(0.,0.,1.)),0.),5.)*1.4; c+=vec3(.2,.6,.7)*pow(max(dot(vP,vec3(1.,0.,0.)),0.),3.)*.5; gl_FragColor=vec4(c,1.); }` })));
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(es, 0.04).texture; scene.environmentIntensity = 1.4; }

const R = rng(v === "se" ? 31 : 17);
const winMat = windowMaterial({ seed: 7, fog: FOG, density: FD, base: "#0a0e1b", warm: "#ffe2b8", cool: "#9fe8ff", lit: 0.2, rowH: 4.2, colW: 3.4, k: 0.85, win: [0.12, 0.88, 0.46, 0.6] });
const boxes = [];
function tower(x, z, w, d, h) { boxes.push([x, h / 2, z, w, h, d]); if (h > 90 && R() < 0.6) { const w2 = w * (0.55 + R() * 0.25), d2 = d * (0.55 + R() * 0.25), h2 = h * (0.15 + R() * 0.3); boxes.push([x, h + h2 / 2, z, w2, h2, d2]); } }
const neonCols = ["#E1A565", "#E374BC", "#61E2EB", "#FF5FD2", "#78D8EF", "#BDAEE9", "#FFB45A"];
const signs = [];

if (v === "se") {
  // rooftop: skyline all around, lower near the camera
  for (let i = 0; i < 520; i++) {
    const a = R() * Math.PI * 2, rr = 120 + Math.pow(R(), 0.7) * 1400;
    const x = Math.cos(a) * rr, z = -Math.abs(Math.sin(a) * rr) - 40;
    tower(x, z, 18 + R() * 40, 18 + R() * 40, 30 + Math.pow(R(), 1.8) * (rr < 400 ? 220 : 160));
  }
} else {
  for (const side of [-1, 1]) {
    for (let z = 40; z > -1600; z -= 26 + R() * 34) {
      const fx = v === "hub" ? 78 : 34; tower(side * (fx + R() * 16), z, 22 + R() * 18, 22 + R() * 20, 40 + Math.pow(R(), 1.3) * (z > -300 ? (v === "hub" ? 80 : 110) : 230));
      if (R() < 0.8) tower(side * ((v === "hub" ? 125 : 85) + R() * 60), z - R() * 20, 26 + R() * 30, 26 + R() * 30, 60 + Math.pow(R(), 1.2) * (z > -400 && v === "hub" ? 120 : 300));
      if (R() < 0.7) tower(side * (180 + R() * 200), z - R() * 30, 30 + R() * 40, 30 + R() * 40, 80 + Math.pow(R(), 1.2) * 340);
      // neon signs on the avenue-facing facade
      if (R() < 0.55) { const w = 6 + R() * 14, h = 2.5 + R() * 6; signs.push({ x: side * ((v === "hub" ? 78 : 34) - 11 - 0.6), y: 30 + R() * 140, z: z + (R() - 0.5) * 10, w, h, rotY: side * Math.PI / 2 * -1, c: neonCols[Math.floor(R() * neonCols.length)] }); }
      if (R() < 0.25) { signs.push({ x: side * ((v === "hub" ? 78 : 34) - 11 - 0.6), y: 40 + R() * 120, z: z + (R() - 0.5) * 10, w: 1.4, h: 18 + R() * 30, rotY: side * Math.PI / 2 * -1, c: neonCols[Math.floor(R() * neonCols.length)] }); }
    }
  }
}
{
  const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), winMat, boxes.length); const m = new THREE.Matrix4();
  boxes.forEach(([x, y, z, w, h, d], i) => { m.compose(new THREE.Vector3(x, y, z), new THREE.Quaternion(), new THREE.Vector3(w, h, d)); im.setMatrixAt(i, m); });
  scene.add(im);
  // cyan / pink edge strips on some towers + red roof beacons
  const strips = new THREE.Group();
  boxes.forEach(([x, y, z, w, h, d]) => {
    if (R() < 0.14) { const c = new THREE.Color(R() < 0.6 ? "#61E2EB" : "#E374BC").multiplyScalar(2.2); const s = new THREE.Mesh(new THREE.BoxGeometry(0.5, h * 0.9, 0.5), new THREE.MeshBasicMaterial({ color: c, toneMapped: false })); s.position.set(x + (x > 0 ? -w / 2 : w / 2), y, z + d / 2); strips.add(s); }
    if (h > 120 && R() < 0.5) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color("#ff3b3b").multiplyScalar(3), toneMapped: false })); b.position.set(x, y + h / 2 + 3, z); strips.add(b); const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 6), new THREE.MeshStandardMaterial({ color: "#222" })); ant.position.set(x, y + h / 2 + 1.5, z); strips.add(ant); }
  });
  scene.add(strips);
}
// neon signs + billboards (abstract — no lettering, per the no-garbled-text rule)
function billboardTex(seed, c1, c2) {
  const c = document.createElement("canvas"); c.width = 256; c.height = 128; const x = c.getContext("2d"); const r = rng(seed);
  const g = x.createLinearGradient(0, 0, 256, 128); g.addColorStop(0, c1); g.addColorStop(1, c2); x.fillStyle = g; x.fillRect(0, 0, 256, 128);
  x.globalAlpha = 0.5; for (let i = 0; i < 6; i++) { x.fillStyle = r() < 0.5 ? "#ffffff" : "#000000"; x.beginPath(); x.arc(r() * 256, r() * 128, 10 + r() * 40, 0, Math.PI * 2); x.fill(); }
  x.globalAlpha = 0.25; for (let y = 0; y < 128; y += 3) { x.fillStyle = "#000"; x.fillRect(0, y, 256, 1); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
signs.forEach((s, i) => {
  const big = s.w > 14 && s.h > 6;
  const mat = big ? new THREE.MeshBasicMaterial({ map: billboardTex(i, s.c, "#1a1040"), toneMapped: false, color: new THREE.Color(1.6, 1.6, 1.6) }) : new THREE.MeshBasicMaterial({ color: new THREE.Color(s.c).multiplyScalar(2.4), toneMapped: false });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(s.w, s.h), mat); m.position.set(s.x, s.y, s.z); m.rotation.y = s.x < 0 ? Math.PI / 2 : -Math.PI / 2; scene.add(m);
  if (!big) { const fr = new THREE.Mesh(new THREE.PlaneGeometry(s.w + 0.8, s.h + 0.8), new THREE.MeshBasicMaterial({ color: "#05060c" })); fr.position.copy(m.position); fr.position.x += s.x < 0 ? -0.05 : 0.05; fr.rotation.y = m.rotation.y; scene.add(fr); }
});

if (v !== "se") {
  // elevated highway + traffic light trails down the avenue
  const hw = new THREE.Mesh(new THREE.BoxGeometry(18, 2, 1800), new THREE.MeshStandardMaterial({ color: "#0c0f1c", roughness: 0.6, metalness: 0.4 })); hw.position.set(0, 18, -800); scene.add(hw);
  for (const sx of [-8.6, 8.6]) { const e = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 1800), new THREE.MeshBasicMaterial({ color: new THREE.Color("#61E2EB").multiplyScalar(1.8), toneMapped: false })); e.position.set(sx, 19.2, -800); scene.add(e); }
  for (let i = 0; i < 90; i++) { const lane = (R() < 0.5 ? -1 : 1) * (2 + R() * 4.5); const col = lane < 0 ? "#ff4a5a" : "#fff1d6"; const t = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 8 + R() * 30), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(2.5), toneMapped: false })); t.position.set(lane, 19.4, -R() * 1600); scene.add(t); }
  // arch gates over the highway
  for (let z = -120; z > -1500; z -= 160) { const g = new THREE.Mesh(new THREE.TorusGeometry(12, 0.35, 6, 40, Math.PI), new THREE.MeshBasicMaterial({ color: new THREE.Color("#61E2EB").multiplyScalar(1.6), toneMapped: false })); g.position.set(0, 19, z); scene.add(g); }
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), new THREE.MeshStandardMaterial({ color: "#05070d", roughness: 0.9 })); ground.rotation.x = -Math.PI / 2; scene.add(ground);
  // drones / sky traffic
  for (let i = 0; i < 40; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.5, 6, 4), new THREE.MeshBasicMaterial({ color: new THREE.Color(R() < 0.5 ? "#78D8EF" : "#E374BC").multiplyScalar(3), toneMapped: false })); d.position.set((R() - 0.5) * 80, 90 + R() * 160, -100 - R() * 900); scene.add(d); }
}

let PC, PR;
if (v === "hub") {
  cam.position.set(0, 150, 60); cam.lookAt(0, 118, -400);
  PC = new THREE.Vector3(0, 128, -230); PR = 50;
} else if (v === "warp") {
  cam.position.set(0, 120, 40); cam.lookAt(0, 105, -400);
} else {
  // rooftop platform with glossy tiles
  const roofY = 80; cam.position.set(0, roofY + 2.4, 9); cam.lookAt(0, roofY + 7.4, -60);
  const mirror = new Reflector(new THREE.PlaneGeometry(60, 60), { textureWidth: W, textureHeight: H, color: 0x17161f });
  mirror.rotation.x = -Math.PI / 2; mirror.position.set(0, roofY - 0.01, -10); scene.add(mirror);
  const tg = new RoundedBoxGeometry(2.9, 0.2, 2.9, 2, 0.04);
  const tm = new THREE.MeshStandardMaterial({ color: "#0b0b17", metalness: 0.6, roughness: 0.3, transparent: true, opacity: 0.86 });
  for (let ix = -4; ix <= 4; ix++) for (let iz = -9; iz <= 2; iz++) { const t = new THREE.Mesh(tg, tm); t.position.set(ix * 3, roofY - 0.1 + (R() - 0.5) * 0.03, iz * 3); scene.add(t); }
  const base = new THREE.Mesh(new THREE.BoxGeometry(27, 6, 36), new THREE.MeshStandardMaterial({ color: "#090912", roughness: 0.7 })); base.position.set(0, roofY - 3.2, -12); scene.add(base);
  PC = new THREE.Vector3(0, roofY + 6.4, -24); PR = 5.3;
  const glowBase = new THREE.PointLight("#5fd8ff", 30, 0, 2); glowBase.position.set(0, roofY + 0.6, -21); scene.add(glowBase);
}
if (PC) {
  const ring = mechRing({ R1: 1.0, R2: 1.3, depth: 0.4, segs: 24, slit: v === "se" ? "#61E2EB" : "#8f6dff", seed: 5, slitK: 1.0, slitP: 0.45, metal: "#232738" }); ring.scale.setScalar(PR); ring.position.copy(PC); scene.add(ring);
  const mem = new THREE.Mesh(new THREE.PlaneGeometry(2 * PR, 2 * PR), portalMaterial(v === "hub" ? { mode: 2, twist: 1.2, fil: 0.9, rim: 1.6, seed: 4.1 } : { mode: 3, twist: 0.8, fil: 1.0, rim: 1.5, seed: 6.2, alphaIn: 0.38 }));
  mem.position.copy(PC); mem.position.z += 0.05; mem.renderOrder = 5; scene.add(mem);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(4 * PR, 4 * PR), glowMaterial("#8f6dff", { inner: 1.0, tight: 0.035, wide: 0.22, k1: 0.45, k2: 0.08 })); glow.position.copy(PC); glow.position.z -= 0.1; glow.renderOrder = 4; scene.add(glow);
  const pl = new THREE.PointLight("#9a78ff", v === "se" ? 160 : 4000, 0, 2); pl.position.copy(PC).add(new THREE.Vector3(0, 0, 4)); scene.add(pl);
}
renderWithBloom(renderer, scene, cam, { strength: 0.6, radius: 0.35, threshold: 0.8 });
