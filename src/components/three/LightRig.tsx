"use client";
/**
 * One fixed set of lights shared by every world (hemisphere, key, three
 * points, one spot), re-aimed and re-coloured per active window each frame.
 * Keeping the light count constant means switching worlds never recompiles a
 * shader mid-scroll.
 */
import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { rig } from "@/lib/rig";
import { store } from "@/lib/store";
import { missionBySlug } from "@/data/nexus";
import { BRIEF, COMMS, HERO } from "@/config/world";
import { view } from "./view";
import { portalFrame } from "./WindowRig";

const CYAN = new THREE.Color("#4bdcfd");
const VIOLET = new THREE.Color("#8b6cff");
const off = (a: readonly number[], o: readonly number[]) => [a[0] + o[0], a[1] + o[1], a[2] + o[2]] as const;

export default function LightRig() {
  const hemi = useRef<THREE.HemisphereLight>(null);
  const key = useRef<THREE.DirectionalLight>(null);
  const p1 = useRef<THREE.PointLight>(null);
  const p2 = useRef<THREE.PointLight>(null);
  const p3 = useRef<THREE.PointLight>(null);
  const spot = useRef<THREE.SpotLight>(null);

  useFrame(() => {
    const h = hemi.current;
    const k = key.current;
    const a = p1.current;
    const b = p2.current;
    const c = p3.current;
    const s = spot.current;
    if (!h || !k || !a || !b || !c || !s) return;
    const id = view.active;
    if (id === "hero") {
      const { pos, quat } = portalFrame;
      const at = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).applyQuaternion(quat).add(pos);
      const emit = rig.emit;
      h.color.set("#2a3d63");
      h.groundColor.set("#06080d");
      h.intensity = 0.55;
      k.color.set("#8eaaff");
      k.intensity = 0.42;
      k.position.set(-14, 22, 6).add(pos);
      k.target.position.copy(pos);
      // emitters: cyan right/upper, violet left/lower
      a.color.copy(CYAN);
      a.position.copy(at(4.6, 2.2, 4.2));
      a.intensity = 22 + emit * 50;
      a.distance = 22;
      b.color.copy(VIOLET);
      b.position.copy(at(-4.6, -2.0, 4.2));
      b.intensity = 16 + emit * 50;
      b.distance = 22;
      // daylight spilling out of the aperture onto the ledge and the explorer
      c.color.set("#cfe8ff");
      c.position.copy(at(0, -0.4, 1.2));
      c.intensity = 30 + emit * 40;
      c.distance = 26;
      s.color.set("#d8ecff");
      s.position.copy(at(0, 0.6, 0.6));
      s.target.position.set(HERO.explorer.pos[0], 0.6, HERO.explorer.pos[2] + 3);
      s.angle = 0.6;
      s.penumbra = 0.8;
      s.intensity = 70 + emit * 80;
      s.distance = 34;
    } else if (id === "comms") {
      const o = COMMS.origin;
      h.color.set("#24375e");
      h.groundColor.set("#04070c");
      h.intensity = 0.5;
      k.color.set("#b9c9ff");
      k.intensity = 0.55;
      k.position.set(...off([30, 40, -120], o));
      k.target.position.set(...off([0, 0, -20], o));
      // rim lights behind the explorer's shore rock (city glow across the water)
      a.color.copy(CYAN);
      a.position.set(...off([2.5, 3, -37], o));
      a.intensity = 16;
      a.distance = 14;
      b.color.copy(VIOLET);
      b.position.set(...off([9, 3.4, -38], o));
      b.intensity = 14;
      b.distance = 14;
      c.color.set("#9fb7ff");
      c.position.set(...off([5, 5, -26], o));
      c.intensity = 4;
      c.distance = 12;
      s.intensity = 0;
    } else if (id === "brief") {
      const o = BRIEF.origin;
      const slug = store.get().briefing;
      const kind = (slug && missionBySlug(slug)?.world) || "terrain";
      h.color.set("#5d7fb8");
      h.groundColor.set("#0a0f1c");
      h.intensity = 0.8;
      k.color.set("#dfe8ff");
      k.intensity = 1.1;
      k.position.set(...off([6, 12, 8], o));
      k.target.position.set(...off([0, 0, 0], o));
      a.color.copy(CYAN);
      a.position.set(...off([-5, 3, 3], o));
      a.intensity = 22;
      a.distance = 16;
      b.color.copy(VIOLET);
      b.position.set(...off([5, 3, -2], o));
      b.intensity = 18;
      b.distance = 16;
      // per-diorama practicals (the cinema's screen glow, the hangar's work light)
      c.color.set("#5ce1ff");
      c.position.set(...off([0, 3, 2], o));
      c.intensity = kind === "cinema" ? 10 : 0;
      c.distance = 14;
      s.color.set("#dfe8ff");
      s.position.set(...off([3, 7.5, 5], o));
      s.target.position.set(...off([0, 1.5, 0], o));
      s.angle = 0.5;
      s.penumbra = 0.6;
      s.intensity = kind === "hangar" ? 120 : 0;
      s.distance = 24;
    }
    k.target.updateMatrixWorld();
    s.target.updateMatrixWorld();
  }, -9);

  return (
    <>
      <hemisphereLight ref={hemi} />
      <directionalLight ref={key} />
      <pointLight ref={p1} decay={2} />
      <pointLight ref={p2} decay={2} />
      <pointLight ref={p3} decay={2} />
      <spotLight ref={spot} decay={2} />
    </>
  );
}
