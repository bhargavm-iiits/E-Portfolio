"use client";
/** A twinkling star dome that follows the camera (drawn at the far plane, upper sky only). */
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { seeded } from "./util";
import { view } from "../view";

function starMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 }, uOpacity: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute vec2 aStar;   // size, seed
      uniform float uTime;
      uniform float uPixelRatio;
      varying float vA;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_Position.z = gl_Position.w * 0.9999;
        gl_PointSize = aStar.x * uPixelRatio;
        vA = (0.55 + 0.45 * sin(uTime * (0.4 + aStar.y * 1.5) + aStar.y * 50.0)) * smoothstep(-0.02, 0.22, normalize(position).y);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uOpacity;
      varying float vA;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(vec3(0.85, 0.92, 1.0) * 1.2, a * a * vA * uOpacity);
      }
    `,
  });
}

export default function Stars({ count, seed = 77, opacity = 1 }: { count: number; seed?: number; opacity?: number }) {
  const mat = useMemo(() => starMaterial(), []);
  const geo = useMemo(() => {
    const rnd = seeded(seed);
    const pos = new Float32Array(count * 3);
    const attr = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      const a = rnd() * Math.PI * 2;
      const y = Math.pow(rnd(), 0.8) * 0.97 + 0.02;
      const r = Math.sqrt(1 - y * y);
      pos.set([Math.cos(a) * r * 400, y * 400, Math.sin(a) * r * 400], i * 3);
      attr.set([1 + Math.pow(rnd(), 6) * 3.2, rnd()], i * 2);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aStar", new THREE.BufferAttribute(attr, 2));
    return g;
  }, [count, seed]);
  const ref = useRef<THREE.Points>(null);

  useFrame((state) => {
    ref.current?.position.copy(state.camera.position);
    mat.uniforms.uTime.value = view.time;
    mat.uniforms.uPixelRatio.value = state.viewport.dpr;
    mat.uniforms.uOpacity.value = opacity;
  });

  return <points ref={ref} geometry={geo} material={mat} frustumCulled={false} renderOrder={-9} />;
}
