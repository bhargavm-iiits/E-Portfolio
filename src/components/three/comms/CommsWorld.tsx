"use client";
/**
 * 05 COMMS band (Docs/Game §8, screenshot footer band): a calm night
 * panorama — tower clusters across a still bay, their lights stretched in the
 * water, a moon with its glitter path, mountains in the haze, mist on the
 * water, a dark wooded rock on the left, and the small explorer on a shore
 * rock, looking out at the next world.
 */
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import { COMMS } from "@/config/world";
import type { TierSettings } from "@/config/quality";
import { NOISE } from "../shaders/common";
import { createTowerMaterial } from "../shaders/materials";
import Mist, { type Puff } from "../shared/Mist";
import Explorer from "../shared/Explorer";
import Stars from "../shared/Stars";
import { coniferGeometry, rockGeometry, seeded, spireGeometry } from "../shared/util";
import { isActive, view } from "../view";

const MOON = new THREE.Vector3(...COMMS.moon.pos);
const MOON_DIR = MOON.clone().sub(new THREE.Vector3(...COMMS.camera.p)).normalize();

function nightSky() {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: { uMoon: { value: MOON_DIR.clone() } },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position = p.xyww;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uMoon;
      varying vec3 vDir;
      ${NOISE}
      void main() {
        vec3 d = normalize(vDir);
        float y = d.y;
        vec3 col = mix(toLin(vec3(0.07, 0.12, 0.22)), toLin(vec3(0.03, 0.06, 0.12)), smoothstep(0.0, 0.2, y));
        col = mix(col, toLin(vec3(0.012, 0.025, 0.055)), smoothstep(0.2, 0.75, y));
        float m = max(dot(d, uMoon), 0.0);
        col += toLin(vec3(0.36, 0.45, 0.68)) * (pow(m, 40.0) * 0.5 + pow(m, 6.0) * 0.08);
        float n = fbm(d.xy * 3.0 + d.z);
        col += toLin(vec3(0.12, 0.16, 0.3)) * pow(n, 3.0) * 0.4 * smoothstep(0.05, 0.4, y);
        col = mix(col, toLin(vec3(0.05, 0.09, 0.17)), smoothstep(0.02, -0.2, y));
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }
    `,
  });
}

function moonMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {},
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      ${NOISE}
      void main() {
        vec2 p = (vUv - 0.5) * 2.0;           // quad is 5 moon radii wide
        float r = length(p) * 2.5;
        float disc = smoothstep(1.0, 0.97, r);
        vec2 q = p * 2.5;
        float maria = fbm(q * 2.2 + 3.0);
        float limb = sqrt(max(0.0, 1.0 - r * r));
        vec3 surface = mix(vec3(0.62, 0.66, 0.74), vec3(0.95, 0.96, 1.0), smoothstep(0.35, 0.7, maria)) * (0.55 + 0.45 * limb);
        // a faint crescent shadow toward the lower left
        surface *= smoothstep(-0.9, 0.3, dot(normalize(q + 1e-4), vec2(0.6, 0.8)) + 0.6);
        float halo = exp(-max(r - 1.0, 0.0) * 1.5) * (1.0 - disc) * 0.55;
        vec3 col = surface * disc * 2.2 + vec3(0.55, 0.65, 0.9) * halo;
        gl_FragColor = vec4(col, max(disc, halo));
        #include <colorspace_fragment>
      }
    `,
  });
}

const WATER_UNIFORMS = {
  color: { value: new THREE.Color(0xffffff) },
  tDiffuse: { value: null as THREE.Texture | null },
  textureMatrix: { value: new THREE.Matrix4() },
  uTime: { value: 0 },
  uMirror: { value: 1 },
  uMoonDir: { value: MOON_DIR.clone() },
};

