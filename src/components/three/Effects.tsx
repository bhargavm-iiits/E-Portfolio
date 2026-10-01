"use client";
/**
 * Post: bloom on emitters / the bright aperture → a grade pass (exposure, and
 * a radial blur used only while crossing the aperture) → ACES tone mapping →
 * fine film grain. No vignette: the page's own panels frame the windows.
 */
import { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, ToneMapping, Noise } from "@react-three/postprocessing";
import { BlendFunction, Effect, EffectAttribute, ToneMappingMode } from "postprocessing";
import { rig } from "@/lib/rig";
import type { TierSettings } from "@/config/quality";

const gradeFrag = /* glsl */ `
uniform float uRadial;
uniform float uExposure;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec3 col = inputColor.rgb;
  if (uRadial > 0.001) {
    vec2 dir = uv - vec2(0.5);
    vec3 acc = col;
    for (int i = 1; i < 12; i++) {
      float s = float(i) / 12.0 * uRadial * 0.2;
      acc += texture2D(inputBuffer, uv - dir * s).rgb;
    }
    col = acc / 12.0;
  }
  outputColor = vec4(col * uExposure, inputColor.a);
}
`;

class GradeEffect extends Effect {
  constructor() {
    super("GradeEffect", gradeFrag, {
      attributes: EffectAttribute.CONVOLUTION,
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, THREE.Uniform>([
        ["uRadial", new THREE.Uniform(0)],
        ["uExposure", new THREE.Uniform(1)],
      ]),
    });
  }
}

/** The live composer, so the stage can pre-compile its pass shaders with everything else. */
export const composerRef: { current: unknown } = { current: null };

/** Every material the composer's passes (and their effects' inner passes) render with. */
export function composerMaterials(): THREE.Material[] {
  const out = new Set<THREE.Material>();
  const visit = (o: unknown, depth: number) => {
    if (!o || typeof o !== "object" || depth > 3) return;
    if ((o as THREE.Material).isMaterial) {
      out.add(o as THREE.Material);
      return;
    }
    if (o instanceof THREE.Object3D || o instanceof THREE.Texture || o instanceof THREE.BufferGeometry || (o as THREE.WebGLRenderTarget).isRenderTarget) return;
    for (const v of Object.values(o as Record<string, unknown>)) {
      if (Array.isArray(v)) v.forEach((x) => visit(x, depth + 1));
      else visit(v, depth + 1);
    }
  };
  visit((composerRef.current as { passes?: unknown[] } | null)?.passes, 0);
  return [...out];
}

export default function Effects({ tier }: { tier: TierSettings }) {
  const grade = useMemo(() => new GradeEffect(), []);

  useFrame(() => {
    grade.uniforms.get("uRadial")!.value = rig.radial;
    grade.uniforms.get("uExposure")!.value = rig.exposure;
  });

  return (
    <EffectComposer
      ref={(c) => {
        composerRef.current = c;
      }}
      multisampling={tier.bloomScale === 1 ? 4 : 0}
      enableNormalPass={false}
    >
      <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.82} luminanceSmoothing={0.2} radius={0.72} resolutionScale={tier.bloomScale} />
      <primitive object={grade} dispose={null} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Noise opacity={0.025} premultiply />
    </EffectComposer>
  );
}
