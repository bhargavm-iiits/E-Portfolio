/**
 * CH11 ISRO Launch Pad Simulation (KF32, KF60): hangar shell with cyan strip lights, the launch
 * vehicle (core with orange band, ogive fairing, two strap-ons), lattice service gantry with
 * orange access arms, crane, tanks, crates, cables and floor teleport rings.
 * Beat: slow push-in, the access arms swing back 25°, the strip lights pulse once.
 */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { rng, gradientEnvironment, span, easeOut3, easeInOut, lerp, disposeObject } from "../lib";
import type { World, WorldContext, FrameCtx } from "../types";

export function buildHangar(ctx: WorldContext): World {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#0b0e14");
  scene.fog = new THREE.Fog("#141922", 55, 140);
  const camera = new THREE.PerspectiveCamera(46, 16 / 9, 0.1, 400);
  scene.environment = gradientEnvironment(ctx.renderer, `vec3 c=mix(vec3(.04,.05,.07),vec3(.45,.5,.58),smoothstep(-.2,.9,vP.y)); c+=vec3(.3,.8,.9)*smoothstep(.97,1.,abs(vP.x))*.8; gl_FragColor=vec4(c,1.);`);
  scene.environmentIntensity = 0.9;
  scene.add(new THREE.HemisphereLight("#b9c6d8", "#151a22", 0.95));
  const spot = new THREE.SpotLight("#fff2e0", 2600, 0, 0.45, 0.6, 2);
  spot.position.set(-6, 32, 14);
  spot.target.position.set(0, 6, 0);
  scene.add(spot, spot.target);
  const spot2 = new THREE.SpotLight("#cfe8ff", 1400, 0, 0.5, 0.7, 2);
  spot2.position.set(14, 26, 10);
  spot2.target.position.set(2, 8, 0);
  scene.add(spot2, spot2.target);
  const R = rng(13);
  const white = new THREE.MeshStandardMaterial({ color: "#e4e7ea", roughness: 0.35, metalness: 0.1 });
  const orange = new THREE.MeshStandardMaterial({ color: "#d9822b", roughness: 0.45, metalness: 0.2 });
  const ochre = new THREE.MeshStandardMaterial({ color: "#c98f3a", roughness: 0.5, metalness: 0.4 });
  const steel = new THREE.MeshStandardMaterial({ color: "#8b929c", roughness: 0.45, metalness: 0.7 });
  const concrete = new THREE.MeshStandardMaterial({ color: "#5d636c", roughness: 0.85, metalness: 0.05 });
  const panel = new THREE.MeshStandardMaterial({ color: "#262b34", roughness: 0.55, metalness: 0.5 });
  const panel2 = new THREE.MeshStandardMaterial({ color: "#1b1f27", roughness: 0.6, metalness: 0.5 });
  const stripMat = new THREE.MeshBasicMaterial({ color: new THREE.Color("#7fe6ff").multiplyScalar(2.4), toneMapped: false });
  const cyanE = (k = 2) => new THREE.MeshBasicMaterial({ color: new THREE.Color("#7fe6ff").multiplyScalar(k), toneMapped: false });

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(120, 80), new THREE.MeshStandardMaterial({ color: "#3b4048", roughness: 0.6, metalness: 0.2 }));
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
  const pg = new RoundedBoxGeometry(5.8, 6.3, 0.6, 2, 0.08), pgs = new RoundedBoxGeometry(0.6, 6.3, 5.8, 2, 0.08);
  for (let x = -36; x <= 36; x += 6) for (let y = 0; y < 34; y += 6.5) { const p = new THREE.Mesh(pg, (x / 6 + y / 6.5) % 2 ? panel : panel2); p.position.set(x, y + 3.2, -14 - R() * 0.4); scene.add(p); }
  for (const sx of [-1, 1]) for (let z = -14; z < 20; z += 6) for (let y = 0; y < 30; y += 6.5) { const p = new THREE.Mesh(pgs, panel); p.position.set(sx * 26, y + 3.2, z); scene.add(p); }
  ([[-20, 13.5, 14], [21, 19, 12], [-26, 7, 8], [24, 6.5, 10]] as number[][]).forEach(([x, y, w]) => { const s = new THREE.Mesh(new THREE.BoxGeometry(w, 0.22, 0.1), stripMat); s.position.set(x, y, -13.5); scene.add(s); });
  for (const sx of [-1, 1]) for (const z of [-6, 2, 10]) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3.4, 0.25), stripMat); s.position.set(sx * 25.6, 5.2, z); scene.add(s); }
  for (let x = -18; x <= 18; x += 12) { const c = new THREE.Mesh(new THREE.BoxGeometry(6, 0.2, 0.5), new THREE.MeshBasicMaterial({ color: new THREE.Color("#e8f4ff").multiplyScalar(3), toneMapped: false })); c.position.set(x, 33, 0); scene.add(c); }
  const fs1 = new THREE.Mesh(new THREE.BoxGeometry(48, 0.06, 0.12), cyanE(2)); fs1.position.set(0, 0.05, -12.5); scene.add(fs1);
  const plat = new THREE.Mesh(new RoundedBoxGeometry(17, 2.2, 11, 2, 0.1), concrete); plat.position.set(1, 1.1, 0); scene.add(plat);
  const deck = new THREE.Mesh(new THREE.BoxGeometry(10, 1.2, 7), concrete); deck.position.set(1, 2.8, -0.5); scene.add(deck);
  for (let x = -7.3; x <= 9.3; x += 0.8) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9), steel); p.position.set(x, 2.65, 5.4); scene.add(p); }
  const rail = new THREE.Mesh(new THREE.BoxGeometry(16.6, 0.06, 0.06), steel); rail.position.set(1, 3.1, 5.4); scene.add(rail);
  for (const [sx, dir] of [[-5.5, 1], [8.0, -1]]) for (let i = 0; i < 9; i++) { const st = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 0.5), steel); st.position.set(sx - dir * i * 0.15, 2.1 - i * 0.24, 6.0 + i * 0.42); st.rotation.y = dir * 0.35; scene.add(st); }
  for (let i = 0; i < 24; i++) { const h = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.3, 0.02), new THREE.MeshStandardMaterial({ color: i % 2 ? "#e2b43a" : "#141414", roughness: 0.6 })); h.position.set(-7 + i * 0.7, 0.3, 5.52); h.rotation.z = 0.6; scene.add(h); }
  const floorRings: THREE.Mesh[] = [];
  for (const [x, z, r] of [[-11, 8, 2.2], [14, 9, 1.8]]) for (const k of [0.55, 0.8, 1]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(r * k, 0.04, 6, 96), cyanE(2.2)); ring.rotation.x = Math.PI / 2; ring.position.set(x, 0.06, z); scene.add(ring); floorRings.push(ring); }
  // launch vehicle
  const RY = 3.4;
  const lathe = (pts: number[][], mat: THREE.Material) => new THREE.Mesh(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), 64), mat);
  const lv = new THREE.Group();
  scene.add(lv);
  const core = lathe([[0, 0], [1.05, 0], [1.05, 7.5]], white); core.position.y = RY; lv.add(core);
  const band = lathe([[1.07, 0], [1.07, 6.2]], orange); band.position.y = RY + 7.5; lv.add(band);
  const upper = lathe([[1.05, 0], [1.05, 3.4]], white); upper.position.y = RY + 13.7; lv.add(upper);
  const fair = lathe([[1.05, 0], [1.35, 0.6], [1.35, 3.2], [1.2, 4.6], [0.85, 5.6], [0.4, 6.3], [0.0, 6.6]], white); fair.position.y = RY + 17.1; lv.add(fair);
  for (const sx of [-1, 1]) {
    const b = lathe([[0, 0], [0.62, 0], [0.62, 9.6], [0.5, 10.6], [0.25, 11.4], [0.0, 11.7]], white); b.position.set(sx * 1.75, RY, 0.2); lv.add(b);
    const n = lathe([[0.64, 0], [0.64, 0.5]], new THREE.MeshStandardMaterial({ color: "#2a2d33", metalness: 0.6, roughness: 0.4 })); n.position.set(sx * 1.75, RY + 4.0, 0.2); lv.add(n);
    const noz = lathe([[0.3, 0], [0.5, -0.7]], steel); noz.position.set(sx * 1.75, RY, 0.2); lv.add(noz);
  }
  const eng = lathe([[0.4, 0], [0.7, -0.8]], steel); eng.position.y = RY; lv.add(eng);
  const lattice = (x: number, z: number, w: number, d: number, h: number, mat: THREE.Material, levels: number) => {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    const colG = new THREE.BoxGeometry(0.18, h, 0.18);
    for (const [cx, cz] of [[-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]]) { const c = new THREE.Mesh(colG, mat); c.position.set(cx, h / 2, cz); g.add(c); }
    const step = h / levels;
    for (let i = 0; i <= levels; i++) {
      const y = i * step;
      for (const [lx, lz, len, rotY] of [[0, d / 2, w, 0], [0, -d / 2, w, 0], [w / 2, 0, d, Math.PI / 2], [-w / 2, 0, d, Math.PI / 2]]) {
        const b = new THREE.Mesh(new THREE.BoxGeometry(len, 0.1, 0.1), mat); b.position.set(lx, y, lz); b.rotation.y = rotY; g.add(b);
        if (i < levels) { const diag = Math.hypot(len, step); const b2 = new THREE.Mesh(new THREE.BoxGeometry(diag, 0.07, 0.07), mat); b2.position.set(lx, y + step / 2, lz); b2.rotation.set(0, rotY, Math.atan2(step, len) * (i % 2 ? 1 : -1)); g.add(b2); }
      }
    }
    scene.add(g);
  };
  lattice(5.3, -1.2, 3.0, 3.0, 25, steel, 14);
  lattice(-5.6, -3.0, 1.6, 1.6, 21, ochre, 13);
  const arms: THREE.Group[] = [];
  ([[11.5, 3.6], [16.2, 3.3], [20.4, 3.0]] as number[][]).forEach(([y, len]) => {
    const pivot = new THREE.Group();
    pivot.position.set(5.3 - 1.4, y, -0.3);
    const a = new THREE.Mesh(new THREE.BoxGeometry(len, 0.5, 1.0), orange); a.position.x = -len / 2 + 0.8; pivot.add(a);
    const tr = new THREE.Mesh(new THREE.BoxGeometry(len, 0.05, 1.0), steel); tr.position.set(-len / 2 + 0.8, 0.28, 0); pivot.add(tr);
    scene.add(pivot);
    arms.push(pivot);
  });
  const jib = new THREE.Mesh(new THREE.BoxGeometry(7, 0.6, 0.6), orange); jib.position.set(-3.6, 21.6, -3.0); scene.add(jib);
  const topBox = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.2, 3.4), panel); topBox.position.set(5.3, 25.6, -1.2); scene.add(topBox);
  for (const [x, z] of [[-14.5, 3.5], [-14.5, 0.2]]) {
    const t = new THREE.Mesh(new THREE.CapsuleGeometry(1.4, 6, 8, 24), new THREE.MeshStandardMaterial({ color: "#a9aeb6", roughness: 0.4, metalness: 0.6 }));
    t.rotation.z = Math.PI / 2; t.position.set(x, 1.9, z); scene.add(t);
    for (const bx of [-2.2, 0, 2.2]) { const b = new THREE.Mesh(new THREE.TorusGeometry(1.42, 0.08, 6, 32), steel); b.rotation.y = Math.PI / 2; b.position.set(x + bx, 1.9, z); scene.add(b); }
  }
  const crateM = new THREE.MeshStandardMaterial({ color: "#5b616b", roughness: 0.6, metalness: 0.4 });
  const crateG = new RoundedBoxGeometry(1.4, 1.4, 1.4, 2, 0.06);
  for (let i = 0; i < 9; i++) { const c = new THREE.Mesh(crateG, crateM); c.position.set(13 + (i % 3) * 1.5, 0.7 + Math.floor(i / 6) * 1.42, 4 + (Math.floor(i / 3) % 2) * 1.5); scene.add(c); }
  const cableM = new THREE.MeshStandardMaterial({ color: "#121418", roughness: 0.5 });
  for (let k = 0; k < 4; k++) { const pts: THREE.Vector3[] = []; for (let i = 0; i <= 12; i++) pts.push(new THREE.Vector3(-12 + i * 1.6, 0.08, 7 + Math.sin(i * 0.8 + k) * 1.2 + k * 0.5)); scene.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.07, 6), cableM)); }

  const world: World = {
    scene,
    camera,
    bloom: { strength: 0.5, radius: 0.4, threshold: 0.82 },
    exposure: 0.95,
    update(f: FrameCtx) {
      const p = f.p, t = f.time;
      const push = easeOut3(span(p, 0, 0.75));
      camera.position.set(lerp(6, 4, push) + f.pointer.x * 0.6, lerp(9.6, 8.6, push) - f.pointer.y * 0.3, lerp(44, 34, push));
      camera.lookAt(0.8, lerp(12.4, 11.6, push), 0);
      const swing = easeInOut(span(p, 0.25, 0.55));
      arms.forEach((a, i) => (a.rotation.y = -swing * THREE.MathUtils.degToRad(25) * (1 - i * 0.12)));
      const pulse = 2.4 + Math.exp(-Math.pow((p - 0.4) / 0.04, 2)) * 2.5 + Math.sin(t * 2) * 0.1;
      stripMat.color.set("#7fe6ff").multiplyScalar(pulse);
      floorRings.forEach((r, i) => r.scale.setScalar(1 + ((t * 0.5 + i * 0.33) % 1) * 0.12));
    },
    resize(w, h) { camera.aspect = w / h; camera.updateProjectionMatrix(); },
    dispose() { disposeObject(scene); scene.environment?.dispose(); },
  };
  return world;
}
