"use client";
/**
 * The explorer: a rigged suited humanoid (Mixamo "X Bot", trimmed to its idle
 * clip), restyled as in the reference — a near-black suit with a cool rim
 * (fresnel) from the light in front of it, a VR headset with a strap light,
 * and a cyan back emblem that brightens on activation (`rig.glow`). Headset
 * and emblem ride the skeleton, so they follow the idle. Each instance clones
 * the skinned scene (SkeletonUtils), so the hero and the contact band can each
 * have one.
 */
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { rig } from "@/lib/rig";
import { view } from "../view";

const MODEL = "/nexus/player.glb";
let pending: Promise<GLTF> | null = null;

/** Loads the model once (no Suspense: the canvas must never suspend). */
export function loadExplorer() {
  pending ??= new GLTFLoader().loadAsync(MODEL);
  return pending;
}

const CYAN = new THREE.Color("#4bdcfd");

/** Standard PBR plus a fresnel rim added before output. */
function suitMaterial(opts: { color: string; metalness: number; roughness: number; rim: THREE.Color; emissive?: THREE.Color; emissiveIntensity?: number }) {
  const m = new THREE.MeshStandardMaterial({
    color: opts.color,
    metalness: opts.metalness,
    roughness: opts.roughness,
    envMapIntensity: 0.3,
    emissive: opts.emissive ?? new THREE.Color(0),
    emissiveIntensity: opts.emissiveIntensity ?? 0,
  });
  const uniforms = { uRim: { value: opts.rim.clone() }, uRimStrength: { value: 1 } };
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.fragmentShader = shader.fragmentShader
      .replace("void main() {", "uniform vec3 uRim;\nuniform float uRimStrength;\nvoid main() {")
      .replace(
        "#include <opaque_fragment>",
        `float facing = clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0);
         outgoingLight += uRim * pow(1.0 - facing, 3.0) * uRimStrength;
         #include <opaque_fragment>`
      );
  };
  m.customProgramCacheKey = () => "suit-rim";
  m.userData.rim = uniforms;
  return m;
}

const glowMat = (color: THREE.Color, k: number) => new THREE.MeshBasicMaterial({ color: color.clone().multiplyScalar(k), toneMapped: false });

/** VR headset on the head bone: visor, strap with a rear light module. Units: metres. */
function buildHeadset(stripMat: THREE.Material) {
  const g = new THREE.Group();
  const shell = new THREE.MeshStandardMaterial({ color: "#0b0e18", metalness: 0.7, roughness: 0.3 });
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.095, 0.11), shell);
  visor.position.set(0, 0.075, 0.1);
  g.add(visor);
  const strap = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.014, 8, 40), shell);
  strap.rotation.x = Math.PI / 2;
  strap.scale.set(1, 1.18, 1);
  strap.position.set(0, 0.085, 0);
  g.add(strap);
  const rear = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.03), shell);
  rear.position.set(0, 0.09, -0.115);
  g.add(rear);
  const light = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.008, 0.004), stripMat);
  light.position.set(0, 0.09, -0.131);
  g.add(light);
  const side = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.008, 0.07), stripMat);
  side.position.set(0.112, 0.085, 0);
  g.add(side, side.clone().translateX(-0.224));
  return g;
}

/** Back emblem: a ring, its core and two strips. */
function buildEmblem(mat: THREE.Material) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.007, 8, 48), mat));
  g.add(new THREE.Mesh(new THREE.CircleGeometry(0.016, 24), mat));
  for (const s of [-1, 1]) {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.06, 0.004), mat);
    strip.position.set(s * 0.08, -0.065, 0);
    strip.rotation.z = s * 0.35;
    g.add(strip);
  }
  return g;
}

/** Pack with a lid and side pouches; the emblem sits on its back panel. */
function buildBackpack(mat: THREE.Material) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new RoundedBoxGeometry(0.3, 0.38, 0.14, 3, 0.035), mat);
  g.add(body);
  const lid = new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.1, 0.17, 2, 0.03), mat);
  lid.position.set(0, 0.17, -0.01);
  g.add(lid);
  for (const s of [-1, 1]) {
    const pouch = new THREE.Mesh(new RoundedBoxGeometry(0.07, 0.18, 0.1, 2, 0.02), mat);
    pouch.position.set(s * 0.18, -0.08, 0.005);
    g.add(pouch);
  }
  return g;
}

/** A long coat skirt hanging from the hips, open at the front. */
function buildCoat(mat: THREE.Material) {
  const geo = new THREE.CylinderGeometry(0.165, 0.29, 0.58, 20, 4, true, 0.32, Math.PI * 2 - 0.64);
  const p = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i);
    // folds toward the hem
    const a = Math.atan2(p.getX(i), p.getZ(i));
    const k = THREE.MathUtils.smoothstep(-y, -0.1, 0.29);
    const fold = 1 + Math.sin(a * 7) * 0.05 * k;
    p.setX(i, p.getX(i) * fold);
    p.setZ(i, p.getZ(i) * fold);
  }
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, mat);
}