const WATER_VERT = /* glsl */ `
  uniform mat4 textureMatrix;
  varying vec4 vUvR;
  varying vec3 vWorld;
  #include <fog_pars_vertex>
  void main() {
    vUvR = textureMatrix * vec4(position, 1.0);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorld = wp.xyz;
    vec4 mvPosition = viewMatrix * wp;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

const WATER_FRAG = /* glsl */ `
  uniform sampler2D tDiffuse;
  uniform float uTime;
  uniform float uMirror;
  uniform vec3 uMoonDir;
  varying vec4 vUvR;
  varying vec3 vWorld;
  #include <fog_pars_fragment>
  ${NOISE}
  float waves(vec2 p) {
    return vnoise(p * 0.11 + vec2(uTime * 0.035, uTime * 0.02)) * 0.6
         + vnoise(p * 0.37 - vec2(uTime * 0.06, -uTime * 0.045)) * 0.3
         + vnoise(p * 1.1 + vec2(uTime * 0.1, uTime * 0.07)) * 0.1;
  }
  void main() {
    vec2 p = vWorld.xz;
    float e = 0.15;
    float h = waves(p);
    vec3 n = normalize(vec3(-(waves(p + vec2(e, 0.0)) - h) / e * 0.55, 1.0, -(waves(p + vec2(0.0, e)) - h) / e * 0.55));
    vec3 V = normalize(cameraPosition - vWorld);
    float F = 0.02 + 0.98 * pow(1.0 - max(dot(n, V), 0.0), 5.0);

    // reflections stretched vertically, as lights on rippled water are
    vec4 uvr = vUvR;
    uvr.x += n.x * 0.03 * uvr.w;
    float s = 0.012 * uvr.w;
    vec3 refl = vec3(0.0);
    for (int i = -3; i <= 3; i++) {
      float w = 1.0 - abs(float(i)) / 4.0;
      refl += texture2DProj(tDiffuse, uvr + vec4(n.z * 0.01 * uvr.w, float(i) * s, 0.0, 0.0)).rgb * w;
    }
    refl /= 4.0;

    vec3 deep = toLin(vec3(0.012, 0.025, 0.05));
    vec3 col = mix(deep, refl, clamp((F * 0.8 + 0.35) * uMirror, 0.0, 1.0));
    // moon glitter path
    vec3 H = normalize(uMoonDir + V);
    col += vec3(0.85, 0.9, 1.0) * pow(max(dot(n, H), 0.0), 420.0) * 1.3;
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

function Water({ resolution }: { resolution: number }) {
  const water = useMemo(() => {
    const geo = new THREE.PlaneGeometry(1400, 900);
    const uniforms = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, WATER_UNIFORMS]);
    let object: THREE.Mesh;
    let material: THREE.ShaderMaterial;
    if (resolution > 0) {
      const r = new Reflector(geo, {
        textureWidth: resolution,
        textureHeight: Math.round(resolution * 0.4),
        clipBias: 0.003,
        shader: { name: "NightWater", uniforms, vertexShader: WATER_VERT, fragmentShader: WATER_FRAG },
      });
      object = r;
      material = r.material as THREE.ShaderMaterial;
    } else {
      material = new THREE.ShaderMaterial({ uniforms, vertexShader: WATER_VERT, fragmentShader: WATER_FRAG });
      material.uniforms.uMirror.value = 0;
      material.uniforms.tDiffuse.value = new THREE.Texture();
      object = new THREE.Mesh(geo, material);
    }
    material.fog = true;
    object.rotation.x = -Math.PI / 2;
    object.position.set(0, 0, -420);
    return { object, material };
  }, [resolution]);

  useEffect(
    () => () => {
      (water.object as THREE.Mesh & { dispose?: () => void }).dispose?.();
      water.material.dispose();
    },
    [water]
  );
  useFrame(() => {
    water.material.uniforms.uTime.value = view.time;
  });
  return <primitive object={water.object} />;
}

/**
 * Placed by screen direction (u = tan of the horizontal angle from the band's
 * centre) so the composition holds: a needle cluster centre-left behind the
 * headline, a taller cluster on the right, a low far skyline, and a clear gap
 * of sky where the moon hangs.
 */
