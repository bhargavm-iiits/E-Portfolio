/**
 * NEXUS content — the single source of truth. Every string here is a fact
 * from the repo's data or the original brief; nothing is copied from the
 * reference screenshot or clips (their credentials and labels conflict with
 * the source data — see README › Content notes).
 */
import { verified } from "@/config/site";

/* ───────────────────────── Missions ───────────────────────── */

export type WorldKind = "terrain" | "lab" | "cinema" | "hangar";

export interface RepoLink {
  label: string;
  href: string;
  note?: string;
}

export interface Mission {
  code: string;
  slug: string;
  title: string;
  /** Specific category shown as the card tag (spec §5: more specific than "AR/VR"). */
  tag: string;
  world: WorldKind;
  /** Card copy. */
  summary: string;
  objective?: string;
  system: string[];
  coreMechanic?: string;
  challenge?: string;
  result?: string;
  structure?: RepoLink[];
  context?: string;
  /** Short factual readouts for the briefing's contextual side panel. */
  hud: string[];
  source?: string;
  live?: string;
  related?: RepoLink[];
  /** Card media: a render of the mission's own 3D diorama (illustrative, labelled as such). */
  image: { src: string; alt: string };
  verify?: boolean;
}

const GH = "https://github.com/bhargavm-iiits";

const allMissions: Mission[] = [
  {
    code: "001",
    slug: "tirumala",
    title: "Tirumala AR Navigation",
    tag: "AR NAVIGATION",
    world: "terrain",
    summary: "Offline augmented-reality guidance for pilgrims on the Alipiri steps route to Tirumala.",
    objective: "Offline augmented-reality guidance for pilgrims on the Alipiri steps route to Tirumala.",
    system: ["Unity 6", "AR Foundation 6.5", "ARCore", "URP", "C#", "A* pathfinding"],
    coreMechanic:
      "Hybrid localisation fuses ARCore visual-inertial odometry, Kalman-filtered GPS, route snapping, compass correction and landmark image recognition into a single correctable yaw + translation transform. A* routing generates turn instructions. AR arrows are overlaid on the camera view, with voice guidance.",
    challenge: "Works with no internet after setup; 1.17 km of the route is missing from OpenStreetMap.",
    result:
      "The gap is bridged with a flagged, amber-highlighted interpolated connector, and landmark recognition supports POI discovery along the route.",
    hud: ["MODE · OFFLINE", "LOCALISATION · VIO + GPS (KALMAN) + COMPASS + LANDMARKS", "ROUTING · A*"],
    source: `${GH}/AR-Navigation`,
    related: [
      {
        label: "Navigation-AR-pages",
        href: `${GH}/Navigation-AR-pages`,
        note: "The route split into individually loadable AR waypoint scenes",
      },
    ],
    image: {
      src: "/nexus/missions/tirumala.webp",
      alt: "Illustrative 3D render: a terrain model with the walking route drawn in amber, points of interest and the flagged interpolated segment",
    },
  },
  {
    code: "002",
    slug: "physics-learning",
    title: "Game-Based Physics Learning",
    tag: verified.physicsVR ? "VR LEARNING" : "GAME-BASED LEARNING",
    world: "lab",
    summary: "Straight-line kinematics taught through play instead of formulas.",
    objective: "Teach straight-line kinematics through play instead of formulas.",
    system: ["Unity", "C#", "Game design"],
    coreMechanic: "Interactive scenes let learners manipulate velocity, displacement and time to build physical intuition.",
    structure: [
      { label: "Teaching-and-Learning", href: `${GH}/Teaching-and-Learning` },
      { label: "Motion-in-Straight-Line", href: `${GH}/Motion-in-Straight-Line` },
      { label: "Velocity—Interactive", href: `${GH}/Velocity---Interactive` },
      { label: "Interactive-Speed", href: `${GH}/Interactive-Speed` },
      { label: "Unity-Linear-Motion", href: `${GH}/Unity-Linear-Motion-` },
    ],
    hud: ["SUITE · 5 UNITY PROJECTS", "TOPIC · STRAIGHT-LINE KINEMATICS", "VARIABLES · v · s · t"],
    source: `${GH}/Teaching-and-Learning`,
    image: {
      src: "/nexus/missions/physics-learning.webp",
      alt: "Illustrative 3D render: a lab pedestal with a cube moving along a track, its velocity arrow and five level pads",
    },
  },
  {
    code: "003",
    slug: "vr-cinema",
    title: "VR Cinema Platform",
    tag: "IMMERSIVE MEDIA",
    world: "cinema",
    summary: "A secure, immersive VR cinema for streamed media: 360° playback and stereoscopic 3D.",
    objective: "A secure, immersive VR cinema for streamed media.",
    system: ["React Three Fiber", "Three.js", "Python / Gradio", "JWT", "AES", "Argon2", "Docker Compose"],
    coreMechanic: "360° spherical video playback and stereoscopic side-by-side 3D.",
    challenge:
      "Protecting content end to end: Argon2 password hashing, JWT auth, AES-encrypted metadata and streams, and rate limiting against brute force.",
    result: "A live demo, a Docker Compose deployment and a dual test suite (pytest backend, npm test frontend).",
    context: "Related to the CYMAX internship (secure VR media platform; see the Player Log).",
    hud: ["PLAYBACK · 360° MONO · SBS 3D", "AUTH · ARGON2 + JWT", "STREAMS · AES-ENCRYPTED"],
    source: `${GH}/VR_Demo_Cymax`,
    live: "https://vr-demo-cymax.vercel.app",
    image: {
      src: "/nexus/missions/vr-cinema.webp",
      alt: "Illustrative 3D render: a curved cinema screen inside a wireframe dome with a 360° playback sphere",
    },
  },
  {
    code: "004",
    slug: "isro-launch-pad",
    title: "ISRO Launch Pad Simulation",
    tag: "3D SIMULATION",
    world: "hangar",
    summary: "Launch-pad simulation from the ISRO project line.",
    system: ["Blender", "Unreal Engine", "3D simulation"],
    context: "Built during the IIIT Sri City summer internship (ISRO project line).",
    hud: ["TOOLS · BLENDER • UNREAL ENGINE", "TYPE · 3D SIMULATION", "LINE · ISRO (SUMMER INTERNSHIP)"],
    image: {
      src: "/nexus/missions/isro-launch-pad.webp",
      alt: "Illustrative 3D render: a rocket on a launch pad inside a hangar, service-tower arms around it",
    },
    verify: true,
  },
];

