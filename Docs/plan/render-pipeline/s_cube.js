// Floating cube sprites (spec BG04): dark glossy w/ violet edges (Home), violet glass (Menu/Finale/Log), blue iso menu cube (CH07).
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { q, W, H, makeRenderer, renderPlain } from "./lib.js";

const kind = q.get("kind") || "dark";
const renderer = makeRenderer(true);
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(22, W / H, 0.1, 100);
cam.position.set(0, 0, 9.0); cam.lookAt(0, 0, 0);

// environment: violet/blue gradient room so glossy faces pick up the world colours
{
  const es = new THREE.Scene();
  const sky = new THREE.Mesh(new THREE.SphereGeometry(20, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, vertexShader: `varying vec3 vP; void main(){ vP=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`, fragmentShader: `varying vec3 vP; void main(){ float y=vP.y; vec3 top=vec3(.25,.33,.9); vec3 mid=vec3(.20,.12,.45); vec3 bot=vec3(.02,.02,.05); vec3 c=mix(bot,mid,smoothstep(-.4,.1,y)); c=mix(c,top,smoothstep(.1,.9,y)); c+=vec3(.8,.6,1.4)*pow(max(dot(vP,normalize(vec3(.6,.4,.7))),0.),24.)*2.; gl_FragColor=vec4(c,1.); }` }));
  es.add(sky);
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(es, 0.03).texture;
}
const rx = +(q.get("rx") ?? 25), ry = +(q.get("ry") ?? 35), rz = +(q.get("rz") ?? 10);
const grp = new THREE.Group(); grp.rotation.set(THREE.MathUtils.degToRad(rx), THREE.MathUtils.degToRad(ry), THREE.MathUtils.degToRad(rz)); scene.add(grp);
const S = 1.6;

function edgeBars(color, mult, thick) {
  const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(mult), toneMapped: false, transparent: true, opacity: 0.95 });
  const h = S / 2 + 0.002, L = S * 0.97;
  for (const a of [-1, 1]) for (const b of [-1, 1]) {
    const x = new THREE.Mesh(new THREE.BoxGeometry(L, thick, thick), m); x.position.set(0, a * h, b * h); grp.add(x);
    const y = new THREE.Mesh(new THREE.BoxGeometry(thick, L, thick), m); y.position.set(a * h, 0, b * h); grp.add(y);
    const z = new THREE.Mesh(new THREE.BoxGeometry(thick, thick, L), m); z.position.set(a * h, b * h, 0); grp.add(z);
  }
}

if (kind === "dark") {
  scene.environmentIntensity = 0.9;
  const mat = new THREE.MeshPhysicalMaterial({ color: "#0b0c1a", metalness: 0.55, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08 });
  grp.add(new THREE.Mesh(new RoundedBoxGeometry(S, S, S, 4, 0.05), mat));
  // inset panel on each face (darker) for the "tech crate" read in KF22
  const pm = new THREE.MeshPhysicalMaterial({ color: "#07070f", metalness: 0.7, roughness: 0.35, clearcoat: 1 });
  for (const [ax, sg] of [["x", 1], ["x", -1], ["y", 1], ["y", -1], ["z", 1], ["z", -1]]) {
    const p = new THREE.Mesh(new RoundedBoxGeometry(S * 0.72, S * 0.72, 0.04, 2, 0.015), pm);
    const v = S / 2 + 0.005;
    if (ax === "x") { p.rotation.y = Math.PI / 2; p.position.x = sg * v; } else if (ax === "y") { p.rotation.x = Math.PI / 2; p.position.y = sg * v; } else p.position.z = sg * v;
    grp.add(p);
  }
  edgeBars("#8a5cff", 2.4, 0.022);
  const k = new THREE.DirectionalLight("#9fb2ff", 1.2); k.position.set(3, 4, 2); scene.add(k);
  const r = new THREE.DirectionalLight("#b07cff", 2.5); r.position.set(-3, 1, -2); scene.add(r);
} else if (kind === "glass") {
  scene.environmentIntensity = 1.2;
  const mat = new THREE.MeshPhysicalMaterial({ color: "#7d6cf0", metalness: 0.0, roughness: 0.18, transparent: true, opacity: 0.5, clearcoat: 1, clearcoatRoughness: 0.1, sheen: 0.4, sheenColor: new THREE.Color("#b9a8ff"), side: THREE.DoubleSide, depthWrite: false });
  grp.add(new THREE.Mesh(new RoundedBoxGeometry(S, S, S, 4, 0.06), mat));
  edgeBars("#c3b6ff", 0.9, 0.012);
  const k = new THREE.DirectionalLight("#c7d2ff", 1.6); k.position.set(2, 4, 3); scene.add(k);
  scene.add(new THREE.AmbientLight("#5040a0", 0.6));
} else if (kind === "menu") {
  scene.environmentIntensity = 0.55;
  grp.rotation.set(THREE.MathUtils.degToRad(35.264), THREE.MathUtils.degToRad(45), 0);
  const faces = [
    new THREE.MeshPhysicalMaterial({ color: "#3d8dff", emissive: "#2a6dff", emissiveIntensity: 0.9, roughness: 0.15, transparent: true, opacity: 0.92, clearcoat: 1 }),
    new THREE.MeshPhysicalMaterial({ color: "#3d8dff", emissive: "#2a6dff", emissiveIntensity: 0.9, roughness: 0.15, transparent: true, opacity: 0.92, clearcoat: 1 }),
    new THREE.MeshPhysicalMaterial({ color: "#5fb0ff", emissive: "#3f9bff", emissiveIntensity: 0.85, roughness: 0.12, transparent: true, opacity: 0.95, clearcoat: 1 }),
    new THREE.MeshPhysicalMaterial({ color: "#1d4fb8", emissive: "#123a9a", emissiveIntensity: 0.6, roughness: 0.2 }),
    new THREE.MeshPhysicalMaterial({ color: "#5aa6ff", emissive: "#3f8cff", emissiveIntensity: 1.0, roughness: 0.15, transparent: true, opacity: 0.92, clearcoat: 1 }),
    new THREE.MeshPhysicalMaterial({ color: "#2a64d8", emissive: "#1d55c8", emissiveIntensity: 0.8, roughness: 0.2 }),
  ];
  grp.add(new THREE.Mesh(new THREE.BoxGeometry(S, S, S), faces));
  edgeBars("#bfe9ff", 1.6, 0.03);
  const k = new THREE.DirectionalLight("#ffffff", 1.2); k.position.set(1, 4, 3); scene.add(k);
}
renderPlain(renderer, scene, cam);
