// CH05 Home vista (KF22): violet fantasy city at dusk seen from the cliff — distant cathedral spire + beam, moon, clouds, floating islands, waterfall.
import * as THREE from "three";
import { q, W, H, makeRenderer, renderWithBloom, NOISE, rng, windowMaterial, skyGradient } from "./lib.js";

const day = q.get("day") === "1";
const renderer = makeRenderer(false);
const scene = new THREE.Scene();
const FOG = day ? "#c3d3ee" : "#4f5aa8";
const FD = day ? 0.00045 : 0.00058;
scene.fog = new THREE.FogExp2(FOG, FD);
const cam = new THREE.PerspectiveCamera(38, W / H, 1, 9000);
cam.position.set(+(q.get("cx") ?? 0), +(q.get("cy") ?? 330), 520);
cam.lookAt(+(q.get("tx") ?? -330), +(q.get("ty") ?? 170), -1300);

skyGradient(scene, day
  ? [[-0.05, "#cdd8ec"], [0.04, "#bcd0f0"], [0.25, "#93b6ea"], [0.65, "#6f98e0"]]
  : [[-0.05, "#4f5aa8"], [0.03, "#6a84cc"], [0.17, "#30478f"], [0.45, "#0f1538"]], 8000);
{ const g = new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000), new THREE.MeshStandardMaterial({ color: day ? "#9aa6b8" : "#080a1e", roughness: 1 })); g.rotation.x = -Math.PI / 2; scene.add(g); }

if (!day) {
  const moon = new THREE.Mesh(new THREE.SphereGeometry(260, 64, 48), new THREE.MeshStandardMaterial({ color: "#c4d2f4", emissive: "#6577b8", emissiveIntensity: 0.75, roughness: 1 }));
  moon.position.set(980, 760, -3600); moon.material.fog = false; scene.add(moon);
  const ml = new THREE.DirectionalLight("#e4ecff", 2.4); ml.position.copy(moon.position).add(new THREE.Vector3(-300, 90, 300)); ml.target = moon; scene.add(ml);
}
scene.add(new THREE.HemisphereLight(day ? "#e6efff" : "#8eaae6", day ? "#6d7a8f" : "#1a1534", day ? 1.5 : 0.45));
const sun = new THREE.DirectionalLight(day ? "#fff6e8" : "#b8c6ff", day ? 2.2 : 0.9); sun.position.set(600, 800, -900); scene.add(sun);

function stripTex(seed, cols = ["#9c7cff", "#7fb2ff", "#c9b8ff"]) {
  const c = document.createElement("canvas"); c.width = 256; c.height = 512; const x = c.getContext("2d");
  x.fillStyle = "#000"; x.fillRect(0, 0, 256, 512); const r = rng(seed);
  for (let i = 0; i < 26; i++) { const px = Math.floor(r() * 32) * 8; x.fillStyle = cols[Math.floor(r() * cols.length)]; x.globalAlpha = 0.5 + r() * 0.5; x.fillRect(px, 0, 2, 512); }
  for (let y = 0; y < 512; y += 10) for (let px = 0; px < 256; px += 8) if (r() < 0.16) { x.globalAlpha = 0.6 + r() * 0.4; x.fillStyle = cols[Math.floor(r() * cols.length)]; x.fillRect(px + 2, y + 2, 4, 5); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
const towerMat = (seed, k = 1.6) => { const t = stripTex(seed); t.repeat.set(3, 2); return new THREE.MeshStandardMaterial({ color: day ? "#e8eef8" : "#1c2250", roughness: 0.45, metalness: 0.4, emissive: day ? "#000000" : "#ffffff", emissiveMap: t, emissiveIntensity: day ? 0 : k }); };

// spire: stacked tiers + flanking needles (castle silhouette)
const SP = new THREE.Vector3(60, 0, -1350), SS = 1.55;
const spire = new THREE.Group(); spire.position.copy(SP); spire.scale.setScalar(SS); scene.add(spire);
const tiers = [[34, 46, 60], [26, 32, 70], [19, 24, 70], [13, 17, 60], [8.5, 11, 55], [5, 7, 45], [2.6, 4, 40]];
let y = 0;
tiers.forEach(([rt, rb, h], i) => {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 8, 1), towerMat(10 + i, 1.4 + i * 0.25)); m.position.y = y + h / 2; spire.add(m);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(rt + 1.2, 0.7, 6, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(day ? "#ffffff" : "#b18cff").multiplyScalar(day ? 0.9 : 2.2), toneMapped: false })); ring.rotation.x = Math.PI / 2; ring.position.y = y + h; spire.add(ring);
  y += h;
});
const tip = new THREE.Mesh(new THREE.ConeGeometry(2.6, 70, 8), towerMat(31, 2.5)); tip.position.y = y + 35; spire.add(tip); y += 70;
const needles = [[-42, 0, 8, 190], [44, 6, 8, 175], [-24, -30, 6, 150], [26, -28, 6, 140], [-64, 14, 7, 120], [66, 18, 7, 115], [0, 40, 9, 130], [-86, 30, 6, 95], [88, 34, 6, 92], [-110, 50, 7, 80], [112, 54, 7, 76], [-30, 70, 8, 90], [36, 72, 8, 86], [-140, 80, 9, 60], [140, 86, 9, 58]];
needles.forEach(([nx, nz, r, h], i) => {
  const g = new THREE.Group(); g.position.set(nx, 0, nz);
  const b = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.75, r, h * 0.82, 8), towerMat(40 + i)); b.position.y = h * 0.41; g.add(b);
  const c = new THREE.Mesh(new THREE.ConeGeometry(r * 0.8, h * 0.32, 8), towerMat(60 + i, 2.2)); c.position.y = h * 0.82 + h * 0.16; g.add(c);
  spire.add(g);
});
{
  const bm = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    uniforms: { uC: { value: new THREE.Color(day ? "#ffffff" : "#bfe2ff") } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `varying vec2 vUv; uniform vec3 uC; void main(){ float x=abs(vUv.x-.5)*2.; float core=exp(-x*x/.02)*2.5+exp(-x*x/.25)*.35; float fade=smoothstep(1.,.0,vUv.y)*.9+.1; gl_FragColor=vec4(uC*core*fade,1.); }` });
  const beam = new THREE.Mesh(new THREE.PlaneGeometry(16, 3000), bm); beam.position.set(SP.x, y * SS + 1500, SP.z); scene.add(beam);
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `varying vec2 vUv; void main(){ float r=length(vUv-.5)*2.; gl_FragColor=vec4(vec3(.75,.85,1.)*exp(-r*r/.05)*1.4,1.); }` }));
  halo.position.set(SP.x, y * SS - 15, SP.z + 4); scene.add(halo);
}