function towerLayout(count: number) {
  const rnd = seeded(4242);
  const out: { x: number; z: number; h: number; w: number; d: number; r: number }[] = [];
  const add = (u: number, z: number, top: number, w: number) => {
    const h = 4 + COMMS.camera.p[1] + top * -z;
    out.push({ x: u * -z, z, h, w, d: w * (0.7 + rnd() * 0.6), r: (rnd() - 0.5) * 0.4 });
  };
  for (let i = 0; i < count; i++) {
    const r = rnd();
    if (r < 0.38) add(-0.34 + rnd() * 0.44, -170 - rnd() * 110, 0.05 + Math.pow(rnd(), 1.5) * 0.2, 3 + rnd() * 5);
    else if (r < 0.8) add(0.43 + rnd() * 0.55, -140 - rnd() * 120, 0.06 + Math.pow(rnd(), 1.3) * 0.24, 3 + rnd() * 6);
    else {
      let u = -0.95 + rnd() * 1.9;
      if (u > 0.15 && u < 0.41) u += 0.3;
      add(u, -300 - rnd() * 80, 0.02 + rnd() * 0.07, 5 + rnd() * 7);
    }
  }
  return out;
}

function Towers({ count }: { count: number }) {
  const material = useMemo(() => createTowerMaterial({ haze: "#0d1a30", hazeY: 3, density: 0.32, boards: false, glow: 0.8 }), []);
  const matrices = useMemo(() => {
    const d = new THREE.Object3D();
    return towerLayout(count).map((t) => {
      d.position.set(t.x, -4 + t.h / 2, t.z);
      d.scale.set(t.w, t.h, t.d);
      d.rotation.y = t.r;
      d.updateMatrix();
      return d.matrix.clone();
    });
  }, [count]);
  useFrame(() => {
    material.uniforms.uTime.value = view.time;
  });
  return (
    <instancedMesh
      args={[undefined, undefined, matrices.length]}
      material={material}
      onUpdate={(m) => {
        matrices.forEach((mat, i) => m.setMatrixAt(i, mat));
        m.instanceMatrix.needsUpdate = true;
        m.computeBoundingSphere();
      }}
    >
      <boxGeometry args={[1, 1, 1]} />
    </instancedMesh>
  );
}

