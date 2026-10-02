/**
 * Shared deep-space backdrops (BG01/BG04/BG08) for CH07 Menu, CH12 Abilities, CH14 Vault, CH15 Finale:
 * an fbm nebula, a three-depth star field and floating glass cubes laid out per chapter in screen terms.
 * The Menu also carries the glowing iso cube that turns toward the hovered chip.
 */
import * as THREE from "three";
import { NOISE, stars, makeCube, makeMenuCube, gradientEnvironment, lerp, disposeObject } from "../lib";
import type { World, WorldContext, FrameCtx } from "../types";

type CubeSpec = [sx: number, sy: number, size: number, kind: "glass" | "dark", depth: number];
const LAYOUT: Record<string, CubeSpec[]> = {
  // px of the 1280×720 artboards → fractions
  menu: [[0.035, 0.11, 0.115, "glass", 9], [0.95, 0.15, 0.15, "glass", 8], [0.29, 0.5, 0.1, "glass", 11], [0.05, 0.8, 0.165, "glass", 8], [0.34, 0.86, 0.072, "glass", 10], [0.93, 0.45, 0.052, "glass", 11], [0.88, 0.62, 0.075, "glass", 10], [0.73, 0.07, 0.066, "glass", 12]],
  abilities: [],
  vault: [[0.06, 0.2, 0.04, "glass", 14], [0.96, 0.85, 0.05, "glass", 14]],
  finale: [[0.18, 0.17, 0.058, "glass", 10], [0.23, 0.26, 0.033, "glass", 11], [0.87, 0.78, 0.1, "glass", 8], [0.94, 0.7, 0.042, "glass", 9]],
};
const PALETTE: Record<string, [string, string, string, number]> = {
  // [deep, mid, cloud, cloud strength]
  menu: ["#0a0e24", "#161c44", "#3a2a6e", 0.55],
  abilities: ["#03050c", "#0b1838", "#16305e", 0.25],
  vault: ["#02040c", "#0b1532", "#1a2a5c", 0.3],
  finale: ["#030B18", "#08162F", "#14244a", 0.25],
};

