"use client";
/**
 * The briefing's evidence window: the selected mission's live diorama
 * (illustrative 3D, labelled as such in the DOM). All four are mounted (and
 * pre-compiled) so opening a briefing never hitches; only the selected one is
 * visible. Opening a briefing plays its signature animation once: the M01
 * route draws on, M02's level pads light in sequence, M04's service arms
 * retract.
 */
import { useEffect, useRef, type ComponentType } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { useFrame } from "@react-three/fiber";
import { rig } from "@/lib/rig";
import { store, useNexus } from "@/lib/store";
import { missionBySlug, type WorldKind } from "@/data/nexus";
import { BRIEF } from "@/config/world";
import { isActive, precompile } from "../view";
import TerrainWorld from "../missions/TerrainWorld";
import PhysicsLab from "../missions/PhysicsLab";
import CinemaDome from "../missions/CinemaDome";
import LaunchHangar from "../missions/LaunchHangar";
import { FloorGrid } from "../missions/shared";

const WORLDS: Record<WorldKind, ComponentType<{ segments?: number; mini?: boolean }>> = {
  terrain: TerrainWorld,
  lab: PhysicsLab,
  cinema: CinemaDome,
  hangar: LaunchHangar,
};
const KINDS = Object.keys(WORLDS) as WorldKind[];

export default function BriefWorld({ segments }: { segments: number }) {
  const root = useRef<THREE.Group>(null);
  const refs = useRef<Partial<Record<WorldKind, THREE.Group | null>>>({});
  const slug = useNexus((s) => s.briefing);
  const reduced = useNexus((s) => s.reduced);

  // Signature animation on open (or the finished state under reduced motion).
  useEffect(() => {
    const kind = slug ? missionBySlug(slug)?.world : undefined;
    if (!kind) return;
    gsap.killTweensOf(rig, "m01,m02,m04");
    if (reduced) {
      Object.assign(rig, { m01: 1, m02: 1, m04: 1 });
      return;
    }
    Object.assign(rig, { m01: 0, m02: 0, m04: 0 });
    const key = kind === "terrain" ? "m01" : kind === "lab" ? "m02" : kind === "hangar" ? "m04" : null;
    if (key) gsap.to(rig, { [key]: 1, duration: kind === "terrain" ? 3.2 : 2.2, ease: "power2.inOut", delay: 0.35 });
  }, [slug, reduced]);

  useFrame(() => {
    const r = root.current;
    if (!r) return;
    r.visible = isActive("brief");
    const kind = (store.get().briefing && missionBySlug(store.get().briefing!)?.world) || null;
    for (const k of KINDS) {
      const g = refs.current[k];
      if (g) g.visible = precompile.active || k === kind;
    }
  }, -8);

  return (
    <group ref={root} position={BRIEF.origin}>
      <mesh rotation-x={-Math.PI / 2} position-y={-1.6} renderOrder={-5}>
        <circleGeometry args={[60, 48]} />
        <meshStandardMaterial color="#05090f" roughness={0.9} metalness={0.1} />
      </mesh>
      <FloorGrid size={60} cell={2} opacity={0.12} y={-1.58} />
      {KINDS.map((k) => {
        const World = WORLDS[k];
        return (
          <group
            key={k}
            ref={(g) => {
              refs.current[k] = g;
            }}
          >
            <World segments={segments} />
          </group>
        );
      })}
    </group>
  );
}
