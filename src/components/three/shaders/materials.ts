import * as THREE from "three";
import { FRAG_TAIL, NOISE, withFog } from "./common";

/* ─────────────── Towers (instanced) — window lights + neon edges ─────────────── */

/**
 * Neon skyscrapers (the entry reference's city): dark facades with dense cool
 * window grids (some warm, some fully lit floors), cyan/magenta edge strips,
 * text-free glowing billboards, red roof beacons, and a blue haze the lower
 * floors sink into. Windows fade to their average brightness with distance
 * (derivative AA) so far towers never shimmer.
 */
export function createTowerMaterial(opts: { haze?: THREE.ColorRepresentation; hazeY?: number; density?: number; boards?: boolean; glow?: number } = {}) {
  const haze = new THREE.Color(opts.haze ?? "#0B1C46");
  return new THREE.ShaderMaterial({
    fog: true,
    uniforms: withFog({
      uTime: { value: 0 },
      uHaze: { value: new THREE.Vector3(Math.pow(haze.r, 2.2), Math.pow(haze.g, 2.2), Math.pow(haze.b, 2.2)) },
      uHazeY: { value: opts.hazeY ?? -12 },
      uOpacity: { value: 1 },
      uDensity: { value: opts.density ?? 1 },
      uBoards: { value: opts.boards === false ? 0 : 1 },
      uGlow: { value: opts.glow ?? 1 },
    }),
    vertexShader: /* glsl */ `
      #include <fog_pars_vertex>
      varying vec3 vLocal;
      varying vec3 vScale;
      varying vec3 vNormalW;
      varying float vSeed;
      varying float vWorldY;
      void main() {
        vLocal = position;
        vScale = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
        vSeed = fract(sin(float(gl_InstanceID) * 12.9898) * 43758.5453);
        vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
        vWorldY = wp.y;
        vNormalW = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
        vec4 mvPosition = viewMatrix * wp;
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }
    `,
    fragmentShader: /* glsl */ `
      #include <fog_pars_fragment>
      uniform float uTime;
      uniform vec3 uHaze;
      uniform float uHazeY;
      uniform float uOpacity;
      uniform float uDensity;
      uniform float uBoards;
      uniform float uGlow;
      varying vec3 vLocal;
      varying vec3 vScale;
      varying vec3 vNormalW;
      varying float vSeed;
      varying float vWorldY;
      ${NOISE}
      vec3 boardColor(float s) {
        if (s < 0.3) return vec3(1.0, 0.3, 0.66);
        if (s < 0.55) return vec3(1.0, 0.62, 0.26);
        if (s < 0.8) return vec3(0.3, 0.9, 1.0);
        return vec3(0.66, 0.46, 1.0);
      }
      void main() {
        vec3 p = vLocal * vScale;                 // metres on the surface, centred
        vec3 n = abs(vNormalW);
        float h = vLocal.y + 0.5;                 // 0 base → 1 roof
        vec3 col = toLin(vec3(0.028, 0.042, 0.095)) * (0.75 + 0.35 * h);

        if (n.y < 0.5) {
          bool xFace = n.x > n.z;
          vec2 uv = xFace ? p.zy : p.xy;
          float faceW = xFace ? vScale.z : vScale.x;
          // facade ribs
          col += toLin(vec3(0.06, 0.09, 0.18)) * step(0.93, fract(uv.x * 0.45 + vSeed * 3.0)) * 0.5;

          // windows (0.42 m × 0.62 m), anti-aliased to their mean at distance
          vec2 g = uv * vec2(2.4, 1.6);
          vec2 cell = floor(g);
          vec2 f = fract(g);
          float win = step(0.22, f.x) * step(f.x, 0.78) * step(0.26, f.y) * step(f.y, 0.74);
          float r = hash21(cell + vSeed * 91.0);
          float floorLit = step(0.96, hash21(vec2(cell.y, vSeed * 13.0)));
          float dens = mix(0.14, 0.4, fract(vSeed * 7.3)) * uDensity;
          float lit = min(step(1.0 - dens, r) + floorLit, 1.0);
          vec3 cool = mix(vec3(0.7, 0.88, 1.0), vec3(0.36, 0.58, 1.0), step(0.55, fract(r * 5.3)));
          vec3 wc = mix(cool, vec3(1.0, 0.74, 0.44), step(0.88, fract(r * 9.7)));
          float bright = 0.3 + 0.8 * fract(r * 3.7);
          vec3 windows = toLin(wc) * win * lit * bright * 1.15 * uGlow;
          vec3 mean = toLin(vec3(0.5, 0.7, 1.0)) * (dens + 0.04) * 0.31 * 0.7;
          float aa = smoothstep(0.3, 0.85, max(fwidth(g.x), fwidth(g.y)));
          col += mix(windows, mean, aa);

          // neon edge strips (some towers)
          float across = xFace ? abs(vLocal.z) : abs(vLocal.x);
          float strip = smoothstep(0.468, 0.5, across) * step(0.52, fract(vSeed * 5.0));
          vec3 neon = mix(vec3(0.3, 0.86, 0.99), vec3(0.58, 0.45, 1.0), step(0.68, fract(vSeed * 11.0)));
          col += toLin(neon) * strip * 1.8;

          // a text-free billboard on some towers, hung in the band the camera sees
          float centreY = vWorldY - p.y;                       // tower centre, world y
          float boardY = -5.0 + 14.0 * fract(vSeed * 23.0);     // world height of the board
          float hasBoard = uBoards * step(0.6, fract(vSeed * 17.0)) * step(4.0, faceW)
                         * step(centreY - vScale.y * 0.5 + 2.0, boardY) * step(boardY, centreY + vScale.y * 0.5 - 2.0);
          vec2 bc = vec2(0.0, boardY - centreY);
          vec2 bs = vec2(min(faceW * 0.7, 6.0), 1.5 + 1.6 * fract(vSeed * 29.0));
          vec2 bd = abs(uv - bc) - bs * 0.5;
          float edgeDist = max(bd.x, bd.y);
          float inBoard = step(edgeDist, 0.0) * hasBoard;
          vec3 bcol = toLin(boardColor(fract(vSeed * 37.0)));
          // a lit sign: soft vertical gradient, fine scanlines, a slow light sweep, a bright frame
          vec2 bl = (uv - bc) / bs + 0.5;
          float grad = 0.75 + 0.35 * smoothstep(0.0, 1.0, bl.y);
          float lines = 0.88 + 0.12 * sin(bl.y * 90.0);
          float sweep = smoothstep(0.18, 0.0, abs(fract(bl.x * 0.6 - uTime * 0.12 + vSeed) - 0.5));
          float frame = smoothstep(-0.18, 0.0, edgeDist);
          vec3 sign = bcol * (1.25 * grad * lines + sweep * 0.7 + frame * 1.2);
          col = mix(col, sign, inBoard);
          col += bcol * smoothstep(0.45, 0.0, edgeDist) * step(0.0, edgeDist) * hasBoard * 0.7;

          // roof rim
          col += toLin(neon) * smoothstep(0.485, 0.5, vLocal.y) * 0.5 * step(0.4, fract(vSeed * 3.1));
        } else if (vNormalW.y > 0.5) {
          // roof beacon
          float beacon = smoothstep(0.16, 0.0, length(vLocal.xz)) * (0.55 + 0.45 * sin(uTime * 2.2 + vSeed * 30.0));
          col += vec3(2.4, 0.18, 0.12) * beacon * step(0.35, fract(vSeed * 19.0));
        }

        // lower floors sink into the blue haze
        float haze = smoothstep(uHazeY + 9.0, uHazeY - 16.0, vWorldY);
        col = mix(col, uHaze, haze * 0.9);
        gl_FragColor = vec4(col, uOpacity);
        ${FRAG_TAIL}
      }
    `,
  });
}
