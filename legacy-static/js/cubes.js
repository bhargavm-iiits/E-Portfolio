import * as THREE from "three";
import { scene, camera, renderer, onFrame, isMobile } from "./scene.js";
import { projects } from "./data.js";

const featured = projects.filter((p) => p.featured);

export const cubeGroup = new THREE.Group();
scene.add(cubeGroup);

const cubes = [];
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2(-10, -10);
let hovered = null;

featured.forEach((project, i) => {
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(project.color),
    metalness: 0.1,
    roughness: 0.05,
    transmission: isMobile ? 0 : 1,
    thickness: 0.6,
    transparent: true,
    opacity: isMobile ? 0.35 : 0.9,
    emissive: new THREE.Color(project.color),
    emissiveIntensity: 0.15,
    iridescence: isMobile ? 0 : 1,
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [100, 400],
  });
  const cube = new THREE.Mesh(geo, glassMat);

  const wireGeo = new THREE.BoxGeometry(1.08, 1.08, 1.08);
  const wireMat = new THREE.MeshBasicMaterial({
    color: project.color,
    wireframe: true,
    transparent: true,
    opacity: 0.5,
  });
  const wire = new THREE.Mesh(wireGeo, wireMat);
  cube.add(wire);

  // Fixed to a right-of-center arc (never orbits into the text column on the left).
  const spread = featured.length > 1 ? i / (featured.length - 1) - 0.5 : 0;
  cube.position.set(
    9 + spread * 3,
    spread * -4,
    -5 - i * 2.2
  );
  cube.scale.setScalar(1.3);
  cube.userData.project = project;
  cube.userData.baseY = cube.position.y;
  cube.userData.floatOffset = Math.random() * Math.PI * 2;
  cube.userData.baseScale = 1.3;

  cubeGroup.add(cube);
  cubes.push(cube);
});

function setPointerFromEvent(e) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
}

window.addEventListener("pointermove", (e) => {
  setPointerFromEvent(e);
});

window.addEventListener("pointerdown", (e) => {
  setPointerFromEvent(e);
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(cubes)[0];
  if (hit) {
    window.dispatchEvent(new CustomEvent("cube:click", { detail: hit.object.userData.project }));
  }
});

onFrame((dt, t) => {
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(cubes)[0];
  const newHovered = hit ? hit.object : null;

  if (newHovered !== hovered) {
    if (hovered) window.dispatchEvent(new CustomEvent("cube:hover", { detail: null }));
    if (newHovered) {
      window.dispatchEvent(new CustomEvent("cube:hover", { detail: newHovered.userData.project }));
    }
    hovered = newHovered;
    renderer.domElement.style.cursor = newHovered ? "pointer" : "";
  }

  cubes.forEach((cube) => {
    const isHovered = cube === hovered;
    const targetScale = cube.userData.baseScale * (isHovered ? 1.25 : 1);
    cube.scale.setScalar(THREE.MathUtils.lerp(cube.scale.x, targetScale, 0.15));
    cube.rotation.x += dt * 0.2;
    cube.rotation.y += dt * 0.25;
    cube.position.y =
      cube.userData.baseY + Math.sin(t * 0.6 + cube.userData.floatOffset) * 0.6;
  });
});

export { cubes };
