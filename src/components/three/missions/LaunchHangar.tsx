"use client";
/**
 * M04 ISRO Launch Pad Simulation — a hangar with ceiling light strips (p5), a
 * rocket on its pad in front of a wide curved glass frame with cyan rim light,
 * a circular HUD pedestal, and a lattice service tower whose arms retract on
 * scroll. Callouts (DOM) pin to the rocket with leader lines (p4).
 */
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { rig } from "@/lib/rig";
import { FloorGrid, HudRings, glow } from "./shared";

function useLattice() {
  return useMemo(() => {
    const d = new THREE.Object3D();
    const list: THREE.Matrix4[] = [];
    const H = 6.2;
    const S = 0.9;
    for (const [x, z] of [
      [-S / 2, -S / 2],
      [S / 2, -S / 2],
      [-S / 2, S / 2],
      [S / 2, S / 2],
    ]) {
      d.position.set(x, H / 2, z);
      d.rotation.set(0, 0, 0);
      d.scale.set(0.07, H, 0.07);
      d.updateMatrix();
      list.push(d.matrix.clone());
    }
    for (let k = 0; k < 9; k++) {
      const y = 0.4 + k * 0.68;
      for (const face of [0, 1, 2, 3]) {
        d.position.set(face === 0 ? 0 : face === 1 ? 0 : face === 2 ? -S / 2 : S / 2, y + 0.34, face === 0 ? -S / 2 : face === 1 ? S / 2 : 0);
        d.rotation.set(0, face >= 2 ? Math.PI / 2 : 0, (k % 2 ? 1 : -1) * 0.62);
        d.scale.set(1.05, 0.035, 0.035);
        d.updateMatrix();
        list.push(d.matrix.clone());
      }
    }
    return list;
  }, []);
}

function useCeilingStrips() {
  return useMemo(() => {
    const d = new THREE.Object3D();
    const list: THREE.Matrix4[] = [];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 3; c++) {
        d.position.set(-6 + c * 6, 8.2, -4 + r * 2.2);
        d.scale.set(4.2, 0.06, 0.18);
        d.updateMatrix();
        list.push(d.matrix.clone());
      }
    }
    for (let i = 0; i < 7; i++) {
      d.position.set(-9 + i * 3, 4.2, -5.5);
      d.scale.set(0.08, 7.6, 0.08);
      d.updateMatrix();
      list.push(d.matrix.clone());
    }
    return list;
  }, []);
}

function Rocket() {
  const white = "#d9dee8";
  const dark = "#1d2233";
  return (
    <group>
      <mesh position-y={2.4}>
        <cylinderGeometry args={[0.34, 0.36, 3.6, 32]} />
        <meshStandardMaterial color={white} metalness={0.25} roughness={0.35} />
      </mesh>
      <mesh position-y={4.75}>
        <coneGeometry args={[0.34, 1.1, 32]} />
        <meshStandardMaterial color={white} metalness={0.25} roughness={0.35} />
      </mesh>
      {[1.2, 3.1, 4.15].map((y) => (
        <mesh key={y} position-y={y}>
          <cylinderGeometry args={[0.355, 0.355, 0.08, 32]} />
          <meshStandardMaterial color={dark} metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.5, 0, 0]}>
          <mesh position-y={1.6}>
            <cylinderGeometry args={[0.16, 0.17, 2.4, 20]} />
            <meshStandardMaterial color={white} metalness={0.25} roughness={0.4} />
          </mesh>
          <mesh position-y={3.05}>
            <coneGeometry args={[0.16, 0.5, 20]} />
            <meshStandardMaterial color={white} metalness={0.25} roughness={0.4} />
          </mesh>
          <mesh position-y={0.32}>
            <cylinderGeometry args={[0.1, 0.16, 0.22, 16]} />
            <meshStandardMaterial color={dark} metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      ))}
      <mesh position-y={0.52}>
        <cylinderGeometry args={[0.16, 0.3, 0.3, 20]} />
        <meshStandardMaterial color={dark} metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