export function buildSpace(ctx: WorldContext): World {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 16 / 9, 0.1, 400);
  scene.add(camera);
  scene.environment = gradientEnvironment(ctx.renderer, `vec3 c=mix(vec3(.02,.02,.06),vec3(.3,.25,.75),smoothstep(-.3,.8,vP.y)); c+=vec3(.6,.5,1.3)*pow(max(dot(vP,normalize(vec3(.6,.4,.7))),0.),20.)*2.; gl_FragColor=vec4(c,1.);`);
  scene.environmentIntensity = 1.1;
  scene.add(new THREE.HemisphereLight("#5040a0", "#05050f", 0.6));
  const key = new THREE.DirectionalLight("#c7d2ff", 1.4);
  key.position.set(2, 4, 3);
  scene.add(key);

  const neb = new THREE.ShaderMaterial({
    depthWrite: false,
    uniforms: { uTime: { value: 0 }, uDeep: { value: new THREE.Color() }, uMid: { value: new THREE.Color() }, uCloud: { value: new THREE.Color() }, uK: { value: 0.5 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: NOISE + `varying vec2 vUv; uniform float uTime,uK; uniform vec3 uDeep,uMid,uCloud;
void main(){ vec2 uv=vUv; vec2 dr=vec2(uTime*.004,0.);
  vec3 c=mix(uDeep,uMid,smoothstep(0.,1.,uv.x*.7+uv.y*.2));
  vec2 w=vec2(fbm(uv*3.+dr),fbm(uv*3.+5.+dr)); float n=fbm(uv*3.5+w*2.+dr*2.);
  float right=smoothstep(.35,1.,uv.x)*smoothstep(0.,.8,uv.y);
  c+=uCloud*smoothstep(.35,.9,n)*right*uK*1.4;
  c+=uCloud*.25*exp(-pow(distance(uv,vec2(.5,.5))/.5,2.))*uK;
  gl_FragColor=vec4(c,1.); }`,
  });
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), neb);
  bg.position.z = -150;
  camera.add(bg);
  const farStars = stars(scene, { n: 1600, r: 120, size: 1.2, seed: 31, opacity: 0.7 });
  const nearStars = stars(scene, { n: 220, r: 60, size: 2.2, seed: 37, opacity: 0.6 });

  const groups: Record<string, THREE.Group> = {};
  const all: { g: THREE.Group; spec: CubeSpec; spin: THREE.Vector3; ph: number }[] = [];
  for (const [chapter, specs] of Object.entries(LAYOUT)) {
    const grp = new THREE.Group();
    specs.forEach((spec, i) => {
      const g = makeCube(spec[3]);
      g.rotation.set(i * 0.7, i * 1.3, i * 0.4);
      grp.add(g);
      all.push({ g, spec, spin: new THREE.Vector3(0.08 + (i % 3) * 0.04, 0.12 - (i % 2) * 0.05, 0.03), ph: i * 1.1 });
    });
    groups[chapter] = grp;
    scene.add(grp);
  }
  // CH07 centre: the glowing iso cube
  const menuCube = makeMenuCube();
  const iso = new THREE.Group();
  iso.add(menuCube);
  menuCube.rotation.set(THREE.MathUtils.degToRad(35.264), THREE.MathUtils.degToRad(45), 0);
  const isoGlow = new THREE.PointLight("#4a9bff", 8, 0, 2);
  iso.add(isoGlow);
  groups.menu.add(iso);

  const view = { aspect: 16 / 9 };
  const toWorld = (sx: number, sy: number, d: number, out: THREE.Vector3) => {
    const hh = d * Math.tan(THREE.MathUtils.degToRad(15)), hw = hh * view.aspect;
    return out.set((sx * 2 - 1) * hw, (1 - sy * 2) * hh, -d);
  };
  const tmp = new THREE.Vector3();
  let yaw = 0;
  const isoBase = new THREE.Vector3();
  function place() {
    for (const c of all) {
      toWorld(c.spec[0], c.spec[1], c.spec[4], tmp);
      c.g.userData.base = tmp.clone();
      const hw = c.spec[4] * Math.tan(THREE.MathUtils.degToRad(15)) * view.aspect;
      c.g.scale.setScalar((c.spec[2] * 2 * hw) / 1.6);
    }
    toWorld(0.494, 0.486, 9, tmp);
    iso.position.copy(tmp);
    isoBase.copy(tmp);
    const hw = 9 * Math.tan(THREE.MathUtils.degToRad(15)) * view.aspect;
    iso.scale.setScalar((0.062 * 2 * hw) / 1.6);
    const hh = 150 * Math.tan(THREE.MathUtils.degToRad(15));
    bg.scale.set(hh * 2 * view.aspect * 1.15, hh * 2 * 1.15, 1);
  }

  const world: World = {
    scene,
    camera,
    bloom: { strength: 0.6, radius: 0.4, threshold: 0.75 },
    exposure: 1,
    update(f: FrameCtx) {
      const pal = PALETTE[f.chapter] ?? PALETTE.vault;
      (neb.uniforms.uDeep.value as THREE.Color).set(pal[0]);
      (neb.uniforms.uMid.value as THREE.Color).set(pal[1]);
      (neb.uniforms.uCloud.value as THREE.Color).set(pal[2]);
      neb.uniforms.uK.value = pal[3];
      neb.uniforms.uTime.value = f.time;
      for (const [chapter, grp] of Object.entries(groups)) grp.visible = chapter === f.chapter;
      for (const c of all) {
        const b = c.g.userData.base as THREE.Vector3 | undefined;
        if (!b || !c.g.parent?.visible) continue;
        c.g.rotation.x += c.spin.x * f.dt;
        c.g.rotation.y += c.spin.y * f.dt;
        c.g.position.set(b.x - f.pointer.x * 0.02 * c.spec[4], b.y + Math.sin(f.time * 0.7 + c.ph) * 0.03 * c.spec[4] + f.pointer.y * 0.01 * c.spec[4], b.z);
      }
      // menu cube: idle spin + turn toward the hovered chip (±25°)
      yaw = lerp(yaw, THREE.MathUtils.degToRad(Math.max(-25, Math.min(25, f.menuYaw / 14))), Math.min(1, f.dt * 5));
      iso.rotation.set(Math.sin(f.time * 0.5) * 0.06, yaw + Math.sin(f.time * 0.35) * 0.12, 0);
      iso.position.set(isoBase.x, isoBase.y + Math.sin(f.time * 1.2) * 0.03, isoBase.z);
      const drift = f.p * 0.6;
      camera.position.set(f.pointer.x * 0.15, -f.pointer.y * 0.1 - drift * 0.2, 0);
      camera.lookAt(f.pointer.x * 0.05, -drift * 0.2, -10);
      farStars.rotation.y = f.time * 0.004;
      nearStars.rotation.y = f.time * 0.008 + f.p * 0.2;
    },
    resize(w, h) {
      view.aspect = w / h;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      place();
    },
    dispose() { disposeObject(scene); scene.environment?.dispose(); },
  };
  return world;
}