export const missions: Mission[] = allMissions.filter((m) => !m.verify || verified.isroMission);
/** The three screenshot missions lead; anything else is an additional mission. */
export const primaryMissions = missions.filter((m) => m.world !== "hangar");
export const extraMissions = missions.filter((m) => m.world === "hangar");

export const missionBySlug = (slug: string) => missions.find((m) => m.slug === slug);

/* ───────────────────────── Side quests ───────────────────────── */

export type QuestCategory = "ai" | "web";

export interface SideQuest {
  id: string;
  title: string;
  kind: string;
  category: QuestCategory;
  stack: string[];
  note?: string;
  source: string;
  live?: string;
}

export const sideQuests: SideQuest[] = [
  {
    id: "opthamiss",
    title: "OpthaMiss",
    kind: "AI tele-ophthalmology",
    category: "ai",
    stack: ["React", "PyTorch", "ViT", "FastAPI"],
    note: "AUC-ROC 0.98, ~92% sensitivity",
    source: `${GH}/OpthaMiss_V1`,
    live: "https://optha-miss-v1.vercel.app",
  },
  {
    id: "vox-align",
    title: "Vox-Align",
    kind: "Multimodal emotional desktop agent",
    category: "ai",
    stack: ["Gemini RAG", "ChromaDB", "BERT", "Python"],
    note: "PyInstaller build",
    source: `${GH}/Vox-Align`,
  },
  {
    id: "privacy-rag",
    title: "Privacy-Preserving-RAG",
    kind: "Privacy-bounded Gen-AI retrieval with anonymisation",
    category: "ai",
    stack: ["Python", "LLMs", "RAG"],
    source: `${GH}/Privacy-Preserving-RAG`,
  },
  {
    id: "hate-speech",
    title: "Hate-Speech-Detection",
    kind: "Multimodal abuse filter",
    category: "ai",
    stack: ["CLIP", "LoRA", "EasyOCR"],
    source: `${GH}/Hate-Speech-Detection`,
  },
  {
    id: "plant-disease",
    title: "AI-Plant-Disease-Detection",
    kind: "13-class classifier",
    category: "ai",
    stack: ["PyTorch", "MobileNetV2", "Flask"],
    source: `${GH}/AI-Plant-Disease-Detection`,
  },
  {
    id: "jarvis",
    title: "Jarvis",
    kind: "Voice assistant",
    category: "ai",
    stack: ["Python", "SpeechRecognition", "pyttsx3"],
    source: `${GH}/Jarvis`,
  },
  {
    id: "e-portfolio",
    title: "E-Portfolio",
    kind: "This site",
    category: "web",
    stack: ["Next.js", "React Three Fiber", "TypeScript"],
    source: `${GH}/E-Portfolio`,
    live: "https://bhargavm-portfolio.vercel.app",
  },
];

