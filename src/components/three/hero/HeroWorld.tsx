"use client";
/**
 * 01 WORLD (Docs/Game §4, screenshot hero): a dark, misty night world with a
 * mechanical portal on the right. Through its aperture: the bright daylight
 * floating city. In front of it: the small explorer, seen from behind on a
 * cracked wet stone ledge. Around: floating rocks with conifers, weathered
 * spires fading into the haze, mist rising from the void, a dim planet, stars.
 */
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { rig } from "@/lib/rig";
import { HERO } from "@/config/world";
import type { TierSettings } from "@/config/quality";
import { NOISE } from "../shaders/common";
import Mist, { type Puff } from "../shared/Mist";
import Explorer from "../shared/Explorer";
import { coniferGeometry, rockGeometry, seeded, spireGeometry } from "../shared/util";
import Stars from "../shared/Stars";
import { isActive, view } from "../view";
import { portalFrame } from "../WindowRig";
import PortalRing from "./PortalRing";
import SkyCity from "./SkyCity";
import Ledge from "./Ledge";

/* ───────────── sky, stars, planet ───────────── */

function nightSky() {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: { uToward: { value: new THREE.Vector3(0, 0, -1) }, uEmit: { value: 0.35 } },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position = p.xyww;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uToward;
      uniform float uEmit;
      varying vec3 vDir;
      ${NOISE}
      void main() {
        vec3 d = normalize(vDir);
        float y = d.y;
        float toward = pow(max(dot(normalize(vec3(d.x, 0.0, d.z)), normalize(vec3(uToward.x, 0.0, uToward.z))), 0.0), 4.0);
        vec3 zen = toLin(vec3(0.008, 0.02, 0.045));
        vec3 mid = toLin(vec3(0.025, 0.05, 0.1));
        vec3 hor = mix(toLin(vec3(0.05, 0.085, 0.15)), toLin(vec3(0.1, 0.11, 0.24)), toward);
        vec3 col = mix(hor, mid, smoothstep(-0.02, 0.18, y));
        col = mix(col, zen, smoothstep(0.18, 0.7, y));
        col = mix(col, toLin(vec3(0.035, 0.06, 0.1)), smoothstep(0.0, -0.3, y));
        // faint nebula
        float n = fbm(d.xy * 2.4 + d.z * 1.3);
        col += toLin(vec3(0.16, 0.13, 0.36)) * pow(n, 3.0) * 0.5 * smoothstep(0.0, 0.5, y);
        col += toLin(vec3(0.1, 0.25, 0.4)) * pow(fbm(d.zy * 3.1 + 4.0), 4.0) * 0.4 * smoothstep(0.05, 0.6, y);
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }
    `,
  });
}

function planetMaterial(light: THREE.Vector3) {
  return new THREE.ShaderMaterial({
    uniforms: { uLight: { value: light } },
    vertexShader: /* glsl */ `
      varying vec3 vN;
      varying vec3 vObj;
      varying vec3 vWorld;
      void main() {
        vN = normalize(mat3(modelMatrix) * normal);
        vObj = position;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorld = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uLight;
      varying vec3 vN;
      varying vec3 vObj;
      varying vec3 vWorld;
      ${NOISE}
      void main() {
        vec3 n = normalize(vN);
        float lit = smoothstep(-0.15, 0.7, dot(n, uLight));
        vec3 p = normalize(vObj);
        float warp = fbm(p.xz * 3.0 + p.y);
        float bands = fbm(vec2(p.y * 7.0 + warp * 1.6, p.x * 1.5));
        vec3 surf = mix(toLin(vec3(0.07, 0.09, 0.15)), toLin(vec3(0.3, 0.36, 0.5)), bands);
        vec3 col = surf * (0.04 + lit * 1.5);
        vec3 V = normalize(cameraPosition - vWorld);
        float rim = pow(1.0 - max(dot(n, V), 0.0), 2.5);
        col += toLin(vec3(0.45, 0.66, 1.0)) * rim * (0.15 + lit * 0.9);
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }
    `,
  });
}

function Sky({ stars }: { stars: number }) {
  const sky = useRef<THREE.Mesh>(null);
  const mat = useMemo(() => {
    const s = nightSky();
    s.uniforms.uToward.value.copy(portalFrame.normal).negate();
    return s;
  }, []);
  const planet = useMemo(() => {
    const pos = new THREE.Vector3(-118, 92, -330);
    return { pos, mat: planetMaterial(portalFrame.pos.clone().sub(pos).normalize().add(new THREE.Vector3(0.4, 0.3, 0)).normalize()) };
  }, []);

  useFrame((state) => {
    sky.current?.position.copy(state.camera.position);
  });

  return (
    <>
      <mesh ref={sky} material={mat} frustumCulled={false} renderOrder={-10}>
        <sphereGeometry args={[800, 32, 16]} />
      </mesh>
      <Stars count={stars} />
      <mesh position={planet.pos} material={planet.mat} rotation={[0.3, 0.6, 0.2]}>
        <sphereGeometry args={[15, 48, 32]} />
      </mesh>
    </>
  );
}

/* ───────────── terrain dressing ───────────── */

interface RockSpec {
  pos: [number, number, number];
  s: number;
  seed: number;
  trees?: [number, number, number][];
  bob?: number;
}

const FLOATING: RockSpec[] = [
  { pos: [-10.5, 8.6, -14], s: 1.5, seed: 1, trees: [[0.2, 0.55, 0.1]], bob: 1 },
  { pos: [-6.8, 1.6, -6.5], s: 0.75, seed: 2, bob: 1 },
  { pos: [9.6, 10.4, -16], s: 1.2, seed: 3, trees: [[-0.2, 0.45, 0]], bob: 1 },
  { pos: [10.8, 2.4, -9.5], s: 0.85, seed: 4, bob: 1 },
  { pos: [14.5, 6.5, -22], s: 1.9, seed: 5, trees: [[0.3, 0.5, 0.2], [-0.4, 0.45, -0.1]], bob: 1 },
  { pos: [-16, 4.2, -21], s: 2.1, seed: 6, trees: [[0, 0.5, 0], [0.5, 0.42, 0.3]], bob: 1 },
  { pos: [-4.2, 10.8, -18], s: 0.55, seed: 7, bob: 1 },
  { pos: [6.2, -0.4, -4.8], s: 0.45, seed: 8, bob: 1 },
  { pos: [-2.4, -2.6, -7.5], s: 0.8, seed: 9, bob: 1 },
  { pos: [4.4, 13.5, -24], s: 0.9, seed: 10, bob: 1 },
  // the dark mass at the lower left (under the copy) and right foreground
  { pos: [-13.5, -2.8, 3.5], s: 4.2, seed: 11, trees: [[0.2, 0.42, -0.2], [-0.1, 0.4, 0.15], [0.45, 0.36, 0.1]] },
  { pos: [-8.5, -4.5, 9.5], s: 3.2, seed: 12 },
  { pos: [11.5, -3.2, 6.5], s: 3.0, seed: 13, trees: [[-0.2, 0.42, 0]] },
];

function Rocks() {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#20252f", roughness: 0.92, metalness: 0.05, flatShading: true }), []);
  const treeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#0d1614", roughness: 1, flatShading: true }), []);
  const geos = useMemo(() => FLOATING.map((r) => rockGeometry({ seed: r.seed * 13, detail: 2, rough: 0.38, squash: 0.62, flatTop: 0.32 })), []);
  const trees = useMemo(() => [coniferGeometry(3), coniferGeometry(8), coniferGeometry(15)], []);
  const ref = useRef<THREE.Group>(null);

  useFrame(() => {
    const t = view.time;
    ref.current?.children.forEach((g, i) => {
      const r = FLOATING[i];
      if (!r.bob) return;
      g.position.y = r.pos[1] + Math.sin(t * 0.3 + i * 1.7) * 0.18 * Math.min(1, r.s);
      g.rotation.y = Math.sin(t * 0.07 + i) * 0.08;
    });
  });

  return (
    <group ref={ref}>
      {FLOATING.map((r, i) => (
        <group key={i} position={r.pos}>
          <mesh geometry={geos[i]} material={mat} scale={r.s} />
          {r.trees?.map((tp, k) => (
            <mesh key={k} geometry={trees[(i + k) % trees.length]} material={treeMat} position={[tp[0] * r.s, tp[1] * r.s * 0.62, tp[2] * r.s]} scale={r.s * (0.55 + ((i + k) % 3) * 0.18)} />
          ))}
        </group>
      ))}
    </group>
  );
}

/** Weathered spires and a far ridge, fading into the haze (layers of depth). */
function Spires() {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#161c27", roughness: 0.95, flatShading: true }), []);
  const list = useMemo(() => {
    const rnd = seeded(902);
    const out: { geo: THREE.BufferGeometry; pos: [number, number, number] }[] = [];
    const place = (side: number, n: number) => {
      for (let i = 0; i < n; i++) {
        const x = side * (22 + rnd() * 40);
        const z = -24 - rnd() * 90;
        const h = 22 + rnd() * 48;
        out.push({ geo: spireGeometry({ seed: i * 7 + (side > 0 ? 100 : 0), height: h, radius: 3 + rnd() * 5, lean: (rnd() - 0.5) * 0.6 }), pos: [x, -24, z] });
      }
    };
    place(-1, 9);
    place(1, 8);
    return out;
  }, []);
  const ridge = useMemo(() => {
    const g = new THREE.PlaneGeometry(900, 60, 180, 1);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      if (p.getY(i) > 0) {
        const x = p.getX(i);
        const h = 18 + Math.abs(Math.sin(x * 0.013) * 22 + Math.sin(x * 0.041) * 9 + Math.sin(x * 0.11) * 3);
        p.setY(i, h);
      }
    }
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <group>
      {list.map((s, i) => (
        <mesh key={i} geometry={s.geo} material={mat} position={s.pos} />
      ))}
      <mesh geometry={ridge} material={mat} position={[0, -30, -190]} />
    </group>
  );
}

function mistBanks(count: number): Puff[] {
  const rnd = seeded(515);
  const out: Puff[] = [];
  const P = HERO.portal.pos;
  for (let i = 0; i < count; i++) {
    const r = rnd();
    if (r < 0.45) {
      // the void below and around the ledge
      out.push({ x: (rnd() - 0.5) * 70, y: -5 + rnd() * 4.2, z: -34 + rnd() * 44, size: 7 + rnd() * 9, alpha: 0.35 + rnd() * 0.4 });
    } else if (r < 0.75) {
      // rising around the portal's lower arc
      const a = Math.PI * (1.05 + rnd() * 0.9);
      out.push({ x: P[0] + Math.cos(a) * (5 + rnd() * 5), y: -1.8 + rnd() * 3, z: P[2] + (rnd() - 0.5) * 5, size: 4 + rnd() * 6, alpha: 0.3 + rnd() * 0.35 });
    } else {
      // far banks between the spires
      out.push({ x: (rnd() - 0.5) * 160, y: -8 + rnd() * 10, z: -40 - rnd() * 90, size: 16 + rnd() * 22, alpha: 0.25 + rnd() * 0.3 });
    }
  }
  return out;
}

export default function HeroWorld({ tier }: { tier: TierSettings }) {
  const root = useRef<THREE.Group>(null);
  const puffs = useMemo(() => mistBanks(tier.mist), [tier.mist]);
  const glowAt = useMemo(() => portalFrame.pos.clone(), []);

  useFrame(() => {
    if (root.current) root.current.visible = isActive("hero");
  }, -8);

  return (
    <group ref={root} position={HERO.origin}>
      <Sky stars={tier.stars} />
      <Spires />
      <Rocks />
      <group position={HERO.portal.pos} quaternion={portalFrame.quat}>
        <PortalRing sparks={tier.sparks} />
        <SkyCity scale={tier.cityScale} msaa={tier.postfx && tier.bloomScale === 1 ? 4 : 0} />
      </group>
      <Ledge resolution={tier.reflection} msaa={tier.bloomScale === 1 ? 4 : 0} />
      <Explorer position={HERO.explorer.pos} yaw={Math.PI + HERO.portal.yaw} height={HERO.explorer.height} rim="#a9c8ff" />
      <Mist puffs={puffs} base="#131c2a" lit="#2f3f55" glowAt={glowAt} glowReach={5} glow={() => 0.1 + rig.emit * 0.8} />
    </group>
  );
}
