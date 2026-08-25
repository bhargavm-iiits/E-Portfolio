import * as THREE from "three";
import { scene, onFrame, isMobile } from "./scene.js";

const BLUE = new THREE.Color("#4F8DFF");
const VIOLET = new THREE.Color("#8B5CF6");
const MAGENTA = new THREE.Color("#C264F0");

export const portalGroup = new THREE.Group();
scene.add(portalGroup);

// --- Lighting ---
scene.add(new THREE.AmbientLight(0x2a2f5f, 0.6));
const key = new THREE.PointLight(BLUE, 4, 60);
key.position.set(8, 6, 10);
scene.add(key);
const rim = new THREE.PointLight(VIOLET, 3, 60);
rim.position.set(-10, -4, -10);
scene.add(rim);

// --- Portal ring ---
const ringGeo = new THREE.TorusGeometry(5, 0.32, 24, 100);
const ringMat = new THREE.MeshStandardMaterial({
  color: VIOLET,
  emissive: VIOLET,
  emissiveIntensity: 1.4,
  metalness: 0.6,
  roughness: 0.2,
});
const portalRing = new THREE.Mesh(ringGeo, ringMat);
portalRing.position.set(10, 0, -16);
portalGroup.add(portalRing);

const innerRingGeo = new THREE.TorusGeometry(5.5, 0.05, 16, 100);
const innerRingMat = new THREE.MeshBasicMaterial({ color: BLUE, transparent: true, opacity: 0.6 });
const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
innerRing.position.copy(portalRing.position);
portalGroup.add(innerRing);

// segmented arc blocks orbiting the ring
const segGeo = new THREE.BoxGeometry(0.5, 1.1, 0.5);
const segMat = new THREE.MeshStandardMaterial({
  color: VIOLET,
  emissive: MAGENTA,
  emissiveIntensity: 0.8,
  metalness: 0.8,
  roughness: 0.3,
});
const segCount = isMobile ? 10 : 20;
const segments = new THREE.InstancedMesh(segGeo, segMat, segCount);
const segDummy = new THREE.Object3D();
for (let i = 0; i < segCount; i++) {
  const a = (i / segCount) * Math.PI * 2;
  segDummy.position.set(
    portalRing.position.x + Math.cos(a) * 5.8,
    Math.sin(a) * 5.8,
    portalRing.position.z
  );
  segDummy.rotation.z = a;
  segDummy.updateMatrix();
  segments.setMatrixAt(i, segDummy.matrix);
}
portalGroup.add(segments);

// --- Portal disc (the "window" into the city) ---
const discGeo = new THREE.CircleGeometry(4.8, 64);
const discMat = new THREE.MeshBasicMaterial({
  color: 0x0a0f2e,
  transparent: true,
  opacity: 0.35,
  side: THREE.DoubleSide,
});
const disc = new THREE.Mesh(discGeo, discMat);
disc.position.copy(portalRing.position);
disc.position.z -= 0.2;
portalGroup.add(disc);

// --- City inside the portal ---
const cityGroup = new THREE.Group();
cityGroup.position.set(portalRing.position.x, -1.5, portalRing.position.z - 8);
portalGroup.add(cityGroup);

const towerGeo = new THREE.BoxGeometry(1, 1, 1);
const towerMat = new THREE.MeshStandardMaterial({
  color: 0x0d1230,
  emissive: BLUE,
  emissiveIntensity: 0.5,
  metalness: 0.4,
  roughness: 0.6,
});
const towerCount = isMobile ? 40 : 90;
const towers = new THREE.InstancedMesh(towerGeo, towerMat, towerCount);
const tDummy = new THREE.Object3D();
for (let i = 0; i < towerCount; i++) {
  const h = 1 + Math.random() * 6;
  tDummy.position.set((Math.random() - 0.5) * 10, h / 2 - 2, (Math.random() - 0.5) * 6 - 2);
  tDummy.scale.set(0.3 + Math.random() * 0.3, h, 0.3 + Math.random() * 0.3);
  tDummy.updateMatrix();
  towers.setMatrixAt(i, tDummy.matrix);
}
cityGroup.add(towers);

// central spire + light beam
const spireGeo = new THREE.CylinderGeometry(0.15, 0.4, 8, 8);
const spireMat = new THREE.MeshStandardMaterial({
  color: 0x0d1230,
  emissive: MAGENTA,
  emissiveIntensity: 0.7,
});
const spire = new THREE.Mesh(spireGeo, spireMat);
spire.position.set(0, 2, -2);
cityGroup.add(spire);

