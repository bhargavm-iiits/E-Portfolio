"use client";
/**
 * The other world seen through the aperture (Docs/Game §4): a bright daylight
 * floating city — crystalline spires on a floating island, waterfalls falling
 * into a cloud sea, smaller islands, distant craft, aerial haze.
 *
 * It is its own scene, rendered every frame into a render target by a camera
 * that mirrors the main camera relative to the portal frame (so parallax
 * through the aperture is correct), and shown on the aperture disc by
 * projecting each disc fragment with the main camera's view-projection — which
 * keeps it right inside mirror passes too. Crossing: the main camera stops at
 * the aperture plane while this camera keeps flying (`rig.cityPush`).
 */
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { rig } from "@/lib/rig";
import { HERO } from "@/config/world";
import { NOISE } from "../shaders/common";
import Mist, { type Puff } from "../shared/Mist";
import { fbm3, rockGeometry, seeded } from "../shared/util";
import { isActive, view } from "../view";
import { portalFrame } from "../WindowRig";

/* ───────────── city-space framing ───────────── */

/** The rest camera expressed in portal-local space, and its sight line through the aperture. */
const sight = (() => {
  const inv = new THREE.Matrix4().compose(portalFrame.pos, portalFrame.quat, new THREE.Vector3(1, 1, 1)).invert();
  const cam = new THREE.Vector3(...HERO.camera.p).add(new THREE.Vector3(...HERO.origin)).applyMatrix4(inv);
  const dir = cam.clone().negate().normalize();
  const right = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
  const up = new THREE.Vector3().crossVectors(right, dir).normalize();
  const camDist = cam.length();
  /** Point at depth `d` behind the aperture, offset (u, v) in aperture radii as seen from the rest camera. */
  const at = (d: number, u: number, v: number) => {
    const s = (HERO.portal.aperture * (camDist + d)) / camDist;
    return dir.clone().multiplyScalar(d).addScaledVector(right, u * s).addScaledVector(up, v * s);
  };
  const unit = (d: number) => (HERO.portal.aperture * (camDist + d)) / camDist;
  return { dir, right, up, at, unit };
})();

/* ───────────── materials ───────────── */

function skyMaterial() {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: { uSun: { value: new THREE.Vector3(-0.45, 0.55, -0.7).normalize() } },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position = p.xyww;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uSun;
      varying vec3 vDir;
      ${NOISE}
      void main() {
        vec3 d = normalize(vDir);
        float y = d.y;
        vec3 zen = toLin(vec3(0.2, 0.46, 0.8));
        vec3 mid = toLin(vec3(0.5, 0.73, 0.94));
        vec3 hor = toLin(vec3(0.74, 0.87, 0.98));
        vec3 col = mix(hor, mid, smoothstep(0.0, 0.22, y));
        col = mix(col, zen, smoothstep(0.22, 0.75, y));
        col = mix(col, toLin(vec3(0.86, 0.93, 0.98)), smoothstep(0.0, -0.25, y));
        float s = max(dot(d, uSun), 0.0);
        col += toLin(vec3(1.0, 0.96, 0.86)) * (pow(s, 6.0) * 0.35 + pow(s, 120.0) * 2.5);
        // high thin cloud streaks
        float c = fbm(vec2(d.x * 3.0 / (abs(y) + 0.25), d.z * 2.0 + y * 3.0));
        col = mix(col, toLin(vec3(0.97, 0.99, 1.0)), smoothstep(0.55, 0.85, c) * smoothstep(0.05, 0.35, y) * 0.45);
        gl_FragColor = vec4(col * 0.92, 1.0);
      }
    `,
  });
}

/** Crystalline towers: cool glassy facade, light bands, bright edges catching the sun. */
function spireMaterial() {
  const m = new THREE.MeshStandardMaterial({ color: "#5f90cc", roughness: 0.3, metalness: 0.4, flatShading: true });
  m.onBeforeCompile = (s) => {
    s.vertexShader = s.vertexShader
      .replace("void main() {", "varying vec3 vObj;\nvarying vec3 vWorldC;\nvoid main() {")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvObj = position;\nvWorldC = (modelMatrix * vec4(position, 1.0)).xyz;");
    s.fragmentShader = s.fragmentShader
      .replace("void main() {", "varying vec3 vObj;\nvarying vec3 vWorldC;\nvoid main() {")
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
         float band = step(fract(vWorldC.y * 0.42), 0.07);
         float slit = step(0.93, fract(atan(vObj.z, vObj.x) * 0.955 + 0.5));
         totalEmissiveRadiance += vec3(0.55, 0.82, 1.0) * (band * 0.7 + slit * 0.45);
         diffuseColor.rgb *= 0.85 + 0.35 * smoothstep(-20.0, 30.0, vWorldC.y);`
      );
  };
  m.customProgramCacheKey = () => "city-spire";
  return m;
}

