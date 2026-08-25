// Plain mutable objects shared between GSAP (outside React) and the R3F
// render loop (useFrame). GSAP tweens these values on scroll; the camera
// rig component lerps the real Three.js camera toward them each frame.
export const cameraTarget = { x: 0, y: 0, z: 18 };
export const portalDiscOpacity = { value: 0.35 };

export const mouseState = { x: 0, y: 0 };

if (typeof window !== "undefined") {
  window.addEventListener("pointermove", (e) => {
    mouseState.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseState.y = (e.clientY / window.innerHeight - 0.5) * 2;
  });
}
