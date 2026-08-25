import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { scene, onFrame, isMobile } from "./scene.js";

export const headsetGroup = new THREE.Group();
scene.add(headsetGroup);

function createHeadset(color) {
  const group = new THREE.Group();

  const bodyGeo = new RoundedBoxGeometry(2.2, 1.1, 1, 6, 0.25);
  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: 0x0d1230,
    metalness: 0.55,
    roughness: 0.25,
    clearcoat: 0.8,
    clearcoatRoughness: 0.2,
    emissive: new THREE.Color(color),
    emissiveIntensity: 0.12,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  group.add(body);

  const lensGeo = new THREE.CircleGeometry(0.3, 32);
  const lensMat = new THREE.MeshStandardMaterial({
    color: 0x03040a,
    emissive: new THREE.Color(color),
    emissiveIntensity: 0.9,
    metalness: 0.3,
    roughness: 0.15,
  });
  const lensL = new THREE.Mesh(lensGeo, lensMat);
  lensL.position.set(-0.55, 0, 0.52);
  const lensR = lensL.clone();
  lensR.position.x = 0.55;
  group.add(lensL, lensR);

  const strapGeo = new THREE.TorusGeometry(1.25, 0.06, 8, 32, Math.PI);
  const strapMat = new THREE.MeshStandardMaterial({ color: 0x0d1230, metalness: 0.5, roughness: 0.4 });
  const strap = new THREE.Mesh(strapGeo, strapMat);
  strap.rotation.y = Math.PI / 2;
  strap.position.z = -0.55;
  group.add(strap);

  return group;
}

const configs = [
  { color: "#6EA8FF", pos: { x: 10.5, y: 2.2, z: -2.5 }, rotY: -0.35 },
  { color: "#C264F0", pos: { x: 13.5, y: -1.8, z: -8 }, rotY: 0.5 },
];

const headsets = [];
configs.forEach((cfg, i) => {
  const hs = createHeadset(cfg.color);
  hs.position.set(cfg.pos.x, cfg.pos.y, cfg.pos.z);
  hs.rotation.y = cfg.rotY;
  hs.scale.setScalar(isMobile ? 0.9 : 1.15);
  hs.userData.baseY = cfg.pos.y;
  hs.userData.floatOffset = i * 2.1;
  headsetGroup.add(hs);
  headsets.push(hs);
});

onFrame((dt, t) => {
  headsets.forEach((hs) => {
    hs.rotation.y += dt * 0.12;
    hs.position.y = hs.userData.baseY + Math.sin(t * 0.5 + hs.userData.floatOffset) * 0.4;
  });
});
