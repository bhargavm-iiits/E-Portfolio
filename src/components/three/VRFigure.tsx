"use client";
import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

const DARK = "#0b0e1a";
const VIOLET = new THREE.Color("#8B5CF6");

export default function VRFigure() {
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (bodyRef.current) bodyRef.current.scale.y = 1 + Math.sin(t * 0.9) * 0.008;
    if (headRef.current) headRef.current.rotation.y = Math.sin(t * 0.3) * 0.06;
    if (leftArmRef.current) leftArmRef.current.rotation.x = -0.3 + Math.sin(t * 0.7) * 0.03;
    if (rightArmRef.current) rightArmRef.current.rotation.x = -0.35 + Math.cos(t * 0.65) * 0.03;
  });

  return (
    <group position={[4.2, -4.4, 1.5]} rotation={[0, -0.5, 0]}>
      {/* Platform */}
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <boxGeometry args={[1.6, 0.3, 1.6]} />
        <meshStandardMaterial color="#12142e" emissive={VIOLET} emissiveIntensity={0.15} roughness={0.7} />
      </mesh>

      <group ref={bodyRef} position={[0, 0.9, 0]}>
        {/* Torso */}
        <mesh>
          <capsuleGeometry args={[0.32, 0.75, 6, 12]} />
          <meshStandardMaterial color={DARK} roughness={0.85} metalness={0.1} />
        </mesh>

        {/* Head + headset */}
        <group ref={headRef} position={[0, 0.72, 0]}>
          <mesh>
            <sphereGeometry args={[0.24, 20, 20]} />
            <meshStandardMaterial color={DARK} roughness={0.9} />
          </mesh>
          <mesh position={[0, 0, 0.18]}>
            <boxGeometry args={[0.34, 0.2, 0.22]} />
            <meshStandardMaterial
              color="#161a33"
              emissive={VIOLET}
              emissiveIntensity={0.4}
              metalness={0.5}
              roughness={0.3}
            />
          </mesh>
          <mesh position={[0, 0, 0.31]}>
            <torusGeometry args={[0.09, 0.015, 8, 20]} />
            <meshBasicMaterial color="#6EA8FF" />
          </mesh>
        </group>

        {/* Arms + controllers */}
        <group ref={leftArmRef} position={[-0.4, 0.25, 0]}>
          <mesh position={[0, -0.35, 0.05]}>
            <capsuleGeometry args={[0.08, 0.55, 4, 8]} />
            <meshStandardMaterial color={DARK} roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.68, 0.15]} rotation={[0.3, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.08, 0.22, 10]} />
            <meshStandardMaterial color="#161a33" emissive={VIOLET} emissiveIntensity={0.5} />
          </mesh>
        </group>
        <group ref={rightArmRef} position={[0.4, 0.25, 0]}>
          <mesh position={[0, -0.35, 0.05]}>
            <capsuleGeometry args={[0.08, 0.55, 4, 8]} />
            <meshStandardMaterial color={DARK} roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.68, 0.15]} rotation={[0.3, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.08, 0.22, 10]} />
            <meshStandardMaterial color="#161a33" emissive={VIOLET} emissiveIntensity={0.5} />
          </mesh>
        </group>

        {/* Legs */}
        <mesh position={[-0.14, -0.75, 0]}>
          <capsuleGeometry args={[0.11, 0.65, 4, 8]} />
          <meshStandardMaterial color={DARK} roughness={0.9} />
        </mesh>
        <mesh position={[0.14, -0.75, 0]}>
          <capsuleGeometry args={[0.11, 0.65, 4, 8]} />
          <meshStandardMaterial color={DARK} roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}
