/**
 * CH08 Game-Based Physics Learning lab (KF28): circular lab, ceiling ring light, consoles,
 * ringed pedestal, glass cube with an atom, molecules, gold cube + energy beam, level pads.
 * Feature beat: the velocity arrow slides along its track while the five level pads light in sequence.
 */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { stars, gradientEnvironment, span, easeOut3, lerp, disposeObject } from "../lib";
import type { World, WorldContext, FrameCtx } from "../types";

export function buildLab(ctx: WorldContext): World {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#060a16");
  const camera = new THREE.PerspectiveCamera(52, 16 / 9, 0.1, 400);
  stars(scene, { n: 900, r: 120, size: 1.4, seed: 2, opacity: 0.75 });
  scene.environment = gradientEnvironment(ctx.renderer, `vec3 c=mix(vec3(.05,.06,.09),vec3(.55,.62,.75),smoothstep(-.2,.8,vP.y)); c+=vec3(1.)*smoothstep(.85,.95,vP.y)*2.; gl_FragColor=vec4(c,1.);`);
  scene.environmentIntensity = 0.55;
  scene.add(new THREE.HemisphereLight("#cfdcf0", "#1a1f2c", 0.45));
  const key = new THREE.DirectionalLight("#ffffff", 1.4);
  key.position.set(0, 10, 4);
  scene.add(key);
  const grey = new THREE.MeshStandardMaterial({ color: "#7d8696", roughness: 0.45, metalness: 0.35 });
  const greyD = new THREE.MeshStandardMaterial({ color: "#3d4452", roughness: 0.5, metalness: 0.4 });
  const dark = new THREE.MeshStandardMaterial({ color: "#1b2030", roughness: 0.35, metalness: 0.5 });
  const cyanE = (k = 2) => new THREE.MeshBasicMaterial({ color: new THREE.Color("#7fe6ff").multiplyScalar(k), toneMapped: false });
  const amberE = (k = 2.5) => new THREE.MeshBasicMaterial({ color: new THREE.Color("#FFB45A").multiplyScalar(k), toneMapped: false });

  const floor = new THREE.Mesh(new THREE.CircleGeometry(14, 96), new THREE.MeshStandardMaterial({ color: "#2a303d", roughness: 0.22, metalness: 0.55 }));
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
  for (const r of [3.2, 5.6, 8.5, 11]) { const ring = new THREE.Mesh(new THREE.RingGeometry(r, r + 0.03, 128), cyanE(r < 4 ? 1.8 : 0.7)); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.005; scene.add(ring); }
  const Rw = 13, segs = 28;
  for (let i = 0; i < segs; i++) {
    const a = (i / segs) * Math.PI * 2;
    if (Math.abs(Math.sin(a / 2)) < 0.18 && Math.cos(a) > 0.9) continue;
    const p = new THREE.Mesh(new RoundedBoxGeometry(2.7, 5.2, 0.3, 2, 0.05), i % 2 ? grey : greyD);
    p.position.set(Math.sin(a) * Rw, 2.6, -Math.cos(a) * Rw);
    p.lookAt(0, 2.6, 0);
    scene.add(p);
    const s = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 0.05), cyanE(1.2));
    s.position.set(Math.sin(a) * (Rw - 0.2), 4.4, -Math.cos(a) * (Rw - 0.2));
    s.lookAt(0, 4.4, 0);
    scene.add(s);
  }
  const ceilMat = new THREE.MeshBasicMaterial({ color: new THREE.Color("#eaf6ff").multiplyScalar(3.5), toneMapped: false });
  const ceil = new THREE.Mesh(new THREE.TorusGeometry(9.5, 0.18, 12, 160), ceilMat);
  ceil.rotation.x = Math.PI / 2;
  ceil.position.y = 7.6;
  scene.add(ceil);
  const ceilFrame = new THREE.Mesh(new THREE.TorusGeometry(9.5, 0.5, 12, 160), dark);
  ceilFrame.rotation.x = Math.PI / 2;
  ceilFrame.position.y = 7.9;
  scene.add(ceilFrame);
  const upper = new THREE.Mesh(new THREE.CylinderGeometry(13.4, 13.4, 1.2, 64, 1, true), new THREE.MeshStandardMaterial({ color: "#4a5262", roughness: 0.5, metalness: 0.4, side: THREE.BackSide }));
  upper.position.y = 5.8;
  scene.add(upper);
  const strip = new THREE.Mesh(new THREE.TorusGeometry(13.1, 0.05, 6, 160), cyanE(2));
  strip.rotation.x = Math.PI / 2;
  strip.position.y = 5.3;
  scene.add(strip);
  const desk = (x: number, z: number, rot: number) => {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = rot;
    const topM = new THREE.Mesh(new RoundedBoxGeometry(4.2, 0.12, 1.2, 2, 0.04), grey); topM.position.y = 1.0; g.add(topM);
    const body = new THREE.Mesh(new RoundedBoxGeometry(4.0, 0.95, 1.0, 2, 0.05), greyD); body.position.y = 0.5; g.add(body);
    const lip = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.03, 0.03), cyanE(1.6)); lip.position.set(0, 0.95, 0.52); g.add(lip);
    for (const mx of [-1.1, 1.0]) {
      const mon = new THREE.Mesh(new RoundedBoxGeometry(1.1, 0.7, 0.06, 2, 0.02), dark); mon.position.set(mx, 1.5, -0.3); mon.rotation.x = -0.12; g.add(mon);
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.6), cyanE(0.7)); scr.position.set(mx, 1.5, -0.26); scr.rotation.x = -0.12; g.add(scr);
    }
    scene.add(g);
  };
  desk(-7.6, -3.2, 0.62); desk(7.6, -3.2, -0.62); desk(-9.6, 1.5, 1.2); desk(9.6, 1.5, -1.2);
  ([[2.6, 0.25, 0], [2.0, 0.3, 0.25], [1.4, 0.35, 0.55]] as number[][]).forEach(([r, h, y]) => {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.04, h, 96), dark); c.position.y = y + h / 2; scene.add(c);
    const rr = new THREE.Mesh(new THREE.TorusGeometry(r * 0.96, 0.03, 6, 128), cyanE(2.6)); rr.rotation.x = Math.PI / 2; rr.position.y = y + h + 0.005; scene.add(rr);
  });
  const disc = new THREE.Mesh(new THREE.CircleGeometry(1.1, 64), cyanE(1.2));
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = 0.91;
  scene.add(disc);
  for (const sx of [-5.4, 5.4]) {
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.3, 0.2, 64), dark); pad.position.set(sx, 0.1, 2.2); scene.add(pad);
    for (const r of [0.5, 0.85, 1.15]) { const rr = new THREE.Mesh(new THREE.TorusGeometry(r, 0.025, 6, 64), cyanE(2.2)); rr.rotation.x = Math.PI / 2; rr.position.set(sx, 0.21, 2.2); scene.add(rr); }
  }
  // glass cube with an atom
  const cubeG = new THREE.Group();
  cubeG.position.set(0, 2.25, 0);
  scene.add(cubeG);
  cubeG.add(new THREE.Mesh(new RoundedBoxGeometry(1.5, 1.5, 1.5, 3, 0.06), new THREE.MeshPhysicalMaterial({ color: "#a9dcff", metalness: 0, roughness: 0.04, transparent: true, opacity: 0.32, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false })));
  cubeG.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.5, 1.5, 1.5)), new THREE.LineBasicMaterial({ color: new THREE.Color("#bfefff").multiplyScalar(1.6), toneMapped: false })));
  cubeG.add(new THREE.Mesh(new THREE.SphereGeometry(0.13, 24, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color("#ff5a6e").multiplyScalar(2), toneMapped: false })));
  const orbits: THREE.Group[] = [];
  [0, 1.05, 2.1].forEach((a) => {
    const og = new THREE.Group();
    og.rotation.set(Math.PI / 2, a, 0);
    const o = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.012, 6, 96), cyanE(2.4));
    o.scale.set(1, 0.42, 1);
    og.add(o);
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 8), cyanE(4));
    og.add(e);
    og.userData.e = e;
    cubeG.add(og);
    orbits.push(og);
  });
  const track = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.03, 0.08), cyanE(1.2));
  track.position.set(0.4, 1.22, 1.3);
  scene.add(track);
  const arrowG = new THREE.Group();
  const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.26, 12), amberE());
  arrow.rotation.z = -Math.PI / 2;
  arrow.position.x = 0.85;
  const shaft = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.035, 0.035), amberE());
  arrowG.add(arrow, shaft);
  arrowG.position.set(1.45, 1.22, 1.3);
  scene.add(arrowG);
  const gold = new THREE.MeshStandardMaterial({ color: "#f2b94a", metalness: 0.8, roughness: 0.25, emissive: "#6a3b00", emissiveIntensity: 0.4 });
  const blueS = new THREE.MeshStandardMaterial({ color: "#4aa3ff", metalness: 0.3, roughness: 0.2, emissive: "#0b3c8a", emissiveIntensity: 0.5 });
  const molecules: THREE.Group[] = [];
  const molecule = (pos: THREE.Vector3, scale: number, mat: THREE.Material, mat2?: THREE.Material) => {
    const g = new THREE.Group();
    g.position.copy(pos);
    g.scale.setScalar(scale);
    const v = [[1, 1, 1], [-1, -1, 1], [-1, 1, -1], [1, -1, -1]].map((p) => new THREE.Vector3(p[0], p[1], p[2]).multiplyScalar(0.6));
    v.forEach((p, i) => { const s = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 16), i === 0 && mat2 ? mat2 : mat); s.position.copy(p); g.add(s); });
    const bm = new THREE.MeshStandardMaterial({ color: "#e8eef8", metalness: 0.4, roughness: 0.3 });
    for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) {
      const a = v[i], b = v[j];
      const c = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, a.distanceTo(b), 8), bm);
      c.position.copy(a).add(b).multiplyScalar(0.5);
      c.lookAt(b);
      c.rotateX(Math.PI / 2);
      g.add(c);
    }
    scene.add(g);
    molecules.push(g);
  };
  molecule(new THREE.Vector3(-3.4, 1.7, 1.2), 1.0, blueS, gold);
  molecule(new THREE.Vector3(-1.9, 2.5, -0.6), 0.75, gold);
  const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), new THREE.MeshPhysicalMaterial({ color: "#3d7dff", roughness: 0.1, transparent: true, opacity: 0.7, clearcoat: 1, emissive: "#1d3d9a", emissiveIntensity: 0.6 }));
  crystal.position.set(2.1, 2.3, 0.2);
  scene.add(crystal);
  const goldCube = new THREE.Mesh(new RoundedBoxGeometry(0.95, 0.95, 0.95, 2, 0.05), new THREE.MeshPhysicalMaterial({ color: "#f5c04a", metalness: 0.2, roughness: 0.15, transparent: true, opacity: 0.75, emissive: "#a86a00", emissiveIntensity: 0.6 }));
  goldCube.position.set(4.3, 1.7, 0.6);
  scene.add(goldCube);
  const orb = new THREE.Mesh(new THREE.SphereGeometry(0.38, 32, 24), amberE(2.2));
  orb.position.set(1.1, 1.85, 1.0);
  scene.add(orb);
  const beamMat = amberE(3);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.1, 8), beamMat);
  beam.position.set(2.7, 1.78, 0.8);
  beam.rotation.z = Math.PI / 2 - 0.05;
  scene.add(beam);
  const pads: THREE.MeshBasicMaterial[] = [];
  for (let i = 0; i < 5; i++) {
    const a = -0.9 + i * 0.45;
    const m = cyanE(0.15);
    pads.push(m);
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.06, 6), m);
    p.position.set(Math.sin(a) * 4.1, 0.04, Math.cos(a) * 4.1 - 0.8);
    scene.add(p);
  }

  const world: World = {
    scene,
    camera,
    bloom: { strength: 0.45, radius: 0.35, threshold: 0.88 },
    exposure: 1,
    update(f: FrameCtx) {
      const p = f.p, t = f.time;
      const push = easeOut3(span(p, 0, 0.6));
      camera.position.set(lerp(0, 0.4, push) + f.pointer.x * 0.25, lerp(3.4, 2.9, push) - f.pointer.y * 0.12, lerp(10.5, 8.2, push));
      camera.lookAt(0, 2.05, 0);
      cubeG.rotation.set(0.35 + Math.sin(t * 0.4) * 0.08, 0.6 + t * 0.25, 0.12);
      cubeG.position.y = 2.25 + Math.sin(t * 1.1) * 0.05;
      orbits.forEach((o, i) => { const e = o.userData.e as THREE.Mesh; const a = t * (1.6 + i * 0.4) + i * 2; e.position.set(Math.cos(a) * 0.5, Math.sin(a) * 0.21, 0); });
      molecules.forEach((m, i) => { m.rotation.y = t * (0.3 + i * 0.15); m.rotation.x = 0.3 + Math.sin(t * 0.5 + i) * 0.2; });
      crystal.rotation.set(0.4 + t * 0.2, 0.3 + t * 0.35, 0.2);
      goldCube.rotation.set(0.3, 0.5 + t * 0.3, 0.1);
      // feature beat: the arrow slides with v·s·t, pads light in sequence
      const beat = span(p, 0.2, 0.55);
      arrowG.position.x = lerp(-1.0, 1.9, (Math.sin(t * 1.2) * 0.5 + 0.5) * 0.3 + beat * 0.7);
      pads.forEach((m, i) => m.color.set("#7fe6ff").multiplyScalar(span(beat, i * 0.18, i * 0.18 + 0.12) * 1.8 + 0.12));
      beamMat.color.set("#FFB45A").multiplyScalar(2.4 + Math.sin(t * 6) * 0.5);
      ceilMat.color.set("#eaf6ff").multiplyScalar(3.2 + Math.sin(t * 0.8) * 0.2);
    },
    resize(w, h) { camera.aspect = w / h; camera.updateProjectionMatrix(); },
    dispose() { disposeObject(scene); scene.environment?.dispose(); },
  };
  return world;
}
