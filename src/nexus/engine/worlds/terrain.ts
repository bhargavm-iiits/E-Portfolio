/**
 * CH09 Tirumala AR Navigation (KF30, KF40): hologram terrain slab with a surface-following wire grid,
 * glowing box edges, grid floor, cyan side paths, the amber Alipiri → Tirumala route with the
 * flagged 1.17 km interpolated gap, start ring and summit pin.
 * Beats: T19 the terrain rises (p .02–.24) · T18 the route draws to the pin (p .28–.52) · pin drop.
 */
import * as THREE from "three";
import { rng, stars, span, easeOut3, easeInOut, lerp, disposeObject } from "../lib";
import type { World, WorldContext, FrameCtx } from "../types";

export function buildTerrain(ctx: WorldContext): World {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#040916");
  const camera = new THREE.PerspectiveCamera(36, 16 / 9, 0.1, 500);
  stars(scene, { n: 900, r: 200, size: 1.2, seed: 6, opacity: 0.6 });
  scene.add(new THREE.HemisphereLight("#7fa6e0", "#050a14", 0.4));
  const sun = new THREE.DirectionalLight("#dfeaff", 2.2);
  sun.position.set(-14, 9, -4);
  scene.add(sun);
  const fill = new THREE.DirectionalLight("#5fb8ff", 0.5);
  fill.position.set(10, 6, 12);
  scene.add(fill);

  const P = rng(9), perm = new Float32Array(1024);
  for (let i = 0; i < 1024; i++) perm[i] = P();
  const hh = (x: number, y: number) => perm[((x * 73856093) ^ (y * 19349663)) & 1023];
  const vnoise = (x: number, y: number) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf); return (hh(xi, yi) * (1 - u) + hh(xi + 1, yi) * u) * (1 - v) + (hh(xi, yi + 1) * (1 - u) + hh(xi + 1, yi + 1) * u) * v; };
  const fbm = (x: number, y: number) => { let s = 0, a = 0.5, f = 1; for (let i = 0; i < 6; i++) { s += a * vnoise(x * f, y * f); f *= 2.03; a *= 0.5; } return s; };
  const ridged = (x: number, y: number) => { let s = 0, a = 0.5, f = 1; for (let i = 0; i < 6; i++) { s += a * Math.pow(1 - Math.abs(vnoise(x * f, y * f) * 2 - 1), 2); f *= 2.1; a *= 0.5; } return s; };
  const SX = 34, SZ = 20, PEAK = new THREE.Vector2(6.5, -6.5);
  const height = (x: number, z: number) => {
    const back = THREE.MathUtils.smoothstep(-z, -9, 6);
    let h = fbm(x * 0.12 + 3, z * 0.12 + 7) * 1.4 + ridged(x * 0.11 + 11, z * 0.13 + 2) * (1.0 + back * 4.2);
    h += 4.2 * Math.exp(-((x - PEAK.x) ** 2 + (z - PEAK.y) ** 2) / 26);
    h += 2.2 * Math.exp(-((x + 6) ** 2 + (z + 7) ** 2) / 30);
    h -= Math.exp(-((x * 0.35 + z * 0.55 + 1.5) ** 2) / 1.2) * 1.2;
    return Math.max(0.15, h * 0.85);
  };
  const slab = new THREE.Group();
  scene.add(slab);
  const geo = new THREE.PlaneGeometry(SX, SZ, 220, 130);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position as THREE.BufferAttribute, cols = new Float32Array(pos.count * 3);
  const cLow = new THREE.Color("#12261f"), cMid = new THREE.Color("#2a3d3c"), cHigh = new THREE.Color("#5d6f78"), cSnow = new THREE.Color("#e6eef8"), c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), y = height(x, z);
    pos.setY(i, y);
    const t = y / 6.5;
    if (t < 0.3) c.lerpColors(cLow, cMid, t / 0.3); else if (t < 0.6) c.lerpColors(cMid, cHigh, (t - 0.3) / 0.3); else c.lerpColors(cHigh, cSnow, Math.min(1, (t - 0.6) / 0.16));
    cols.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(cols, 3));
  geo.computeVertexNormals();
  const skin = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, metalness: 0.05, transparent: true, opacity: 0.94 });
  slab.add(new THREE.Mesh(geo, skin));
  {
    const pts: number[] = [], step = 1.7;
    for (let gx = -SX / 2; gx <= SX / 2 + 0.01; gx += step) for (let z = -SZ / 2; z < SZ / 2; z += 0.15) pts.push(gx, height(gx, z) + 0.03, z, gx, height(gx, z + 0.15) + 0.03, z + 0.15);
    for (let gz = -SZ / 2; gz <= SZ / 2 + 0.01; gz += step) for (let x = -SX / 2; x < SX / 2; x += 0.15) pts.push(x, height(x, gz) + 0.03, gz, x + 0.15, height(x + 0.15, gz) + 0.03, gz);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    slab.add(new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: new THREE.Color("#8fe9ff").multiplyScalar(1.1), transparent: true, opacity: 0.32, toneMapped: false })));
  }
  const skirtM = new THREE.MeshStandardMaterial({ color: "#0b1d2c", roughness: 0.6, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
  const edgeLine = new THREE.LineBasicMaterial({ color: new THREE.Color("#7fe6ff").multiplyScalar(1.8), toneMapped: false });
  const edge = (fixed: number, len: number, along: "x" | "z") => {
    const n = 200, verts: number[] = [], idx: number[] = [], top: number[] = [];
    for (let i = 0; i <= n; i++) {
      const t = -len / 2 + (len * i) / n, x = along === "x" ? t : fixed, z = along === "x" ? fixed : t;
      verts.push(x, height(x, z), z, x, -0.9, z);
      if (i < n) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
    for (let i = 0; i < n; i++) {
      const t0 = -len / 2 + (len * i) / n, t1 = -len / 2 + (len * (i + 1)) / n;
      const x0 = along === "x" ? t0 : fixed, z0 = along === "x" ? fixed : t0, x1 = along === "x" ? t1 : fixed, z1 = along === "x" ? fixed : t1;
      top.push(x0, height(x0, z0) + 0.02, z0, x1, height(x1, z1) + 0.02, z1);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    slab.add(new THREE.Mesh(g, skirtM));
    const tg = new THREE.BufferGeometry();
    tg.setAttribute("position", new THREE.Float32BufferAttribute(top, 3));
    slab.add(new THREE.LineSegments(tg, edgeLine));
  };
  edge(SZ / 2, SX, "x"); edge(-SZ / 2, SX, "x"); edge(SX / 2, SZ, "z"); edge(-SX / 2, SZ, "z");
  const bright = new THREE.MeshBasicMaterial({ color: new THREE.Color("#7fe6ff").multiplyScalar(1.7), toneMapped: false });
  const bar = (x: number, z: number, lx: number, lz: number) => { const m = new THREE.Mesh(new THREE.BoxGeometry(lx || 0.08, 0.08, lz || 0.08), bright); m.position.set(x, -0.9, z); scene.add(m); };
  bar(0, SZ / 2, SX + 0.08, 0); bar(0, -SZ / 2, SX + 0.08, 0); bar(SX / 2, 0, 0, SZ); bar(-SX / 2, 0, 0, SZ);
  const grid = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, uniforms: { uTime: { value: 0 } },
    vertexShader: `varying vec3 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `varying vec3 vW; uniform float uTime; void main(){ vec2 c=(vW.xz+vec2(0.,uTime*.52))/2.6; vec2 f=abs(fract(c)-.5); float l=1.-smoothstep(.0,.035,min(f.x,f.y)*2.); float fade=exp(-length(vW.xz)/60.); gl_FragColor=vec4(vec3(.17,.43,.62)*1.1, l*.38*fade); }`,
  }));
  grid.rotation.x = -Math.PI / 2;
  grid.position.y = -0.92;
  scene.add(grid);

  const surface = (pts: [number, number][], lift: number) => new THREE.CatmullRomCurve3(pts.map(([x, z]) => new THREE.Vector3(x, height(x, z) + lift, z)));
  const route = surface([[-8.5, 5.8], [-7.2, 4.2], [-5.2, 3.6], [-3.4, 2.2], [-1.6, 1.2], [0.2, 0.8], [1.6, -0.4], [2.4, -1.8], [3.6, -2.6], [4.8, -3.8], [5.6, -5.0], [6.3, -6.2]], 0.16);
  const amber = (k: number) => new THREE.MeshBasicMaterial({ color: new THREE.Color("#FFB45A").multiplyScalar(k), toneMapped: false });
  const sub = (a: number, b: number) => new THREE.CatmullRomCurve3(Array.from({ length: 40 }, (_, i) => route.getPoint(a + ((b - a) * i) / 39)));
  const routeA = new THREE.Mesh(new THREE.TubeGeometry(sub(0, 0.42), 200, 0.09, 8), amber(2.6));
  const routeB = new THREE.Mesh(new THREE.TubeGeometry(sub(0.55, 1), 200, 0.09, 8), amber(2.6));
  slab.add(routeA, routeB);
  const dashes: THREE.Mesh[] = [];
  for (let t = 0.42; t < 0.55; t += 0.018) { const d = new THREE.Mesh(new THREE.TubeGeometry(sub(t, Math.min(t + 0.009, 0.55)), 8, 0.08, 6), amber(1.6)); slab.add(d); dashes.push(d); }
  const flag = new THREE.Group();
  {
    const p = route.getPoint(0.485);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.4), amber(1.4)); pole.position.set(p.x, p.y + 0.7, p.z); flag.add(pole);
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.42), amber(2.0)); fl.position.set(p.x + 0.36, p.y + 1.18, p.z); (fl.material as THREE.Material).side = THREE.DoubleSide; flag.add(fl);
  }
  slab.add(flag);
  const cyan = new THREE.MeshBasicMaterial({ color: new THREE.Color("#8fefff").multiplyScalar(1.3), toneMapped: false });
  slab.add(new THREE.Mesh(new THREE.TubeGeometry(surface([[-15, 2.5], [-12, 2.2], [-9.5, 3.0], [-7.6, 2.4]], 0.1), 100, 0.07, 6), cyan));
  slab.add(new THREE.Mesh(new THREE.TubeGeometry(surface([[-6, 9.6], [-4.5, 7.8], [-2.2, 6.4], [0.5, 5.2], [3.5, 4.6], [6, 3.4], [9, 3.0]], 0.1), 160, 0.05, 6), cyan));
  slab.add(new THREE.Mesh(new THREE.TubeGeometry(surface([[-2.5, -1.5], [-1.6, -3.4], [-1.2, -5.2], [-0.4, -7.0]], 0.08), 80, 0.05, 6), cyan));
  const start = route.getPoint(0);
  const startRing = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.06, 8, 48), amber(2.4));
  startRing.rotation.x = -Math.PI / 2;
  startRing.position.set(start.x, start.y + 0.02, start.z);
  slab.add(startRing);
  const pulseRing = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.025, 6, 48), amber(1.2));
  pulseRing.rotation.x = -Math.PI / 2;
  pulseRing.position.copy(startRing.position);
  slab.add(pulseRing);
  const end = route.getPoint(1);
  const pin = new THREE.Group();
  {
    pin.add(new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 16), amber(2.2)));
    const tipm = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.8, 24), amber(2.2)); tipm.rotation.x = Math.PI; tipm.position.y = -0.5; pin.add(tipm);
    const hole = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 12), new THREE.MeshBasicMaterial({ color: "#3a1c05" })); hole.position.z = 0.32; pin.add(hole);
  }
  slab.add(pin);
  const ripple = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.03, 6, 48), amber(1.6));
  ripple.rotation.x = -Math.PI / 2;
  ripple.position.set(end.x, end.y + 0.05, end.z);
  slab.add(ripple);
  const routeCountA = routeA.geometry.index!.count, routeCountB = routeB.geometry.index!.count;
  const anchor = new THREE.Vector3();
  const flagPos = route.getPoint(0.485).add(new THREE.Vector3(0, 1.0, 0));
  const pinTop = end.clone().add(new THREE.Vector3(0.6, 1.6, 0));

  const base = new THREE.Vector3(9.5, 16.5, 32.5);
  const world: World = {
    scene,
    camera,
    bloom: { strength: 0.75, radius: 0.45, threshold: 0.7 },
    exposure: 1,
    update(f: FrameCtx) {
      const p = f.p, t = f.time;
      (grid.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
      // T19: the terrain rises
      const rise = easeOut3(span(p, 0.02, 0.24));
      slab.scale.set(1, 0.04 + rise * 0.96, 1);
      skin.opacity = 0.2 + rise * 0.74;
      // T18: the route draws to the pin, then the pin drops with a ripple
      const draw = easeInOut(span(p, 0.28, 0.52));
      const dA = span(draw, 0, 0.42 / 1.0), dB = span(draw, 0.55, 1);
      routeA.geometry.setDrawRange(0, Math.floor((dA * routeCountA) / 3) * 3);
      routeB.geometry.setDrawRange(0, Math.floor((dB * routeCountB) / 3) * 3);
      dashes.forEach((d, i) => (d.visible = draw > 0.42 + i * 0.018));
      flag.visible = draw > 0.49;
      const drop = span(p, 0.5, 0.56);
      pin.visible = drop > 0;
      const back = drop < 1 ? 1 + 2.70158 * Math.pow(drop - 1, 3) + 1.70158 * Math.pow(drop - 1, 2) : 1;
      pin.position.set(end.x, end.y + 1.35 + (1 - back) * 1.4 + Math.sin(t * 2) * 0.05, end.z);
      pin.rotation.y = t * 0.8;
      const rp = (t * 0.6) % 1;
      ripple.scale.setScalar(1 + rp * 1.4);
      (ripple.material as THREE.MeshBasicMaterial).color.set("#FFB45A").multiplyScalar(1.6 * (1 - rp) * (drop > 0.9 ? 1 : 0));
      pulseRing.scale.setScalar(1 + ((t * 0.8) % 1) * 0.8);
      // slow orbit
      const a = lerp(-0.06, 0.08, easeInOut(p)) + f.pointer.x * 0.03;
      camera.position.set(base.x * Math.cos(a) + base.z * Math.sin(a), base.y - f.pointer.y * 0.5 - p * 1.2, base.z * Math.cos(a) - base.x * Math.sin(a) - p * 3);
      camera.lookAt(1.0, 3.0, -1.0);
      // screen anchors for the DOM labels (start · gap flag · summit pin)
      camera.updateMatrixWorld();
      const out: Record<string, string> = {};
      for (const [k, v] of [["s", start], ["f", flagPos], ["p", pinTop]] as const) {
        anchor.copy(v);
        slab.localToWorld(anchor);
        anchor.project(camera);
        out[`--${k}x`] = `${((anchor.x * 0.5 + 0.5) * f.width).toFixed(1)}px`;
        out[`--${k}y`] = `${((1 - (anchor.y * 0.5 + 0.5)) * f.height).toFixed(1)}px`;
      }
      ctx.publish(out);
    },
    resize(w, h) { camera.aspect = w / h; camera.updateProjectionMatrix(); },
    dispose() { disposeObject(scene); },
  };
  return world;
}
