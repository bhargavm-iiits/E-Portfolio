/**
 * Geometry for the mechanical portal (Docs/Game §4): an asymmetric
 * segmented ring with a thick dark body — bevelled armour segments of uneven
 * depth and reach, inset face plates, a bore lip, outer greebles and pipes —
 * cyan emitters on the right / upper arc and violet on the left / lower arc,
 * a slower counter-ring behind, and blocks that have broken away.
 * Ring-local space: the ring lies in XY, +Z faces the viewer, units metres.
 */
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { seeded } from "../shared/util";

const TAU = Math.PI * 2;
const CYAN = new THREE.Color("#4bdcfd");
const VIOLET = new THREE.Color("#8b6cff");
const CYAN_HI = new THREE.Color("#a8f3ff");

/** Emitter colour by angle: cyan on the right / upper arc, violet on the left / lower arc. */
export function emitterColor(a: number, out = new THREE.Color()) {
  const d = Math.cos(a - 0.62);
  const w = THREE.MathUtils.smoothstep(d, -0.32, 0.32);
  return out.copy(VIOLET).lerp(CYAN, w);
}

function sectorShape(r0: number, r1: number, a0: number, a1: number) {
  const s = new THREE.Shape();
  s.moveTo(Math.cos(a0) * r1, Math.sin(a0) * r1);
  s.absarc(0, 0, r1, a0, a1, false);
  s.lineTo(Math.cos(a1) * r0, Math.sin(a1) * r0);
  s.absarc(0, 0, r0, a1, a0, true);
  s.closePath();
  return s;
}

/** A bevelled armour segment between z0 and z0 + depth. */
function slab(r0: number, r1: number, a0: number, a1: number, z0: number, depth: number, bevel = 0.035) {
  const segs = Math.max(3, Math.ceil(((a1 - a0) / TAU) * 140));
  const g = new THREE.ExtrudeGeometry(sectorShape(r0, r1, a0, a1), {
    depth: Math.max(0.001, depth - bevel * 2),
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 1,
    curveSegments: segs,
  });
  g.translate(0, 0, z0 + bevel);
  return g; // ExtrudeGeometry is already non-indexed
}

/** A box placed in polar coordinates (angle a, radius r), its local X tangential, Y radial. */
function polarBox(a: number, r: number, z: number, w: number, h: number, d: number, tilt = 0) {
  const g = new THREE.BoxGeometry(w, h, d).toNonIndexed();
  const m = new THREE.Matrix4().compose(
    new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, z),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, tilt, a - Math.PI / 2)),
    new THREE.Vector3(1, 1, 1)
  );
  g.applyMatrix4(m);
  return g;
}

/** Inward-facing cylindrical band (lights inside the bore). */
function boreBand(r: number, a0: number, a1: number, z0: number, z1: number) {
  const segs = Math.max(2, Math.ceil(((a1 - a0) / TAU) * 160));
  const pos: number[] = [];
  const nrm: number[] = [];
  const uv: number[] = [];
  for (let i = 0; i < segs; i++) {
    const t0 = a0 + ((a1 - a0) * i) / segs;
    const t1 = a0 + ((a1 - a0) * (i + 1)) / segs;
    const p = (t: number, z: number) => [Math.cos(t) * r, Math.sin(t) * r, z];
    const quad = [p(t0, z0), p(t1, z0), p(t1, z1), p(t0, z0), p(t1, z1), p(t0, z1)];
    const ts = [t0, t1, t1, t0, t1, t0];
    quad.forEach((q, k) => {
      pos.push(...q);
      nrm.push(-Math.cos(ts[k]), -Math.sin(ts[k]), 0);
      uv.push(0, 0);
    });
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nrm, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  return g;
}

function colorize(g: THREE.BufferGeometry, color: THREE.Color | ((x: number, y: number) => THREE.Color)) {
  const p = g.attributes.position;
  const c = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    const col = typeof color === "function" ? color(p.getX(i), p.getY(i)) : color;
    c[i * 3] = col.r;
    c[i * 3 + 1] = col.g;
    c[i * 3 + 2] = col.b;
  }
  g.setAttribute("color", new THREE.BufferAttribute(c, 3));
  return g;
}

const byAngle = (k = 1) => {
  const tmp = new THREE.Color();
  return (x: number, y: number) => emitterColor(Math.atan2(y, x), tmp).multiplyScalar(k);
};

function strip(attrs: THREE.BufferGeometry[]) {
  for (const g of attrs) {
    if (!g.attributes.uv) g.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
  }
  return attrs;
}

export interface RingParts {
  body: THREE.BufferGeometry;
  plates: THREE.BufferGeometry;
  emitters: THREE.BufferGeometry;
  back: { body: THREE.BufferGeometry; emitters: THREE.BufferGeometry };
  blocks: { body: THREE.BufferGeometry; plates: THREE.BufferGeometry; emitters: THREE.BufferGeometry; home: THREE.Vector3; rot: THREE.Euler; phase: number }[];
}