export const questCategoryLabel: Record<QuestCategory, string> = { ai: "AI/ML", web: "WEB" };

/* ───────────────────────── Ability tree ───────────────────────── */

/** Evidence the ability tree links to. */
export type Evidence =
  | { kind: "mission"; slug: string; label: string }
  | { kind: "quest"; id: string; label: string }
  | { kind: "log"; code: string; label: string };

export interface Ability {
  id: string;
  label: string;
  /** Role line under the node (screenshot style: what it does, never a proficiency score). */
  role: string;
  blurb: string;
  usedIn: Evidence[];
  /** Brand mark id in data/brandIcons, or a drawn glyph. */
  mark: "unity" | "csharp" | "arf" | "pytorch" | "rag" | "unreal" | "blender" | "three" | "python" | "fastapi" | "docker" | "vit" | "lora";
  /** Violet = AI category (screenshot), cyan otherwise. */
  tone: "cyan" | "violet";
  verify?: boolean;
}

const M = (slug: string, label: string): Evidence => ({ kind: "mission", slug, label });
const Q = (id: string, label: string): Evidence => ({ kind: "quest", id, label });
const L = (code: string, label: string): Evidence => ({ kind: "log", code, label });

const allAbilities: Ability[] = [
  {
    id: "unity",
    label: "Unity",
    role: "ENGINE CORE",
    blurb: "Unity 6 with URP: the AR navigation app and the game-based physics suite.",
    usedIn: [M("tirumala", "TIRUMALA AR"), M("physics-learning", "PHYSICS LEARNING")],
    mark: "unity",
    tone: "cyan",
  },
  {
    id: "csharp",
    label: "C#",
    role: "GAME SYSTEMS",
    blurb: "Gameplay, systems and AR logic inside Unity.",
    usedIn: [M("tirumala", "TIRUMALA AR"), M("physics-learning", "PHYSICS LEARNING")],
    mark: "csharp",
    tone: "cyan",
  },
  {
    id: "arf",
    label: "AR Foundation",
    role: "REAL-WORLD EXPERIENCES",
    blurb: "AR Foundation 6.5 with ARCore visual-inertial odometry for on-route AR guidance.",
    usedIn: [M("tirumala", "TIRUMALA AR")],
    mark: "arf",
    tone: "cyan",
  },
  {
    id: "pytorch",
    label: "PyTorch",
    role: "AI MODELS & VISION",
    blurb: "Vision Transformers for tele-ophthalmology screening and a MobileNetV2 plant-disease classifier.",
    usedIn: [Q("opthamiss", "OPTHAMISS"), Q("plant-disease", "PLANT DISEASE"), L("ACHIEVEMENT", "IDEAVERSE 2026")],
    mark: "pytorch",
    tone: "violet",
  },
  {
    id: "rag",
    label: "RAG",
    role: "INTELLIGENT SYSTEMS",
    blurb: "Retrieval-augmented generation: a Gemini RAG + ChromaDB agent and privacy-bounded retrieval with anonymisation.",
    usedIn: [Q("vox-align", "VOX-ALIGN"), Q("privacy-rag", "PRIVACY RAG")],
    mark: "rag",
    tone: "cyan",
  },
  {
    id: "unreal",
    label: "Unreal Engine",
    role: "SIMULATION",
    blurb: "3D content and simulation on the ISRO project line.",
    usedIn: [M("isro-launch-pad", "ISRO LAUNCH PAD"), L("LOG 03", "INTERNSHIP")],
    mark: "unreal",
    tone: "cyan",
  },
  {
    id: "blender",
    label: "Blender",
    role: "MODELLING",
    blurb: "Modelling and scene building for simulations.",
    usedIn: [M("isro-launch-pad", "ISRO LAUNCH PAD"), L("LOG 03", "INTERNSHIP")],
    mark: "blender",
    tone: "cyan",
  },
  {
    id: "three",
    label: "Three.js / R3F",
    role: "WEB 3D",
    blurb: "Web-based 360° and stereoscopic playback, and this portfolio.",
    usedIn: [M("vr-cinema", "VR CINEMA"), Q("e-portfolio", "E-PORTFOLIO")],
    mark: "three",
    tone: "cyan",
  },
  {
    id: "python",
    label: "Python",
    role: "BACKENDS & ML",
    blurb: "Backends and machine-learning pipelines.",
    usedIn: [M("vr-cinema", "VR CINEMA"), Q("vox-align", "VOX-ALIGN")],
    mark: "python",
    tone: "cyan",
  },
  {
    id: "fastapi",
    label: "FastAPI",
    role: "MODEL SERVING",
    blurb: "Model-serving APIs.",
    usedIn: [Q("opthamiss", "OPTHAMISS")],
    mark: "fastapi",
    tone: "cyan",
  },
  {
    id: "docker",
    label: "Docker",
    role: "DEPLOYMENT",
    blurb: "Docker Compose deployment.",
    usedIn: [M("vr-cinema", "VR CINEMA")],
    mark: "docker",
    tone: "cyan",
  },
  {
    id: "lora",
    label: "LoRA",
    role: "FINE-TUNING",
    blurb: "LoRA fine-tuning for a multimodal abuse filter (CLIP).",
    usedIn: [Q("hate-speech", "HATE-SPEECH FILTER")],
    mark: "lora",
    tone: "violet",
  },
];

