"use client";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { featuredProjects, type Project } from "@/data/portfolio";
import { useIsMobile } from "@/lib/useMediaQuery";

interface CubeProps {
  project: Project;
  index: number;
  total: number;
  isMobile: boolean;
  onHover: (project: Project | null) => void;
  onSelect: (project: Project) => void;
}

function Cube({ project, index, total, isMobile, onHover, onSelect }: CubeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const spread = total > 1 ? index / (total - 1) - 0.5 : 0;
  const basePosition: [number, number, number] = [9 + spread * 3, spread * -4, -5 - index * 2.2];
  const floatOffset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state, dt) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x += dt * 0.2;
    meshRef.current.rotation.y += dt * 0.25;
    meshRef.current.position.y = basePosition[1] + Math.sin(t * 0.6 + floatOffset) * 0.6;
    const targetScale = 1.3 * (hovered ? 1.25 : 1);
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.15));
  });

  return (
    <mesh
      ref={meshRef}
      position={basePosition}
      scale={1.3}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        onHover(project);
      }}
      onPointerOut={() => {
        setHovered(false);
        onHover(null);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(project);
      }}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshPhysicalMaterial
        color={project.color}
        metalness={0.1}
        roughness={0.05}
        transmission={isMobile ? 0 : 1}
        thickness={0.6}
        transparent
        opacity={isMobile ? 0.35 : 0.9}
        emissive={project.color}
        emissiveIntensity={0.15}
        iridescence={isMobile ? 0 : 1}
        iridescenceIOR={1.3}
        iridescenceThicknessRange={[100, 400]}
      />
      <mesh scale={1.08}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={project.color} wireframe transparent opacity={0.5} />
      </mesh>
    </mesh>
  );
}

export default function ProjectCubes({
  onHover,
  onSelect,
}: {
  onHover: (project: Project | null) => void;
  onSelect: (project: Project) => void;
}) {
  const isMobile = useIsMobile();

  return (
    <group>
      {featuredProjects.map((project, i) => (
        <Cube
          key={project.id}
          project={project}
          index={i}
          total={featuredProjects.length}
          isMobile={isMobile}
          onHover={onHover}
          onSelect={onSelect}
        />
      ))}
    </group>
  );
}