/** Build the whole portal. `inner` = bore radius, `outer` = typical armour reach. */
export function buildRing(inner: number, outer: number, seed = 7): RingParts {
  const rnd = seeded(seed);
  const body: THREE.BufferGeometry[] = [];
  const plates: THREE.BufferGeometry[] = [];
  const emitters: THREE.BufferGeometry[] = [];
  const blocks: RingParts["blocks"] = [];

  // Uneven segmentation: 26 segments, a few merged into long heavy pieces.
  const N = 26;
  const gap = 0.022;
  // Angles of the segments that have broken away (upper-left, right).
  const broken = new Set([9, 25]);
  let i = 0;
  while (i < N) {
    const span = rnd() < 0.18 && i < N - 1 && !broken.has(i + 1) ? 2 : 1;
    const a0 = (i / N) * TAU + gap / 2 + 0.08;
    const a1 = ((i + span) / N) * TAU - gap / 2 + 0.08;
    const heavy = span === 2 || rnd() < 0.22;
    const r0 = inner + rnd() * 0.05;
    const r1 = outer - 0.3 + rnd() * 0.35 + (heavy ? 0.4 : 0);
    const depth = 0.85 + rnd() * 0.45 + (heavy ? 0.3 : 0);
    const z0 = -depth / 2 + (rnd() - 0.5) * 0.12;
    const zf = z0 + depth;

    const pieceBody: THREE.BufferGeometry[] = [];
    const piecePlates: THREE.BufferGeometry[] = [];
    const pieceEm: THREE.BufferGeometry[] = [];

    // armour body
    pieceBody.push(slab(r0, r1, a0, a1, z0, depth));
    // bore lip: a slightly deeper inner rim
    pieceBody.push(slab(r0 - 0.04, r0 + 0.1, a0 + 0.004, a1 - 0.004, z0 - 0.12, depth + 0.24, 0.015));
    // face plates (one or two, radially split by a groove)
    const ai = 0.012;
    if (rnd() < 0.55) {
      piecePlates.push(slab(r0 + 0.2, r1 - 0.14, a0 + ai, a1 - ai, zf - 0.01, 0.07, 0.012));
    } else {
      const mid = r0 + 0.2 + (r1 - r0 - 0.34) * (0.35 + rnd() * 0.3);
      piecePlates.push(slab(r0 + 0.2, mid - 0.04, a0 + ai, a1 - ai, zf - 0.01, 0.06, 0.01));
      piecePlates.push(slab(mid + 0.04, r1 - 0.14, a0 + ai * 1.6, a1 - ai * 1.6, zf - 0.01, 0.1, 0.012));
    }
    // back plate
    piecePlates.push(slab(r0 + 0.25, r1 - 0.2, a0 + ai, a1 - ai, z0 - 0.05, 0.06, 0.01));

    // outer greebles: vents, boxes, a pipe run
    const nG = 1 + Math.floor(rnd() * 3);
    for (let g = 0; g < nG; g++) {
      const a = THREE.MathUtils.lerp(a0 + 0.03, a1 - 0.03, rnd());
      const w = 0.12 + rnd() * 0.3;
      const h = 0.08 + rnd() * 0.2;
      const d = 0.2 + rnd() * (depth * 0.6);
      pieceBody.push(polarBox(a, r1 + h / 2 - 0.02, z0 + depth * (0.2 + rnd() * 0.6), w, h, d));
    }
    if (rnd() < 0.4) {
      const pipe = new THREE.TorusGeometry(r1 + 0.06, 0.035, 6, Math.max(4, Math.ceil((a1 - a0) * 30)), a1 - a0 - 0.04).toNonIndexed();
      pipe.rotateZ(a0 + 0.02);
      pipe.translate(0, 0, zf - 0.18);
      pieceBody.push(pipe);
    }
    // front greeble blocks on the plate
    if (rnd() < 0.5) {
      const a = THREE.MathUtils.lerp(a0 + 0.04, a1 - 0.04, rnd());
      pieceBody.push(polarBox(a, THREE.MathUtils.lerp(r0 + 0.35, r1 - 0.3, rnd()), zf + 0.1, 0.18 + rnd() * 0.2, 0.1 + rnd() * 0.18, 0.1));
    }

    // emitters — the inner front strip (most segments)
    if (rnd() < 0.86) {
      pieceEm.push(colorize(slab(r0 + 0.11, r0 + 0.16, a0 + 0.008, a1 - 0.008, zf + 0.005, 0.03, 0), byAngle(1)));
    }
    // a light line inside the bore, near the front
    pieceEm.push(colorize(boreBand(r0 - 0.045, a0 + 0.01, a1 - 0.01, zf - 0.1, zf - 0.04), byAngle(0.9)));
    // outer accent bars (tangential), brighter on heavy pieces
    if (rnd() < 0.5 || heavy) {
      const t0 = THREE.MathUtils.lerp(a0, a1, 0.1 + rnd() * 0.3);
      const t1 = THREE.MathUtils.lerp(t0, a1, 0.4 + rnd() * 0.5);
      pieceEm.push(colorize(slab(r1 - 0.2, r1 - 0.15, t0, t1, zf + 0.06, 0.03, 0), byAngle(heavy ? 1.2 : 0.8)));
    }
    // radial notch lights
    if (rnd() < 0.35) {
      const a = THREE.MathUtils.lerp(a0, a1, 0.5);
      const g = polarBox(a, (r0 + r1) / 2, zf + 0.09, 0.03, (r1 - r0) * 0.35, 0.02);
      pieceEm.push(colorize(g, emitterColor(a).multiplyScalar(0.9)));
    }
    // small white-hot status pips
    if (rnd() < 0.3) {
      const a = THREE.MathUtils.lerp(a0 + 0.02, a1 - 0.02, rnd());
      pieceEm.push(colorize(polarBox(a, r1 - 0.32, zf + 0.09, 0.05, 0.05, 0.02), CYAN_HI));
    }

    if (broken.has(i)) {
      // This piece has broken away: centre it on its own origin to float nearby.
      const mid = (a0 + a1) / 2;
      const home = new THREE.Vector3(Math.cos(mid), Math.sin(mid), 0).multiplyScalar((r0 + r1) / 2);
      const centre = (list: THREE.BufferGeometry[]) => {
        const m = mergeGeometries(strip(list), false)!;
        m.translate(-home.x, -home.y, 0);
        return m;
      };
      const push = 1.3 + rnd() * 1.4;
      const dir = new THREE.Vector3(Math.cos(mid), Math.sin(mid), 0);
      blocks.push({
        body: centre(pieceBody),
        plates: centre(piecePlates),
        emitters: centre(pieceEm),
        home: home.clone().addScaledVector(dir, push).add(new THREE.Vector3(0, 0, 0.6 + rnd() * 0.8)),
        rot: new THREE.Euler((rnd() - 0.5) * 0.7, (rnd() - 0.5) * 0.9, (rnd() - 0.5) * 0.6),
        phase: rnd() * TAU,
      });
    } else {
      body.push(...pieceBody);
      plates.push(...piecePlates);
      emitters.push(...pieceEm);
    }
    i += span;
  }

  // Two smaller fragments drifting farther out (debris from the breaks).
  for (const a of [1.95, 2.35, -0.55]) {
    const fragBody = [slab(0.0, 0.5 + rnd() * 0.3, -0.3, 0.3, -0.25, 0.5 + rnd() * 0.3)];
    const g = mergeGeometries(strip(fragBody), false)!;
    g.center();
    const r = outer + 1.4 + rnd() * 1.6;
    blocks.push({
      body: g,
      plates: new THREE.BufferGeometry(),
      emitters: new THREE.BufferGeometry(),
      home: new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, -0.4 + rnd() * 1.2),
      rot: new THREE.Euler(rnd() * 3, rnd() * 3, rnd() * 3),
      phase: rnd() * TAU,
    });
  }

  // Counter-ring behind: fewer, larger plates with uneven gaps, sparse lights.
  const backBody: THREE.BufferGeometry[] = [];
  const backEm: THREE.BufferGeometry[] = [];
  let a = 0;
  while (a < TAU - 0.2) {
    const len = 0.3 + rnd() * 0.45;
    const g = 0.05 + rnd() * 0.14;
    const a0 = a;
    const a1 = Math.min(TAU - 0.02, a + len);
    const r0 = outer - 0.75 + rnd() * 0.1;
    const r1 = outer + 0.15 + rnd() * 0.3;
    backBody.push(slab(r0, r1, a0, a1, -1.55, 0.5));
    backBody.push(slab(r0 + 0.12, r1 - 0.08, a0 + 0.02, a1 - 0.02, -1.08, 0.07, 0.01));
    if (rnd() < 0.55) backEm.push(colorize(slab(r1 - 0.09, r1 - 0.05, a0 + 0.03, a1 - 0.03, -1.0, 0.025, 0), byAngle(0.7)));
    a = a1 + g;
  }

  const merge = (list: THREE.BufferGeometry[]) => (list.length ? mergeGeometries(strip(list), false) : null) ?? new THREE.BufferGeometry();
  return {
    body: merge(body),
    plates: merge(plates),
    emitters: merge(emitters),
    back: { body: merge(backBody), emitters: merge(backEm) },
    blocks,
  };
}