/** Spire needles on top of the tallest right-hand towers (the screenshot's pointed skyline). */
function Needles() {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#0b111c", roughness: 0.6, metalness: 0.4 }), []);
  const lights = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color("#4bdcfd").multiplyScalar(2.2), toneMapped: false }), []);
  const list = useMemo(() => {
    const rnd = seeded(77);
    const us = [-0.22, -0.08, 0.04, 0.5, 0.63, 0.81];
    return us.map((u, i) => {
      const z = -190 - rnd() * 60;
      return { pos: [u * -z, -4, z] as [number, number, number], h: 8 + (0.2 + rnd() * 0.1) * -z, r: 2 + rnd() * 2.2, seed: i };
    });
  }, []);
  const geos = useMemo(() => list.map((n) => spireGeometry({ seed: n.seed * 3 + 1, height: n.h, radius: n.r })), [list]);
  return (
    <group>
      {list.map((n, i) => (
        <group key={i} position={n.pos}>
          <mesh geometry={geos[i]} material={mat} />
          {[0.35, 0.55, 0.72, 0.86].map((k) => (
            <mesh key={k} position-y={n.h * k} material={lights}>
              <cylinderGeometry args={[n.r * (1 - k * 0.8) * 1.02, n.r * (1 - k * 0.8) * 1.02, 0.22, 9, 1, true]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function Mountains() {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: "#0f1b32", fog: true }), []);
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(1600, 120, 240, 1);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      if (p.getY(i) > 0) {
        const x = p.getX(i);
        p.setY(i, 22 + Math.abs(Math.sin(x * 0.006) * 46 + Math.sin(x * 0.019 + 1.3) * 18 + Math.sin(x * 0.07) * 4));
      }
    }
    return g;
  }, []);
  return <mesh geometry={geo} material={mat} position={[0, -30, -420]} />;
}

function Shore() {
  const rock = useMemo(() => new THREE.MeshStandardMaterial({ color: "#151a24", roughness: 0.92, flatShading: true }), []);
  const tree = useMemo(() => new THREE.MeshStandardMaterial({ color: "#0a1211", roughness: 1, flatShading: true }), []);
  const g = useMemo(
    () => ({
      perch: rockGeometry({ seed: 501, detail: 2, rough: 0.3, squash: 0.45, flatTop: 0.3 }),
      left: rockGeometry({ seed: 502, detail: 2, rough: 0.4, squash: 0.7, flatTop: 0.35 }),
      small: rockGeometry({ seed: 503, detail: 1, rough: 0.35, squash: 0.5 }),
      tree: coniferGeometry(11),
      tree2: coniferGeometry(19),
    }),
    []
  );
  const [ex, , ez] = COMMS.explorer.pos;
  return (
    <group>
      {/* the explorer's perch */}
      <mesh geometry={g.perch} material={rock} position={[ex, -0.35, ez]} scale={[1.6, 1.4, 1.3]} />
      <mesh geometry={g.small} material={rock} position={[ex + 2.2, -0.2, ez - 1.2]} scale={0.7} />
      <mesh geometry={g.small} material={rock} position={[ex - 2.6, -0.3, ez + 0.8]} scale={0.5} />
      {/* the dark wooded mass on the left */}
      <group position={[-30, -1.5, -40]}>
        <mesh geometry={g.left} material={rock} scale={[11, 7, 8]} />
        {[
          [-2, 2.6, 1, 5.5],
          [1.5, 2.4, -1, 7],
          [4, 2.0, 1.5, 4.5],
          [-5, 1.8, -2, 6],
        ].map(([x, y, z, s], i) => (
          <mesh key={i} geometry={i % 2 ? g.tree : g.tree2} material={tree} position={[x, y, z]} scale={s} />
        ))}
      </group>
    </group>
  );
}

function waterMist(): Puff[] {
  const rnd = seeded(330);
  const out: Puff[] = [];
  for (let i = 0; i < 46; i++) {
    out.push({ x: (rnd() - 0.5) * 300, y: 1 + rnd() * 7, z: -80 - rnd() * 160, size: 22 + rnd() * 30, alpha: 0.25 + rnd() * 0.3 });
  }
  for (let i = 0; i < 12; i++) {
    out.push({ x: (rnd() - 0.5) * 60, y: 0.4 + rnd() * 1.2, z: -30 - rnd() * 40, size: 8 + rnd() * 10, alpha: 0.18 + rnd() * 0.2 });
  }
  // a low bank hugging the far shore, softening the tower bases
  for (let i = 0; i < 26; i++) {
    const z = -140 - rnd() * 160;
    out.push({ x: (rnd() - 0.5) * 1.8 * -z, y: 0.5 + rnd() * 4, z, size: 18 + rnd() * 26, alpha: 0.3 + rnd() * 0.3 });
  }
  return out;
}

export default function CommsWorld({ tier }: { tier: TierSettings }) {
  const root = useRef<THREE.Group>(null);
  const sky = useRef<THREE.Mesh>(null);
  const moon = useRef<THREE.Mesh>(null);
  const mats = useMemo(() => ({ sky: nightSky(), moon: moonMaterial() }), []);
  const mist = useMemo(() => waterMist(), []);

  useFrame((state) => {
    const r = root.current;
    if (!r) return;
    r.visible = isActive("comms");
    if (!r.visible) return;
    sky.current?.position.copy(state.camera.position);
    moon.current?.quaternion.copy(state.camera.quaternion);
  }, -8);

  return (
    <group ref={root} position={COMMS.origin}>
      <mesh ref={sky} material={mats.sky} frustumCulled={false} renderOrder={-10}>
        <sphereGeometry args={[800, 32, 16]} />
      </mesh>
      <Stars count={Math.round(tier.stars * 0.6)} seed={31} opacity={0.8} />
      <mesh ref={moon} position={COMMS.moon.pos} material={mats.moon} renderOrder={-8}>
        <planeGeometry args={[COMMS.moon.radius * 5, COMMS.moon.radius * 5]} />
      </mesh>
      <Mountains />
      <Towers count={tier.towers} />
      <Needles />
      <Water resolution={tier.reflection ? Math.min(tier.reflection, 1024) : 0} />
      <Shore />
      <Explorer position={COMMS.explorer.pos} yaw={Math.PI - 0.15} height={COMMS.explorer.height} rim="#8fb4ff" glow={() => 0.7} rimStrength={() => 0.9} />
      <Mist puffs={mist} base="#16233b" lit="#2d4064" renderOrder={6} />
    </group>
  );
}