function islandMaterial() {
  return new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0, flatShading: true });
}

function waterfallMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    fog: true,
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uTime: { value: 0 } }]),
    vertexShader: /* glsl */ `
      #include <fog_pars_vertex>
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }
    `,
    fragmentShader: /* glsl */ `
      #include <fog_pars_fragment>
      uniform float uTime;
      varying vec2 vUv;
      ${NOISE}
      void main() {
        float x = vUv.x;
        float streak = fbm(vec2(x * 22.0, vUv.y * 3.0 + uTime * 1.6));
        float edge = smoothstep(0.0, 0.18, x) * smoothstep(1.0, 0.82, x);
        float fall = smoothstep(0.0, 0.25, vUv.y);           // fades into the cloud sea below
        float a = edge * fall * (0.35 + 0.65 * smoothstep(0.35, 0.75, streak));
        vec3 col = mix(toLin(vec3(0.78, 0.88, 0.96)), vec3(1.0), streak);
        gl_FragColor = vec4(col * 1.1, a * 0.9);
        #include <fog_fragment>
      }
    `,
  });
}

/* ───────────── pieces ───────────── */

/** A floating island: jagged inverted cone with a grassy top, rock strata below. */
function islandGeometry(seed: number, radius: number, depth: number) {
  const g = rockGeometry({ seed, detail: 3, rough: 0.46, squash: 1, flatTop: 0.25 });
  const p = g.attributes.position as THREE.BufferAttribute;
  const col = new Float32Array(p.count * 3);
  const grass = new THREE.Color("#5e8f4c");
  const moss = new THREE.Color("#7c9a5a");
  const rock = new THREE.Color("#8a8072");
  const deep = new THREE.Color("#4a4a52");
  const c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i);
    let y = p.getY(i);
    let z = p.getZ(i);
    // taper the underside into a long root
    if (y < 0.2) {
      const k = THREE.MathUtils.clamp((0.2 - y) / 1.2, 0, 1);
      const taper = 1 - k * 0.55;
      const jag = fbm3(x * 4 + seed, y * 3, z * 4, 3) - 0.5;
      x = x * taper + jag * 0.35 * k;
      z = z * taper - jag * 0.3 * k;
      y = 0.2 - (0.2 - y) * (1 + k * 0.85);
    }
    p.setXYZ(i, x * radius, y * depth, z * radius);
    const top = THREE.MathUtils.smoothstep(y, 0.12, 0.24);
    const n = fbm3(x * 3 + seed, y * 3, z * 3, 3);
    c.copy(deep).lerp(rock, THREE.MathUtils.smoothstep(y, -1.4, 0.1) * (0.7 + n * 0.5));
    c.lerp(n > 0.5 ? moss : grass, top);
    col.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}

interface TowerSpec {
  x: number;
  z: number;
  h: number;
  r: number;
}

/** A cluster of crystalline spires (hexagonal prisms with long tips), merged. */
function spireCluster(seed: number, towers: TowerSpec[]) {
  const geos: THREE.BufferGeometry[] = [];
  towers.forEach((t, i) => {
    const body = new THREE.CylinderGeometry(t.r * 0.82, t.r, t.h, 6, 1).toNonIndexed();
    body.translate(t.x, t.h / 2, t.z);
    geos.push(body);
    const tipH = t.h * (0.22 + ((seed * 13 + i * 7) % 10) * 0.025);
    const tip = new THREE.ConeGeometry(t.r * 0.82, tipH, 6, 1).toNonIndexed();
    tip.translate(t.x, t.h + tipH / 2, t.z);
    geos.push(tip);
    // collar rings on the taller towers
    if (t.h > 10) {
      const ring = new THREE.CylinderGeometry(t.r * 1.25, t.r * 1.25, 0.25, 6, 1).toNonIndexed();
      ring.translate(t.x, t.h * 0.62, t.z);
      geos.push(ring);
    }
  });
  const merged = mergeAll(geos);
  merged.computeVertexNormals();
  return merged;
}

