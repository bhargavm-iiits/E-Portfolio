"use client";
/**
 * The mechanical portal: armour body, face plates and emitters (see
 * ringGeometry), a counter-ring turning slowly behind, broken-away blocks
 * hanging in the air, drifting debris, sparks, and an energy rim at the
 * aperture edge. Idle emitters glow softly; ENTER THE NEXUS energises them
 * (`rig.emit`, `rig.sparks`).
 */
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { rig } from "@/lib/rig";
import { HERO } from "@/config/world";
import { NOISE } from "../shaders/common";
import { rockGeometry, seeded } from "../shared/util";
import { view } from "../view";
import { buildRing } from "./ringGeometry";

/** Dark machined metal with low-frequency wear (object-space, so it never swims). */
function metal(color: string, roughness: number, metalness: number) {
  const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, envMapIntensity: 0.55 });
  m.onBeforeCompile = (s) => {
    s.vertexShader = s.vertexShader
      .replace("void main() {", "varying vec3 vObj;\nvoid main() {")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvObj = position;");
    s.fragmentShader = s.fragmentShader
      .replace("void main() {", `varying vec3 vObj;\n${NOISE}\nvoid main() {`)
      .replace(
        "#include <roughnessmap_fragment>",
        `#include <roughnessmap_fragment>
         float wear = fbm(vObj.xy * 2.3 + vObj.z * 1.7);
         float fine = vnoise(vObj.xy * 18.0 + vObj.z * 9.0);
         roughnessFactor = clamp(roughnessFactor * mix(0.65, 1.35, wear) + (fine - 0.5) * 0.12, 0.08, 1.0);
         diffuseColor.rgb *= mix(0.72, 1.18, wear) * (0.94 + fine * 0.12);`
      );
  };
  m.customProgramCacheKey = () => `ring-metal`;
  return m;
}

const RIM_VERT = /* glsl */ `
  varying vec2 vP;
  void main() {
    vP = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const RIM_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uEmit;
  uniform float uR;
  uniform vec3 uCyan;
  uniform vec3 uViolet;
  varying vec2 vP;
  ${NOISE}
  void main() {
    float r = length(vP);
    float a = atan(vP.y, vP.x);
    vec2 dir = vP / max(r, 1e-4);
    float w = smoothstep(-0.32, 0.32, dot(dir, vec2(cos(0.62), sin(0.62))));
    vec3 col = mix(uViolet, uCyan, w);
    float d = r - uR;
    // a hot thin edge, a softer inner falloff into the aperture
    float edge = exp(-pow(d / 0.035, 2.0)) * 1.6 + exp(-max(-d, 0.0) / 0.16) * step(d, 0.0) * 0.55;
    float n = vnoise(vec2(a * 7.0 + uTime * 0.9, uTime * 0.6 + r * 3.0));
    float runner = pow(max(0.0, sin(a * 3.0 - uTime * (0.5 + uEmit * 3.0))), 24.0);
    float k = edge * (0.55 + 0.45 * n) * (0.45 + uEmit * 1.4) + runner * edge * uEmit * 2.0;
    gl_FragColor = vec4(col * k, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const SPARK_VERT = /* glsl */ `
  attribute vec4 aSeed;
  uniform float uTime;
  uniform float uSparks;
  uniform float uR;
  uniform float uPixelRatio;
  varying float vA;
  varying float vAng;
  void main() {
    float spd = (0.06 + aSeed.y * 0.12) + uSparks * (0.6 + aSeed.y * 1.4);
    float ang = aSeed.x * 6.2831 + uTime * spd * (aSeed.z > 0.5 ? 1.0 : -1.0);
    float life = fract(aSeed.w + uTime * (0.05 + uSparks * 0.4));
    float r = uR + 0.15 + (aSeed.z - 0.5) * 2.2 * (1.0 - uSparks * 0.7) + life * (1.0 - uSparks) * 1.6;
    vec3 p = vec3(cos(ang) * r, sin(ang) * r + life * 1.2 * (1.0 - uSparks), (aSeed.y - 0.5) * 1.6);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (2.0 + aSeed.y * 3.0) * (1.0 + uSparks * 0.8) * uPixelRatio * (18.0 / max(-mv.z, 1.0));
    vA = sin(life * 3.1416) * (0.25 + uSparks * 0.9);
    vAng = ang;
  }
`;
const SPARK_FRAG = /* glsl */ `
  uniform vec3 uCyan;
  uniform vec3 uViolet;
  varying float vA;
  varying float vAng;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    float w = smoothstep(-0.32, 0.32, cos(vAng - 0.62));
    gl_FragColor = vec4(mix(uViolet, uCyan, w) * 3.0, a * a * vA);
  }
