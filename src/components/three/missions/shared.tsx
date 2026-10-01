"use client";
/** Shared bits for the mission dioramas: HUD floor grid, glow colours, seeded noise. */
import { useMemo } from "react";
import * as THREE from "three";
import { FRAG_TAIL, withFog } from "../shaders/common";

export const glow = (hex: string, k = 2) => new THREE.Color(hex).multiplyScalar(k);

export function seeded(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** Deterministic 2D value noise in JS (terrain heightfields). */
export function makeNoise2D(seed: number) {
  const rnd = seeded(seed);
  const perm = new Float32Array(512);
  for (let i = 0; i < 512; i++) perm[i] = rnd();
  const h = (x: number, y: number) => perm[(((x * 73856093) ^ (y * 19349663)) >>> 0) % 512];
  const smooth = (t: number) => t * t * (3 - 2 * t);
  const n = (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = smooth(x - xi);
    const yf = smooth(y - yi);
    const a = h(xi, yi);
    const b = h(xi + 1, yi);
    const c = h(xi, yi + 1);
    const d = h(xi + 1, yi + 1);
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
  };
  return (x: number, y: number) => {
    let v = 0;
    let amp = 0.5;
    let f = 1;
    for (let o = 0; o < 5; o++) {
      v += amp * n(x * f, y * f);
      f *= 2.03;
      amp *= 0.5;
    }
    return v;
  };
}

/** Holographic floor grid that fades radially (the "tron" floor in p5's worlds). */
export function FloorGrid({ size = 40, cell = 1, color = "#5CE1FF", opacity = 0.35, y = 0 }: { size?: number; cell?: number; color?: string; opacity?: number; y?: number }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        fog: true,
        uniforms: withFog({ uColor: { value: new THREE.Color(color) }, uCell: { value: cell }, uOpacity: { value: opacity }, uSize: { value: size } }),
        vertexShader: /* glsl */ `
          #include <fog_pars_vertex>
          varying vec2 vP;
          void main() {
            vP = position.xy;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            #include <fog_vertex>
          }
        `,
        fragmentShader: /* glsl */ `
          #include <fog_pars_fragment>
          uniform vec3 uColor;
          uniform float uCell;
          uniform float uOpacity;
          uniform float uSize;
          varying vec2 vP;
          void main() {
            vec2 g = abs(fract(vP / uCell - 0.5) - 0.5) / fwidth(vP / uCell);
            float line = 1.0 - min(min(g.x, g.y), 1.0);
            vec2 g5 = abs(fract(vP / (uCell * 5.0) - 0.5) - 0.5) / fwidth(vP / (uCell * 5.0));
            float major = 1.0 - min(min(g5.x, g5.y), 1.0);
            float fade = smoothstep(uSize * 0.5, uSize * 0.12, length(vP));
            float a = (line * 0.45 + major * 0.8) * fade * uOpacity;
            gl_FragColor = vec4(uColor * 1.6, a);
            ${FRAG_TAIL}
          }
        `,
      }),
    [color, cell, opacity, size]
  );
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={y} material={mat} renderOrder={1}>
      <planeGeometry args={[size, size]} />
    </mesh>
  );
}

/** Glowing edge lines for a box (glass cases, frames). */
export function BoxEdges({ size, color = "#5CE1FF", intensity = 2, opacity = 0.9 }: { size: [number, number, number]; color?: string; intensity?: number; opacity?: number }) {
  const geo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(...size)), [size]);
  const c = useMemo(() => glow(color, intensity), [color, intensity]);
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color={c} toneMapped={false} transparent opacity={opacity} />
    </lineSegments>
  );
}

/** Emissive HUD rings for pedestals. */
export function HudRings({ radius = 2.4, y = 0, color = "#5CE1FF" }: { radius?: number; y?: number; color?: string }) {
  const c = useMemo(() => glow(color, 2.2), [color]);
  const c2 = useMemo(() => glow(color, 1.1), [color]);
  return (
    <group position-y={y} rotation-x={-Math.PI / 2}>
      <mesh>
        <ringGeometry args={[radius, radius + 0.05, 96]} />
        <meshBasicMaterial color={c} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh>
        <ringGeometry args={[radius * 0.78, radius * 0.78 + 0.02, 96]} />
        <meshBasicMaterial color={c2} toneMapped={false} transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh>
        <ringGeometry args={[radius + 0.25, radius + 0.27, 96, 1, 0, Math.PI * 1.3]} />
        <meshBasicMaterial color={c2} toneMapped={false} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
