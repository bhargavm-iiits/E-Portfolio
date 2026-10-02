// CH02 World Entry plate (KF08): head-on plasma portal inside a thick segmented mechanical torus, spiral into a white core + inner ring, rocky ground with ruined towers in fog.
import * as THREE from "three";
import { q, W, H, makeRenderer, renderWithBloom, portalMaterial, glowMaterial, mechRing, fogMaterial, rng, stars, skyGradient } from "./lib.js";

const renderer = makeRenderer(false);
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2("#1c1d4a", 0.022);
const cam = new THREE.PerspectiveCamera(40, W / H, 0.1, 2000);
cam.position.set(0, 2.2, 14); cam.lookAt(0, 3.6, 0);
skyGradient(scene, [[-0.1, "#26265e"], [0.05, "#232458"], [0.3, "#121238"], [0.7, "#07081c"]], 1500);
stars(scene, { n: 1200, r: 900, size: 1.2, seed: 5, opacity: 0.6 });
{ const es = new THREE.Scene(); es.add(new THREE.Mesh(new THREE.SphereGeometry(20, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, vertexShader: `varying vec3 vP; void main(){ vP=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`, fragmentShader: `varying vec3 vP; void main(){ vec3 c=mix(vec3(.03,.03,.08),vec3(.2,.18,.5),smoothstep(-.3,.6,vP.y)); c+=vec3(.7,.5,1.3)*pow(max(dot(vP,vec3(0.,0.,-1.)),0.),4.)*1.5; gl_FragColor=vec4(c,1.); }` })));
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(es, 0.04).texture; scene.environmentIntensity = 1.2; }
scene.add(new THREE.HemisphereLight("#5c5ab0", "#08081a", 0.5));

const PC = new THREE.Vector3(0, 4.3, 0), PR = 3.45;
const ring = mechRing({ R1: 1.0, R2: 1.36, depth: 0.5, segs: 24, slit: "#61E2EB", seed: 9, slitK: 1.4, slitP: 0.7, metal: "#20233a" }); ring.scale.setScalar(PR); ring.position.copy(PC); scene.add(ring);
const outer = mechRing({ R1: 1.4, R2: 1.5, depth: 0.3, segs: 36, slit: "#9a7cff", seed: 3, slitK: 1.0, slitP: 0.3, metal: "#171a2c" }); outer.scale.setScalar(PR); outer.position.copy(PC); outer.position.z -= 0.6; scene.add(outer);
const mem = new THREE.Mesh(new THREE.PlaneGeometry(2 * PR, 2 * PR), portalMaterial({ mode: 1, twist: 6.0, fil: 1.3, rim: 1.7, core: 1.5, sigma: 0.13, seed: 3.3, gain: 1.1 })); mem.position.copy(PC); mem.position.z += 0.1; mem.renderOrder = 5; scene.add(mem);
const glow = new THREE.Mesh(new THREE.PlaneGeometry(4 * PR, 4 * PR), glowMaterial("#8f6dff", { inner: 1.0, tight: 0.04, wide: 0.3, k1: 0.5, k2: 0.1 })); glow.position.copy(PC); glow.position.z += 0.05; glow.renderOrder = 4; scene.add(glow);
// anamorphic horizontal flare through the core
{ const f = new THREE.Mesh(new THREE.PlaneGeometry(40, 1.2), new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `varying vec2 vUv; void main(){ float y=abs(vUv.y-.5)*2.; float x=abs(vUv.x-.5)*2.; float g=exp(-y*y/.004)*exp(-x*x/.08)*1.6 + exp(-y*y/.02)*exp(-x*x/.6)*.35; gl_FragColor=vec4(vec3(.85,.78,1.)*g,1.); }` })); f.position.copy(PC); f.position.z += 0.2; f.renderOrder = 6; scene.add(f); }
const pl = new THREE.PointLight("#9a78ff", 220, 0, 2); pl.position.copy(PC).add(new THREE.Vector3(0, 0, 2)); scene.add(pl);
const pl2 = new THREE.PointLight("#b9a0ff", 60, 0, 2); pl2.position.set(0, 0.6, 3); scene.add(pl2);

// rocky ground: displaced plane + scattered boulders
{
  const g = new THREE.PlaneGeometry(120, 80, 240, 160); g.rotateX(-Math.PI / 2); const p = g.attributes.position; const r = rng(3);
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); const n = Math.sin(x * 0.7 + z * 0.3) * 0.15 + Math.sin(x * 1.9 - z * 1.3) * 0.08 + (r() - 0.5) * 0.12; const crater = Math.abs(x) < 4 && z > -3 && z < 6 ? -0.15 : 0; p.setY(i, n + crater + Math.max(0, (Math.abs(x) - 8) * 0.06)); }
  g.computeVertexNormals();
  scene.add(new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: "#1a1934", roughness: 0.55, metalness: 0.35, flatShading: true })));
  const rockM = new THREE.MeshStandardMaterial({ color: "#16152c", roughness: 0.8, flatShading: true });
  for (let i = 0; i < 90; i++) { const s = 0.15 + Math.pow(r(), 2) * 0.9; const m = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), rockM); const x = (r() - 0.5) * 30; if (Math.abs(x) < 2.5) continue; m.position.set(x, s * 0.3, 8 - r() * 22); m.rotation.set(r() * 3, r() * 3, r() * 3); m.scale.y = 0.6; scene.add(m); }
}
// ruined towers left and right, silhouetted in fog
{
  const r = rng(7); const tm = new THREE.MeshStandardMaterial({ color: "#121226", roughness: 0.9, metalness: 0.2 });
  for (const side of [-1, 1]) for (let i = 0; i < 14; i++) {
    const x = side * (9 + r() * 22), z = -4 - r() * 30, w = 1.2 + r() * 3, h = 2 + r() * 9;
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, w * (0.6 + r() * 0.6)), tm); m.position.set(x, h / 2 - 0.2, z); m.rotation.set(0, r(), (r() - 0.5) * 0.12); scene.add(m);
    if (r() < 0.5) { const b = new THREE.Mesh(new THREE.BoxGeometry(w * 0.5, h * 0.3, w * 0.5), tm); b.position.set(x + (r() - 0.5) * w, h + h * 0.1, z); b.rotation.z = (r() - 0.5) * 0.6; scene.add(b); }
    if (r() < 0.35) { const wl = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.4, 0.05), new THREE.MeshBasicMaterial({ color: new THREE.Color("#78D8EF").multiplyScalar(1.6), toneMapped: false })); wl.position.set(x - side * w * 0.3, h * (0.3 + r() * 0.5), z + w * 0.5); scene.add(wl); }
  }
}
// fog banks at the ground
[[-9, 1.0, 2, 14, 3.5, 2.2, [0.9, 0.5]], [9, 1.0, 2, 14, 3.5, 3.9, [0.1, 0.5]], [-12, 1.6, -8, 18, 5, 5.1, [0.9, 0.5]], [12, 1.6, -8, 18, 5, 6.6, [0.1, 0.5]], [0, 0.4, 5, 26, 1.8, 8.3, [0.5, 0.9]]].forEach(([x, y, z, w, h, s, lp]) => {
  const f = new THREE.Mesh(new THREE.PlaneGeometry(w, h), fogMaterial({ seed: s, litPos: lp, opacity: 0.85, shadow: "#1a1b40", lit: "#6d68a8" })); f.position.set(x, y, z); f.renderOrder = 7; scene.add(f);
});
renderWithBloom(renderer, scene, cam, { strength: 0.65, radius: 0.4, threshold: 0.78 });
