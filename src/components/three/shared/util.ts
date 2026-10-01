/** Deterministic helpers for procedural geometry (no texture downloads). */
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { view } from "../view";

export function seeded(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function hash3(x: number, y: number, z: number) {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
}

/** 3D value noise in [0, 1]. */
export function noise3(x: number, y: number, z: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const xf = x - xi;
  const yf = y - yi;
  const zf = z - zi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const w = zf * zf * (3 - 2 * zf);
  const l = THREE.MathUtils.lerp;
  const c = (dx: number, dy: number, dz: number) => hash3(xi + dx, yi + dy, zi + dz);
  return l(
    l(l(c(0, 0, 0), c(1, 0, 0), u), l(c(0, 1, 0), c(1, 1, 0), u), v),
    l(l(c(0, 0, 1), c(1, 0, 1), u), l(c(0, 1, 1), c(1, 1, 1), u), v),
    w
  );
}

export function fbm3(x: number, y: number, z: number, octaves = 4) {
  let v = 0;
  let a = 0.5;
  for (let i = 0; i < octaves; i++) {
    v += a * noise3(x, y, z);
    x = x * 2.03 + 17.1;
    y = y * 2.03 + 9.2;
    z = z * 2.03 + 3.7;
    a *= 0.5;
  }
  return v;
}

/**
 * A jagged rock: a subdivided icosahedron pushed around by fbm, with flattened
 * strata and a few hard facets, then flat-shaded so its planes catch light.
 */
export function rockGeometry(opts: { seed: number; detail?: number; rough?: number; squash?: number; flatTop?: number }) {
  const { seed, detail = 2, rough = 0.42, squash = 1, flatTop = 0 } = opts;
  const g = mergeVertices(new THREE.IcosahedronGeometry(1, detail));
  const p = g.attributes.position as THREE.BufferAttribute;
  const o = seed * 7.31;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n = fbm3(v.x * 1.4 + o, v.y * 1.4 + o * 0.7, v.z * 1.4 - o, 4);
    const facet = Math.floor(noise3(v.x * 2.2 + o, v.y * 2.2, v.z * 2.2) * 3) / 3;
    v.multiplyScalar(1 + (n - 0.5) * rough * 2 + (facet - 0.33) * rough * 0.35);
    v.y *= squash;
    if (flatTop > 0 && v.y > flatTop) v.y = flatTop + (v.y - flatTop) * 0.12;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  const flat = g.toNonIndexed();
  flat.computeVertexNormals();
  g.dispose();
  return flat;
}

/** A tall weathered spire / sea stack (for cliffs and distant pinnacles). */
export function spireGeometry(opts: { seed: number; height: number; radius: number; lean?: number }) {
  const { seed, height, radius, lean = 0 } = opts;
  const g = new THREE.CylinderGeometry(radius * 0.18, radius, height, 9, 14, false);
  g.translate(0, height / 2, 0);
  const p = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const h = v.y / height;
    const n = fbm3(v.x * 0.5 + seed, v.y * 0.35, v.z * 0.5 - seed, 4);
    const k = 1 + (n - 0.5) * 0.9;
    v.x = v.x * k + lean * h * h * height * 0.15;
    v.z *= k;
    // shelf-like strata
    v.y += Math.sin(h * 40 + seed) * 0.08 * height * 0.01;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  const flat = g.toNonIndexed();
  flat.computeVertexNormals();
  g.dispose();
  return flat;
}

/**
 * Baked textures (scripts/gen-textures.mjs), loaded once and shared. The
 * returned texture is usable at once and fills in when the image arrives.
 */
const textures = new Map<string, THREE.Texture>();
export function loadTexture(url: string, setup?: (t: THREE.Texture) => void) {
  let t = textures.get(url);
  if (!t) {
    t = new THREE.TextureLoader().load(url, () => {
      view.dirty = true;
    });
    setup?.(t);
    textures.set(url, t);
  }
  return t;
}

/** 2×2 atlas of soft smoke puffs (luminance = coverage). */
export function smokeAtlas() {
  return loadTexture("/nexus/tex/smoke.png", (t) => {
    t.minFilter = THREE.LinearMipmapLinearFilter;
  });
}

/** Stone slabs: R crack lines, G slab tone, B puddle mask (tiles seamlessly). */
export function stoneMap() {
  return loadTexture("/nexus/tex/stone.png", (t) => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.anisotropy = 8;
  });
}

/** sRGB hex → linear vec3 (for shader uniforms authored in sRGB). */
export function lin(hex: string) {
  return new THREE.Color(hex);
}

/** A small conifer (stacked cones + trunk), about 1 m tall. */
export function coniferGeometry(seed: number) {
  const rnd = seeded(seed);
  const geos: THREE.BufferGeometry[] = [];
  const h = 1;
  const layers = 4 + Math.floor(rnd() * 3);
  for (let i = 0; i < layers; i++) {
    const t = i / layers;
    const c = new THREE.ConeGeometry((1 - t) * 0.32 + 0.06, h * 0.42, 7).toNonIndexed();
    c.translate(0, 0.18 + t * h * 0.78, 0);
    geos.push(c);
  }
  const trunk = new THREE.CylinderGeometry(0.03, 0.04, 0.3, 5).toNonIndexed();
  trunk.translate(0, 0.12, 0);
  geos.push(trunk);
  let n = 0;
  geos.forEach((g) => (n += g.attributes.position.count));
  const pos = new Float32Array(n * 3);
  let o = 0;
  geos.forEach((g) => {
    pos.set(g.attributes.position.array as Float32Array, o);
    o += g.attributes.position.count * 3;
  });
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  out.computeVertexNormals();
  return out;
}