// city: instanced towers, denser + taller toward the spire
{
  const r = rng(5), N = 4200, im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), windowMaterial({ seed: 3, fog: FOG, density: FD, base: day ? "#d5dcea" : "#0d1030", warm: day ? "#ffffff" : "#b9a0ff", cool: day ? "#eef4ff" : "#8fd0ff", lit: day ? 0.0 : 0.4, rowH: 3.0, colW: 2.6 }), N);
  const m = new THREE.Matrix4(); let k = 0;
  for (let i = 0; i < N * 4 && k < N; i++) {
    const z = -80 - Math.pow(r(), 1.25) * 2700; const x = -200 + (r() - 0.5) * (900 + (-z) * 1.8);
    const d = Math.hypot(x - SP.x, z - SP.z);
    if (d < 170) continue;
    const near = Math.max(0, 1 - d / 900);
    const fg = Math.max(0, 1 + z / 700); const h = 12 + Math.pow(r(), 2.0) * (40 + near * 110 + fg * 70);
    const w = 10 + r() * 22, dd = 10 + r() * 22;
    m.compose(new THREE.Vector3(x, h / 2, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, r() * 0.8, 0)), new THREE.Vector3(w, h, dd));
    im.setMatrixAt(k++, m);
  }
  im.count = k; scene.add(im);
  const cr = rng(9);
  for (let i = 0; i < 70; i++) {
    const x = -300 + (cr() - 0.5) * 2400, z = -700 - cr() * 1900; const d = Math.hypot(x - SP.x, z - SP.z); if (d < 190) continue;
    const near = Math.max(0, 1 - d / 900);
    const h = 40 + cr() * (60 + near * 120), rr = 4 + cr() * 6;
    const g = new THREE.Group(); g.position.set(x, 0, z);
    const b = new THREE.Mesh(new THREE.CylinderGeometry(rr * 0.8, rr, h, 6), towerMat(100 + i, 1.4)); b.position.y = h / 2; g.add(b);
    const c = new THREE.Mesh(new THREE.ConeGeometry(rr * 0.9, h * 0.3, 6), towerMat(300 + i, 2.0)); c.position.y = h + h * 0.15; g.add(c);
    scene.add(g);
  }
}

