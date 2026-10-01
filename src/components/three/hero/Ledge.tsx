"use client";
/**
 * The cracked wet stone ledge the explorer stands on (Docs/Game §4): a rugged
 * cliff block with a wet top that truly mirrors the portal, its emitters and
 * the explorer. The top is a planar mirror (three's Reflector, rendered only
 * when the ledge is drawn) with a custom stone shader: Voronoi cracks, cell
 * tones, puddles that are glassy while dry stone blurs the reflection, Fresnel,
 * and the portal's cyan / violet light raking across it. Low tier: no mirror.
 */
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import { rig } from "@/lib/rig";
import { NOISE } from "../shaders/common";
import { fbm3, rockGeometry, seeded, stoneMap } from "../shared/util";
import { portalFrame } from "../WindowRig";

const STONE_UNIFORMS = {
  color: { value: new THREE.Color(0xffffff) },
  tDiffuse: { value: null as THREE.Texture | null },
  textureMatrix: { value: new THREE.Matrix4() },
  uCrack: { value: null as THREE.Texture | null },
  uMirror: { value: 1 },
  uEmit: { value: 0.35 },
  uPortal: { value: new THREE.Vector3() },
  uCyan: { value: new THREE.Color("#4bdcfd") },
  uViolet: { value: new THREE.Color("#8b6cff") },
};

