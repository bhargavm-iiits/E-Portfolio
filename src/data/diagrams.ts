/**
 * Briefing "media" until real footage exists: system diagrams whose every
 * label is a fact from nexus.ts (no mock screenshots, no invented metrics).
 * Coordinates are in a 640×360 viewBox.
 */

export interface DiagramNode {
  id: string;
  label: string;
  x: number;
  y: number;
  w?: number;
  tone?: "cyan" | "amber" | "violet" | "ink";
}

export interface DiagramSlide {
  title: string;
  caption: string;
  nodes: DiagramNode[];
  edges: { from: string; to: string; dashed?: boolean; tone?: "cyan" | "amber" }[];
  callouts?: { x: number; y: number; label: string }[];
}

export const diagrams: Record<string, DiagramSlide[]> = {
  tirumala: [
    {
      title: "LOCALISATION FUSION",
      caption: "Five signals fused into one correctable yaw + translation transform, then routed with A*.",
      nodes: [
        { id: "vio", label: "ARCore VIO", x: 20, y: 26, w: 150 },
        { id: "gps", label: "GPS · Kalman filter", x: 20, y: 88, w: 150 },
        { id: "snap", label: "Route snapping", x: 20, y: 150, w: 150 },
        { id: "compass", label: "Compass correction", x: 20, y: 212, w: 150 },
        { id: "landmark", label: "Landmark recognition", x: 20, y: 274, w: 150 },
        { id: "xf", label: "Yaw + translation transform", x: 230, y: 150, w: 170, tone: "violet" },
        { id: "astar", label: "A* routing", x: 450, y: 70, w: 160 },
        { id: "turns", label: "Turn instructions", x: 450, y: 150, w: 160 },
        { id: "ar", label: "AR arrows + voice", x: 450, y: 230, w: 160, tone: "amber" },
      ],
      edges: [
        { from: "vio", to: "xf" },
        { from: "gps", to: "xf" },
        { from: "snap", to: "xf" },
        { from: "compass", to: "xf" },
        { from: "landmark", to: "xf" },
        { from: "xf", to: "astar" },
        { from: "astar", to: "turns" },
        { from: "turns", to: "ar", tone: "amber" },
      ],
      callouts: [{ x: 315, y: 132, label: "SINGLE CORRECTABLE TRANSFORM" }],
    },
    {
      title: "ROUTE COVERAGE",
      caption: "1.17 km of the Alipiri route is missing from OpenStreetMap — bridged by a flagged, interpolated connector.",
      nodes: [
        { id: "start", label: "Alipiri (start)", x: 20, y: 150, w: 120, tone: "amber" },
        { id: "osm1", label: "Mapped route (OSM)", x: 170, y: 150, w: 130 },
        { id: "gap", label: "Interpolated · 1.17 km", x: 330, y: 150, w: 140, tone: "amber" },
        { id: "end", label: "Tirumala", x: 500, y: 150, w: 120, tone: "amber" },
      ],
      edges: [
        { from: "start", to: "osm1" },
        { from: "osm1", to: "gap", dashed: true, tone: "amber" },
        { from: "gap", to: "end", dashed: true, tone: "amber" },
      ],
      callouts: [
        { x: 400, y: 132, label: "FLAGGED IN AMBER" },
        { x: 90, y: 60, label: "OFFLINE AFTER SETUP" },
      ],
    },
  ],
  "physics-learning": [
    {
      title: "SUITE MAP",
      caption: "Five Unity projects around one topic: straight-line kinematics.",
      nodes: [
        { id: "core", label: "Straight-line kinematics", x: 230, y: 150, w: 180, tone: "violet" },
        { id: "a", label: "Teaching-and-Learning", x: 20, y: 40, w: 170 },
        { id: "b", label: "Motion-in-Straight-Line", x: 450, y: 40, w: 170 },
        { id: "c", label: "Velocity—Interactive", x: 20, y: 262, w: 170 },
        { id: "d", label: "Interactive-Speed", x: 450, y: 262, w: 170 },
        { id: "e", label: "Unity-Linear-Motion", x: 235, y: 290, w: 170 },
      ],
      edges: [
        { from: "a", to: "core" },
        { from: "b", to: "core" },
        { from: "c", to: "core" },
        { from: "d", to: "core" },
        { from: "e", to: "core" },
      ],
      callouts: [{ x: 320, y: 120, label: "VARIABLES: v · s · t" }],
    },
  ],
  "vr-cinema": [
    {
      title: "SECURITY PIPELINE",
      caption: "Content protected end to end: hashing, auth, encryption and brute-force limits.",
      nodes: [
        { id: "argon", label: "Argon2 password hashing", x: 20, y: 150, w: 170 },
        { id: "jwt", label: "JWT auth", x: 240, y: 150, w: 140, tone: "violet" },
        { id: "aes", label: "AES metadata + streams", x: 440, y: 150, w: 180, tone: "amber" },
        { id: "rate", label: "Rate limiting", x: 240, y: 270, w: 140 },
      ],
      edges: [
        { from: "argon", to: "jwt" },
        { from: "jwt", to: "aes" },
        { from: "rate", to: "jwt", dashed: true },
      ],
      callouts: [{ x: 310, y: 128, label: "AGAINST BRUTE FORCE" }],
    },
    {
      title: "PLAYBACK + DELIVERY",
      caption: "Web-based 360° and stereoscopic playback on a Python / Gradio backend, shipped with Docker Compose.",
      nodes: [
        { id: "r3f", label: "React Three Fiber · Three.js", x: 20, y: 90, w: 200, tone: "violet" },
        { id: "mono", label: "360° spherical playback", x: 290, y: 40, w: 180 },
        { id: "sbs", label: "Stereoscopic SBS 3D", x: 290, y: 140, w: 180 },
        { id: "py", label: "Python / Gradio backend", x: 20, y: 230, w: 200 },
        { id: "docker", label: "Docker Compose", x: 290, y: 230, w: 180 },
        { id: "tests", label: "pytest + npm test", x: 490, y: 230, w: 130, tone: "amber" },
      ],
      edges: [
        { from: "r3f", to: "mono" },
        { from: "r3f", to: "sbs" },
        { from: "py", to: "docker" },
        { from: "docker", to: "tests" },
        { from: "r3f", to: "py", dashed: true },
      ],
    },
  ],
  "isro-launch-pad": [
    {
      title: "TOOLCHAIN",
      caption: "Built during the IIIT Sri City summer internship (ISRO project line).",
      nodes: [
        { id: "blender", label: "Blender", x: 40, y: 150, w: 150 },
        { id: "unreal", label: "Unreal Engine", x: 245, y: 150, w: 150, tone: "violet" },
        { id: "sim", label: "3D simulation", x: 450, y: 150, w: 150, tone: "amber" },
      ],
      edges: [
        { from: "blender", to: "unreal" },
        { from: "unreal", to: "sim" },
      ],
      callouts: [{ x: 320, y: 128, label: "SUMMER INTERNSHIP · ISRO LINE" }],
    },
  ],
};
