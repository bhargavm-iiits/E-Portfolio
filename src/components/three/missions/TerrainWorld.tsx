"use client";
/**
 * M01 Tirumala AR Navigation — terrain block with a cyan contour-line mesh over
 * shaded relief (p5). An amber route draws on from the start ring (Alipiri) to
 * the summit pin; the 1.17 km gap missing from OpenStreetMap renders as a
 * dashed, flagged INTERPOLATED connector — true to the project. POIs pop along
 * the route and AR chevrons slide along the drawn path.
 */
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { rig } from "@/lib/rig";
import { FRAG_TAIL, withFog } from "../shaders/common";
import { FloorGrid, glow, makeNoise2D } from "./shared";

const W = 12;
const D = 8;
const BASE = -1.3;
/** Fraction of the route that is the interpolated connector. */
export const INTERP: [number, number] = [0.5, 0.64];

const noise = makeNoise2D(2024);
const SUMMIT = { x: 3.3, z: -2.1 };

function heightAt(x: number, z: number) {
  const hills = noise(x * 0.32 + 10, z * 0.32 + 4) * 1.5;
  const ridge = Math.exp(-((x - SUMMIT.x) ** 2 / 7 + (z - SUMMIT.z) ** 2 / 4)) * 2.3;
  const ridge2 = Math.exp(-((x - 0.2) ** 2 / 5 + (z + 2.8) ** 2 / 3)) * 1.3;
  const slope = (z < 0 ? -z : 0) * 0.08 + (x + 6) * 0.03;
  const edge = Math.min(1, (W / 2 - Math.abs(x)) * 2, (D / 2 - Math.abs(z)) * 2);
  return (hills + ridge + ridge2 + slope) * Math.max(0, edge) * 0.85;
}

function createTerrainMaterial() {
  return new THREE.ShaderMaterial({
    fog: true,
    uniforms: withFog({ uTime: { value: 0 } }),
    vertexShader: /* glsl */ `
      #include <fog_pars_vertex>
      varying vec3 vP;
      varying vec3 vN;
      varying vec3 vWorld;
      void main() {
        vP = position;
        vN = normalize(mat3(modelMatrix) * normal);
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorld = wp.xyz;
        vec4 mvPosition = viewMatrix * wp;
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }
    `,
    fragmentShader: /* glsl */ `
      #include <fog_pars_fragment>
      uniform float uTime;
      varying vec3 vP;
      varying vec3 vN;
      varying vec3 vWorld;
      vec3 toLin(vec3 c) { return pow(c, vec3(2.2)); }
      void main() {
        vec3 n = normalize(vN);
        float h = vP.y;
        float light = max(dot(n, normalize(vec3(-0.4, 0.8, 0.45))), 0.0);
        vec3 low = toLin(vec3(0.05, 0.12, 0.2));
        vec3 high = toLin(vec3(0.24, 0.36, 0.52));
        vec3 snow = toLin(vec3(0.75, 0.85, 0.95));
        vec3 col = mix(low, high, smoothstep(0.0, 2.2, h));
        col = mix(col, snow, smoothstep(2.4, 3.2, h) * smoothstep(0.55, 0.9, n.y));
        col *= 0.35 + light * 0.9;
        // contour lines every 0.22 m of height
        float ch = h / 0.22;
        float contour = 1.0 - smoothstep(0.0, 1.0, abs(fract(ch - 0.5) - 0.5) / max(fwidth(ch), 1e-4));
        // wire grid in plan
        vec2 gp = vP.xz / 0.5;
        vec2 gg = abs(fract(gp - 0.5) - 0.5) / fwidth(gp);
        float grid = 1.0 - min(min(gg.x, gg.y), 1.0);
        vec3 cyan = vec3(0.36, 0.88, 1.0);
        col += cyan * (contour * 0.9 + grid * 0.28) * (0.6 + 0.4 * smoothstep(0.0, 2.5, h));
        float fres = pow(1.0 - max(dot(n, normalize(cameraPosition - vWorld)), 0.0), 3.0);
        col += cyan * fres * 0.25;
        gl_FragColor = vec4(col, 1.0);
        ${FRAG_TAIL}
      }
    `,
  });
}

function createRouteMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uA: { value: INTERP[0] },
      uB: { value: INTERP[1] },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      uniform float uProgress;
      uniform float uTime;
      uniform float uA;
      uniform float uB;
      varying vec2 vUv;
      void main() {
        float x = vUv.x;
        if (x > uProgress) discard;
        bool interp = x > uA && x < uB;
        if (interp && fract(x * 90.0) < 0.45) discard;   // dashed connector
        vec3 amber = vec3(1.0, 0.71, 0.28);
        vec3 col = interp ? vec3(1.0, 0.85, 0.55) : amber;
        float head = smoothstep(uProgress - 0.03, uProgress, x) * step(uProgress, 0.995);
        float flow = pow(0.5 + 0.5 * sin(x * 60.0 - uTime * 4.0), 8.0) * 0.6;
        col *= 1.35 + head * 2.2 + flow * 0.7 + (interp ? 0.4 * sin(uTime * 3.0) : 0.0);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

function useTerrain(segments: number) {
  return useMemo(() => {
    const g = new THREE.PlaneGeometry(W, D, segments, Math.round((segments * D) / W));
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) pos.setY(i, heightAt(pos.getX(i), pos.getZ(i)));
    g.computeVertexNormals();

    // Block skirt: vertical walls following the edge heights.
    const wall: number[] = [];
    const edge = (ax: number, az: number, bx: number, bz: number, steps: number) => {
      for (let i = 0; i < steps; i++) {
        const t0 = i / steps;
        const t1 = (i + 1) / steps;
        const x0 = ax + (bx - ax) * t0;
        const z0 = az + (bz - az) * t0;
        const x1 = ax + (bx - ax) * t1;
        const z1 = az + (bz - az) * t1;
        const h0 = heightAt(x0, z0);
        const h1 = heightAt(x1, z1);
        wall.push(x0, BASE, z0, x1, BASE, z1, x1, h1, z1, x0, BASE, z0, x1, h1, z1, x0, h0, z0);
      }
    };
    const hw = W / 2;
    const hd = D / 2;
    edge(-hw, hd, hw, hd, 60);
    edge(hw, hd, hw, -hd, 40);
    edge(hw, -hd, -hw, -hd, 60);
    edge(-hw, -hd, -hw, hd, 40);
    const wallGeo = new THREE.BufferGeometry();
    wallGeo.setAttribute("position", new THREE.Float32BufferAttribute(wall, 3));
    wallGeo.computeVertexNormals();
    return { terrain: g, wall: wallGeo };
  }, [segments]);
}

function useRoute() {
  return useMemo(() => {
    const plan: [number, number][] = [
      [-4.6, 2.9],
      [-3.4, 2.2],
      [-2.6, 1.1],
      [-1.2, 0.9],
      [-0.4, -0.1],
      [0.8, 0.2],
      [1.6, -0.8],
      [2.5, -1.3],
      [SUMMIT.x, SUMMIT.z],
    ];
    const flat = new THREE.CatmullRomCurve3(plan.map(([x, z]) => new THREE.Vector3(x, 0, z)));
    const samples = flat.getSpacedPoints(160).map((p) => new THREE.Vector3(p.x, heightAt(p.x, p.z) + 0.07, p.z));
    const curve = new THREE.CatmullRomCurve3(samples);
    const tube = new THREE.TubeGeometry(curve, 320, 0.05, 6, false);
    return { curve, tube };
  }, []);
}

interface Props {
  mini?: boolean;
  segments?: number;
}