function mergeAll(list: THREE.BufferGeometry[]) {
  // positions + normals only (no uvs needed)
  let n = 0;
  list.forEach((g) => (n += g.attributes.position.count));
  const pos = new Float32Array(n * 3);
  let o = 0;
  list.forEach((g) => {
    pos.set(g.attributes.position.array as Float32Array, o);
    o += g.attributes.position.count * 3;
    g.dispose();
  });
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  return out;
}

function makeTowers(seed: number, count: number, spread: number, tallest: number): TowerSpec[] {
  const rnd = seeded(seed);
  const list: TowerSpec[] = [{ x: 0, z: 0, h: tallest, r: tallest * 0.075 }];
  for (let i = 1; i < count; i++) {
    const a = rnd() * Math.PI * 2;
    const d = Math.pow(rnd(), 0.7) * spread;
    const falloff = 1 - d / (spread * 1.25);
    list.push({ x: Math.cos(a) * d, z: Math.sin(a) * d, h: tallest * (0.18 + 0.62 * falloff * (0.5 + rnd() * 0.5)), r: 0.35 + rnd() * 0.75 });
  }
  return list;
}

interface IslandSpec {
  pos: THREE.Vector3;
  radius: number;
  depth: number;
  towers: TowerSpec[];
  falls: { a: number; w: number; h: number }[];
  seed: number;
}

function Island({ spec, rock, glass, water }: { spec: IslandSpec; rock: THREE.Material; glass: THREE.Material; water: THREE.Material }) {
  const geo = useMemo(() => islandGeometry(spec.seed, spec.radius, spec.depth), [spec]);
  const city = useMemo(() => spireCluster(spec.seed, spec.towers), [spec]);
  const top = spec.depth * 0.25;
  return (
    <group position={spec.pos}>
      <mesh geometry={geo} material={rock} />
      <mesh geometry={city} material={glass} position-y={top - 0.2} />
      {spec.falls.map((f, i) => (
        <mesh key={i} material={water} position={[Math.cos(f.a) * spec.radius * 0.86, top - f.h / 2 - 0.3, Math.sin(f.a) * spec.radius * 0.86]} rotation-y={-f.a + Math.PI / 2} renderOrder={2}>
          <planeGeometry args={[f.w, f.h]} />
        </mesh>
      ))}
    </group>
  );
}

function Craft({ material }: { material: THREE.Material }) {
  const ref = useRef<THREE.Group>(null);
  const craft = useMemo(() => {
    const rnd = seeded(66);
    return Array.from({ length: 5 }, (_, i) => ({
      base: sight.at(70 + rnd() * 90, -0.8 + rnd() * 1.6, 0.25 + rnd() * 0.5),
      speed: (rnd() < 0.5 ? -1 : 1) * (0.6 + rnd() * 0.9),
      s: 0.5 + rnd() * 0.6,
      phase: i * 1.7,
    }));
  }, []);
  const geo = useMemo(() => {
    const g = new THREE.ConeGeometry(0.5, 3, 5);
    g.rotateZ(-Math.PI / 2);
    g.scale(1, 0.35, 1);
    return g;
  }, []);
  useFrame(() => {
    const t = view.time;
    ref.current?.children.forEach((c, i) => {
      const k = craft[i];
      c.position.copy(k.base).addScaledVector(sight.right, ((t * k.speed + k.phase * 10) % 60) - 30);
      c.position.y += Math.sin(t * 0.4 + k.phase) * 0.6;
      c.rotation.y = k.speed > 0 ? 0 : Math.PI;
    });
  });
  return (
    <group ref={ref}>
      {craft.map((k, i) => (
        <mesh key={i} geometry={geo} material={material} scale={k.s} />
      ))}
    </group>
  );
}

