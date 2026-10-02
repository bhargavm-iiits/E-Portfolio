/**
 * CH10 VR Cinema Platform (no reference; built in-language): wireframe dome, curved screen with a
 * stereoscopic side-by-side test pattern, a 360° playback sphere and orbiting lock glyphs.
 * Beats: the screen powers on with a scanline sweep, the sphere spins, the locks orbit.
 */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { NOISE, rng, stars, span, easeOut3, lerp, disposeObject } from "../lib";
import type { World, FrameCtx } from "../types";

export function buildCinema(): World {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#07061a");
  const camera = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 500);
  stars(scene, { n: 1200, r: 160, size: 1.3, seed: 8, opacity: 0.7 });
  scene.add(new THREE.HemisphereLight("#6a5cff", "#0a0820", 0.6));
  const cyanE = (k = 2) => new THREE.MeshBasicMaterial({ color: new THREE.Color("#7fe6ff").multiplyScalar(k), toneMapped: false });
  const violetE = (k = 2) => new THREE.MeshBasicMaterial({ color: new THREE.Color("#9a7cff").multiplyScalar(k), toneMapped: false });
  const nebMat = new THREE.ShaderMaterial({
    depthWrite: false, uniforms: { uTime: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: NOISE + `varying vec2 vUv; uniform float uTime; void main(){ vec2 d=vec2(uTime*.005,0.); vec2 w=vec2(fbm(vUv*3.+d),fbm(vUv*3.+5.)); float n=fbm(vUv*4.+w*2.+d); vec3 c=mix(vec3(.02,.02,.07),vec3(.16,.09,.34),smoothstep(.35,.85,n)); c+=vec3(.25,.12,.5)*pow(n,4.)*.8; gl_FragColor=vec4(c,1.); }`,
  });
  const neb = new THREE.Mesh(new THREE.PlaneGeometry(260, 140), nebMat);
  neb.position.set(0, 20, -80);
  scene.add(neb);
  {
    const e = new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(15, 3), 1), p = e.attributes.position as THREE.BufferAttribute, keep: number[] = [];
    for (let i = 0; i < p.count; i += 2) if (p.getY(i) > -1 && p.getY(i + 1) > -1) keep.push(p.getX(i), p.getY(i), p.getZ(i), p.getX(i + 1), p.getY(i + 1), p.getZ(i + 1));
    const lg = new THREE.BufferGeometry();
    lg.setAttribute("position", new THREE.Float32BufferAttribute(keep, 3));
    scene.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: new THREE.Color("#6fdcff").multiplyScalar(1.2), transparent: true, opacity: 0.55, toneMapped: false })));
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(14.9, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2 + 0.07), new THREE.MeshBasicMaterial({ color: "#1a1250", transparent: true, opacity: 0.35, side: THREE.BackSide })));
  }
  const floor = new THREE.Mesh(new THREE.CircleGeometry(15, 96), new THREE.MeshStandardMaterial({ color: "#0d0c22", roughness: 0.3, metalness: 0.6 }));
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
  for (const r of [3, 6, 9.5, 13]) { const ring = new THREE.Mesh(new THREE.RingGeometry(r, r + 0.04, 128), cyanE(r < 4 ? 2 : 1)); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.01; scene.add(ring); }
  const sbs = (() => {
    const c = document.createElement("canvas");
    c.width = 2048; c.height = 640;
    const x = c.getContext("2d")!;
    const bars = ["#e8e8e8", "#e8e05a", "#5ae0e0", "#5ae05a", "#e05ae0", "#e05a5a", "#5a5ae0"];
    for (let eye = 0; eye < 2; eye++) {
      const ox = eye * 1024, off = eye ? -14 : 14;
      const g = x.createLinearGradient(ox, 0, ox + 1024, 640); g.addColorStop(0, "#1b1446"); g.addColorStop(1, "#0b1636"); x.fillStyle = g; x.fillRect(ox, 0, 1024, 640);
      bars.forEach((b, i) => { x.fillStyle = b; x.globalAlpha = 0.85; x.fillRect(ox + 112 + i * 114, 60, 114, 150); });
      x.globalAlpha = 1; x.strokeStyle = "#9fe8ff"; x.lineWidth = 3;
      for (const r of [70, 130, 190]) { x.beginPath(); x.arc(ox + 512 + off, 410, r, 0, Math.PI * 2); x.stroke(); }
      x.beginPath(); x.moveTo(ox + 512 + off - 220, 410); x.lineTo(ox + 512 + off + 220, 410); x.moveTo(ox + 512 + off, 230); x.lineTo(ox + 512 + off, 600); x.stroke();
      x.fillStyle = "#ffffff"; x.font = "bold 64px sans-serif"; x.fillText(eye ? "R" : "L", ox + 60, 590);
      for (let i = 0; i < 16; i++) { x.fillStyle = `rgb(${i * 16},${i * 16},${i * 16})`; x.fillRect(ox + 112 + i * 50, 230, 50, 26); }
    }
    x.fillStyle = "#000"; x.fillRect(1020, 0, 8, 640);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; t.repeat.x = -1; t.offset.x = 1; return t;
  })();
  const scrMat = new THREE.MeshBasicMaterial({ map: sbs, side: THREE.BackSide, toneMapped: false, color: new THREE.Color(0, 0, 0) });
  const scr = new THREE.Mesh(new THREE.CylinderGeometry(12, 12, 4.6, 96, 1, true, Math.PI - 0.62, 1.24), scrMat);
  scr.position.set(0, 4.4, 8.5);
  scene.add(scr);
  const frame = new THREE.Mesh(new THREE.CylinderGeometry(12.05, 12.05, 4.9, 96, 1, true, Math.PI - 0.64, 1.28), new THREE.MeshStandardMaterial({ color: "#0b0b18", side: THREE.BackSide, metalness: 0.6, roughness: 0.3 }));
  frame.position.copy(scr.position);
  frame.position.z += 0.02;
  scene.add(frame);
  for (const y of [2.1, 6.7]) { const edge = new THREE.Mesh(new THREE.TorusGeometry(12, 0.035, 6, 128, 1.24), cyanE(2)); edge.rotation.set(Math.PI / 2, 0, Math.PI / 2 + 0.95); edge.position.set(0, y, 8.5); scene.add(edge); }
  const scan = new THREE.Mesh(new THREE.PlaneGeometry(14, 0.06), cyanE(3));
  scan.position.set(0, 5.6, -3.05);
  scene.add(scan);
  const pano = (() => {
    const c = document.createElement("canvas");
    c.width = 1024; c.height = 512;
    const x = c.getContext("2d")!;
    const g = x.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, "#0b0928"); g.addColorStop(0.42, "#2a2170"); g.addColorStop(0.5, "#7a5be6"); g.addColorStop(0.505, "#ffb45a"); g.addColorStop(0.52, "#141238"); g.addColorStop(1, "#06061a");
    x.fillStyle = g; x.fillRect(0, 0, 1024, 512);
    x.strokeStyle = "rgba(160,230,255,.35)"; x.lineWidth = 2;
    for (let i = 0; i <= 1024; i += 64) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 512); x.stroke(); }
    for (let j = 0; j <= 512; j += 64) { x.beginPath(); x.moveTo(0, j); x.lineTo(1024, j); x.stroke(); }
    const r = rng(4);
    for (let i = 0; i < 90; i++) { x.fillStyle = "rgba(12,10,34,.95)"; const w = 10 + r() * 30, h = 30 + r() * 120, px = r() * 1024; x.fillRect(px, 258 - h, w, h); x.fillStyle = r() < 0.5 ? "#ffd7a3" : "#9fe8ff"; for (let k = 0; k < 6; k++) x.fillRect(px + r() * w, 258 - r() * h, 2, 2); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(1.5, 64, 32), new THREE.MeshStandardMaterial({ map: pano, emissive: "#ffffff", emissiveMap: pano, emissiveIntensity: 0.7, roughness: 0.2, metalness: 0.1 }));
  sphere.position.set(-3.6, 2.7, 3.2);
  scene.add(sphere);
  const glass = new THREE.Mesh(new THREE.SphereGeometry(1.6, 64, 32), new THREE.MeshPhysicalMaterial({ color: "#bfe8ff", transparent: true, opacity: 0.18, roughness: 0.05, clearcoat: 1 }));
  glass.position.copy(sphere.position);
  scene.add(glass);
  const orbit = new THREE.Group();
  orbit.position.copy(sphere.position);
  orbit.rotation.set(1.25, 0.2, 0);
  scene.add(orbit);
  orbit.add(new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.015, 6, 128), cyanE(1.3)));
  const locks = new THREE.Group();
  orbit.add(locks);
  [0.4, 2.5, 4.4].forEach((a, i) => {
    const lock = new THREE.Group();
    lock.position.set(Math.cos(a) * 2.4, Math.sin(a) * 2.4, 0);
    lock.rotation.x = -1.25;
    const m = i === 1 ? violetE(1.8) : cyanE(1.8);
    lock.add(new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.34, 0.14, 2, 0.04), m));
    const sh = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.03, 8, 24, Math.PI), m);
    sh.position.y = 0.17;
    lock.add(sh);
    locks.add(lock);
  });
  const pod = new THREE.Mesh(new RoundedBoxGeometry(1.6, 1.1, 1.0, 2, 0.06), new THREE.MeshStandardMaterial({ color: "#14132c", metalness: 0.6, roughness: 0.3 }));
  pod.position.set(3.8, 0.55, 3.5);
  pod.rotation.y = -0.4;
  scene.add(pod);

  const world: World = {
    scene,
    camera,
    bloom: { strength: 0.7, radius: 0.45, threshold: 0.72 },
    exposure: 1,
    update(f: FrameCtx) {
      const p = f.p, t = f.time;
      nebMat.uniforms.uTime.value = t;
      const push = easeOut3(span(p, 0, 0.7));
      camera.position.set(lerp(0.4, -0.3, push) + f.pointer.x * 0.3, lerp(2.8, 2.5, push) - f.pointer.y * 0.15, lerp(12.2, 9.6, push));
      camera.lookAt(0, 3.4, 0);
      // power-on: the screen fades up behind a scanline sweep
      const on = span(p, 0.06, 0.3);
      scrMat.color.setScalar(1.15 * on);
      scan.position.y = lerp(6.7, 2.1, on);
      scan.visible = on > 0 && on < 1;
      sphere.rotation.y = 0.6 + t * 0.35;
      const unfold = easeOut3(span(p, 0.18, 0.4));
      sphere.scale.setScalar(0.2 + unfold * 0.8);
      glass.scale.copy(sphere.scale);
      locks.rotation.z = t * 0.4;
      orbit.scale.setScalar(0.4 + easeOut3(span(p, 0.3, 0.5)) * 0.6);
    },
    resize(w, h) { camera.aspect = w / h; camera.updateProjectionMatrix(); },
    dispose() { disposeObject(scene); sbs.dispose(); pano.dispose(); },
  };
  return world;
}