export default function TerrainWorld({ mini = false, segments = 150 }: Props) {
  const { terrain, wall } = useTerrain(mini ? 60 : segments);
  const { curve, tube } = useRoute();
  const terrainMat = useMemo(() => createTerrainMaterial(), []);
  const routeMat = useMemo(() => createRouteMaterial(), []);
  const chevrons = useRef<THREE.Group>(null);
  const pois = useRef<THREE.Group>(null);
  const pin = useRef<THREE.Group>(null);
  const startRing = useRef<THREE.Mesh>(null);
  const poiAt = useMemo(() => [0.2, 0.38, 0.78, 0.9], []);
  const amber = useMemo(() => glow("#FFB547", 2.6), []);
  const cyan = useMemo(() => glow("#5CE1FF", 2.4), []);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);

  const start = curve.getPointAt(0);
  const summit = curve.getPointAt(1);


  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const progress = mini ? THREE.MathUtils.clamp(((t * 0.18) % 1.35) / 1.0, 0, 1) : rig.m01;
    routeMat.uniforms.uProgress.value = progress;
    routeMat.uniforms.uTime.value = t;
    if (pin.current) {
      pin.current.position.y = summit.y + 0.55 + Math.sin(t * 1.6) * 0.06;
      pin.current.scale.setScalar(THREE.MathUtils.smoothstep(progress, 0.92, 1));
    }
    if (startRing.current) startRing.current.scale.setScalar(1 + Math.sin(t * 2.2) * 0.08);
    pois.current?.children.forEach((c, i) => {
      const k = THREE.MathUtils.smoothstep(progress, poiAt[i], poiAt[i] + 0.05);
      c.scale.setScalar(k * (1 + Math.sin(t * 2 + i) * 0.1));
      c.rotation.y = t * 0.8;
    });
    chevrons.current?.children.forEach((c, i) => {
      const f = ((t * 0.07 + i / 6) % 1) * progress;
      const p = curve.getPointAt(Math.min(f, 0.999));
      const tan = curve.getTangentAt(Math.min(f, 0.999));
      c.position.copy(p).add(new THREE.Vector3(0, 0.12, 0));
      c.quaternion.setFromUnitVectors(up, tan);
      c.visible = progress > 0.05;
    });
  });

  return (
    <group>
      <mesh geometry={terrain} material={terrainMat} />
      <mesh geometry={wall}>
        <meshStandardMaterial color="#0b1430" emissive="#1a3a6a" emissiveIntensity={0.25} roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={tube} material={routeMat} />

      <mesh ref={startRing} position={[start.x, start.y + 0.02, start.z]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.22, 0.3, 40]} />
        <meshBasicMaterial color={amber} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>

      <group ref={pin} position={[summit.x, summit.y + 0.55, summit.z]}>
        <mesh position-y={0.18}>
          <sphereGeometry args={[0.16, 20, 14]} />
          <meshBasicMaterial color={amber} toneMapped={false} />
        </mesh>
        <mesh rotation-x={Math.PI}>
          <coneGeometry args={[0.13, 0.36, 20]} />
          <meshBasicMaterial color={amber} toneMapped={false} />
        </mesh>
      </group>

      <group ref={pois}>
        {poiAt.map((f) => {
          const p = curve.getPointAt(f);
          return (
            <mesh key={f} position={[p.x, p.y + 0.22, p.z]} scale={0}>
              <octahedronGeometry args={[0.09, 0]} />
              <meshBasicMaterial color={cyan} toneMapped={false} />
            </mesh>
          );
        })}
      </group>

      <group ref={chevrons}>
        {Array.from({ length: mini ? 3 : 6 }, (_, i) => (
          <mesh key={i}>
            <coneGeometry args={[0.07, 0.16, 3]} />
            <meshBasicMaterial color={cyan} toneMapped={false} />
          </mesh>
        ))}
      </group>

      {!mini && <FloorGrid size={34} y={BASE - 0.02} opacity={0.4} />}
    </group>
  );
}