function CityContent({ quality }: { quality: number }) {
  const mats = useMemo(
    () => ({
      sky: skyMaterial(),
      glass: spireMaterial(),
      rock: islandMaterial(),
      water: waterfallMaterial(),
      craft: new THREE.MeshStandardMaterial({ color: "#2b3442", roughness: 0.5, metalness: 0.6 }),
    }),
    []
  );
  const islands = useMemo<IslandSpec[]>(() => {
    const u = (d: number) => sight.unit(d);
    const main = sight.at(165, 0.02, -0.38);
    return [
      {
        seed: 11,
        pos: main,
        radius: u(165) * 0.46,
        depth: u(165) * 0.62,
        towers: makeTowers(5, 48, u(165) * 0.32, u(165) * 1.02),
        falls: [
          { a: 1.9, w: 2.6, h: 34 },
          { a: 1.3, w: 1.6, h: 30 },
          { a: 2.5, w: 1.8, h: 26 },
          { a: 0.8, w: 1.1, h: 22 },
        ],
      },
      {
        seed: 23,
        pos: sight.at(210, -0.72, -0.08),
        radius: u(210) * 0.2,
        depth: u(210) * 0.3,
        towers: makeTowers(9, 9, u(210) * 0.13, u(210) * 0.36),
        falls: [{ a: 1.7, w: 1.2, h: 18 }],
      },
      {
        seed: 37,
        pos: sight.at(230, 0.74, -0.02),
        radius: u(230) * 0.17,
        depth: u(230) * 0.28,
        towers: makeTowers(14, 7, u(230) * 0.1, u(230) * 0.3),
        falls: [{ a: 1.4, w: 1.0, h: 16 }],
      },
      {
        seed: 51,
        pos: sight.at(120, -0.86, 0.42),
        radius: u(120) * 0.08,
        depth: u(120) * 0.12,
        towers: makeTowers(21, 3, u(120) * 0.04, u(120) * 0.14),
        falls: [],
      },
    ];
  }, []);

  // Cloud sea under the islands + far banks on the horizon.
  const clouds = useMemo<Puff[]>(() => {
    const rnd = seeded(808);
    const list: Puff[] = [];
    const n = Math.round(70 * quality);
    for (let i = 0; i < n; i++) {
      const d = 80 + rnd() * 260;
      const p = sight.at(d, (rnd() - 0.5) * 3.2, -0.62 - rnd() * 0.5);
      list.push({ x: p.x, y: p.y, z: p.z, size: sight.unit(d) * (0.45 + rnd() * 0.6), alpha: 0.55 + rnd() * 0.4 });
    }
    for (let i = 0; i < 14; i++) {
      const d = 260 + rnd() * 200;
      const p = sight.at(d, (rnd() - 0.5) * 3.5, -0.2 + rnd() * 0.25);
      list.push({ x: p.x, y: p.y, z: p.z, size: sight.unit(d) * (0.5 + rnd() * 0.5), alpha: 0.35 + rnd() * 0.3 });
    }
    return list;
  }, [quality]);

  // Spray where the falls meet the clouds.
  const spray = useMemo<Puff[]>(() => {
    const rnd = seeded(17);
    const out: Puff[] = [];
    const main = islands[0];
    for (let i = 0; i < 12; i++) {
      out.push({
        x: main.pos.x + (rnd() - 0.5) * main.radius * 1.6,
        y: main.pos.y + main.depth * 0.25 - 26 - rnd() * 8,
        z: main.pos.z + main.radius * 0.6 + rnd() * 4,
        size: 7 + rnd() * 8,
        alpha: 0.45,
      });
    }
    return out;
  }, [islands]);

  useFrame(() => {
    mats.water.uniforms.uTime.value = view.time;
  });

  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats]);

  return (
    <>
      <mesh material={mats.sky} frustumCulled={false} renderOrder={-10} name="city-sky">
        <sphereGeometry args={[800, 32, 16]} />
      </mesh>
      <hemisphereLight args={["#d8ecff", "#7c8f74", 1.5]} />
      <directionalLight position={[-120, 160, -80]} intensity={2.6} color="#fff3df" />
      <directionalLight position={[80, 40, 60]} intensity={0.5} color="#bcd8ff" />
      {islands.map((s) => (
        <Island key={s.seed} spec={s} rock={mats.rock} glass={mats.glass} water={mats.water} />
      ))}
      <Mist puffs={clouds} base="#d6e6f4" lit="#ffffff" renderOrder={3} />
      <Mist puffs={spray} base="#e6f0f8" lit="#ffffff" renderOrder={3} />
      <Craft material={mats.craft} />
    </>
  );
}

/* ───────────── the aperture ───────────── */