`;

export default function PortalRing({ sparks }: { sparks: number }) {
  const { inner, outer, aperture } = HERO.portal;
  const parts = useMemo(() => buildRing(inner, outer), [inner, outer]);
  const mats = useMemo(
    () => ({
      body: metal("#151a23", 0.38, 0.85),
      plate: metal("#1c2230", 0.5, 0.72),
      emit: new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }),
      emitBack: new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }),
      rim: new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uEmit: { value: 0.35 },
          uR: { value: aperture + 0.06 },
          uCyan: { value: new THREE.Color("#4bdcfd") },
          uViolet: { value: new THREE.Color("#8b6cff") },
        },
        vertexShader: RIM_VERT,
        fragmentShader: RIM_FRAG,
      }),
      spark: new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uSparks: { value: 0 },
          uR: { value: aperture },
          uPixelRatio: { value: 1 },
          uCyan: { value: new THREE.Color("#4bdcfd") },
          uViolet: { value: new THREE.Color("#8b6cff") },
        },
        vertexShader: SPARK_VERT,
        fragmentShader: SPARK_FRAG,
      }),
    }),
    [aperture]
  );

  const sparkGeo = useMemo(() => {
    const rnd = seeded(91);
    const seed = new Float32Array(sparks * 4).map(() => rnd());
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(sparks * 3), 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 4));
    return g;
  }, [sparks]);

  // Debris: small machined chunks orbiting slowly outside the ring.
  const debris = useMemo(() => {
    const rnd = seeded(404);
    const count = 34;
    const geo = rockGeometry({ seed: 3, detail: 0, rough: 0.25 });
    const items = Array.from({ length: count }, () => {
      const a = rnd() * Math.PI * 2;
      return {
        a,
        r: outer + 0.6 + Math.pow(rnd(), 1.5) * 4.5,
        z: (rnd() - 0.5) * 3,
        s: 0.04 + Math.pow(rnd(), 2.2) * 0.22,
        spin: (rnd() - 0.5) * 0.6,
        speed: (rnd() - 0.5) * 0.02,
      };
    });
    return { geo, items };
  }, [outer]);

  const back = useRef<THREE.Group>(null);
  const blocks = useRef<THREE.Group>(null);
  const debrisRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const t = view.time;
    const emit = rig.emit;
    const flicker = 0.97 + 0.03 * Math.sin(t * 13.1) * Math.sin(t * 7.7);
    mats.emit.color.setScalar((1.6 + emit * 3.2) * flicker);
    mats.emitBack.color.setScalar(0.9 + emit * 1.6);
    mats.rim.uniforms.uTime.value = t;
    mats.rim.uniforms.uEmit.value = emit;
    mats.spark.uniforms.uTime.value = t;
    mats.spark.uniforms.uSparks.value = rig.sparks;
    mats.spark.uniforms.uPixelRatio.value = state.viewport.dpr;
    if (back.current) back.current.rotation.z = -t * (0.012 + emit * 0.05);
    blocks.current?.children.forEach((b, i) => {
      const p = parts.blocks[i];
      b.position.set(p.home.x, p.home.y + Math.sin(t * 0.35 + p.phase) * 0.12, p.home.z + Math.sin(t * 0.21 + p.phase) * 0.08);
      b.rotation.set(p.rot.x + Math.sin(t * 0.17 + p.phase) * 0.05, p.rot.y + t * 0.01, p.rot.z);
    });
    const d = debrisRef.current;
    if (d) {
      debris.items.forEach((it, i) => {
        const a = it.a + t * it.speed;
        dummy.position.set(Math.cos(a) * it.r, Math.sin(a) * it.r, it.z + Math.sin(t * 0.3 + i) * 0.1);
        dummy.rotation.set(t * it.spin, t * it.spin * 0.7, i);
        dummy.scale.setScalar(it.s);
        dummy.updateMatrix();
        d.setMatrixAt(i, dummy.matrix);
      });
      d.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      <mesh geometry={parts.body} material={mats.body} />
      <mesh geometry={parts.plates} material={mats.plate} />
      <mesh geometry={parts.emitters} material={mats.emit} />
      <group ref={back}>
        <mesh geometry={parts.back.body} material={mats.body} />
        <mesh geometry={parts.back.emitters} material={mats.emitBack} />
      </group>
      <group ref={blocks}>
        {parts.blocks.map((b, i) => (
          <group key={i}>
            <mesh geometry={b.body} material={mats.body} />
            <mesh geometry={b.plates} material={mats.plate} />
            <mesh geometry={b.emitters} material={mats.emit} />
          </group>
        ))}
      </group>
      <instancedMesh ref={debrisRef} args={[debris.geo, mats.body, debris.items.length]} frustumCulled={false} />
      <mesh material={mats.rim} position-z={0.03} renderOrder={4}>
        <ringGeometry args={[aperture - 0.6, aperture + 0.16, 192, 2]} />
      </mesh>
      <points geometry={sparkGeo} material={mats.spark} frustumCulled={false} renderOrder={8} />
    </group>
  );
}
