// Transparent prop sprites: Home ring frame, cliff ledge, standalone mechanical portal rings.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { q, W, H, makeRenderer, renderPlain, mechRing, rng } from "./lib.js";

const kind = q.get("kind");
const renderer = makeRenderer(true);
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(30, W / H, 0.1, 200);
{
  const es = new THREE.Scene();
  es.add(new THREE.Mesh(new THREE.SphereGeometry(20, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, vertexShader: `varying vec3 vP; void main(){ vP=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`, fragmentShader: `varying vec3 vP; void main(){ vec3 c=mix(vec3(.02,.02,.05),vec3(.25,.2,.6),smoothstep(-.2,.6,vP.y)); c+=vec3(.6,.5,1.2)*pow(max(dot(vP,normalize(vec3(.3,.2,-1.))),0.),6.)*1.5; gl_FragColor=vec4(c,1.); }` })));
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(es, 0.03).texture;
}

if (kind === "homering") {
  // huge frame around the vista: thick segmented metal ring, violet rim light on its inner edge (KF22)
  scene.environmentIntensity = 0.7;
  const ring = mechRing({ R1: 1.0, R2: 1.16, depth: 0.22, segs: 36, slit: "#9a7cff", altEvery: 4, slitAlt: "#61E2EB", seed: 8, metal: "#14162a", lip: "#9b7bff" });
  ring.rotation.y = THREE.MathUtils.degToRad(-14); scene.add(ring);
  cam.fov = 30; cam.updateProjectionMatrix(); cam.position.set(0, 0, 5.0); cam.lookAt(0, 0, 0);
  const rim = new THREE.PointLight("#a184ff", 6, 0, 2); rim.position.set(0.3, 0.2, -0.6); scene.add(rim);
  const k = new THREE.DirectionalLight("#7f8cff", 1.2); k.position.set(-2, 3, 2); scene.add(k);
} else if (kind === "ledge") {
  // dark tiled stone cliff ledge, seen from behind the player (KF22 foreground)
  scene.environmentIntensity = 0.5;
  cam.fov = 34; cam.updateProjectionMatrix(); cam.position.set(0.3, 2.9, 6.4); cam.lookAt(0.1, -0.7, -0.4);
  const r = rng(4), grp = new THREE.Group(); scene.add(grp);
  const rockM = new THREE.MeshStandardMaterial({ color: "#121326", roughness: 0.92, flatShading: true });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 1.6, 2.4, 9, 4), rockM); body.position.y = -1.25; body.scale.set(1.25, 1, 0.9);
  const p = body.geometry.attributes.position; const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); if (v.y < 1.15) { v.x *= 0.88 + r() * 0.24; v.z *= 0.88 + r() * 0.24; } p.setXYZ(i, v.x, v.y, v.z); }
  body.geometry.computeVertexNormals(); grp.add(body);
  const tileM = [new THREE.MeshStandardMaterial({ color: "#191b33", roughness: 0.55, metalness: 0.15 }), new THREE.MeshStandardMaterial({ color: "#131528", roughness: 0.75, metalness: 0.1 }), new THREE.MeshStandardMaterial({ color: "#1f2240", roughness: 0.45, metalness: 0.2 })];
  for (let ix = -6; ix <= 6; ix++) for (let iz = -4; iz <= 4; iz++) {
    const x = ix * 0.36, z = iz * 0.36; const d = Math.hypot(x / 1.25 / 2.6, z / 0.9 / 2.6); if (d > 0.84 - r() * 0.06) continue;
    const t = new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.06 + r() * 0.03, 0.34, 2, 0.012), tileM[Math.floor(r() * 3)]);
    t.position.set(x + (r() - 0.5) * 0.01, 0.0 + (r() - 0.5) * 0.02, z); t.rotation.set((r() - 0.5) * 0.04, (r() - 0.5) * 0.05, (r() - 0.5) * 0.04); grp.add(t);
  }
  grp.rotation.y = 0.2;
  const rim = new THREE.DirectionalLight("#8b7cff", 2.6); rim.position.set(0.5, 0.6, -3); scene.add(rim);
  const rim2 = new THREE.DirectionalLight("#6fa0ff", 2.0); rim2.position.set(3, 1, -1); scene.add(rim2);
  scene.add(new THREE.HemisphereLight("#2a2c60", "#05050c", 0.5));
} else if (kind === "mechring") {
  // standalone segmented portal ring (Entry / Hub / Short Entry)
  scene.environmentIntensity = 0.9;
  const ring = mechRing({ R1: 1.0, R2: 1.3, depth: 0.4, segs: 24, slit: q.get("slit") || "#61E2EB", altEvery: +(q.get("alt") || 0), slitAlt: "#FFB45A", seed: 5 });
  scene.add(ring);
  cam.position.set(0, 0, 6.0); cam.lookAt(0, 0, 0);
  const pl = new THREE.PointLight("#9a78ff", 8, 0, 2); pl.position.set(0, 0, 0.6); scene.add(pl);
  const k = new THREE.DirectionalLight("#9fb2ff", 1.0); k.position.set(-2, 3, 3); scene.add(k);
}
renderPlain(renderer, scene, cam);
