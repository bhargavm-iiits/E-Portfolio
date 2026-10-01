"use client";
/**
 * M02 Game-Based Physics Learning — holographic lab (p5's "WebGL window"):
 * a notched SIMULATION frame, a circular emissive pedestal, and a cube moving
 * along a straight metre-marked track with a velocity arrow. The live v / s / t
 * values are real: s = v·t for the running demo. Five level pads — one per
 * Unity project in the suite — light up in sequence; hovering a level in the
 * DOM list switches the demo's velocity.
 */
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { lab, rig } from "@/lib/rig";
import { store } from "@/lib/store";
import { LEVEL_VELOCITY } from "@/config/world";
import { BoxEdges, FloorGrid, HudRings, glow } from "./shared";

const TRACK = 6.4;
/** s–t plot window (seconds shown) and size on the panel (metres). */
const PLOT_T = 8;
const PLOT_W = 5.6;
const PLOT_H = 2.3;

/** Live s–t plot on the panel: axes, the slope for the current level, and the run so far. */
function useLine(color: THREE.Color, opacity = 1) {
  return useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    return new THREE.Line(g, new THREE.LineBasicMaterial({ color, toneMapped: false, transparent: opacity < 1, opacity }));
  }, [color, opacity]);
}

function NotchedFrame({ w, h, color }: { w: number; h: number; color: THREE.Color }) {
  const line = useMemo(() => {
    const tab = w * 0.28;
    const notch = 0.22;
    const pts = [
      [-w / 2, -h / 2],
      [w / 2 - notch, -h / 2],
      [w / 2, -h / 2 + notch],
      [w / 2, h / 2],
      [-w / 2 + tab + notch, h / 2],
      [-w / 2 + tab, h / 2 + notch * 1.4],
      [-w / 2 + notch, h / 2 + notch * 1.4],
      [-w / 2, h / 2 + notch * 1.4 - notch],
      [-w / 2, -h / 2],
    ].map(([x, y]) => new THREE.Vector3(x, y, 0));
    return new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color, toneMapped: false })
    );
  }, [w, h, color]);
  return <primitive object={line} />;
}

interface Props {
  mini?: boolean;
}

