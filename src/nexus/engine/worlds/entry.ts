/**
 * CH02 World Entry (KF08/KF09): head-on plasma inside a thick segmented torus, spiral into a
 * white core with an anamorphic flare, rocky ground with ruined towers in fog, bokeh rain.
 * Dolly (measured): portal width 38.5 % → 99.4 % between 1.2 s and 3.0 s, then the threshold.
 */
import * as THREE from "three";
import { portalMaterial, glowMaterial, mechRing, fogMaterial, rng, stars, skyGradient, gradientEnvironment, span, easeIn3, lerp, disposeObject } from "../lib";
import type { World, WorldContext, FrameCtx } from "../types";

export function buildEntry(ctx: WorldContext): World {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2("#1c1d4a", 0.022);
  const camera = new THREE.PerspectiveCamera(40, 16 / 9, 0.1, 2000);
  scene.add(camera);
  skyGradient(scene, [[-0.1, "#26265e"], [0.05, "#232458"], [0.3, "#121238"], [0.7, "#07081c"]], 1500);
  stars(scene, { n: 1200, r: 900, size: 1.2, seed: 5, opacity: 0.6 });
  scene.environment = gradientEnvironment(ctx.renderer, `vec3 c=mix(vec3(.03,.03,.08),vec3(.2,.18,.5),smoothstep(-.3,.6,vP.y)); c+=vec3(.7,.5,1.3)*pow(max(dot(vP,vec3(0.,0.,-1.)),0.),4.)*1.5; gl_FragColor=vec4(c,1.);`);
  scene.environmentIntensity = 1.2;
  scene.add(new THREE.HemisphereLight("#5c5ab0", "#08081a", 0.5));

  const PC = new THREE.Vector3(0, 4.3, 0), PR = 3.45;
  const ring = mechRing({ R1: 1.0, R2: 1.36, depth: 0.5, segs: 24, slit: "#61E2EB", seed: 9, slitK: 1.4, slitP: 0.7, metal: "#20233a" });
  ring.scale.setScalar(PR);
  ring.position.copy(PC);
  scene.add(ring);
  const outer = mechRing({ R1: 1.4, R2: 1.5, depth: 0.3, segs: 36, slit: "#9a7cff", seed: 3, slitK: 1.0, slitP: 0.3, metal: "#171a2c" });
  outer.scale.setScalar(PR);
  outer.position.copy(PC);
  outer.position.z -= 0.6;
  scene.add(outer);
  const pm = portalMaterial({ mode: 1, twist: 6.0, fil: 1.3, rim: 1.7, core: 1.5, sigma: 0.13, seed: 3.3, gain: 1.1, omega: 0.5 });
  const mem = new THREE.Mesh(new THREE.PlaneGeometry(2 * PR, 2 * PR), pm);
  mem.position.copy(PC);
  mem.position.z += 0.1;
  mem.renderOrder = 5;
  scene.add(mem);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(4 * PR, 4 * PR), glowMaterial("#8f6dff", { inner: 1.0, tight: 0.04, wide: 0.3, k1: 0.5, k2: 0.1 }));
  glow.position.copy(PC);
  glow.position.z += 0.05;
  glow.renderOrder = 4;
  scene.add(glow);
  const flareMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, uniforms: { uK: { value: 1 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `varying vec2 vUv; uniform float uK; void main(){ float y=abs(vUv.y-.5)*2.; float x=abs(vUv.x-.5)*2.; float g=exp(-y*y/.004)*exp(-x*x/.08)*1.6 + exp(-y*y/.02)*exp(-x*x/.6)*.35; gl_FragColor=vec4(vec3(.85,.78,1.)*g*uK,1.); }`,
  });
  const flare = new THREE.Mesh(new THREE.PlaneGeometry(40, 1.2), flareMat);
  flare.position.copy(PC);
  flare.position.z += 0.2;
  flare.renderOrder = 6;
  scene.add(flare);
  const pl = new THREE.PointLight("#9a78ff", 220, 0, 2);
  pl.position.copy(PC).add(new THREE.Vector3(0, 0, 2));
  scene.add(pl);
  const pl2 = new THREE.PointLight("#b9a0ff", 60, 0, 2);
  pl2.position.set(0, 0.6, 3);
  scene.add(pl2);

  {
    const g = new THREE.PlaneGeometry(120, 80, 240, 160);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position as THREE.BufferAttribute;
    const r = rng(3);
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i);
      const n = Math.sin(x * 0.7 + z * 0.3) * 0.15 + Math.sin(x * 1.9 - z * 1.3) * 0.08 + (r() - 0.5) * 0.12;
      const crater = Math.abs(x) < 4 && z > -3 && z < 6 ? -0.15 : 0;
      p.setY(i, n + crater + Math.max(0, (Math.abs(x) - 8) * 0.06));
    }
    g.computeVertexNormals();
    scene.add(new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: "#1a1934", roughness: 0.55, metalness: 0.35, flatShading: true })));
    const rockM = new THREE.MeshStandardMaterial({ color: "#16152c", roughness: 0.8, flatShading: true });
    for (let i = 0; i < 90; i++) {
      const s = 0.15 + Math.pow(r(), 2) * 0.9;
      const x = (r() - 0.5) * 30;
      if (Math.abs(x) < 2.5) continue;
      const m = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), rockM);
      m.position.set(x, s * 0.3, 8 - r() * 22);
      m.rotation.set(r() * 3, r() * 3, r() * 3);
      m.scale.y = 0.6;
      scene.add(m);
    }
    const r2 = rng(7), tm = new THREE.MeshStandardMaterial({ color: "#121226", roughness: 0.9, metalness: 0.2 });
    for (const side of [-1, 1]) for (let i = 0; i < 14; i++) {
      const x = side * (9 + r2() * 22), z = -4 - r2() * 30, w = 1.2 + r2() * 3, h = 2 + r2() * 9;
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, w * (0.6 + r2() * 0.6)), tm);
      m.position.set(x, h / 2 - 0.2, z);
      m.rotation.set(0, r2(), (r2() - 0.5) * 0.12);
      scene.add(m);
      if (r2() < 0.35) {
        const wl = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.4, 0.05), new THREE.MeshBasicMaterial({ color: new THREE.Color("#78D8EF").multiplyScalar(1.6), toneMapped: false }));
        wl.position.set(x - side * w * 0.3, h * (0.3 + r2() * 0.5), z + w * 0.5);
        scene.add(wl);
      }
    }
  }
  const fogMats: THREE.ShaderMaterial[] = [];
  ([[-9, 1.0, 2, 14, 3.5, 2.2, [0.9, 0.5]], [9, 1.0, 2, 14, 3.5, 3.9, [0.1, 0.5]], [-12, 1.6, -8, 18, 5, 5.1, [0.9, 0.5]], [12, 1.6, -8, 18, 5, 6.6, [0.1, 0.5]], [0, 0.4, 5, 26, 1.8, 8.3, [0.5, 0.9]]] as [number, number, number, number, number, number, [number, number]][]).forEach(([x, y, z, w, h, s, lp]) => {
    const mat = fogMaterial({ seed: s, litPos: lp, opacity: 0.85, shadow: "#1a1b40", lit: "#6d68a8" });
    fogMats.push(mat);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    f.position.set(x, y, z);
    f.renderOrder = 7;
    scene.add(f);
  });

  // BG03 bokeh rain: soft discs attached to the camera, falling and swaying
  const N = 110, bpos = new Float32Array(N * 3), bsz = new Float32Array(N), bcol = new Float32Array(N * 3), seeds = new Float32Array(N);
  const br = rng(13);
  for (let i = 0; i < N; i++) {
    const d = 2 + Math.pow(br(), 1.3) * 16;
    bpos.set([(br() - 0.5) * d * 1.6, (br() - 0.5) * d * 0.9, -d], i * 3);
    bsz[i] = 3 + Math.pow(1 - (d - 2) / 16, 2.6) * 30 + br() * 4;
    const c = br() < 0.58 ? new THREE.Color("#61E2EB") : new THREE.Color("#E374BC");
    bcol.set([c.r, c.g, c.b], i * 3);
    seeds[i] = br() * 100;
  }
  const bg = new THREE.BufferGeometry();
  bg.setAttribute("position", new THREE.BufferAttribute(bpos, 3));
  bg.setAttribute("aSize", new THREE.BufferAttribute(bsz, 1));
  bg.setAttribute("aCol", new THREE.BufferAttribute(bcol, 3));
  bg.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  const bmat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, fog: false,
    uniforms: { uTime: { value: 0 }, uScale: { value: 1 }, uFall: { value: 1 } },
    vertexShader: `attribute float aSize; attribute vec3 aCol; attribute float aSeed; uniform float uTime,uScale,uFall; varying vec3 vC; varying float vBlur;
void main(){ vec3 p=position; float d=-p.z; p.y=mod(p.y+.9*d*.5 - uTime*(.08+.04*fract(aSeed))*d*uFall, .9*d)-.45*d; p.x+=sin(uTime*.6+aSeed)*.04*d;
 vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv; gl_PointSize=aSize*uScale; vC=aCol; vBlur=clamp((aSize-20.)/50.,0.,1.); }`,
    fragmentShader: `varying vec3 vC; varying float vBlur; void main(){ vec2 q=gl_PointCoord*2.-1.; float r=length(q); float edge=mix(.92,.35,vBlur); float a=1.-smoothstep(edge,1.,r); a*=mix(.85,.42,vBlur); gl_FragColor=vec4(vC*a,1.); }`,
  });
  const bokeh = new THREE.Points(bg, bmat);
  bokeh.frustumCulled = false;
  camera.add(bokeh);

  const world: World = {
    scene,
    camera,
    bloom: { strength: 0.65, radius: 0.4, threshold: 0.78 },
    exposure: 0.95,
    update(f: FrameCtx) {
      const t = f.p * 3.1;
      pm.uniforms.uTime.value = f.time;
      for (const m of fogMats) m.uniforms.uTime.value = f.time;
      bmat.uniforms.uTime.value = f.time;
      bmat.uniforms.uScale.value = f.height / 720;
      let z: number;
      if (t <= 1.2) z = 14 + (1.2 - t) * 0.3;
      else if (t <= 2.95) { const w = 0.385 + 0.615 * Math.pow(Math.min(1, (t - 1.2) / 1.8), 3); z = (14 * 0.385) / w; }
      else z = lerp((14 * 0.385) / 0.99, 0.15, easeIn3(span(t, 2.95, 3.1)));
      camera.position.set(f.pointer.x * 0.12, lerp(2.2, 4.3, span(t, 1.6, 3.05)) - f.pointer.y * 0.06, z);
      camera.lookAt(0, lerp(3.6, 4.3, span(t, 1.6, 3.05)), -50);
      pm.uniforms.uCore.value = 1.5 + Math.sin(f.time * 1.6) * 0.15 + span(t, 2.6, 3.1) * 6;
      pm.uniforms.uSigma.value = 0.13 + span(t, 2.6, 3.1) * 0.3;
      flareMat.uniforms.uK.value = 1 + span(t, 2.0, 3.0) * 1.5;
      outer.rotation.z = f.time * 0.03;
      world.bloom.strength = 0.65 + span(t, 2.0, 3.0) * 0.9;
    },
    resize(w, h) { camera.aspect = w / h; camera.updateProjectionMatrix(); },
    dispose() { disposeObject(scene); scene.environment?.dispose(); },
  };
  return world;
}
