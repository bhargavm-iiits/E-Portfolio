"use client";
import { useRef, type ReactNode } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import Environment from "./Environment";
import ProjectCubes from "./ProjectCubes";
import VRFigure from "./VRFigure";
import { cameraTarget, mouseState } from "@/lib/cameraRig";
import { useIsMobile, useReducedMotion } from "@/lib/useMediaQuery";
import type { Project } from "@/data/portfolio";

function Rig({ children }: { children: ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  useFrame(() => {
    camera.position.set(cameraTarget.x, cameraTarget.y, cameraTarget.z);
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        mouseState.x * 0.05,
        0.02
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        -mouseState.y * 0.03,
        0.02
      );
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

interface SceneProps {
  onCubeHover: (project: Project | null) => void;
  onCubeSelect: (project: Project) => void;
}

export default function Scene({ onCubeHover, onCubeSelect }: SceneProps) {
  const isMobile = useIsMobile();
  const reducedMotion = useReducedMotion();

  return (
    <Canvas
      camera={{ position: [0, 0, 18], fov: 50, near: 0.1, far: 500 }}
      dpr={[1, isMobile ? 1.5 : 2]}
      gl={{ antialias: !isMobile, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.1;
      }}
    >
      <fogExp2 attach="fog" args={["#030712", 0.012]} />
      <Rig>
        <Environment />
        <ProjectCubes onHover={onCubeHover} onSelect={onCubeSelect} />
        <VRFigure />
      </Rig>
      {!isMobile && !reducedMotion && (
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.8} luminanceThreshold={0.5} luminanceSmoothing={0.85} mipmapBlur />
        </EffectComposer>
      )}
    </Canvas>
  );
}