export const abilities = allAbilities.filter((a) => !a.verify);
export const abilityById = (id: string) => abilities.find((a) => a.id === id);

/** The screenshot's cross: Unity at the core, C# above, AR Foundation left, PyTorch right, RAG below. */
export const abilityCross = { core: "unity", top: "csharp", left: "arf", right: "pytorch", bottom: "rag" } as const;
/** Everything else in the kit, listed with its evidence. */
export const abilityKit = abilities.filter((a) => !Object.values(abilityCross).includes(a.id as never));

/* ───────────────────────── Player log ───────────────────────── */

export interface LogEntry {
  code: string;
  kind: "education" | "work" | "achievement";
  org: string;
  role: string;
  /** Right-aligned dates (source data; see README › Content notes for conflicts). */
  period: string;
  where?: string;
  desc: string[];
  /** Amber achievement badge. */
  badge?: string;
}

export const log: LogEntry[] = [
  {
    code: "LOG 01",
    kind: "education",
    org: "IIIT Sri City",
    role: "B.Tech Artificial Intelligence & Data Science",
    period: verified.graduation2027 ? "2023 – 2027" : "2023 – PRESENT",
    desc: [],
  },
  {
    code: "LOG 02",
    kind: "work",
    org: "Cymax",
    role: "AR/VR Developer (Intern)",
    period: "JAN 2026 – PRESENT",
    where: "Hyderabad",
    desc: [
      "Developing a secure VR media platform with a web-based controller interface, one-to-one device pairing, user authentication and subscription-based access.",
      "Building an encrypted VR video player with secure streaming, runtime decryption and DRM-based protection.",
    ],
  },
  {
    code: "LOG 03",
    kind: "work",
    org: "IIIT Sri City · XR & Simulation",
    role: "Summer Intern",
    period: "MAY – JUL 2026",
    desc: [
      "Worked across the Teaching-and-Learning, AR-Navigation and ISRO project lines.",
      "Built and iterated 3D content and simulations in Unity, Blender and Unreal Engine.",
    ],
  },
  {
    code: "ACHIEVEMENT",
    kind: "achievement",
    org: "IDEAVERSE 2026",
    role: "MISS-EyeScreen, an AI tele-ophthalmology system",
    period: "2026",
    badge: "TOP 8 / 150+ TEAMS",
    desc: ["ViT · PyTorch · FastAPI · React; AUC-ROC up to 0.98, sensitivity ~92%."],
  },
];

export const nextObjective = verified.graduation2027 ? "Graduating 2027 · open to Unity / XR roles" : "Open to Unity / XR roles";

/* ───────────────────────── Hero ───────────────────────── */

export const hero = {
  eyebrow: "UNITY • AR/VR • AI ENGINEERING",
  name: "BHARGAV M",
  statement: "I BUILD PLAYABLE WORLDS.",
  description: "Blending real and virtual worlds through interactive experiences, intelligent systems and immersive gameplay.",
} as const;

/* ───────────────────────── Comms ───────────────────────── */

export const comms = {
  headline: ["LET’S BUILD", "THE NEXT WORLD."],
  path: ["IDEAS", "EXPERIENCES", "REAL IMPACT"],
  footerLeft: "NEXUS // BHARGAV",
  footerRight: "SAME WORLD. DIFFERENT REALITIES.",
} as const;
