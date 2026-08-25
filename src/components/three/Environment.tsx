"use client";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useIsMobile } from "@/lib/useMediaQuery";
import { portalDiscOpacity } from "@/lib/cameraRig";
import { PORTAL_POSITION } from "@/lib/constants";

const BLUE = new THREE.Color("#4F8DFF");
const VIOLET = new THREE.Color("#8B5CF6");
const MAGENTA = new THREE.Color("#C264F0");

export default function Environment() {
  const isMobile = useIsMobile();
  const { scene } = useThree();

  const portalRingRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const segmentsRef = useRef<THREE.InstancedMesh>(null);
  const discRef = useRef<THREE.Mesh>(null);
  const spireRef = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Mesh<THREE.CylinderGeometry, THREE.MeshBasicMaterial>>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  const moonRimRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const debrisGroupRef = useRef<THREE.Group>(null);

  const segCount = isMobile ? 10 : 20;
  const segMatrices = useMemo(() => {
    const dummy = new THREE.Object3D();
    const matrices: THREE.Matrix4[] = [];
    for (let i = 0; i < segCount; i++) {
      const a = (i / segCount) * Math.PI * 2;
      dummy.position.set(
        PORTAL_POSITION.x + Math.cos(a) * 5.8,
        Math.sin(a) * 5.8,
        PORTAL_POSITION.z
      );
      dummy.rotation.z = a;
      dummy.updateMatrix();
      matrices.push(dummy.matrix.clone());
    }
    return matrices;
  }, [segCount]);

  const towerCount = isMobile ? 40 : 90;
  const towerMatrices = useMemo(() => {
    const dummy = new THREE.Object3D();
    const matrices: THREE.Matrix4[] = [];
    for (let i = 0; i < towerCount; i++) {
      const h = 1 + Math.random() * 6;
      dummy.position.set((Math.random() - 0.5) * 10, h / 2 - 2, (Math.random() - 0.5) * 6 - 2);
      dummy.scale.set(0.3 + Math.random() * 0.3, h, 0.3 + Math.random() * 0.3);
      dummy.updateMatrix();
      matrices.push(dummy.matrix.clone());
    }
    return matrices;
  }, [towerCount]);

  const debrisCount = isMobile ? 30 : 70;
  const debrisConfigs = useMemo(
    () =>
      Array.from({ length: debrisCount }, () => ({
        position: [
          (Math.random() - 0.5) * 60,
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * -140 - 10,
        ] as [number, number, number],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0] as [number, number, number],
        speed: 0.02 + Math.random() * 0.06,
      })),
    [debrisCount]
  );

  const particleCount = isMobile ? 600 : 1800;
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < positions.length; i++) positions[i] = (Math.random() - 0.5) * 70;
    return positions;
  }, [particleCount]);

  useFrame((state, dt) => {
    const t = state.clock.getElapsedTime();
    if (portalRingRef.current) portalRingRef.current.rotation.z += dt * 0.15;
    if (innerRingRef.current) innerRingRef.current.rotation.z -= dt * 0.1;
    if (segmentsRef.current) segmentsRef.current.rotation.z -= dt * 0.08;
    if (spireRef.current) spireRef.current.rotation.y += dt * 0.2;
    if (planetRef.current) planetRef.current.rotation.y += dt * 0.05;
    if (moonRimRef.current) moonRimRef.current.scale.setScalar(1 + Math.sin(t * 0.8) * 0.02);
    if (beamRef.current) beamRef.current.material.opacity = 0.35 + Math.sin(t * 1.5) * 0.15;
    if (particlesRef.current) particlesRef.current.rotation.y += dt * 0.01;
    if (discRef.current) {
      const mat = discRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, portalDiscOpacity.value, 0.1);
    }
    if (scene.fog && scene.fog instanceof THREE.FogExp2) {
      scene.fog.density = 0.012 + Math.sin(t * 0.3) * 0.002;
    }

    if (debrisGroupRef.current) {
      debrisGroupRef.current.children.forEach((child, i) => {
        const cfg = debrisConfigs[i];
        child.position.z += cfg.speed;
        child.rotation.x += cfg.speed * 0.3;
        child.rotation.y += cfg.speed * 0.3;
        if (child.position.z > 20) child.position.z = -140;
      });
    }
  });

  return (
    <group>
      <ambientLight color="#2a2f5f" intensity={0.6} />
      <pointLight color={BLUE} intensity={4} distance={60} position={[8, 6, 10]} />
      <pointLight color={VIOLET} intensity={3} distance={60} position={[-10, -4, -10]} />

      {/* Portal ring */}
      <mesh ref={portalRingRef} position={[PORTAL_POSITION.x, PORTAL_POSITION.y, PORTAL_POSITION.z]}>
        <torusGeometry args={[5, 0.32, 24, 100]} />
        <meshStandardMaterial color={VIOLET} emissive={VIOLET} emissiveIntensity={1.4} metalness={0.6} roughness={0.2} />
      </mesh>
      <mesh ref={innerRingRef} position={[PORTAL_POSITION.x, PORTAL_POSITION.y, PORTAL_POSITION.z]}>
        <torusGeometry args={[5.5, 0.05, 16, 100]} />
        <meshBasicMaterial color={BLUE} transparent opacity={0.6} />
      </mesh>
      <instancedMesh
        ref={segmentsRef}
        args={[undefined, undefined, segCount]}
        onUpdate={(mesh) => {
          segMatrices.forEach((m, i) => mesh.setMatrixAt(i, m));
          mesh.instanceMatrix.needsUpdate = true;
        }}
      >
        <boxGeometry args={[0.5, 1.1, 0.5]} />
        <meshStandardMaterial color={VIOLET} emissive={MAGENTA} emissiveIntensity={0.8} metalness={0.8} roughness={0.3} />
      </instancedMesh>
      <mesh ref={discRef} position={[PORTAL_POSITION.x, PORTAL_POSITION.y, PORTAL_POSITION.z - 0.2]}>
        <circleGeometry args={[4.8, 64]} />
        <meshBasicMaterial color="#0a0f2e" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>

      {/* City */}
      <group position={[PORTAL_POSITION.x, -1.5, PORTAL_POSITION.z - 8]}>
        <instancedMesh
          args={[undefined, undefined, towerCount]}
          onUpdate={(mesh) => {
            towerMatrices.forEach((m, i) => mesh.setMatrixAt(i, m));
            mesh.instanceMatrix.needsUpdate = true;
          }}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#0d1230" emissive={BLUE} emissiveIntensity={0.5} metalness={0.4} roughness={0.6} />
        </instancedMesh>

        <mesh ref={spireRef} position={[0, 2, -2]}>
          <cylinderGeometry args={[0.15, 0.4, 8, 8]} />
          <meshStandardMaterial color="#0d1230" emissive={MAGENTA} emissiveIntensity={0.7} />
        </mesh>
        <mesh ref={beamRef} position={[0, 17, -2]}>
          <cylinderGeometry args={[0.05, 0.05, 30, 8, 1, true]} />
          <meshBasicMaterial
            color="#bfe1ff"
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        <mesh ref={planetRef} position={[5, 4, -24]}>
          <sphereGeometry args={[3.4, 40, 40]} />
          <meshStandardMaterial color="#1a1440" emissive={VIOLET} emissiveIntensity={0.18} roughness={1} />
        </mesh>
        <mesh ref={moonRimRef} position={[5, 4, -24]}>
          <sphereGeometry args={[3.55, 40, 40]} />
          <meshBasicMaterial color={BLUE} transparent opacity={0.12} side={THREE.BackSide} />
        </mesh>
      </group>

      {/* Depth-cue grid floor */}
      <gridHelper args={[140, 40, 0x8b5cf6, 0x4f8dff]} position={[0, -10, 0]}>
        <lineBasicMaterial transparent opacity={0.06} vertexColors />
      </gridHelper>

      {/* Debris field */}
      <group ref={debrisGroupRef}>
        {debrisConfigs.map((cfg, i) => (
          <mesh key={i} position={cfg.position} rotation={cfg.rotation}>
            <octahedronGeometry args={[0.25, 0]} />
            <meshBasicMaterial color={BLUE} wireframe transparent opacity={0.16} />
          </mesh>
        ))}
      </group>

      {/* Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.05} color="#8fb2ff" transparent opacity={0.5} />
      </points>
    </group>
  );
}
