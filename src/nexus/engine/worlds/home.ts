/**
 * CH05 Home + CH06 Dive (KF22–KF25). Two layers:
 *  - background: the violet fantasy city at dusk (spire + beam, moon, clouds, floating islands);
 *  - foreground: a dark wall with a circular opening, the segmented ring frame, the cliff ledge,
 *    the player from behind and the dark neon-edged cubes.
 * The opening is placed in screen terms (centre 78 % / 46 %, radius 42 % vh) on every resize.
 * Dive pushes the camera to the back of the headset and through the visor.
 */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { NOISE, rng, windowMaterial, skyGradient, cloudMaterial, mechRing, makeCube, gradientEnvironment, span, smooth, easeInOut, easeIn3, lerp, disposeObject } from "../lib";
import type { World, WorldContext, FrameCtx } from "../types";

function buildVista(scene: THREE.Scene) {
  const FOG = "#4f5aa8", FD = 0.00058;
  scene.fog = new THREE.FogExp2(FOG, FD);
  skyGradient(scene, [[-0.05, "#4f5aa8"], [0.03, "#6a84cc"], [0.17, "#30478f"], [0.45, "#0f1538"]], 8000);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000), new THREE.MeshStandardMaterial({ color: "#080a1e", roughness: 1 }));
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);
  const moon = new THREE.Mesh(new THREE.SphereGeometry(260, 64, 48), new THREE.MeshStandardMaterial({ color: "#c4d2f4", emissive: "#6577b8", emissiveIntensity: 0.75, roughness: 1, fog: false }));
  moon.position.set(980, 760, -3600);
  scene.add(moon);
  const ml = new THREE.DirectionalLight("#e4ecff", 2.4);
  ml.position.copy(moon.position).add(new THREE.Vector3(-300, 90, 300));
  ml.target = moon;
  scene.add(ml);
  scene.add(new THREE.HemisphereLight("#8eaae6", "#1a1534", 0.45));
  const sun = new THREE.DirectionalLight("#b8c6ff", 0.9);
  sun.position.set(600, 800, -900);
  scene.add(sun);

  const stripTex = (seed: number, cols = ["#9c7cff", "#7fb2ff", "#c9b8ff"]) => {
    const c = document.createElement("canvas");
    c.width = 256; c.height = 512;
    const x = c.getContext("2d")!, r = rng(seed);
    x.fillStyle = "#000"; x.fillRect(0, 0, 256, 512);
    for (let i = 0; i < 26; i++) { const px = Math.floor(r() * 32) * 8; x.fillStyle = cols[Math.floor(r() * cols.length)]; x.globalAlpha = 0.5 + r() * 0.5; x.fillRect(px, 0, 2, 512); }
    for (let y = 0; y < 512; y += 10) for (let px = 0; px < 256; px += 8) if (r() < 0.16) { x.globalAlpha = 0.6 + r() * 0.4; x.fillStyle = cols[Math.floor(r() * cols.length)]; x.fillRect(px + 2, y + 2, 4, 5); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  };
  const texCache: THREE.Texture[] = [];
  for (let i = 0; i < 8; i++) { const t = stripTex(10 + i); t.repeat.set(3, 2); texCache.push(t); }
  const towerMat = (seed: number, k = 1.6) => new THREE.MeshStandardMaterial({ color: "#1c2250", roughness: 0.45, metalness: 0.4, emissive: "#ffffff", emissiveMap: texCache[seed % texCache.length], emissiveIntensity: k });

  const SP = new THREE.Vector3(60, 0, -1350), SS = 1.55;
  const spire = new THREE.Group();
  spire.position.copy(SP);
  spire.scale.setScalar(SS);
  scene.add(spire);
  const ringMats: THREE.MeshBasicMaterial[] = [];
  let y = 0;
  ([[34, 46, 60], [26, 32, 70], [19, 24, 70], [13, 17, 60], [8.5, 11, 55], [5, 7, 45], [2.6, 4, 40]] as [number, number, number][]).forEach(([rt, rb, h], i) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 8, 1), towerMat(i, 1.4 + i * 0.25));
    m.position.y = y + h / 2;
    spire.add(m);
    const rm = new THREE.MeshBasicMaterial({ color: new THREE.Color("#b18cff").multiplyScalar(2.2), toneMapped: false });
    ringMats.push(rm);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(rt + 1.2, 0.7, 6, 32), rm);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = y + h;
    spire.add(ring);
    y += h;
  });
  const tip = new THREE.Mesh(new THREE.ConeGeometry(2.6, 70, 8), towerMat(3, 2.5));
  tip.position.y = y + 35;
  spire.add(tip);
  y += 70;
  ([[-42, 0, 8, 190], [44, 6, 8, 175], [-24, -30, 6, 150], [26, -28, 6, 140], [-64, 14, 7, 120], [66, 18, 7, 115], [0, 40, 9, 130], [-86, 30, 6, 95], [88, 34, 6, 92], [-110, 50, 7, 80], [112, 54, 7, 76], [-30, 70, 8, 90], [36, 72, 8, 86], [-140, 80, 9, 60], [140, 86, 9, 58]] as number[][]).forEach(([nx, nz, r, h], i) => {
    const g = new THREE.Group();
    g.position.set(nx, 0, nz);
    const b = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.75, r, h * 0.82, 8), towerMat(i));
    b.position.y = h * 0.41;
    g.add(b);
    const c = new THREE.Mesh(new THREE.ConeGeometry(r * 0.8, h * 0.32, 8), towerMat(i + 3, 2.2));
    c.position.y = h * 0.82 + h * 0.16;
    g.add(c);
    spire.add(g);
  });
  const beamMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, uniforms: { uC: { value: new THREE.Color("#bfe2ff") }, uK: { value: 1 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `varying vec2 vUv; uniform vec3 uC; uniform float uK; void main(){ float x=abs(vUv.x-.5)*2.; float core=exp(-x*x/.02)*2.5+exp(-x*x/.25)*.35; float fade=smoothstep(1.,.0,vUv.y)*.9+.1; gl_FragColor=vec4(uC*core*fade*uK,1.); }`,
  });
  const beam = new THREE.Mesh(new THREE.PlaneGeometry(16, 3000), beamMat);
  beam.position.set(SP.x, y * SS + 1500, SP.z);
  scene.add(beam);
  const haloMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, uniforms: { uK: { value: 1 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `varying vec2 vUv; uniform float uK; void main(){ float r=length(vUv-.5)*2.; gl_FragColor=vec4(vec3(.75,.85,1.)*exp(-r*r/.05)*1.4*uK,1.); }`,
  });
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), haloMat);
  halo.position.set(SP.x, y * SS - 15, SP.z + 4);
  scene.add(halo);

  const winMat = windowMaterial({ seed: 3, fog: FOG, density: FD, base: "#0d1030", warm: "#b9a0ff", cool: "#8fd0ff", lit: 0.4, rowH: 3.0, colW: 2.6, k: 1.25 });
  {
    const r = rng(5), N = 4200, im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), winMat, N);
    const m = new THREE.Matrix4();
    let k = 0;
    for (let i = 0; i < N * 4 && k < N; i++) {
      const z = -80 - Math.pow(r(), 1.25) * 2700;
      const x = -200 + (r() - 0.5) * (900 + -z * 1.8);
      const d = Math.hypot(x - SP.x, z - SP.z);
      if (d < 170) continue;
      const near = Math.max(0, 1 - d / 900), fg = Math.max(0, 1 + z / 700);
      const h = 12 + Math.pow(r(), 2.0) * (40 + near * 110 + fg * 70);
      m.compose(new THREE.Vector3(x, h / 2, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, r() * 0.8, 0)), new THREE.Vector3(10 + r() * 22, h, 10 + r() * 22));
      im.setMatrixAt(k++, m);
    }
    im.count = k;
    scene.add(im);
    const cr = rng(9);
    for (let i = 0; i < 70; i++) {
      const x = -300 + (cr() - 0.5) * 2400, z = -700 - cr() * 1900;
      if (Math.hypot(x - SP.x, z - SP.z) < 190) continue;
      const near = Math.max(0, 1 - Math.hypot(x - SP.x, z - SP.z) / 900);
      const h = 40 + cr() * (60 + near * 120), rr = 4 + cr() * 6;
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      const b = new THREE.Mesh(new THREE.CylinderGeometry(rr * 0.8, rr, h, 6), towerMat(i, 1.4));
      b.position.y = h / 2;
      g.add(b);
      const c = new THREE.Mesh(new THREE.ConeGeometry(rr * 0.9, h * 0.3, 6), towerMat(i + 1, 2.0));
      c.position.y = h + h * 0.15;
      g.add(c);
      scene.add(g);
    }
  }
  const cloudMats: THREE.ShaderMaterial[] = [];
  ([
    [700, 900, -3300, 2600, 700, 1.3, 0.95], [-900, 820, -3400, 2600, 600, 2.4, 0.8], [250, 620, -2700, 2000, 420, 3.7, 0.75],
    [1300, 700, -3000, 1800, 520, 4.6, 0.9], [-300, 70, -1900, 3400, 220, 5.8, 0.7], [300, 45, -1100, 3000, 180, 6.9, 0.55],
    [-700, 60, -900, 2000, 160, 7.7, 0.5], [900, 380, -2300, 1600, 380, 8.8, 0.8], [1600, 1050, -3700, 2000, 560, 9.9, 0.9],
    [-150, 20, -650, 2400, 120, 11.1, 0.45], [500, 140, -1600, 1400, 220, 12.6, 0.6],
    [-1200, 60, -2900, 4200, 320, 13.3, 0.95], [1400, 60, -2900, 4200, 320, 14.4, 0.95], [0, 30, -2500, 3600, 220, 15.5, 0.9],
  ] as number[][]).forEach(([x, yy, z, w, h, s, o]) => {
    const mat = cloudMaterial(s, "#b4bdf0", "#4a5092", o);
    cloudMats.push(mat);
    const c = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    c.position.set(x, yy, z);
    c.lookAt(0, yy, 520);
    scene.add(c);
  });
  const rock = new THREE.MeshStandardMaterial({ color: "#151630", roughness: 0.95, flatShading: true });
  const grass = new THREE.MeshStandardMaterial({ color: "#2c3266", roughness: 0.9, flatShading: true });
  const islands = new THREE.Group();
  ([[-380, 470, -1700, 46, 3], [430, 600, -2000, 40, 3], [-640, 360, -1500, 28, 2], [700, 400, -1650, 26, 2], [960, 700, -2500, 34, 3]] as number[][]).forEach(([x, yy, z, r, nt], i) => {
    const g = new THREE.Group();
    g.position.set(x, yy, z);
    g.userData.y0 = yy;
    g.userData.ph = i * 1.7;
    const geo = new THREE.IcosahedronGeometry(r, 3), p = geo.attributes.position as THREE.BufferAttribute, rr = rng(40 + i), vv = new THREE.Vector3();
    for (let k = 0; k < p.count; k++) { vv.fromBufferAttribute(p, k); const n = 0.75 + rr() * 0.35; if (vv.y > 0) vv.y *= 0.12; else vv.y *= 1.6 * n; vv.x *= n; vv.z *= n; p.setXYZ(k, vv.x, vv.y, vv.z); }
    geo.computeVertexNormals();
    g.add(new THREE.Mesh(geo, rock));
    const top = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.85, r * 0.9, 4, 9), grass);
    top.position.y = r * 0.1;
    g.add(top);
    const tr = rng(300 + i);
    for (let t = 0; t < nt; t++) {
      const h = r * (0.4 + tr() * 0.9), px = (tr() - 0.5) * r, pz = (tr() - 0.5) * r * 0.6;
      const tw = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.06, r * 0.09, h, 6), towerMat(i + t, 2));
      tw.position.set(px, h / 2 + r * 0.1, pz);
      g.add(tw);
      const c = new THREE.Mesh(new THREE.ConeGeometry(r * 0.08, h * 0.4, 6), towerMat(t, 2.2));
      c.position.set(px, h + h * 0.2 + r * 0.1, pz);
      g.add(c);
    }
    islands.add(g);
  });
  scene.add(islands);
  return { winMat, cloudMats, beamMat, haloMat, ringMats, islands, texCache };
}

