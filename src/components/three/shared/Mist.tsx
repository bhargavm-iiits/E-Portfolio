"use client";
/**
 * Volumetric-looking mist: soft billboards cut from the shared smoke atlas,
 * each slowly turning and drifting, tinted cooler away from a light source and
 * toward its colour near it (the portal's cyan / violet, the moon). One
 * instanced draw call per bank.
 */
import { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { withFog } from "../shaders/common";
import { smokeAtlas } from "./util";
import { view } from "../view";

export interface Puff {
  x: number;
  y: number;
  z: number;
  size: number;
  alpha: number;
}

interface MistProps {
  puffs: Puff[];
  /** Base (shadow) and lit colours of the mist, sRGB. */
  base: string;
  lit: string;
  /** A light the mist glows toward (world space), its colour and reach. */
  glowAt?: THREE.Vector3;
  glowA?: string;
  glowB?: string;
  glowReach?: number;
  /** Uniform driving the glow strength (0..1), read each frame. */
  glow?: () => number;
  renderOrder?: number;
}

function createMistMaterial(atlas: THREE.Texture) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    fog: true,
    uniforms: withFog({
      uAtlas: { value: atlas },
      uTime: { value: 0 },
      uBase: { value: new THREE.Color() },
      uLit: { value: new THREE.Color() },
      uGlowA: { value: new THREE.Color() },
      uGlowB: { value: new THREE.Color() },
      uGlowAt: { value: new THREE.Vector3() },
      uReach: { value: 10 },
      uGlow: { value: 0 },
    }),
    vertexShader: /* glsl */ `
      #include <fog_pars_vertex>
      attribute vec4 aPuff;   // size, seed, spin, alpha
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vWorld;
      varying float vSeed;
      varying float vAlpha;
      void main() {
        float rot = aPuff.y * 6.28 + uTime * aPuff.z;
        vec2 c = position.xy;
        vec2 pr = vec2(c.x * cos(rot) - c.y * sin(rot), c.x * sin(rot) + c.y * cos(rot));
        vec3 centre = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
        centre.x += sin(uTime * 0.045 + aPuff.y * 40.0) * 0.7;
        centre.y += sin(uTime * 0.07 + aPuff.y * 17.0) * 0.12;
        vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
        vec3 up = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
        vec3 wp = centre + (right * pr.x + up * pr.y * 0.55) * aPuff.x;
        vUv = uv;
        vWorld = wp;
        vSeed = aPuff.y;
        vAlpha = aPuff.w;
        vec4 mvPosition = viewMatrix * vec4(wp, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }
    `,
    fragmentShader: /* glsl */ `
      #include <fog_pars_fragment>
      uniform sampler2D uAtlas;
      uniform vec3 uBase;
      uniform vec3 uLit;
      uniform vec3 uGlowA;
      uniform vec3 uGlowB;
      uniform vec3 uGlowAt;
      uniform float uReach;
      uniform float uGlow;
      varying vec2 vUv;
      varying vec3 vWorld;
      varying float vSeed;
      varying float vAlpha;
      void main() {
        float k = floor(vSeed * 4.0);
        vec2 cell = vec2(mod(k, 2.0), floor(k / 2.0)) * 0.5;
        float a = texture2D(uAtlas, cell + vUv * 0.5).r;
        if (a < 0.01) discard;
        vec3 col = mix(uBase, uLit, clamp(vUv.y * 0.85 + a * 0.35, 0.0, 1.0));
        vec3 d = vWorld - uGlowAt;
        float near = exp(-length(d) / uReach);
        vec3 tint = mix(uGlowB, uGlowA, smoothstep(-2.0, 2.0, d.x + d.y * 0.6));
        col += tint * near * uGlow;
        gl_FragColor = vec4(col, pow(a, 1.3) * vAlpha);
        #include <fog_fragment>
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
}

export default function Mist({ puffs, base, lit, glowAt, glowA = "#4bdcfd", glowB = "#8b6cff", glowReach = 10, glow, renderOrder = 6 }: MistProps) {
  const material = useMemo(() => {
    const m = createMistMaterial(smokeAtlas());
    m.uniforms.uBase.value.set(base);
    m.uniforms.uLit.value.set(lit);
    m.uniforms.uGlowA.value.set(glowA);
    m.uniforms.uGlowB.value.set(glowB);
    m.uniforms.uReach.value = glowReach;
    if (glowAt) m.uniforms.uGlowAt.value.copy(glowAt);
    return m;
  }, [base, lit, glowA, glowB, glowReach, glowAt]);

  const { geometry, matrices } = useMemo(() => {
    const d = new THREE.Object3D();
    const matrices: THREE.Matrix4[] = [];
    const data = new Float32Array(puffs.length * 4);
    puffs.forEach((p, i) => {
      d.position.set(p.x, p.y, p.z);
      d.updateMatrix();
      matrices.push(d.matrix.clone());
      const s = Math.abs(Math.sin(i * 12.9898 + p.x * 3.1) * 43758.5453) % 1;
      data.set([p.size, s, (s - 0.5) * 0.06, p.alpha], i * 4);
    });
    const geometry = new THREE.PlaneGeometry(1, 1);
    geometry.setAttribute("aPuff", new THREE.InstancedBufferAttribute(data, 4));
    return { geometry, matrices };
  }, [puffs]);

  useFrame(() => {
    material.uniforms.uTime.value = view.time;
    material.uniforms.uGlow.value = glow ? glow() : 0;
  });

  return (
    <instancedMesh
      args={[geometry, material, matrices.length]}
      frustumCulled={false}
      renderOrder={renderOrder}
      onUpdate={(m) => {
        matrices.forEach((mm, i) => m.setMatrixAt(i, mm));
        m.instanceMatrix.needsUpdate = true;
      }}
    />
  );
}
