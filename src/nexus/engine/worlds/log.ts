/**
 * CH13 Player Log (KF64–KF66): the player faces the camera, lit by pink and cyan neon rims.
 * T32 (reverse): a blue wireframe hologram resolves into the solid player. The backdrop crossfades
 * from violet space with cubes to the neon city (our own Hub render) past p .5.
 * Publishes both controllers' screen positions so the DOM ribbons and log connectors stay attached.
 */
import * as THREE from "three";
import { NOISE, stars, makeCube, gradientEnvironment, span, smooth, lerp, disposeObject } from "../lib";
import type { World, WorldContext, FrameCtx } from "../types";

export function buildLog(ctx: WorldContext): World {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(24.4, 16 / 9, 0.05, 300);
  scene.add(camera);
  scene.environment = gradientEnvironment(ctx.renderer, `vec3 c=mix(vec3(.05,.03,.12),vec3(.35,.25,.75),smoothstep(-.3,.8,vP.y)); gl_FragColor=vec4(c,1.);`);
  scene.environmentIntensity = 0.35;
  scene.add(new THREE.HemisphereLight("#5a4fb0", "#120c2a", 0.5));
  const key = new THREE.DirectionalLight("#c8d2ff", 1.6), pink = new THREE.DirectionalLight("#ff5fd2", 4.2), cyan = new THREE.DirectionalLight("#5fd8ff", 4.2), back = new THREE.DirectionalLight("#8a6cff", 1.5);
  scene.add(key, pink, cyan, back);

  const city = new THREE.TextureLoader().load("/nexus/plates/hub.jpg");
  city.colorSpace = THREE.SRGBColorSpace;
  const bgMat = new THREE.ShaderMaterial({
    depthWrite: false,
    uniforms: { uTime: { value: 0 }, uCity: { value: city }, uMix: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: NOISE + `varying vec2 vUv; uniform float uTime,uMix; uniform sampler2D uCity;
void main(){ vec2 uv=vUv; vec3 c=mix(vec3(.027,.027,.094),vec3(.16,.11,.38),smoothstep(0.,1.,uv.x*.8+uv.y*.2));
  float n=fbm(uv*3.2+vec2(uTime*.01,0.)); c+=vec3(.24,.14,.52)*smoothstep(.4,.9,n)*smoothstep(.3,1.,uv.x)*.8;
  vec3 cityC=texture2D(uCity, uv*vec2(.9,.9)+vec2(.05,.05)).rgb; cityC=pow(cityC,vec3(2.2))*1.4;
  float m=uMix*smoothstep(.15,.75,uv.x);
  gl_FragColor=vec4(mix(c,cityC,m),1.); }`,
  });
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), bgMat);
  bg.position.z = -60;
  camera.add(bg);
  const st = stars(scene, { n: 900, r: 40, size: 1.6, seed: 23, opacity: 0.7 });

  const cubes: { g: THREE.Group; base: THREE.Vector3; ph: number }[] = [];
  ([[-1.55, 1.95, -2.2, "glass", 0.32], [1.75, 2.05, -2.6, "glass", 0.4], [-1.2, 1.15, -1.0, "dark", 0.2], [1.05, 1.55, -0.8, "dark", 0.17], [1.5, 0.6, -1.4, "glass", 0.2], [-1.9, 0.25, -2.0, "glass", 0.45], [0.75, 2.25, -1.6, "dark", 0.12]] as [number, number, number, "glass" | "dark", number][]).forEach(([x, y, z, k, s], i) => {
    const g = makeCube(k);
    g.scale.setScalar(s / 1.6 * 1.6);
    g.position.set(x, y, z);
    g.rotation.set(i, i * 2, i * 0.5);
    scene.add(g);
    cubes.push({ g, base: new THREE.Vector3(x, y, z), ph: i * 1.3 });
  });

  const player = new THREE.Group();
  player.rotation.y = THREE.MathUtils.degToRad(8);
  scene.add(player);
  key.target = player; pink.target = player; cyan.target = player; back.target = player;
  key.position.set(0.6, 2.6, 3); pink.position.set(-3, 1.6, -1.2); cyan.position.set(3, 1.6, -1.2); back.position.set(0, 3, -3);
  const solidMats: THREE.MeshStandardMaterial[] = [];
  const holoMat = new THREE.MeshBasicMaterial({ color: new THREE.Color("#6B8BFF").multiplyScalar(1.6), wireframe: true, transparent: true, opacity: 0, toneMapped: false, depthWrite: false });
  const ctrlL = new THREE.Vector3(-0.45, 1.2, 0.2), ctrlR = new THREE.Vector3(0.42, 0.95, 0.1);
  const tmp = new THREE.Vector3();

  const world: World = {
    scene,
    camera,
    bloom: { strength: 0.6, radius: 0.45, threshold: 0.75 },
    exposure: 1,
    attachCharacter(c) {
      const m = c.clone(true);
      m.updateMatrixWorld(true);
      const meshes: THREE.Mesh[] = [];
      m.traverse((o) => { if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh); });
      meshes.forEach((mesh) => {
        const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
        mat.emissiveIntensity = 3.0;
        mat.transparent = true;
        solidMats.push(mat);
        mesh.material = mat;
        const holo = new THREE.Mesh(mesh.geometry, holoMat);
        mesh.add(holo);
        // controllers = the outermost vertex clusters (arms extended)
        const pos = mesh.geometry.attributes.position as THREE.BufferAttribute;
        const pts: THREE.Vector3[] = [];
        for (let i = 0; i < pos.count; i += 2) pts.push(new THREE.Vector3().fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld));
        let minX = 1e9, maxX = -1e9;
        for (const p of pts) { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); }
        const acc = (sel: (x: number) => boolean, out: THREE.Vector3) => { const s = new THREE.Vector3(); let n = 0; for (const p of pts) if (sel(p.x)) { s.add(p); n++; } if (n) out.copy(s.divideScalar(n)); };
        acc((x) => x < minX + 0.07, ctrlL);
        acc((x) => x > maxX - 0.07, ctrlR);
      });
      player.add(m);
    },
    update(f: FrameCtx) {
      const p = f.p, t = f.time;
      bgMat.uniforms.uTime.value = t;
      bgMat.uniforms.uMix.value = smooth(span(p, 0.45, 0.7));
      // T32 reverse: hologram → solid
      const solid = smooth(span(p, 0.04, 0.2));
      solidMats.forEach((m) => { m.opacity = solid; m.depthWrite = solid > 0.98; });
      holoMat.opacity = (1 - solid) * 0.85;
      // gentle ±12° orbit while the log writes in
      const orbit = THREE.MathUtils.degToRad(lerp(-6, 6, smooth(span(p, 0.2, 0.85)))) + f.pointer.x * 0.03;
      const dist = 2.25;
      camera.position.set(Math.sin(orbit) * dist + 0.08, 1.22 - f.pointer.y * 0.03, Math.cos(orbit) * dist);
      camera.lookAt(0.08, 1.08, 0);
      cubes.forEach((c, i) => { c.g.rotation.x += 0.12 * f.dt; c.g.rotation.y += (0.18 - i * 0.02) * f.dt; c.g.position.set(c.base.x, c.base.y + Math.sin(t * 0.7 + c.ph) * 0.04, c.base.z); });
      st.rotation.y = t * 0.01;
      const hh = 60 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      bg.scale.set(hh * 2 * camera.aspect * 1.1, hh * 2 * 1.1, 1);
      // controller anchors for the DOM ribbons
      const out: Record<string, string> = {};
      for (const [k, v] of [["l", ctrlL], ["r", ctrlR]] as const) {
        tmp.copy(v);
        if (player.children[0]) player.children[0].localToWorld(tmp);
        else tmp.applyMatrix4(player.matrixWorld);
        tmp.project(camera);
        out[`--${k}x`] = `${((tmp.x * 0.5 + 0.5) * f.width).toFixed(1)}px`;
        out[`--${k}y`] = `${((1 - (tmp.y * 0.5 + 0.5)) * f.height).toFixed(1)}px`;
      }
      ctx.publish(out);
    },
    resize(w, h) { camera.aspect = w / h; camera.updateProjectionMatrix(); },
    dispose() { disposeObject(scene); city.dispose(); scene.environment?.dispose(); },
  };
  return world;
}
