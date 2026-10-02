/**
 * CH01 The Gate (KF01–KF07): plasma portal, wet tiled walkway, fog banks, rim particles,
 * the player from behind. Camera follows the measured dolly w(t)=.31+.53(t/7.8)³, rises
 * over the player's head and crosses the membrane into the core flare (white-out is the DOM cover).
 */
import * as THREE from "three";
import { Reflector } from "three/addons/objects/Reflector.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { portalMaterial, glowMaterial, fogMaterial, stars, rng, span, easeIn2, easeIn3, lerp, disposeObject } from "../lib";
import type { World, WorldContext, FrameCtx } from "../types";

export function buildGate(ctx: WorldContext): World {
  const { renderer } = ctx;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#02030A");
  const camera = new THREE.PerspectiveCamera(35, 16 / 9, 0.05, 2000);

  const R = 2.15, PZ = -5, PY = 1.95;
  // the city seen through the membrane once it becomes a window (T02)
  const city = new THREE.TextureLoader().load("/nexus/plates/hub.jpg");
  city.colorSpace = THREE.SRGBColorSpace;
  const cityDisc = new THREE.Mesh(new THREE.CircleGeometry(R * 0.995, 96), new THREE.MeshBasicMaterial({ map: city, toneMapped: true, transparent: true, opacity: 0 }));
  cityDisc.position.set(0, PY, PZ - 0.03);
  scene.add(cityDisc);

  const pm = portalMaterial({ mode: 0, twist: 0.9, fil: 0.9, rim: 1.25, core: 0, seed: 2.3, gain: 1.15, omega: 0.15 });
  const portal = new THREE.Mesh(new THREE.PlaneGeometry(2 * R, 2 * R), pm);
  portal.position.set(0, PY, PZ);
  portal.renderOrder = 2;
  scene.add(portal);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(4 * R, 4 * R), glowMaterial("#7a5cff", { inner: 1.0, tight: 0.04, wide: 0.3, k1: 0.35, k2: 0.06 }));
  glow.position.set(0, PY, PZ - 0.02);
  glow.renderOrder = 1;
  scene.add(glow);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(R * 1.055, 0.03, 12, 200), new THREE.MeshStandardMaterial({ color: "#151826", metalness: 0.9, roughness: 0.35, emissive: "#3a2a7a", emissiveIntensity: 0.25 }));
  ring.position.set(0, PY, PZ - 0.04);
  scene.add(ring);

  const pl = new THREE.PointLight("#9a78ff", 22, 0, 2);
  pl.position.set(0, PY, PZ + 0.6);
  scene.add(pl);
  const pl2 = new THREE.PointLight("#b79bff", 8, 0, 2);
  pl2.position.set(0, 0.35, PZ + 0.9);
  scene.add(pl2);
  scene.add(new THREE.HemisphereLight("#1d1f45", "#05060d", 0.25));
  {
    const es = new THREE.Scene();
    es.background = new THREE.Color("#020208");
    const d = new THREE.Mesh(new THREE.CircleGeometry(1.15, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color("#8f6dff").multiplyScalar(5.0) }));
    d.position.set(0, 0.9, -8);
    d.lookAt(0, 0, 0);
    es.add(d);
    const d2 = new THREE.Mesh(new THREE.RingGeometry(1.1, 1.3, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color("#d8c8ff").multiplyScalar(5.0), side: THREE.DoubleSide }));
    d2.position.copy(d.position);
    d2.lookAt(0, 0, 0);
    es.add(d2);
    const pmr = new THREE.PMREMGenerator(renderer);
    scene.environment = pmr.fromScene(es, 0.02).texture;
    scene.environmentIntensity = 0.6;
    pmr.dispose();
  }

  const mirrorScale = ctx.quality === "high" ? 0.75 : 0.4;
  const mirror = new Reflector(new THREE.PlaneGeometry(60, 60), { textureWidth: 1024, textureHeight: 576, color: 0x15151d });
  mirror.rotation.x = -Math.PI / 2;
  mirror.position.y = -0.002;
  scene.add(mirror);

  const rnd = rng(11);
  const tileG = new RoundedBoxGeometry(1.94, 0.12, 1.94, 2, 0.025);
  const roughTex = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const x = c.getContext("2d")!;
    x.fillStyle = "#a0a0a0";
    x.fillRect(0, 0, 256, 256);
    const rr = rng(77);
    for (let i = 0; i < 90; i++) {
      const px = rr() * 256, py = rr() * 256, r = 10 + rr() * 60;
      const g = x.createRadialGradient(px, py, 0, px, py, r);
      const v = Math.floor(20 + rr() * 60);
      g.addColorStop(0, `rgba(${v},${v},${v},0.9)`);
      g.addColorStop(1, "rgba(160,160,160,0)");
      x.fillStyle = g;
      x.fillRect(px - r, py - r, 2 * r, 2 * r);
    }
    return new THREE.CanvasTexture(c);
  })();
  const dry = new THREE.MeshStandardMaterial({ color: "#0a0c18", metalness: 0.85, roughness: 1, roughnessMap: roughTex, transparent: true, opacity: 0.97 });
  const wet = new THREE.MeshStandardMaterial({ color: "#080a16", metalness: 0.9, roughness: 0.6, roughnessMap: roughTex, transparent: true, opacity: 0.82 });
  const tiles: { x: number; y: number; z: number; wet: boolean; tilt: number }[] = [];
  for (let ix = -6; ix <= 6; ix++) for (let iz = -3; iz <= 5; iz++) {
    const x = ix * 2, z = PZ + 1 + iz * 2 + 1;
    const walk = Math.abs(x) <= 2;
    if (!walk && rnd() < 0.18) continue;
    tiles.push({ x, y: (walk ? 0 : -0.05) - 0.06 + (rnd() - 0.5) * 0.02, z, wet: (walk && rnd() < 0.55) || rnd() < 0.25, tilt: (rnd() - 0.5) * 0.012 });
  }
  for (const kind of [false, true]) {
    const list = tiles.filter((t) => t.wet === kind);
    const im = new THREE.InstancedMesh(tileG, kind ? wet : dry, list.length);
    const m = new THREE.Matrix4(), e = new THREE.Euler();
    list.forEach((t, i) => { e.set(t.tilt, 0, t.tilt * 0.7); m.makeRotationFromEuler(e); m.setPosition(t.x, t.y, t.z); im.setMatrixAt(i, m); });
    scene.add(im);
  }
  const seamM = new THREE.MeshBasicMaterial({ color: new THREE.Color("#61E2EB").multiplyScalar(0.75), toneMapped: false });
  for (const sx of [-3, 3]) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.01, 20), seamM); s.position.set(sx, 0.005, PZ + 10); scene.add(s); }
  for (const z of [PZ + 2, PZ + 6, PZ + 10, PZ + 14]) { const s = new THREE.Mesh(new THREE.BoxGeometry(6, 0.008, 0.02), new THREE.MeshBasicMaterial({ color: new THREE.Color("#61E2EB").multiplyScalar(0.6), toneMapped: false })); s.position.set(0, 0.004, z); scene.add(s); }

  const fogMats: THREE.ShaderMaterial[] = [];
  const fogs: [number, number, number, number, number, number, [number, number]][] = [
    [-7.5, 1.0, -3.5, 13, 4.2, 1.1, [0.85, 0.55]], [7.5, 1.0, -3.5, 13, 4.2, 2.7, [0.15, 0.55]],
    [-5.6, 0.6, 0.5, 9, 3.2, 4.4, [0.9, 0.6]], [5.8, 0.6, 0.5, 9, 3.2, 6.1, [0.1, 0.6]],
    [-9, 1.6, -9, 16, 5, 7.3, [0.9, 0.4]], [9, 1.6, -9, 16, 5, 8.8, [0.1, 0.4]],
    [-4.2, 0.2, 3.4, 6, 2.0, 9.9, [0.9, 0.7]], [4.4, 0.2, 3.4, 6, 2.0, 12.4, [0.1, 0.7]],
    [-6.5, 0.3, -6.5, 10, 2.4, 14.2, [0.95, 0.6]], [6.5, 0.3, -6.5, 10, 2.4, 15.7, [0.05, 0.6]],
    [0, 0.15, -9, 22, 1.6, 17.1, [0.5, 0.7]], [-3.8, 0.45, -1.5, 5, 1.6, 18.3, [0.95, 0.6]], [3.9, 0.45, -1.5, 5, 1.6, 19.4, [0.05, 0.6]],
  ];
  for (const [x, y, z, w, h, seed, lp] of fogs) {
    const mat = fogMaterial({ seed, litPos: lp, opacity: 0.92, shadow: "#141a35", lit: "#6c679b" });
    fogMats.push(mat);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    f.position.set(x, y, z);
    f.renderOrder = 3;
    scene.add(f);
  }
  stars(scene, { n: 1800, r: 600, size: 1.2, seed: 4, opacity: 0.55 });
  stars(scene, { n: 260, r: 600, size: 2.1, seed: 9, opacity: 0.8 });

  // T01 particle swarm hugging the rim
  const swarm = new THREE.Group();
  swarm.position.set(0, PY, PZ);
  const swarmMat = new THREE.PointsMaterial({ size: 3.0, sizeAttenuation: false, color: new THREE.Color("#f2ecff").multiplyScalar(1.3), transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
  {
    const n = 300, pos = new Float32Array(n * 3), r2 = rng(21);
    for (let i = 0; i < n; i++) {
      let a = r2() * Math.PI * 2;
      if (Math.sin(a) < -0.35 && r2() < 0.7) a = Math.PI - a;
      const rr = R * (1.03 + Math.pow(r2(), 2.4) * 0.6);
      pos.set([Math.cos(a) * rr, Math.sin(a) * rr, (r2() - 0.5) * 1.2], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    swarm.add(new THREE.Points(g, swarmMat));
  }
  scene.add(swarm);

  // the player: back to camera, violet rim from the portal
  const AVZ = -2.2;
  const player = new THREE.Group();
  player.position.set(0, 0, AVZ);
  player.rotation.y = Math.PI;
  player.scale.setScalar(1.22);
  scene.add(player);
  const rimL = new THREE.DirectionalLight("#b58cff", 5.5);
  const rimR = new THREE.DirectionalLight("#a77dff", 5.5);
  rimL.position.set(-1.6, 1.4, AVZ - 1.2);
  rimR.position.set(1.6, 1.4, AVZ - 1.2);
  rimL.target = player;
  rimR.target = player;
  scene.add(rimL, rimR);

  const world: World = {
    scene,
    camera,
    bloom: { strength: 0.55, radius: 0.32, threshold: 0.9 },
    exposure: 0.9,
    attachCharacter(c) {
      const m = c.clone(true);
      m.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh) {
          const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
          mat.emissiveIntensity = 1.6;
          mat.envMapIntensity = 0.15;
          mesh.material = mat;
        }
      });
      player.add(m);
    },
    update(f: FrameCtx) {
      const t = f.p * 9.9;
      pm.uniforms.uTime.value = f.time;
      for (const m of fogMats) m.uniforms.uTime.value = f.time;
      // dolly (measured): portal share of width w(t) for t ≤ 7.8, then accelerate through
      let z: number, y: number;
      if (t <= 7.8) {
        const w = 0.31 + 0.53 * Math.pow(t / 7.8, 3);
        z = PZ + (12 * 0.31) / w;
        const near = span(AVZ + 3.4 - z, 0, 3.2);
        y = 1.5 + easeIn2(near) * 1.05;
      } else {
        const k = easeIn3(span(t, 7.8, 8.9));
        z = lerp(PZ + (12 * 0.31) / 0.84, PZ + 0.32, k);
        y = lerp(2.55, PY, k);
      }
      const px = f.pointer.x * 0.08 * (1 - span(t, 6, 8));
      camera.position.set(px, y - f.pointer.y * 0.04, z);
      camera.lookAt(px * 0.3, lerp(1.5, PY, span(t, 7.8, 8.9)) - span(t, 6.5, 7.8) * 0.25, PZ - 100);
      // plasma: idle → window (T02) → vortex spin-up (T03) → core flare (T04)
      const vort = easeIn2(span(t, 4.5, 7.9));
      pm.uniforms.uTwist.value = 0.9 + vort * 14;
      pm.uniforms.uOmega.value = 0.15 + vort * 2.25;
      pm.uniforms.uRim.value = 1.25 + vort * 0.7;
      pm.uniforms.uFil.value = 0.9 + vort * 0.4;
      const win = span(t, 3.4, 4.6) * (1 - span(t, 4.8, 6.4));
      pm.uniforms.uWindow.value = win;
      (cityDisc.material as THREE.MeshBasicMaterial).opacity = win;
      const flare = span(t, 8.3, 9.4);
      pm.uniforms.uCore.value = flare * 7;
      pm.uniforms.uSigma.value = 0.04 + flare * 0.3;
      // swarm (T01 from 2.8 s) orbits outward
      swarmMat.opacity = span(t, 2.6, 3.4) * (1 - span(t, 8.6, 9.2) * 0.6);
      swarm.rotation.z = f.time * 0.06 + t * 0.15;
      swarm.scale.setScalar(1 + span(t, 2.8, 8) * 0.12);
      world.bloom.strength = 0.55 + span(t, 6.5, 9.0) * 1.3;
      world.bloom.threshold = 0.9 - span(t, 7.8, 9.4) * 0.35;
      player.visible = z > AVZ - 0.2;
    },
    resize(w, h) {
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      mirror.getRenderTarget().setSize(Math.round(w * mirrorScale), Math.round(h * mirrorScale));
    },
    dispose() {
      disposeObject(scene);
      mirror.dispose();
      city.dispose();
      roughTex.dispose();
      scene.environment?.dispose();
    },
  };
  return world;
}
