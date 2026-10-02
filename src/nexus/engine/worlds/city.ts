/**
 * BG05 neon megacity. `hub` = CH03 (KF10/KF11): glide down the avenue toward the second portal
 * whose interior streaks erupt. `warp` = CH04 (KF12–KF14): corridor flight with velocity-coupled
 * hyperspace streaks, cyan laser rails and a wormhole mouth.
 */
import * as THREE from "three";
import { portalMaterial, glowMaterial, mechRing, windowMaterial, skyGradient, gradientEnvironment, rng, stars, span, easeIn2, lerp, disposeObject } from "../lib";
import type { World, WorldContext, FrameCtx } from "../types";

export function buildCity(ctx: WorldContext, v: "hub" | "warp"): World {
  const scene = new THREE.Scene();
  const FOG = "#16203A", FD = 0.0034;
  scene.fog = new THREE.FogExp2(FOG, FD);
  const camera = new THREE.PerspectiveCamera(45, 16 / 9, 0.5, 6000);
  scene.add(camera);
  skyGradient(scene, [[-0.05, "#16203A"], [0.06, "#1b2a44"], [0.3, "#0d1628"], [0.7, "#050912"]], 5000);
  stars(scene, { n: 700, r: 4000, size: 1.1, seed: 12, opacity: 0.5, spread: [1, 0.6] });
  scene.add(new THREE.HemisphereLight("#2a3d66", "#07080f", 0.5));
  scene.environment = gradientEnvironment(ctx.renderer, `vec3 c=mix(vec3(.02,.03,.06),vec3(.18,.22,.4),smoothstep(-.3,.5,vP.y)); c+=vec3(.5,.35,1.)*pow(max(dot(vP,vec3(0.,0.,1.)),0.),5.)*1.4; c+=vec3(.2,.6,.7)*pow(max(dot(vP,vec3(1.,0.,0.)),0.),3.)*.5; gl_FragColor=vec4(c,1.);`);
  scene.environmentIntensity = 1.4;

  const R = rng(17);
  const winMat = windowMaterial({ seed: 7, fog: FOG, density: FD, base: "#0a0e1b", warm: "#ffe2b8", cool: "#9fe8ff", lit: 0.2, rowH: 4.2, colW: 3.4, k: 0.85, win: [0.12, 0.88, 0.46, 0.6] });
  const boxes: number[][] = [];
  const tower = (x: number, z: number, w: number, d: number, h: number) => {
    boxes.push([x, h / 2, z, w, h, d]);
    if (h > 90 && R() < 0.6) { const w2 = w * (0.55 + R() * 0.25), d2 = d * (0.55 + R() * 0.25), h2 = h * (0.15 + R() * 0.3); boxes.push([x, h + h2 / 2, z, w2, h2, d2]); }
  };
  const neon = ["#E1A565", "#E374BC", "#61E2EB", "#FF5FD2", "#78D8EF", "#BDAEE9", "#FFB45A"];
  const signs: { x: number; y: number; z: number; w: number; h: number; c: string }[] = [];
  const front = v === "hub" ? 78 : 34;
  for (const side of [-1, 1]) {
    for (let z = 40; z > -1700; z -= 26 + R() * 34) {
      tower(side * (front + R() * 16), z, 22 + R() * 18, 22 + R() * 20, 40 + Math.pow(R(), 1.3) * (z > -300 ? (v === "hub" ? 80 : 110) : 230));
      if (R() < 0.8) tower(side * ((v === "hub" ? 125 : 85) + R() * 60), z - R() * 20, 26 + R() * 30, 26 + R() * 30, 60 + Math.pow(R(), 1.2) * (z > -400 && v === "hub" ? 120 : 300));
      if (R() < 0.7) tower(side * (180 + R() * 200), z - R() * 30, 30 + R() * 40, 30 + R() * 40, 80 + Math.pow(R(), 1.2) * 340);
      if (R() < 0.55) signs.push({ x: side * (front - 11 - 0.6), y: 30 + R() * 140, z: z + (R() - 0.5) * 10, w: 6 + R() * 14, h: 2.5 + R() * 6, c: neon[Math.floor(R() * neon.length)] });
      if (R() < 0.25) signs.push({ x: side * (front - 11 - 0.6), y: 40 + R() * 120, z: z + (R() - 0.5) * 10, w: 1.4, h: 18 + R() * 30, c: neon[Math.floor(R() * neon.length)] });
    }
  }
  {
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), winMat, boxes.length);
    const m = new THREE.Matrix4();
    boxes.forEach(([x, y, z, w, h, d], i) => { m.compose(new THREE.Vector3(x, y, z), new THREE.Quaternion(), new THREE.Vector3(w, h, d)); im.setMatrixAt(i, m); });
    scene.add(im);
    const stripG = new THREE.Group();
    const stripC = new THREE.MeshBasicMaterial({ color: new THREE.Color("#61E2EB").multiplyScalar(2.2), toneMapped: false });
    const stripP = new THREE.MeshBasicMaterial({ color: new THREE.Color("#E374BC").multiplyScalar(2.2), toneMapped: false });
    const beacon = new THREE.MeshBasicMaterial({ color: new THREE.Color("#ff3b3b").multiplyScalar(3), toneMapped: false });
    boxes.forEach(([x, y, z, w, h, d]) => {
      if (R() < 0.14) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.5, h * 0.9, 0.5), R() < 0.6 ? stripC : stripP); s.position.set(x + (x > 0 ? -w / 2 : w / 2), y, z + d / 2); stripG.add(s); }
      if (h > 120 && R() < 0.5) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 6), beacon); b.position.set(x, y + h / 2 + 3, z); stripG.add(b); }
    });
    scene.add(stripG);
  }
  const bbTex = (seed: number, c1: string) => {
    const c = document.createElement("canvas");
    c.width = 256; c.height = 128;
    const x = c.getContext("2d")!, r = rng(seed);
    const g = x.createLinearGradient(0, 0, 256, 128); g.addColorStop(0, c1); g.addColorStop(1, "#1a1040");
    x.fillStyle = g; x.fillRect(0, 0, 256, 128);
    x.globalAlpha = 0.5;
    for (let i = 0; i < 6; i++) { x.fillStyle = r() < 0.5 ? "#ffffff" : "#000000"; x.beginPath(); x.arc(r() * 256, r() * 128, 10 + r() * 40, 0, Math.PI * 2); x.fill(); }
    x.globalAlpha = 0.25;
    for (let yy = 0; yy < 128; yy += 3) { x.fillStyle = "#000"; x.fillRect(0, yy, 256, 1); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  };
  const signMats: THREE.MeshBasicMaterial[] = [];
  signs.forEach((s, i) => {
    const big = s.w > 14 && s.h > 6;
    const mat = big ? new THREE.MeshBasicMaterial({ map: bbTex(i, s.c), toneMapped: false, color: new THREE.Color(1.6, 1.6, 1.6) }) : new THREE.MeshBasicMaterial({ color: new THREE.Color(s.c).multiplyScalar(2.4), toneMapped: false });
    signMats.push(mat);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(s.w, s.h), mat);
    mesh.position.set(s.x, s.y, s.z);
    mesh.rotation.y = s.x < 0 ? Math.PI / 2 : -Math.PI / 2;
    scene.add(mesh);
  });
  // elevated highway + traffic trails + arch gates + drones
  const hw = new THREE.Mesh(new THREE.BoxGeometry(18, 2, 1800), new THREE.MeshStandardMaterial({ color: "#0c0f1c", roughness: 0.6, metalness: 0.4 }));
  hw.position.set(0, 18, -800);
  scene.add(hw);
  for (const sx of [-8.6, 8.6]) { const e = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 1800), new THREE.MeshBasicMaterial({ color: new THREE.Color("#61E2EB").multiplyScalar(1.8), toneMapped: false })); e.position.set(sx, 19.2, -800); scene.add(e); }
  const traffic = new THREE.Group();
  for (let i = 0; i < 90; i++) {
    const lane = (R() < 0.5 ? -1 : 1) * (2 + R() * 4.5);
    const t = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 8 + R() * 30), new THREE.MeshBasicMaterial({ color: new THREE.Color(lane < 0 ? "#ff4a5a" : "#fff1d6").multiplyScalar(2.5), toneMapped: false }));
    t.position.set(lane, 19.4, -R() * 1600);
    t.userData.speed = (lane < 0 ? 1 : -1) * (40 + R() * 50);
    traffic.add(t);
  }
  scene.add(traffic);
  for (let z = -120; z > -1500; z -= 160) { const g = new THREE.Mesh(new THREE.TorusGeometry(12, 0.35, 6, 40, Math.PI), new THREE.MeshBasicMaterial({ color: new THREE.Color("#61E2EB").multiplyScalar(1.6), toneMapped: false })); g.position.set(0, 19, z); scene.add(g); }
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), new THREE.MeshStandardMaterial({ color: "#05070d", roughness: 0.9 }));
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);
  const drones = new THREE.Group();
  for (let i = 0; i < 40; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.5, 6, 4), new THREE.MeshBasicMaterial({ color: new THREE.Color(R() < 0.5 ? "#78D8EF" : "#E374BC").multiplyScalar(3), toneMapped: false })); d.position.set((R() - 0.5) * 80, 90 + R() * 160, -100 - R() * 900); d.userData.ph = R() * 6; drones.add(d); }
  scene.add(drones);

  // hub: second portal over the avenue
  let pm: ReturnType<typeof portalMaterial> | null = null;
  const PC = new THREE.Vector3(0, 128, -230), PR = 50;
  if (v === "hub") {
    const ring = mechRing({ R1: 1.0, R2: 1.3, depth: 0.4, segs: 24, slit: "#8f6dff", seed: 5, slitK: 1.0, slitP: 0.45, metal: "#232738" });
    ring.scale.setScalar(PR);
    ring.position.copy(PC);
    scene.add(ring);
    pm = portalMaterial({ mode: 2, twist: 1.2, fil: 0.9, rim: 1.6, seed: 4.1, omega: 0.25, streak: 0.62 });
    const mem = new THREE.Mesh(new THREE.PlaneGeometry(2 * PR, 2 * PR), pm);
    mem.position.copy(PC);
    mem.position.z += 0.05;
    mem.renderOrder = 5;
    scene.add(mem);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(4 * PR, 4 * PR), glowMaterial("#8f6dff", { inner: 1.0, tight: 0.035, wide: 0.22, k1: 0.45, k2: 0.08 }));
    glow.position.copy(PC);
    glow.position.z -= 0.1;
    glow.renderOrder = 4;
    scene.add(glow);
    const pl = new THREE.PointLight("#9a78ff", 4000, 0, 2);
    pl.position.copy(PC).add(new THREE.Vector3(0, 0, 4));
    scene.add(pl);
  }

  // warp: velocity-coupled streak field around the camera + laser rails + wormhole
  const STREAKS = v === "warp" ? 700 : 0;
  let streakMesh: THREE.InstancedMesh | null = null;
  const sData: { a: number; r: number; z: number; len: number }[] = [];
  let worm: THREE.Group | null = null;
  if (v === "warp") {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    geo.translate(0, 0, -0.5);
    const mat = new THREE.MeshBasicMaterial({ vertexColors: false, toneMapped: false, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false });
    streakMesh = new THREE.InstancedMesh(geo, mat, STREAKS);
    streakMesh.frustumCulled = false;
    const cA = new THREE.Color("#70CFDE").multiplyScalar(1.5), cB = new THREE.Color("#BDAEE9").multiplyScalar(1.5);
    for (let i = 0; i < STREAKS; i++) {
      sData.push({ a: R() * Math.PI * 2, r: 6 + Math.pow(R(), 0.7) * 70, z: -R() * 600, len: 0.5 + R() });
      streakMesh.setColorAt(i, R() < 0.5 ? cA : cB);
    }
    camera.add(streakMesh);
    for (const [x0, y0, z0, x1, y1, z1] of [[-200, 92, -150, 30, 100, -420], [140, 160, -300, -20, 110, -520], [-120, 60, -500, 60, 140, -760]]) {
      const a = new THREE.Vector3(x0, y0, z0), b = new THREE.Vector3(x1, y1, z1);
      const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, a.distanceTo(b), 6), new THREE.MeshBasicMaterial({ color: new THREE.Color("#8cf0fa").multiplyScalar(3), toneMapped: false }));
      rail.position.copy(a).add(b).multiplyScalar(0.5);
      rail.lookAt(b);
      rail.rotateX(Math.PI / 2);
      scene.add(rail);
    }
    worm = new THREE.Group();
    const mouth = new THREE.Mesh(new THREE.CircleGeometry(9, 64), new THREE.MeshBasicMaterial({ color: "#04030c", transparent: true, opacity: 0.96, fog: false }));
    worm.add(mouth);
    const rim = new THREE.Mesh(new THREE.PlaneGeometry(46, 46), glowMaterial("#9d78ff", { inner: 0.78, tight: 0.12, wide: 0.5, k1: 1.2, k2: 0.25 }));
    rim.position.z = 0.1;
    worm.add(rim);
    worm.position.set(0, 0, -160);
    camera.add(worm);
  }

  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), pos = new THREE.Vector3();
  const world: World = {
    scene,
    camera,
    bloom: { strength: 0.6, radius: 0.35, threshold: 0.8 },
    exposure: 1,
    update(f: FrameCtx) {
      winMat.uniforms.uTime.value = f.time;
      traffic.children.forEach((t) => { t.position.z += (t.userData.speed as number) * f.dt; if (t.position.z < -1650) t.position.z += 1650; if (t.position.z > 0) t.position.z -= 1650; });
      drones.children.forEach((d) => { d.position.y += Math.sin(f.time * 0.8 + (d.userData.ph as number)) * 0.05; });
      if (v === "hub" && pm) {
        pm.uniforms.uTime.value = f.time;
        const p = f.p;
        const travel = p < 0.4 ? p * 0.25 : 0.1 + easeIn2((p - 0.4) / 0.6) * 0.9;
        const z = lerp(60, -226, travel);
        camera.position.set(f.pointer.x * 3, lerp(150, 128, span(p, 0.3, 1)) - f.pointer.y * 1.5, z);
        camera.lookAt(0, lerp(118, 128, span(p, 0.3, 1)), -600);
        pm.uniforms.uStreak.value = lerp(0.62, 0.22, span(p, 0.35, 0.95));
        pm.uniforms.uOmega.value = 0.25 + span(p, 0.5, 1) * 1.6;
        world.bloom.strength = 0.6 + span(p, 0.75, 1) * 1.2;
      } else if (v === "warp" && streakMesh && worm) {
        const p = f.p;
        const z = 40 - p * 1250;
        camera.position.set(Math.sin(f.time * 0.4) * 2 + f.pointer.x * 3, lerp(112, 96, p) - f.pointer.y * 1.5, z);
        camera.lookAt(Math.sin(f.time * 0.4) * 2, lerp(108, 96, p), z - 400);
        camera.rotateZ(Math.sin(f.time * 0.3) * 0.02 + f.vel * 0.0006);
        const speed = 260 + Math.abs(f.vel) * 26 + span(p, 0.55, 1) * 500;
        const stretch = 18 + Math.abs(f.vel) * 1.6 + span(p, 0.55, 1) * 70;
        const ribbon = span(p, 0.5, 0.8) * (1 - span(p, 0.85, 1));
        for (let i = 0; i < STREAKS; i++) {
          const s = sData[i];
          s.z += speed * f.dt;
          if (s.z > 4) { s.z -= 600; s.a = R() * Math.PI * 2; }
          const wob = ribbon * Math.sin(s.z * 0.02 + f.time * 2 + s.a * 3) * 6;
          pos.set(Math.cos(s.a) * s.r + wob, Math.sin(s.a) * s.r * 0.62, s.z);
          sc.set(0.07 + s.len * 0.06, 0.07 + s.len * 0.06, stretch * s.len);
          m4.compose(pos, q, sc);
          streakMesh.setMatrixAt(i, m4);
        }
        streakMesh.instanceMatrix.needsUpdate = true;
        const fade = 1 - span(p, 0.78, 0.92);
        (streakMesh.material as THREE.MeshBasicMaterial).opacity = 0.7 * (0.35 + 0.65 * fade);
        worm.scale.setScalar(1 + span(p, 0.6, 0.85) * 2.5);
        worm.rotation.z = f.time * 0.2;
        worm.visible = p < 0.86;
        world.bloom.strength = 0.6 + span(p, 0.62, 0.8) * 1.6;
      }
    },
    resize(w, h) { camera.aspect = w / h; camera.updateProjectionMatrix(); },
    dispose() { disposeObject(scene); scene.environment?.dispose(); signMats.forEach((m) => m.map?.dispose()); },
  };
  return world;
}
