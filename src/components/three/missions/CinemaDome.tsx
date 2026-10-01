"use client";
/**
 * M03 VR Cinema Platform — observatory / VR cinema: a wire dome, a giant
 * curved screen, a sphere-mapped 360° preview and a floating headset. The
 * DOM mode switch morphs the screen between 360° MONO and SBS 3D (side-by-side
 * stereo pair with a divider). The panorama is procedural — no stock footage.
 */
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { store } from "@/lib/store";
import { NOISE } from "../shaders/common";
import { buildHeadsetGeometry, buildHeadsetLightsGeometry } from "../world/headset";
import { FloorGrid, HudRings, glow } from "./shared";

const PANO = /* glsl */ `
${NOISE}
// Procedural equirectangular scene: dusk sky, skyline silhouette, stars.
vec3 pano(vec2 uv, float time) {
  float y = uv.y;
  vec3 sky = mix(vec3(0.95, 0.55, 0.45), vec3(0.18, 0.2, 0.55), smoothstep(0.45, 0.85, y));
  sky = mix(sky, vec3(0.03, 0.05, 0.16), smoothstep(0.8, 1.0, y));
  float sun = exp(-pow(length((uv - vec2(fract(0.3 + time * 0.01), 0.5)) * vec2(3.0, 5.0)), 2.0) * 6.0);
  sky += vec3(1.0, 0.75, 0.5) * sun * 0.8;
  float cells = floor(uv.x * 90.0);
  float hgt = 0.08 + hash21(vec2(cells, 1.7)) * 0.16 + fbm(vec2(uv.x * 6.0, 1.0)) * 0.1;
  float city = step(y, 0.32 + hgt);
  vec3 col = mix(sky, vec3(0.04, 0.05, 0.12), city);
  float win = step(0.8, hash21(floor(uv * vec2(420.0, 160.0)))) * city * step(0.3, y);
  col += vec3(1.0, 0.8, 0.5) * win * 0.9;
  col = mix(col, vec3(0.02, 0.03, 0.08), smoothstep(0.32, 0.0, y));
  float stars = step(0.997, hash21(floor(uv * vec2(900.0, 450.0)))) * smoothstep(0.75, 0.95, y);
  col += stars;
  return toLin(col);
}
`;