const STONE_VERT = /* glsl */ `
  uniform mat4 textureMatrix;
  varying vec4 vUvR;
  varying vec2 vUv;
  varying vec3 vWorld;
  #include <fog_pars_vertex>
  void main() {
    vUv = uv;
    vUvR = textureMatrix * vec4(position, 1.0);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorld = wp.xyz;
    vec4 mvPosition = viewMatrix * wp;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

const STONE_FRAG = /* glsl */ `
  uniform sampler2D tDiffuse;
  uniform sampler2D uCrack;
  uniform float uMirror;
  uniform float uEmit;
  uniform vec3 uPortal;
  uniform vec3 uCyan;
  uniform vec3 uViolet;
  varying vec4 vUvR;
  varying vec2 vUv;
  varying vec3 vWorld;
  #include <fog_pars_fragment>
  ${NOISE}
  void main() {
    vec2 st = vUv * 0.075;
    vec4 tex = texture2D(uCrack, st);
    float e = 0.004;
    vec4 tx = texture2D(uCrack, st + vec2(e, 0.0));
    vec4 tz = texture2D(uCrack, st + vec2(0.0, e));
    // height: slab tone, sunken cracks, a little grain
    float h0 = tex.g * 0.3 - tex.r * 0.7 + vnoise(st * 90.0) * 0.12;
    float hx = tx.g * 0.3 - tx.r * 0.7 + vnoise((st + vec2(e, 0.0)) * 90.0) * 0.12;
    float hz = tz.g * 0.3 - tz.r * 0.7 + vnoise((st + vec2(0.0, e)) * 90.0) * 0.12;
    float wet = smoothstep(0.25, 0.8, tex.b);
    float crack = tex.r;
    float bump = mix(2.2, 0.35, wet);
    vec3 n = normalize(vec3(-(hx - h0) * bump * 3.0, 1.0, (hz - h0) * bump * 3.0));
    float rough = mix(0.6, 0.04, wet);

    vec3 V = normalize(cameraPosition - vWorld);
    float ndv = max(dot(n, V), 0.0);
    float F = 0.035 + 0.965 * pow(1.0 - ndv, 5.0);

    // reflection: normal-distorted, blurred by roughness (5 taps)
    vec4 uvr = vUvR;
    uvr.xy += n.xz * (0.03 + rough * 0.22) * uvr.w;
    float b = rough * 0.03 * uvr.w;
    vec3 refl = texture2DProj(tDiffuse, uvr).rgb * 0.36;
    refl += texture2DProj(tDiffuse, uvr + vec4( b,  0.0, 0.0, 0.0)).rgb * 0.16;
    refl += texture2DProj(tDiffuse, uvr + vec4(-b,  0.0, 0.0, 0.0)).rgb * 0.16;
    refl += texture2DProj(tDiffuse, uvr + vec4(0.0,  b * 1.8, 0.0, 0.0)).rgb * 0.16;
    refl += texture2DProj(tDiffuse, uvr + vec4(0.0, -b * 1.8, 0.0, 0.0)).rgb * 0.16;

    // stone, lit by the portal (cyan right, violet left, daylight from the aperture)
    vec3 stone = toLin(vec3(0.07, 0.078, 0.095)) * (0.65 + tex.g * 0.6) * (0.85 + vnoise(vUv * 1.7) * 0.3);
    vec3 L = uPortal - vWorld;
    float dist = length(L);
    L /= dist;
    float fall = 1.0 / (1.0 + dist * dist * 0.012);
    vec3 lc = mix(uViolet, uCyan, smoothstep(-2.5, 2.5, vWorld.x + vWorld.y * 0.3)) * (0.45 + uEmit * 1.1) + vec3(0.75, 0.88, 1.0) * 0.55;
    float diff = max(dot(n, L), 0.0);
    vec3 col = stone * (0.12 + diff * fall * lc * 2.6);
    col *= 1.0 - crack * 0.82;
    // faint light caught along cracks nearest the portal
    float seam = crack * smoothstep(1.5, -3.5, vWorld.z) * smoothstep(0.55, 0.9, tex.g);
    col += seam * lc * 0.14 * (0.4 + uEmit);

    float mirror = uMirror * F * mix(0.3, 1.0, wet) * (1.0 - crack * 0.9);
    col = mix(col, refl, clamp(mirror, 0.0, 1.0));
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

/* ───────────── outline + cliff ───────────── */

/** The ledge outline in plan view (x, z), tip toward the portal. */
const OUTLINE: [number, number][] = [
  [-1.9, -3.3], [-0.9, -4.05], [0.5, -4.25], [1.7, -3.75], [2.7, -2.7], [3.5, -1.1], [4.2, 1.1], [5.4, 3.6], [6.0, 6.2], [7.6, 9.2], [10, 13], [13, 18.5],
  [-13, 18.5], [-9.4, 14.2], [-6.6, 10.6], [-5.2, 7.4], [-4.4, 4.6], [-3.4, 2.2], [-2.9, -0.2], [-2.6, -1.9],
];

function outlineShape(jitter: number, inset = 0) {
  const pts = OUTLINE.map(([x, z]) => new THREE.Vector2(x, -z));
  const curve = new THREE.SplineCurve([...pts, pts[0]]);
  const spaced = curve.getSpacedPoints(160);
  spaced.pop();
  const c = new THREE.Vector2(0.5, -6);
  const out = spaced.map((p, i) => {
    const n = fbm3(p.x * 0.9, p.y * 0.9, 3.1, 3) - 0.5;
    const dir = p.clone().sub(c).normalize();
    return p.clone().addScaledVector(dir, n * jitter + (i % 7 === 0 ? -0.06 : 0) - inset);
  });
  return new THREE.Shape(out);
}

function cliffGeometry() {
  const depth = 9;
  const g = new THREE.ExtrudeGeometry(outlineShape(0.9), { depth, bevelEnabled: false, steps: 10 });
  g.translate(0, 0, -depth);
  g.rotateX(-Math.PI / 2); // shape (x, -z, d) → (x, d, z); extruded downward
  g.translate(0, -0.025, 0);
  const p = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    if (v.y < -0.1) {
      const k = THREE.MathUtils.clamp(-v.y / depth, 0, 1);
      const n = fbm3(v.x * 0.55, v.y * 0.5, v.z * 0.55, 4) - 0.5;
      const ledge = Math.sin(v.y * 2.7 + v.x * 0.4) * 0.12;
      // undercut toward the base, rough strata
      v.x = v.x * (1 - k * 0.32) + n * 1.6 + ledge;
      v.z = v.z * (1 - k * 0.32) + 2.4 * k + n * 1.4 - ledge;
    }
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

function rubble() {
  const rnd = seeded(77);
  const list: { geo: THREE.BufferGeometry; pos: [number, number, number]; rot: [number, number, number]; s: [number, number, number] }[] = [];
  const edge = OUTLINE.slice(0, 12);
  for (let i = 0; i < 16; i++) {
    const [x, z] = edge[Math.floor(rnd() * edge.length)];
    const s = 0.12 + Math.pow(rnd(), 2) * 0.55;
    list.push({
      geo: rockGeometry({ seed: 30 + i, detail: 1, rough: 0.35, squash: 0.6 }),
      pos: [x * (0.92 + rnd() * 0.1), s * 0.18, z + (rnd() - 0.5) * 0.8],
      rot: [rnd() * 0.4, rnd() * 6.28, rnd() * 0.4],
      s: [s * (1 + rnd()), s, s * (1 + rnd())],
    });
  }
  // broken slabs beyond the tip, dropping toward the void
  [
    [-0.2, -0.55, -5.0, 0.25, 1.2],
    [1.6, -1.3, -5.6, -0.35, 0.9],
    [-1.4, -1.9, -5.9, 0.4, 0.8],
  ].forEach(([x, y, z, tilt, s], i) =>
    list.push({ geo: rockGeometry({ seed: 60 + i, detail: 1, rough: 0.2, squash: 0.3, flatTop: 0.15 }), pos: [x, y, z], rot: [tilt, i * 1.3, tilt * 0.6], s: [s * 1.3, s, s] })
  );
  return list;
}

export default function Ledge({ resolution, msaa }: { resolution: number; msaa: number }) {
  const cliff = useMemo(() => cliffGeometry(), []);
  const pieces = useMemo(() => rubble(), []);
  const crack = useMemo(() => stoneMap(), []);
  const rock = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1b2029", roughness: 0.93, metalness: 0.05, flatShading: true }), []);

  const top = useMemo(() => {
    // Kept in local XY (+Z up after the object's −90° X rotation): the Reflector
    // derives its mirror plane from the object transform, not the geometry.
    const geo = new THREE.ShapeGeometry(outlineShape(0.9, 0.12), 6);
    // uvs in metres (world x, z) so the stone pattern has a fixed physical scale
    const p = geo.attributes.position;
    const uv = new Float32Array(p.count * 2);
    for (let i = 0; i < p.count; i++) uv.set([p.getX(i), -p.getY(i)], i * 2);
    geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    const uniforms = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, STONE_UNIFORMS]);
    if (resolution > 0) {
      const r = new Reflector(geo, {
        textureWidth: resolution,
        textureHeight: Math.round(resolution * 0.6),
        clipBias: 0.003,
        multisample: msaa,
        shader: { name: "WetStone", uniforms, vertexShader: STONE_VERT, fragmentShader: STONE_FRAG },
      });
      r.rotation.x = -Math.PI / 2;
      const m = r.material as THREE.ShaderMaterial;
      m.fog = true;
      m.uniforms.uCrack.value = crack;
      m.uniforms.uPortal.value.copy(portalFrame.pos);
      return { object: r as THREE.Mesh, material: m, dispose: () => r.dispose() };
    }
    // no mirror: the same stone, with the reflection term off
    const m = new THREE.ShaderMaterial({ uniforms, vertexShader: STONE_VERT, fragmentShader: STONE_FRAG, fog: true });
    m.uniforms.uCrack.value = crack;
    m.uniforms.uMirror.value = 0;
    m.uniforms.tDiffuse.value = new THREE.Texture();
    m.uniforms.uPortal.value.copy(portalFrame.pos);
    const mesh = new THREE.Mesh(geo, m);
    mesh.rotation.x = -Math.PI / 2;
    return { object: mesh, material: m, dispose: () => m.dispose() };
  }, [resolution, msaa, crack]);

  useEffect(() => () => top.dispose(), [top]);

  useFrame(() => {
    top.material.uniforms.uEmit.value = rig.emit;
  });

  return (
    <group>
      <primitive object={top.object} />
      <mesh geometry={cliff} material={rock} />
      {pieces.map((r, i) => (
        <mesh key={i} geometry={r.geo} material={rock} position={r.pos} rotation={r.rot} scale={r.s} />
      ))}
    </group>
  );
}
