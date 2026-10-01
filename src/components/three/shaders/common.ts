import * as THREE from "three";

/** Value noise + fbm, shared by several shaders. */
export const NOISE = /* glsl */ `
// Colours in shaders are authored in sRGB and converted: the pipeline is linear.
vec3 toLin(vec3 c) { return pow(c, vec3(2.2)); }
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
             mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * vnoise(p);
    p = p * 2.03 + vec2(17.1, 9.2);
    a *= 0.5;
  }
  return v;
}
`;

/** Fog-aware ShaderMaterial uniforms. */
export function withFog<T extends Record<string, THREE.IUniform>>(uniforms: T) {
  return THREE.UniformsUtils.merge([THREE.UniformsLib.fog, uniforms]) as T &
    typeof THREE.UniformsLib.fog;
}

/** Chunks appended to fragment shaders so custom materials tone-map + fog like built-ins. */
export const FRAG_TAIL = /* glsl */ `
  #include <fog_fragment>
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
`;