interface Props {
  mini?: boolean;
}

export default function LaunchHangar({ mini = false }: Props) {
  const lattice = useLattice();
  const strips = useCeilingStrips();
  const arms = useRef<THREE.Group>(null);
  const cyan = useMemo(() => glow("#5CE1FF", 2.2), []);
  const stripColor = useMemo(() => glow("#DDEBFF", 2.6), []);
  const frameGlass = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#9fc6ff",
        metalness: 0,
        roughness: 0.08,
        transparent: true,
        opacity: 0.12,
        side: THREE.DoubleSide,
        depthWrite: false,
        envMapIntensity: 1.6,
      }),
    []
  );


  useFrame((state) => {
    const k = mini ? 0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 0.6) : rig.m04;
    arms.current?.children.forEach((arm, i) => {
      const local = THREE.MathUtils.clamp(k * 1.4 - i * 0.18, 0, 1);
      arm.rotation.y = local * 1.25;
    });
  });

  const ARC = 1.7;

  return (
    <group>
      {/* hangar shell */}
      {!mini && (
        <>
          <mesh position={[0, 4, -6]}>
            <boxGeometry args={[22, 9, 0.3]} />
            <meshStandardMaterial color="#0b0f1f" metalness={0.4} roughness={0.7} />
          </mesh>
          <mesh position={[0, 8.5, -0.5]}>
            <boxGeometry args={[22, 0.3, 11]} />
            <meshStandardMaterial color="#0b0f1f" metalness={0.4} roughness={0.7} />
          </mesh>
          <instancedMesh
            args={[undefined, undefined, strips.length]}
            onUpdate={(m) => {
              strips.forEach((mat, i) => m.setMatrixAt(i, mat));
              m.instanceMatrix.needsUpdate = true;
            }}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color={stripColor} toneMapped={false} />
          </instancedMesh>
        </>
      )}
      <mesh position-y={-0.05} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[22, 14]} />
        <meshStandardMaterial color="#10141f" metalness={0.5} roughness={0.55} />
      </mesh>

      {/* HUD pedestal + pad */}
      <HudRings radius={2.6} y={0.01} />
      <mesh position-y={0.18}>
        <cylinderGeometry args={[2.2, 2.4, 0.36, 8]} />
        <meshStandardMaterial color="#2a3042" metalness={0.5} roughness={0.6} />
      </mesh>

      <group position-y={0.36}>
        <Rocket />
      </group>

      {/* service tower + retracting arms */}
      <group position={[1.7, 0.36, -0.2]}>
        <instancedMesh
          args={[undefined, undefined, lattice.length]}
          onUpdate={(m) => {
            lattice.forEach((mat, i) => m.setMatrixAt(i, mat));
            m.instanceMatrix.needsUpdate = true;
          }}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#c8792e" metalness={0.5} roughness={0.5} />
        </instancedMesh>
        <group ref={arms}>
          {[1.8, 3.2, 4.4].map((y) => (
            <group key={y} position={[-0.45, y, 0]}>
              <mesh position={[-0.42, 0, 0]}>
                <boxGeometry args={[0.84, 0.08, 0.14]} />
                <meshStandardMaterial color="#c8792e" metalness={0.5} roughness={0.5} />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* wide curved glass frame with cyan rim light */}
      <mesh position-y={3.3} material={frameGlass}>
        <cylinderGeometry args={[4.6, 4.6, 6.4, 64, 1, true, Math.PI - ARC / 2, ARC]} />
      </mesh>
      {[0.1, 6.5].map((y) => (
        <mesh key={y} position-y={y} rotation={[Math.PI / 2, 0, -Math.PI / 2 - ARC / 2]}>
          <torusGeometry args={[4.6, 0.02, 6, 96, ARC]} />
          <meshBasicMaterial color={cyan} toneMapped={false} />
        </mesh>
      ))}
      {!mini && <FloorGrid size={30} y={0.0} opacity={0.18} />}
    </group>
  );
}