export function buildHome(ctx: WorldContext): World {
  /* background: vista */
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(33.4, 16 / 9, 1, 9000);
  const vista = buildVista(scene);
  const camBase = new THREE.Vector3(0, 330, 520), lookBase = new THREE.Vector3(-330, 170, -1300);

  /* foreground */
  const fgScene = new THREE.Scene();
  const fgCam = new THREE.PerspectiveCamera(30, 16 / 9, 0.05, 100);
  fgScene.environment = gradientEnvironment(ctx.renderer, `vec3 c=mix(vec3(.02,.02,.05),vec3(.25,.33,.9),smoothstep(-.2,.9,vP.y)); c+=vec3(.8,.6,1.4)*pow(max(dot(vP,normalize(vec3(.4,.2,-1.))),0.),6.)*1.6; gl_FragColor=vec4(c,1.);`);
  fgScene.environmentIntensity = 0.8;
  fgScene.add(new THREE.HemisphereLight("#3d4a90", "#0b0c1d", 0.45));
  const rimA = new THREE.DirectionalLight("#8ea6ff", 4.0), rimB = new THREE.DirectionalLight("#9a7cff", 3.2), top = new THREE.DirectionalLight("#c9d6ff", 1.2);
  fgScene.add(rimA, rimB, top);

  const DW = 12;
  const wallMat = new THREE.ShaderMaterial({
    uniforms: { uC: { value: new THREE.Vector2() }, uR: { value: 2.7 }, uHalf: { value: new THREE.Vector2(5.7, 3.2) } },
    vertexShader: `varying vec2 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xy; gl_Position=projectionMatrix*viewMatrix*w; }`,
    fragmentShader: NOISE + `varying vec2 vW; uniform vec2 uC,uHalf; uniform float uR;
void main(){ float d=distance(vW,uC); if(d<uR) discard;
  vec2 uv=vW/uHalf*.5+.5;
  vec3 c=mix(vec3(.012,.03,.09),vec3(.04,.07,.21),smoothstep(0.,1.,uv.x));
  c+=vec3(.25,.18,.65)*exp(-pow((d-uR)/.9,2.))*.35;
  float s=step(.9965,hash(floor(vW*42.)))*.8; c+=vec3(s);
  gl_FragColor=vec4(c,1.); }`,
  });
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), wallMat);
  wall.position.z = -DW;
  fgScene.add(wall);
  const frame = mechRing({ R1: 1.0, R2: 1.16, depth: 0.22, segs: 36, slit: "#9a7cff", altEvery: 4, slitAlt: "#61E2EB", seed: 8, metal: "#14162a", lip: "#9b7bff", slitK: 1.6 });
  frame.rotation.y = THREE.MathUtils.degToRad(-14);
  fgScene.add(frame);
  const ringLight = new THREE.PointLight("#a184ff", 6, 0, 2);
  fgScene.add(ringLight);

  // cliff ledge: dark rock with a tiled top (KF22 foreground)
  const ledge = new THREE.Group();
  {
    const r = rng(4);
    const rockM = new THREE.MeshStandardMaterial({ color: "#121326", roughness: 0.92, flatShading: true });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 1.6, 2.4, 9, 4), rockM);
    body.position.y = -1.25;
    body.scale.set(1.25, 1, 0.9);
    const p = body.geometry.attributes.position as THREE.BufferAttribute, vv = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) { vv.fromBufferAttribute(p, i); if (vv.y < 1.15) { vv.x *= 0.88 + r() * 0.24; vv.z *= 0.88 + r() * 0.24; } p.setXYZ(i, vv.x, vv.y, vv.z); }
    body.geometry.computeVertexNormals();
    ledge.add(body);
    const tileM = [new THREE.MeshStandardMaterial({ color: "#191b33", roughness: 0.55, metalness: 0.15 }), new THREE.MeshStandardMaterial({ color: "#131528", roughness: 0.75, metalness: 0.1 }), new THREE.MeshStandardMaterial({ color: "#1f2240", roughness: 0.45, metalness: 0.2 })];
    const tg = new RoundedBoxGeometry(0.34, 0.08, 0.34, 2, 0.012);
    for (let ix = -6; ix <= 6; ix++) for (let iz = -4; iz <= 4; iz++) {
      const x = ix * 0.36, z = iz * 0.36;
      if (Math.hypot(x / 1.25 / 2.6, z / 0.9 / 2.6) > 0.84 - r() * 0.06) continue;
      const t = new THREE.Mesh(tg, tileM[Math.floor(r() * 3)]);
      t.position.set(x, (r() - 0.5) * 0.02, z);
      t.rotation.set((r() - 0.5) * 0.04, (r() - 0.5) * 0.05, (r() - 0.5) * 0.04);
      ledge.add(t);
    }
    ledge.rotation.y = 0.2;
  }
  fgScene.add(ledge);

  const player = new THREE.Group();
  fgScene.add(player);
  rimA.target = player; rimB.target = player; top.target = player;
  const head = new THREE.Vector3(0, 1.66, 0);

  const cubes: { g: THREE.Group; sx: number; sy: number; d: number; size: number; spin: THREE.Vector3; ph: number }[] = [];
  ([[0.61, 0.2, 9, 0.09], [0.93, 0.22, 9.5, 0.1], [0.92, 0.69, 8, 0.13], [0.68, 0.32, 10, 0.03], [0.83, 0.4, 10, 0.025], [0.975, 0.58, 9, 0.026]] as number[][]).forEach(([sx, sy, d, size], i) => {
    const g = makeCube("dark");
    fgScene.add(g);
    cubes.push({ g, sx, sy, d, size, spin: new THREE.Vector3(0.12 + i * 0.03, 0.2 - i * 0.02, 0.05), ph: i * 1.3 });
  });

  const layout = { aspect: 16 / 9, mobile: false };
  const screenToWorld = (sx: number, sy: number, d: number, _cam: THREE.PerspectiveCamera, out: THREE.Vector3) => {
    const halfH = d * Math.tan(THREE.MathUtils.degToRad(15)), halfW = halfH * layout.aspect;
    return out.set((sx * 2 - 1) * halfW, (1 - sy * 2) * halfH, -d);
  };
  const tmp = new THREE.Vector3(), headW = new THREE.Vector3(), proj = new THREE.Vector3();

  function place() {
    const mobile = layout.mobile;
    const halfH = DW * Math.tan(THREE.MathUtils.degToRad(15)), halfW = halfH * layout.aspect;
    const cx = mobile ? 0.5 : 0.78, cy = mobile ? 0.68 : 0.46;
    const radius = mobile ? Math.min(0.46 * 2 * halfW, 0.3 * 2 * halfH) : 0.42 * 2 * halfH;
    screenToWorld(cx, cy, DW, fgCam, tmp);
    wall.scale.set(halfW * 2.4, halfH * 2.4, 1);
    wallMat.uniforms.uC.value.set(tmp.x, tmp.y);
    wallMat.uniforms.uR.value = radius;
    wallMat.uniforms.uHalf.value.set(halfW, halfH);
    frame.position.set(tmp.x, tmp.y, -DW + 0.25);
    frame.scale.setScalar(radius * 0.995);
    ringLight.position.set(tmp.x + radius * 0.2, tmp.y, -DW + 1.2);
    // player: x 56 %, feet at 97 % vh, 58 % vh tall → depth 5.78
    const pd = mobile ? 7.2 : 5.78;
    screenToWorld(mobile ? 0.5 : 0.56, mobile ? 0.985 : 0.972, pd, fgCam, tmp);
    player.position.copy(tmp);
    ledge.position.set(tmp.x + 0.45, tmp.y, tmp.z + 0.35);
    ledge.scale.setScalar(0.62);
    rimA.position.copy(tmp).add(new THREE.Vector3(2.5, 1.6, -3));
    rimB.position.copy(tmp).add(new THREE.Vector3(-2.6, 1.2, -3));
    top.position.copy(tmp).add(new THREE.Vector3(0.3, 4, -1));
    cubes.forEach((c, i) => {
      const sx = mobile ? [0.14, 0.86, 0.85, 0.3, 0.7, 0.92][i] : c.sx, sy = mobile ? [0.5, 0.48, 0.78, 0.6, 0.58, 0.7][i] : c.sy;
      screenToWorld(sx, sy, c.d, fgCam, tmp);
      c.g.position.copy(tmp);
      c.g.userData.base = tmp.clone();
      const hh = c.d * Math.tan(THREE.MathUtils.degToRad(15));
      c.g.scale.setScalar(((c.size * 2 * hh * layout.aspect) / 1.6) * (mobile ? 1.6 : 1));
    });
    // vista framing inside the opening: zoom ×1.15 and shift so the spire sits at ~75 % / 12 %
    camera.setViewOffset(1000 * layout.aspect, 1000, mobile ? 120 : -44 * layout.aspect, mobile ? -40 : -100, 1000 * layout.aspect, 1000);
  }

  const world: World = {
    scene,
    camera,
    fg: { scene: fgScene, camera: fgCam },
    bloom: { strength: 0.42, radius: 0.35, threshold: 0.85 },
    exposure: 1,
    attachCharacter(c) {
      const m = c.clone(true);
      m.updateMatrixWorld(true);
      const v = new THREE.Vector3();
      m.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
        mat.emissiveIntensity = 2.2;
        mat.envMapIntensity = 0.35;
        mesh.material = mat;
        const pos = mesh.geometry.attributes.position as THREE.BufferAttribute;
        const pts: THREE.Vector3[] = [];
        let maxY = -1e9;
        for (let i = 0; i < pos.count; i += 3) { v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld); pts.push(v.clone()); maxY = Math.max(maxY, v.y); }
        let sx = 0, sz = 0, n = 0;
        for (const p of pts) if (p.y > maxY - 0.24) { sx += p.x; sz += p.z; n++; }
        if (n) head.set(sx / n, maxY - 0.13, sz / n);
      });
      m.rotation.y = Math.PI + THREE.MathUtils.degToRad(16);
      player.add(m);
    },
    update(f: FrameCtx) {
      const t = f.time;
      vista.winMat.uniforms.uTime.value = t;
      vista.cloudMats.forEach((m) => (m.uniforms.uTime.value = t));
      const pulse = 0.85 + 0.15 * Math.sin(t * (Math.PI * 2) / 1.6);
      vista.beamMat.uniforms.uK.value = pulse;
      vista.haloMat.uniforms.uK.value = pulse;
      vista.islands.children.forEach((g) => { g.position.y = (g.userData.y0 as number) + Math.sin(t * 0.25 + (g.userData.ph as number)) * 6; });
      // pointer parallax per depth
      const px = f.pointer.x, py = f.pointer.y;
      camera.position.set(camBase.x + px * 18, camBase.y - py * 8, camBase.z);
      camera.lookAt(lookBase);
      cubes.forEach((c) => {
        const b = c.g.userData.base as THREE.Vector3 | undefined;
        if (!b) return;
        c.g.rotation.x += c.spin.x * f.dt;
        c.g.rotation.y += c.spin.y * f.dt;
        c.g.position.set(b.x - px * 0.05 * c.d * 0.1, b.y + Math.sin(t * 0.8 + c.ph) * 0.06 * c.d * 0.1 + py * 0.02, b.z);
      });
      // Dive: T11 push → T12 reach the headset → T13 through the visor
      const dive = f.chapter === "dive" ? f.p : 0;
      headW.copy(head);
      player.children[0]?.localToWorld(headW);
      if (!player.children[0]) headW.copy(player.position).add(new THREE.Vector3(0, 1.66, 0));
      const k1 = easeInOut(span(dive, 0, 0.42)), k2 = easeInOut(span(dive, 0.4, 0.75)), k3 = easeIn3(span(dive, 0.71, 1));
      const start = new THREE.Vector3(px * 0.06, -py * 0.04, 0);
      const mid = new THREE.Vector3(lerp(0, headW.x, 0.55), lerp(0, headW.y, 0.5), headW.z + 3.2);
      const near = new THREE.Vector3(headW.x, headW.y + 0.04, headW.z + 0.95);
      const into = new THREE.Vector3(headW.x, headW.y, headW.z + 0.12);
      fgCam.position.copy(start).lerp(mid, k1).lerp(near, k2).lerp(into, k3);
      const look = new THREE.Vector3(0, 0, -20).lerp(headW, smooth(span(dive, 0.05, 0.6)));
      fgCam.lookAt(look);
      fgCam.fov = 30 - k3 * 12;
      fgCam.updateProjectionMatrix();
      // the vista follows a little of the push (depth cue)
      camera.position.z -= k1 * 160 + k2 * 120;
      camera.position.y -= k1 * 20;
      // publish the head's screen position for the holo-HUD overlay
      proj.copy(headW).project(fgCam);
      const dist = fgCam.position.distanceTo(headW);
      ctx.publish({ "--hx": `${((proj.x * 0.5 + 0.5) * f.width).toFixed(1)}px`, "--hy": `${((1 - (proj.y * 0.5 + 0.5)) * f.height).toFixed(1)}px`, "--hs": (0.95 / Math.max(0.15, dist)).toFixed(3) });
      world.bloom.strength = 0.42 + k2 * 0.25;
    },
    resize(w, h) {
      layout.aspect = w / h;
      layout.mobile = w / h < 0.9;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      fgCam.aspect = w / h;
      fgCam.updateProjectionMatrix();
      place();
    },
    dispose() {
      disposeObject(scene);
      disposeObject(fgScene);
      vista.texCache.forEach((t) => t.dispose());
      fgScene.environment?.dispose();
    },
  };
  return world;
}
