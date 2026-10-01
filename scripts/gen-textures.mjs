// Bakes the procedural textures the 3D stage used to generate at runtime, so
// first load does no per-pixel work on the main thread:
//   public/nexus/tex/stone.png  RGB  — R crack lines, G slab tone, B wet (puddle) mask; tiles seamlessly
//   public/nexus/tex/smoke.png  grey — 2×2 atlas of soft smoke puffs (luminance = alpha)
// usage: node scripts/gen-textures.mjs   (no dependencies: PNGs are encoded with node:zlib)
import { writeFileSync, mkdirSync } from "node:fs";
import { deflateSync } from "node:zlib";

/* ── deterministic noise (same family as the runtime helpers) ── */
function seeded(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}
const hash3 = (x, y, z) => {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
};
const lerp = (a, b, t) => a + (b - a) * t;
function noise3(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  const c = (a, b, d) => hash3(xi + a, yi + b, zi + d);
  return lerp(lerp(lerp(c(0, 0, 0), c(1, 0, 0), u), lerp(c(0, 1, 0), c(1, 1, 0), u), v), lerp(lerp(c(0, 0, 1), c(1, 0, 1), u), lerp(c(0, 1, 1), c(1, 1, 1), u), v), w);
}
function fbm3(x, y, z, octaves = 4) {
  let v = 0, a = 0.5;
  for (let i = 0; i < octaves; i++) {
    v += a * noise3(x, y, z);
    x = x * 2.03 + 17.1;
    y = y * 2.03 + 9.2;
    z = z * 2.03 + 3.7;
    a *= 0.5;
  }
  return v;
}
const smoothstep = (x, e0, e1) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

/* ── PNG encoder ── */
const CRC = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(width, height, channels, pixels) {
  const colorType = channels === 1 ? 0 : 2;
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = colorType;
  const raw = Buffer.alloc((width * channels + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * channels + 1)] = 0;
    Buffer.from(pixels.buffer, y * width * channels, width * channels).copy(raw, y * (width * channels + 1) + 1);
  }
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
}

/* ── stone: tiling Voronoi slabs + fine cracks + puddles ── */
function stone(size = 256) {
  const layer = (cells, seed) => {
    const rnd = seeded(seed);
    const pts = Array.from({ length: cells * cells }, () => [rnd(), rnd(), rnd()]);
    return (u, v) => {
      const x = u * cells, y = v * cells;
      const cx = Math.floor(x), cy = Math.floor(y);
      let f1 = 9, f2 = 9, id = 0;
      for (let j = -1; j <= 1; j++)
        for (let i = -1; i <= 1; i++) {
          const gx = cx + i, gy = cy + j;
          const p = pts[(((gy % cells) + cells) % cells) * cells + (((gx % cells) + cells) % cells)];
          const d = Math.hypot(gx + 0.15 + p[0] * 0.7 - x, gy + 0.15 + p[1] * 0.7 - y);
          if (d < f1) {
            f2 = f1;
            f1 = d;
            id = p[2];
          } else if (d < f2) f2 = d;
        }
      return { edge: f2 - f1, id };
    };
  };
  const big = layer(4, 11);
  const fine = layer(17, 29);
  const out = new Uint8Array(size * size * 3);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const u = x / size, v = y / size;
      const a = u * Math.PI * 2, b = v * Math.PI * 2;
      // tileable low-frequency fields (sampled on a torus)
      const n = fbm3(Math.cos(a) * 1.2, Math.sin(a) * 1.2 + Math.cos(b) * 1.2, Math.sin(b) * 1.2, 4);
      const n2 = fbm3(Math.cos(a) * 3 + 5, Math.sin(a) * 3, Math.cos(b) * 3 + Math.sin(b) * 3, 3);
      const B = big(u, v), F = fine(u, v);
      const crack = Math.max(1 - smoothstep(B.edge, 0, 0.045 + n2 * 0.03), (1 - smoothstep(F.edge, 0, 0.03)) * 0.55 * (n2 > 0.45 ? 1 : 0.25));
      const i = (y * size + x) * 3;
      out[i] = Math.round(crack * 255);
      out[i + 1] = Math.round((B.id * 0.7 + F.id * 0.3) * 255);
      out[i + 2] = Math.round(smoothstep(n, 0.42, 0.62) * 255);
    }
  return png(size, size, 3, out);
}

/* ── smoke: 2×2 atlas of soft puffs ── */
function smoke() {
  const S = 128, W = S * 2;
  const out = new Uint8Array(W * W);
  for (let k = 0; k < 4; k++) {
    const ox = (k % 2) * S, oy = Math.floor(k / 2) * S;
    for (let y = 0; y < S; y++)
      for (let x = 0; x < S; x++) {
        const nx = x / S, ny = y / S;
        let n = 0, amp = 0.55, f = 3;
        for (let o = 0; o < 4; o++) {
          n += amp * noise3(nx * f + k * 3.1, ny * f + o * 1.7, k * 5.3);
          f *= 2.1;
          amp *= 0.5;
        }
        const r = Math.hypot(nx - 0.5, (ny - 0.5) * 1.1) * 2;
        const a = Math.max(0, Math.min(1, (1 - r) * 1.6)) * Math.max(0, Math.min(1, (n - 0.3) * 1.9));
        out[(oy + y) * W + ox + x] = Math.round(Math.pow(a, 1.2) * 255);
      }
  }
  return png(W, W, 1, out);
}

mkdirSync("public/nexus/tex", { recursive: true });
let t = performance.now();
writeFileSync("public/nexus/tex/stone.png", stone());
console.log(`stone.png  ${(performance.now() - t).toFixed(0)} ms`);
t = performance.now();
writeFileSync("public/nexus/tex/smoke.png", smoke());
console.log(`smoke.png  ${(performance.now() - t).toFixed(0)} ms`);