const DISC_VERT = /* glsl */ `
  varying vec3 vWorld;
  varying vec2 vP;
  void main() {
    vP = position.xy;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorld = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;
const DISC_FRAG = /* glsl */ `
  uniform sampler2D uCity;
  uniform mat4 uViewProj;
  uniform vec3 uCentre;
  uniform float uR;
  uniform float uEmit;
  uniform float uOpen;
  uniform vec3 uCyan;
  uniform vec3 uViolet;
  varying vec3 vWorld;
  varying vec2 vP;
  vec2 project(vec3 p) {
    vec4 c = uViewProj * vec4(p, 1.0);
    return c.xy / c.w * 0.5 + 0.5;
  }
  void main() {
    vec2 uv = project(vWorld);
    vec2 uc = project(uCentre);
    float r = length(vP) / uR;
    float e = smoothstep(0.72, 1.0, r);
    // slight lens dispersion toward the rim
    vec2 d = uv - uc;
    vec3 col;
    col.r = texture2D(uCity, uc + d * (1.0 - 0.006 * e)).r;
    col.g = texture2D(uCity, uv).g;
    col.b = texture2D(uCity, uc + d * (1.0 + 0.006 * e)).b;
    // a bright haze veil at the edge, tinted by the emitters
    vec2 dir = vP / max(length(vP), 1e-4);
    float w = smoothstep(-0.32, 0.32, dot(dir, vec2(cos(0.62), sin(0.62))));
    vec3 tint = mix(uViolet, uCyan, w);
    col = mix(col, vec3(0.8, 0.9, 1.0), e * e * 0.12);
    col += tint * pow(e, 4.0) * (0.25 + uEmit * 0.9);
    col *= uOpen;
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/** The city scene lives outside the main graph: the stage pre-compiles it through this. */
const registry: { scene: THREE.Scene | null; camera: THREE.Camera | null } = { scene: null, camera: null };
export function compileCity(gl: THREE.WebGLRenderer) {
  return registry.scene && registry.camera ? gl.compileAsync(registry.scene, registry.camera) : Promise.resolve();
}

export default function SkyCity({ scale, msaa }: { scale: number; msaa: number }) {
  const { gl, size, viewport } = useThree();
  const cityScene = useMemo(() => {
    const s = new THREE.Scene();
    s.fog = new THREE.Fog("#a8cbee", 160, 1100);
    return s;
  }, []);
  const cityCam = useMemo(() => new THREE.PerspectiveCamera(30, 1, 0.5, 2000), []);
  useEffect(() => {
    registry.scene = cityScene;
    registry.camera = cityCam;
    return () => {
      registry.scene = null;
      registry.camera = null;
    };
  }, [cityScene, cityCam]);
  const target = useMemo(
    () => new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: msaa, depthBuffer: true }),
    [msaa]
  );
  useEffect(() => {
    const w = Math.max(4, Math.round(size.width * viewport.dpr * scale));
    const h = Math.max(4, Math.round(size.height * viewport.dpr * scale));
    target.setSize(w, h);
  }, [size, viewport.dpr, scale, target]);
  useEffect(() => () => target.dispose(), [target]);

  const disc = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uCity: { value: target.texture },
          uViewProj: { value: new THREE.Matrix4() },
          uCentre: { value: portalFrame.pos.clone() },
          uR: { value: HERO.portal.inner + 0.05 },
          uEmit: { value: 0.35 },
          uOpen: { value: 1 },
          uCyan: { value: new THREE.Color("#4bdcfd") },
          uViolet: { value: new THREE.Color("#8b6cff") },
        },
        vertexShader: DISC_VERT,
        fragmentShader: DISC_FRAG,
      }),
    [target]
  );

  const portalInv = useMemo(() => new THREE.Matrix4().compose(portalFrame.pos, portalFrame.quat, new THREE.Vector3(1, 1, 1)).invert(), []);
  const m = useMemo(() => new THREE.Matrix4(), []);

  useFrame((state) => {
    if (!isActive("hero")) return;
    const main = state.camera as THREE.PerspectiveCamera;
    m.multiplyMatrices(portalInv, main.matrixWorld);
    m.decompose(cityCam.position, cityCam.quaternion, cityCam.scale);
    cityCam.position.addScaledVector(sight.dir, rig.cityPush * 120);
    cityCam.updateMatrixWorld();
    cityCam.projectionMatrix.copy(main.projectionMatrix);
    cityCam.projectionMatrixInverse.copy(main.projectionMatrixInverse);
    const sky = cityScene.getObjectByName("city-sky");
    sky?.position.copy(cityCam.position);

    const prev = gl.getRenderTarget();
    gl.setRenderTarget(target);
    gl.clear();
    gl.render(cityScene, cityCam);
    gl.setRenderTarget(prev);

    disc.uniforms.uViewProj.value.copy(view.viewProj);
    disc.uniforms.uEmit.value = rig.emit;
  }, -5);

  return (
    <>
      {createPortal(<CityContent quality={scale} />, cityScene)}
      <mesh material={disc} renderOrder={1}>
        <circleGeometry args={[HERO.portal.inner + 0.05, 160]} />
      </mesh>
    </>
  );
}