function cloudMat(seed, top, bot, op = 0.9, sc = [2.2, 1.2]) {
  return new THREE.ShaderMaterial({ transparent: true, depthWrite: false, fog: false,
    uniforms: { uSeed: { value: seed }, uTop: { value: new THREE.Color(top) }, uBot: { value: new THREE.Color(bot) }, uOp: { value: op }, uSc: { value: new THREE.Vector2(...sc) } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: NOISE + `varying vec2 vUv; uniform float uSeed,uOp; uniform vec3 uTop,uBot; uniform vec2 uSc;
void main(){ vec2 uv=vUv; vec2 w=vec2(fbm(uv*2.+uSeed),fbm(uv*2.+uSeed+4.3)); float n=fbm(uv*uSc+w*1.4+uSeed);
  float n2=fbm(uv*uSc*2.6+w*1.8+uSeed*.7);
  float shape=smoothstep(0.,.25,uv.x)*smoothstep(1.,.75,uv.x)*smoothstep(0.,.35,uv.y)*smoothstep(1.,.55,uv.y);
  float a=smoothstep(.38,.75,n*.8+n2*.35)*shape*uOp;
  vec3 c=mix(uBot,uTop,clamp(uv.y*1.2+n2*.5-.2,0.,1.));
  gl_FragColor=vec4(c,a); }` });
}
const ct = day ? "#ffffff" : "#b4bdf0", cb = day ? "#c9d4ea" : "#4a5092";
[
  [700, 900, -3300, 2600, 700, 1.3, 0.95], [-900, 820, -3400, 2600, 600, 2.4, 0.8], [250, 620, -2700, 2000, 420, 3.7, 0.75],
  [1300, 700, -3000, 1800, 520, 4.6, 0.9], [-300, 70, -1900, 3400, 220, 5.8, 0.7], [300, 45, -1100, 3000, 180, 6.9, 0.55],
  [-700, 60, -900, 2000, 160, 7.7, 0.5], [900, 380, -2300, 1600, 380, 8.8, 0.8], [1600, 1050, -3700, 2000, 560, 9.9, 0.9],
  [-150, 20, -650, 2400, 120, 11.1, 0.45], [500, 140, -1600, 1400, 220, 12.6, 0.6],
  [-1200, 60, -2900, 4200, 320, 13.3, 0.95], [1400, 60, -2900, 4200, 320, 14.4, 0.95], [0, 30, -2500, 3600, 220, 15.5, 0.9],
].forEach(([x, yy, z, w, h, s, o]) => { const c = new THREE.Mesh(new THREE.PlaneGeometry(w, h), cloudMat(s, ct, cb, o)); c.position.set(x, yy, z); c.lookAt(cam.position.x, yy, cam.position.z); scene.add(c); });

// floating islands: displaced rock with a flat top and small towers
const rock = new THREE.MeshStandardMaterial({ color: day ? "#8c8f9c" : "#151630", roughness: 0.95, flatShading: true });
const grass = new THREE.MeshStandardMaterial({ color: day ? "#7fae6a" : "#2c3266", roughness: 0.9, flatShading: true });
function island(r, seed) {
  const g = new THREE.IcosahedronGeometry(r, 3); const p = g.attributes.position; const rr = rng(seed); const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const n = 0.75 + rr() * 0.35; if (v.y > 0) v.y *= 0.12; else v.y *= 1.6 * n; v.x *= n; v.z *= n; p.setXYZ(i, v.x, v.y, v.z); }
  g.computeVertexNormals(); return g;
}
[[-380, 470, -1700, 46, 3], [430, 600, -2000, 40, 3], [-640, 360, -1500, 28, 2], [700, 400, -1650, 26, 2], [960, 700, -2500, 34, 3]].forEach(([x, yy, z, r, nt], i) => {
  const g = new THREE.Group(); g.position.set(x, yy, z);
  g.add(new THREE.Mesh(island(r, 40 + i), rock));
  const top = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.85, r * 0.9, 4, 9), grass); top.position.y = r * 0.1; g.add(top);
  const tr = rng(300 + i);
  for (let t = 0; t < nt; t++) { const h = r * (0.4 + tr() * 0.9); const px = (tr() - 0.5) * r, pz = (tr() - 0.5) * r * 0.6; const tw = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.06, r * 0.09, h, 6), towerMat(400 + i * 5 + t, 2)); tw.position.set(px, h / 2 + r * 0.1, pz); g.add(tw); const c = new THREE.Mesh(new THREE.ConeGeometry(r * 0.08, h * 0.4, 6), towerMat(500 + t, 2.2)); c.position.set(px, h + h * 0.2 + r * 0.1, pz); g.add(c); }
  scene.add(g);
});
renderWithBloom(renderer, scene, cam, { strength: day ? 0.2 : 0.38, radius: 0.35, threshold: 0.85 });