interface ExplorerProps {
  position: readonly [number, number, number];
  /** Yaw (radians); π faces −Z (seen from behind by a camera on +Z). */
  yaw?: number;
  height?: number;
  rim?: string;
  /** Emblem / strap glow 0..1 (defaults to the portal's `rig.glow`). */
  glow?: () => number;
  rimStrength?: () => number;
}

export default function Explorer({ position, yaw = Math.PI, height = 1.8, rim = "#9fc4ff", glow = () => rig.glow, rimStrength = () => 0.3 + rig.emit * 0.9 }: ExplorerProps) {
  const [gltf, setGltf] = useState<GLTF | null>(null);

  const mats = useMemo(() => {
    const rimColor = new THREE.Color(rim);
    return {
      surface: suitMaterial({ color: "#0b0e16", metalness: 0.3, roughness: 0.62, rim: rimColor }),
      joints: suitMaterial({ color: "#080a12", metalness: 0.45, roughness: 0.5, rim: rimColor, emissive: CYAN, emissiveIntensity: 0.01 }),
      cloth: (() => {
        const m = suitMaterial({ color: "#0a0d14", metalness: 0.08, roughness: 0.85, rim: rimColor });
        m.side = THREE.DoubleSide;
        return m;
      })(),
      emblem: glowMat(CYAN, 2.6),
      strip: glowMat(CYAN, 2.2),
    };
  }, [rim]);

  useEffect(() => {
    let alive = true;
    loadExplorer()
      .then((g) => {
        if (!alive) return;
        setGltf(g);
        view.dirty = true;
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // Clone, restyle, rig props to bones, fit to height, start the idle.
  const model = useMemo(() => {
    if (!gltf) return null;
    const scene = cloneSkinned(gltf.scene) as THREE.Group;
    const bones: Record<string, THREE.Bone> = {};
    scene.traverse((o) => {
      if ((o as THREE.Bone).isBone) bones[o.name.replace(/^mixamorig:?/, "")] = o as THREE.Bone;
      const mesh = o as THREE.SkinnedMesh;
      if (mesh.isMesh) {
        const name = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material).name;
        mesh.material = /Joints/i.test(name) ? mats.joints : mats.surface;
        mesh.frustumCulled = false;
      }
    });
    scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(scene);
    const k = height / Math.max(0.01, box.max.y - box.min.y);
    scene.scale.setScalar(scene.scale.x * k);
    scene.position.y -= box.min.y * k;
    scene.updateMatrixWorld(true);

    const attach = (bone: THREE.Bone | undefined, obj: THREE.Object3D, offset: THREE.Vector3) => {
      if (!bone) return;
      const s = bone.getWorldScale(new THREE.Vector3()).x;
      obj.scale.setScalar(1 / s);
      obj.position.copy(offset).multiplyScalar(1 / s);
      bone.add(obj);
    };
    attach(bones.Head, buildHeadset(mats.strip), new THREE.Vector3(0, 0, 0));
    attach(bones.Spine2, buildBackpack(mats.cloth), new THREE.Vector3(0, 0.02, -0.19));
    attach(bones.Hips, buildCoat(mats.cloth), new THREE.Vector3(0, -0.27, -0.005));
    const emblem = buildEmblem(mats.emblem);
    emblem.rotation.y = Math.PI;
    attach(bones.Spine2, emblem, new THREE.Vector3(0, 0.03, -0.265));

    const m = new THREE.AnimationMixer(scene);
    const idle = gltf.animations.find((a) => a.name === "idle") ?? gltf.animations[0];
    if (idle) {
      const action = m.clipAction(idle);
      action.time = (Math.abs(position[0] * 7.31 + position[2] * 3.17) % 1) * idle.duration;
      action.play();
    }
    return { scene, mixer: m };
    // position only seeds the idle phase
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gltf, mats, height]);

  useEffect(() => () => {
    model?.mixer.stopAllAction();
  }, [model]);

  useFrame(() => {
    if (model && view.dt > 0) model.mixer.update(view.dt);
    const e = glow();
    mats.emblem.color.copy(CYAN).multiplyScalar(0.4 + e * 2.6);
    mats.strip.color.copy(CYAN).multiplyScalar(0.6 + e * 1.8);
    const r = rimStrength();
    mats.surface.userData.rim.uRimStrength.value = r;
    mats.joints.userData.rim.uRimStrength.value = r * 0.8;
    mats.cloth.userData.rim.uRimStrength.value = r * 0.7;
    mats.joints.emissiveIntensity = 0.008 + e * 0.03;
  });

  return <group position={position as [number, number, number]} rotation-y={yaw}>{model && <primitive object={model.scene} />}</group>;
}