const beamGeo = new THREE.CylinderGeometry(0.05, 0.05, 30, 8, 1, true);
const beamMat = new THREE.MeshBasicMaterial({
  color: 0xbfe1ff,
  transparent: true,
  opacity: 0.5,
  side: THREE.DoubleSide,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const beam = new THREE.Mesh(beamGeo, beamMat);
beam.position.set(0, 17, -2);
cityGroup.add(beam);

// giant moon
const planetGeo = new THREE.SphereGeometry(3.4, 40, 40);
const planetMat = new THREE.MeshStandardMaterial({
  color: 0x1a1440,
  emissive: VIOLET,
  emissiveIntensity: 0.18,
  roughness: 1,
});
const planet = new THREE.Mesh(planetGeo, planetMat);
planet.position.set(5, 4, -24);
cityGroup.add(planet);

const moonRimGeo = new THREE.SphereGeometry(3.55, 40, 40);
const moonRimMat = new THREE.MeshBasicMaterial({
  color: BLUE,
  transparent: true,
  opacity: 0.12,
  side: THREE.BackSide,
});
const moonRim = new THREE.Mesh(moonRimGeo, moonRimMat);
moonRim.position.copy(planet.position);
cityGroup.add(moonRim);

// --- Subtle depth-cue grid floor ---
const gridFloor = new THREE.GridHelper(140, 40, 0x8b5cf6, 0x4f7df3);
gridFloor.position.y = -10;
gridFloor.material.transparent = true;
gridFloor.material.opacity = 0.06;
scene.add(gridFloor);

// --- Floating debris field (deep space) ---
const debrisGeo = new THREE.OctahedronGeometry(0.25, 0);
const debrisMat = new THREE.MeshBasicMaterial({
  color: BLUE,
  wireframe: true,
  transparent: true,
  opacity: 0.16,
});
const debrisCount = isMobile ? 30 : 70;
const debris = [];
const debrisGroup = new THREE.Group();
for (let i = 0; i < debrisCount; i++) {
  const m = new THREE.Mesh(debrisGeo, debrisMat);
  m.position.set(
    (Math.random() - 0.5) * 60,
    (Math.random() - 0.5) * 40,
    (Math.random() - 0.5) * -140 - 10
  );
  m.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
  debrisGroup.add(m);
  debris.push({ mesh: m, speed: 0.02 + Math.random() * 0.06 });
}
portalGroup.add(debrisGroup);

// --- Particles ---
const particleCount = isMobile ? 600 : 1800;
const positions = new Float32Array(particleCount * 3);
for (let i = 0; i < positions.length; i++) positions[i] = (Math.random() - 0.5) * 70;
const particlesGeo = new THREE.BufferGeometry();
particlesGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
const particlesMat = new THREE.PointsMaterial({
  size: 0.05,
  color: 0x8fb2ff,
  transparent: true,
  opacity: 0.5,
});
const particles = new THREE.Points(particlesGeo, particlesMat);
scene.add(particles);

// --- Continuous ambient animation ---
let mouseX = 0, mouseY = 0;
window.addEventListener("mousemove", (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

onFrame((dt, t) => {
  portalRing.rotation.z += dt * 0.15;
  innerRing.rotation.z -= dt * 0.1;
  segments.rotation.z -= dt * 0.08;
  spire.rotation.y += dt * 0.2;
  planet.rotation.y += dt * 0.05;
  moonRim.scale.setScalar(1 + Math.sin(t * 0.8) * 0.02);
  beam.material.opacity = 0.35 + Math.sin(t * 1.5) * 0.15;
  particles.rotation.y += dt * 0.01;
  scene.fog.density = 0.012 + Math.sin(t * 0.3) * 0.002;

  debris.forEach((d) => {
    d.mesh.position.z += d.speed;
    d.mesh.rotation.x += d.speed * 0.3;
    d.mesh.rotation.y += d.speed * 0.3;
    if (d.mesh.position.z > 20) d.mesh.position.z = -140;
  });

  // gentle mouse parallax on the whole group
  portalGroup.rotation.y += (mouseX * 0.05 - portalGroup.rotation.y) * 0.02;
  portalGroup.rotation.x += (-mouseY * 0.03 - portalGroup.rotation.x) * 0.02;
});

export const portalObjects = { portalRing, innerRing, disc, cityGroup, planet, beam, debrisGroup };