export default function PhysicsLab({ mini = false }: Props) {
  const cube = useRef<THREE.Group>(null);
  const arrow = useRef<THREE.Group>(null);
  const pads = useRef<THREE.Group>(null);
  const dot = useRef<THREE.Mesh>(null);
  const sim = useRef({ t: 0, level: 0 });
  const cyan = useMemo(() => glow("#5CE1FF", 2.2), []);
  const amber = useMemo(() => glow("#FFB547", 2.6), []);
  const violet = useMemo(() => glow("#845EF5", 1.8), []);
  const dim = useMemo(() => glow("#5CE1FF", 0.5), []);
  const guide = useLine(violet, 0.6);
  const run = useLine(amber);
  const axes = useMemo(() => {
    const x0 = -PLOT_W / 2;
    const y0 = -PLOT_H / 2;
    const pts: THREE.Vector3[] = [new THREE.Vector3(x0, y0 + PLOT_H, 0), new THREE.Vector3(x0, y0, 0), new THREE.Vector3(x0, y0, 0), new THREE.Vector3(x0 + PLOT_W, y0, 0)];
    for (let i = 1; i <= 8; i++) {
      const x = x0 + (i / 8) * PLOT_W;
      pts.push(new THREE.Vector3(x, y0, 0), new THREE.Vector3(x, y0 + PLOT_H, 0));
    }
    for (let i = 1; i <= 4; i++) {
      const y = y0 + (i / 4) * PLOT_H;
      pts.push(new THREE.Vector3(x0, y, 0), new THREE.Vector3(x0 + PLOT_W, y, 0));
    }
    return new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: dim, toneMapped: false, transparent: true, opacity: 0.45 }));
  }, [dim]);
  const ticks = useMemo(() => {
    const d = new THREE.Object3D();
    return Array.from({ length: 7 }, (_, i) => {
      d.position.set(-TRACK / 2 + (i * TRACK) / 6, 0.47, 0.26);
      d.updateMatrix();
      return d.matrix.clone();
    });
  }, []);


  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const level = mini ? Math.floor(t / 4) % 5 : store.get().labLevel;
    if (level !== sim.current.level) {
      sim.current.level = level;
      sim.current.t = 0;
    }
    const v = LEVEL_VELOCITY[level];
    sim.current.t += Math.min(dt, 0.1);
    let s = v * sim.current.t;
    if (s > TRACK - 0.5) {
      sim.current.t = 0;
      s = 0;
    }
    if (!mini) {
      lab.v = v;
      lab.s = s;
      lab.t = sim.current.t;
    }
    if (cube.current) {
      cube.current.position.x = -TRACK / 2 + 0.25 + s;
      cube.current.rotation.y = 0;
    }
    if (arrow.current) arrow.current.scale.x = 0.4 + v * 0.45;
    // plot: s = v·t, the guide for the whole window and the run so far
    const px = (t: number) => -PLOT_W / 2 + (t / PLOT_T) * PLOT_W;
    const py = (s: number) => -PLOT_H / 2 + (s / TRACK) * PLOT_H;
    const tEnd = Math.min(PLOT_T, TRACK / v);
    const gp = guide.geometry.attributes.position as THREE.BufferAttribute;
    gp.setXYZ(0, px(0), py(0), 0);
    gp.setXYZ(1, px(tEnd), py(v * tEnd), 0);
    gp.needsUpdate = true;
    const rp = run.geometry.attributes.position as THREE.BufferAttribute;
    rp.setXYZ(0, px(0), py(0), 0.01);
    rp.setXYZ(1, px(sim.current.t), py(s), 0.01);
    rp.needsUpdate = true;
    dot.current?.position.set(px(sim.current.t), py(s), 0.02);
    const lit = mini ? 1 : rig.m02;
    pads.current?.children.forEach((p, i) => {
      const on = THREE.MathUtils.smoothstep(lit * 5.5, i, i + 0.6);
      const active = i === level ? 1 : 0;
      const m = (p as THREE.Mesh).material as THREE.MeshBasicMaterial;
      m.color.copy(violet).lerp(cyan, on).multiplyScalar(0.14 + on * 0.3 + active * 0.55);
      p.position.y = 0.04 + active * 0.06;
    });
  });

  return (
    <group>
      {/* pedestal */}
      <mesh position-y={-0.15}>
        <cylinderGeometry args={[3.4, 3.6, 0.3, 64]} />
        <meshStandardMaterial color="#0c1128" metalness={0.6} roughness={0.35} />
      </mesh>
      <HudRings radius={3.45} y={0.02} />

      {/* track with metre marks */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[TRACK, 0.08, 0.42]} />
        <meshStandardMaterial color="#141a38" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.25, 0.22]}>
        <boxGeometry args={[TRACK, 0.015, 0.015]} />
        <meshBasicMaterial color={cyan} toneMapped={false} />
      </mesh>
      <instancedMesh
        args={[undefined, undefined, ticks.length]}
        onUpdate={(m) => {
          ticks.forEach((mat, i) => m.setMatrixAt(i, mat));
          m.instanceMatrix.needsUpdate = true;
        }}
      >
        <boxGeometry args={[0.02, 0.45, 0.02]} />
        <meshBasicMaterial color={cyan} toneMapped={false} transparent opacity={0.6} />
      </instancedMesh>

      {/* moving cube + velocity vector */}
      <group ref={cube} position={[-TRACK / 2 + 0.25, 0.5, 0]}>
        <mesh>
          <boxGeometry args={[0.48, 0.48, 0.48]} />
          <meshStandardMaterial color="#1a2250" emissive="#3944C6" emissiveIntensity={0.9} metalness={0.3} roughness={0.2} />
        </mesh>
        <BoxEdges size={[0.5, 0.5, 0.5]} intensity={2.6} />
        <group ref={arrow} position={[0.3, 0, 0]}>
          <mesh position={[0.5, 0, 0]} rotation-z={-Math.PI / 2}>
            <cylinderGeometry args={[0.03, 0.03, 1, 8]} />
            <meshBasicMaterial color={amber} toneMapped={false} />
          </mesh>
          <mesh position={[1.05, 0, 0]} rotation-z={-Math.PI / 2}>
            <coneGeometry args={[0.09, 0.2, 12]} />
            <meshBasicMaterial color={amber} toneMapped={false} />
          </mesh>
        </group>
      </group>

      {/* notched SIMULATION window behind */}
      <group position={[0, 1.7, -2.6]}>
        <mesh>
          <planeGeometry args={[7.2, 3.4]} />
          <meshBasicMaterial color="#0a1230" transparent opacity={0.45} depthWrite={false} />
        </mesh>
        <NotchedFrame w={7.2} h={3.4} color={cyan} />
        <group position={[0.15, -0.05, 0.02]}>
          <primitive object={axes} />
          <primitive object={guide} />
          <primitive object={run} />
          <mesh ref={dot}>
            <circleGeometry args={[0.07, 20]} />
            <meshBasicMaterial color={amber} toneMapped={false} />
          </mesh>
        </group>
      </group>

      {/* level pads */}
      <group ref={pads} position={[0, 0, 2.4]}>
        {LEVEL_VELOCITY.map((_, i) => {
          const a = ((i - 2) / 2) * 0.55;
          return (
            <mesh key={i} position={[Math.sin(a) * 2.6, 0.04, Math.cos(a) * 0.6 - 0.2]}>
              <cylinderGeometry args={[0.36, 0.36, 0.06, 6]} />
              <meshBasicMaterial toneMapped={false} />
            </mesh>
          );
        })}
      </group>

      {!mini && <FloorGrid size={30} y={-0.31} opacity={0.3} />}
    </group>
  );
}