function createScreenMaterial() {
  return new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms: { uTime: { value: 0 }, uMode: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uMode;
      varying vec2 vUv;
      ${PANO}
      void main() {
        float look = uTime * 0.012;
        vec2 u = vec2(1.0 - vUv.x, vUv.y);
        vec3 mono = pano(vec2(fract(u.x * 0.45 + look), 0.2 + u.y * 0.6), uTime);
        float eye = step(0.5, u.x);
        vec2 su = vec2(fract(fract(u.x * 2.0) * 0.45 + look + eye * 0.012), 0.2 + u.y * 0.6);
        vec3 sbs = pano(su, uTime) * mix(vec3(1.0, 0.92, 0.92), vec3(0.92, 0.95, 1.0), eye);
        vec3 col = mix(mono, sbs, uMode);
        float divider = smoothstep(0.004, 0.0, abs(u.x - 0.5)) * uMode;
        col += vec3(0.36, 0.88, 1.0) * divider * 3.0;
        float edge = smoothstep(0.0, 0.02, vUv.x) * smoothstep(1.0, 0.98, vUv.x) * smoothstep(0.0, 0.03, vUv.y) * smoothstep(1.0, 0.97, vUv.y);
        float scan = 0.94 + 0.06 * sin(vUv.y * 600.0);
        gl_FragColor = vec4(col * edge * scan * 1.25, 1.0);
      }
    `,
  });
}

function createSphereMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec3 vN;
      varying vec3 vView;
      void main() {
        vN = normalize(position);
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vView = normalize(cameraPosition - wp.xyz);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      varying vec3 vN;
      varying vec3 vView;
      ${PANO}
      void main() {
        vec2 uv = vec2(atan(vN.z, vN.x) / 6.2831853 + 0.5 + uTime * 0.02, asin(clamp(vN.y, -1.0, 1.0)) / 3.14159265 + 0.5);
        vec3 col = pano(vec2(fract(uv.x), uv.y), uTime);
        float grid = step(0.97, fract(uv.x * 24.0)) + step(0.96, fract(uv.y * 12.0));
        col += vec3(0.36, 0.88, 1.0) * grid * 0.35;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

/** One auditorium seat (facing −Z, toward the screen), merged into a single geometry. */
function seatGeometry() {
  const part = (w: number, h: number, d: number, x: number, y: number, z: number) => new THREE.BoxGeometry(w, h, d).translate(x, y, z);
  return mergeGeometries([
    part(0.38, 0.26, 0.3, 0, 0.13, 0.02),
    part(0.56, 0.14, 0.5, 0, 0.33, 0),
    part(0.56, 0.62, 0.1, 0, 0.66, 0.22),
    part(0.06, 0.12, 0.46, 0.3, 0.47, 0),
    part(0.06, 0.12, 0.46, -0.3, 0.47, 0),
  ])!;
}

/** Stepped rows of seats, gently curved toward the screen. */
function seatLayout() {
  const d = new THREE.Object3D();
  const seats: THREE.Matrix4[] = [];
  const strips: THREE.Matrix4[] = [];
  for (let r = 0; r < 3; r++) {
    for (let k = 0; k < 7; k++) {
      const x = (k - 3) * 0.7;
      d.position.set(x, r * 0.2, -0.3 + r * 0.9 + x * x * 0.035);
      d.rotation.y = -x * 0.05;
      d.updateMatrix();
      seats.push(d.matrix.clone());
      d.position.y += 0.98;
      d.position.z += 0.27;
      d.updateMatrix();
      strips.push(d.matrix.clone());
    }
  }
  return { seats, strips };
}

interface Props {
  mini?: boolean;
}

export default function CinemaDome({ mini = false }: Props) {
  const screen = useMemo(() => createScreenMaterial(), []);
  const sphereMat = useMemo(() => createSphereMaterial(), []);
  const headset = useMemo(() => buildHeadsetGeometry(), []);
  const headsetLights = useMemo(() => buildHeadsetLightsGeometry(), []);
  const sphere = useRef<THREE.Mesh>(null);
  const hmd = useRef<THREE.Group>(null);
  const cyan = useMemo(() => glow("#5CE1FF", 2.4), []);
  const domeColor = useMemo(() => glow("#5CE1FF", 0.9), []);
  const ARC = 1.9;
  const seat = useMemo(() => seatGeometry(), []);
  const rows = useMemo(() => seatLayout(), []);


  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    screen.uniforms.uTime.value = t;
    sphereMat.uniforms.uTime.value = t;
    const target = mini ? (Math.sin(t * 0.4) > 0 ? 1 : 0) : store.get().cinemaMode === "sbs" ? 1 : 0;
    screen.uniforms.uMode.value = THREE.MathUtils.damp(screen.uniforms.uMode.value, target, 4, dt);
    if (sphere.current) sphere.current.rotation.y = t * 0.2;
    if (hmd.current) {
      hmd.current.position.y = 1.2 + Math.sin(t * 0.9) * 0.12;
      hmd.current.rotation.y = -0.6 + Math.sin(t * 0.35) * 0.35;
    }
  });

  return (
    <group>
      {/* floor + HUD rings */}
      <mesh position-y={-0.1} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[6.4, 64]} />
        <meshStandardMaterial color="#0a0f26" metalness={0.5} roughness={0.5} />
      </mesh>
      <HudRings radius={5.6} y={0.0} />

      {/* observatory dome (wire) */}
      <mesh position-y={-0.1}>
        <sphereGeometry args={[6.4, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial color={domeColor} wireframe transparent opacity={0.16} toneMapped={false} />
      </mesh>

      {/* giant curved screen, concave toward the viewer */}
      <mesh position-y={2.2} material={screen}>
        <cylinderGeometry args={[5.2, 5.2, 3.3, 72, 1, true, Math.PI - ARC / 2, ARC]} />
      </mesh>
      <mesh position-y={2.2}>
        <cylinderGeometry args={[5.25, 5.25, 3.42, 72, 1, true, Math.PI - ARC / 2 - 0.01, ARC + 0.02]} />
        <meshBasicMaterial color={cyan} wireframe transparent opacity={0.08} toneMapped={false} side={THREE.BackSide} />
      </mesh>

      {/* 360° preview sphere */}
      <mesh ref={sphere} position={[-3.1, 1.3, 1.6]} material={sphereMat}>
        <sphereGeometry args={[0.8, 48, 32]} />
      </mesh>
      <group position={[-3.1, 0, 1.6]}>
        <HudRings radius={0.9} y={0.03} />
      </group>

      {/* floating headset */}
      <group ref={hmd} position={[3.0, 1.2, 1.3]} scale={3.2}>
        <group position-y={-1.67}>
          <mesh geometry={headset}>
            <meshStandardMaterial color="#10162e" metalness={0.8} roughness={0.22} />
          </mesh>
          <mesh geometry={headsetLights}>
            <meshBasicMaterial color={cyan} toneMapped={false} />
          </mesh>
        </group>
      </group>
      {/* stepped seating */}
      {!mini && (
        <group position={[0, -0.1, 0.4]}>
          {[0, 1, 2].map((r) => (
            <mesh key={r} position={[0, r * 0.2 - 0.1, -0.3 + r * 0.9 + 0.2]}>
              <boxGeometry args={[5.6, 0.2 + r * 0.4, 0.9]} />
              <meshStandardMaterial color="#0b1022" roughness={0.7} metalness={0.3} />
            </mesh>
          ))}
          <instancedMesh
            args={[seat, undefined, rows.seats.length]}
            onUpdate={(m) => {
              rows.seats.forEach((mat, i) => m.setMatrixAt(i, mat));
              m.instanceMatrix.needsUpdate = true;
            }}
          >
            <meshStandardMaterial color="#1a2142" roughness={0.78} metalness={0.15} />
          </instancedMesh>
          <instancedMesh
            args={[undefined, undefined, rows.strips.length]}
            onUpdate={(m) => {
              rows.strips.forEach((mat, i) => m.setMatrixAt(i, mat));
              m.instanceMatrix.needsUpdate = true;
            }}
          >
            <boxGeometry args={[0.42, 0.018, 0.02]} />
            <meshBasicMaterial color={cyan} toneMapped={false} />
          </instancedMesh>
        </group>
      )}
      {!mini && <FloorGrid size={34} y={-0.12} opacity={0.25} />}
    </group>
  );
}
