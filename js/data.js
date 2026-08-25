// Single source of truth for all portfolio content.
export const profile = {
  name: "Bhargav M",
  heroName: { line1: "BHARGAV", line2: "M" },
  eyebrow: "AR/VR · AI ENGINEER",
  tagline: "I BUILD IMMERSIVE INTELLIGENCE",
  bio: "B.Tech AI & Data Science at IIIT Sri City. I build AR/VR experiences and the AI models that make them think.",
  location: "IIIT Sri City",
  phone: "+91 7795036940",
  email: "bhargav.m23@iiits.in",
  linkedin: "https://www.linkedin.com/in/bhargav-ai",
  linkedinLabel: "linkedin.com/in/bhargav-ai",
  github: "https://github.com/bhargavm-iiits",
  githubLabel: "github.com/bhargavm-iiits",
  capabilities: [
    { icon: "vr", label: "AR / VR DEV" },
    { icon: "brain", label: "AI & ML" },
    { icon: "code", label: "C# / UNITY" },
    { icon: "rocket", label: "PYTORCH" },
  ],
};

export const education = [
  { school: "IIIT SRI CITY", period: "2023 - PRESENT", degree: "B.Tech AI & DS", score: "CGPA: 6.69" },
  { school: "BGS PU COLLEGE", period: "2020 - 2022", degree: "CLASS XII", score: "92.3%" },
  { school: "BGS PUBLIC SCHOOL", period: "2020", degree: "CLASS X", score: "97.6%" },
];

export const experience = [
  {
    company: "CYMAX",
    role: "AR/VR DEVELOPER INTERN",
    location: "HYDERABAD // JAN 2026 - PRESENT",
    bullets: [
      "Developing a secure VR media platform with a web-based controller interface, implementing one-to-one device pairing, user authentication, and subscription-based content access.",
      "Building an encrypted VR video player with secure streaming, runtime decryption, and DRM-based content protection to prevent unauthorized redistribution.",
    ],
  },
  {
    company: "IIIT SRI CITY",
    role: "SUMMER INTERN",
    location: "SRI CITY // MAY 2026 - JULY 2026",
    bullets: [
      "Worked across the Teaching-and-Learning, AR-Navigation, and ISRO project lines, building interactive and AR-driven learning and navigation systems.",
      "Built and iterated 3D content and simulations using Unity, Blender, and Unreal Engine.",
    ],
  },
];

export const achievement = {
  title: "IDEAVERSE 2026",
  highlight: "TOP 8 OUT OF 150+ TEAMS",
  bullets: [
    "Secured Top 8 position among 150+ teams for developing MISS-EyeScreen, an AI-powered tele-ophthalmology system.",
    "Built a multimodal deep learning solution using Vision Transformers (ViT), PyTorch, FastAPI, and React, achieving high-performance metrics (AUC-ROC up to 0.98, sensitivity ~92%) for real-time screening.",
    "Designed a scalable end-to-end AI pipeline integrating computer vision and deployment-ready architecture for low-resource environments.",
  ],
};

export const extras = [
  { title: "PHOTOGRAPHY CLUB", sub: "Workshops & Event Coverage" },
  { title: "MERAKI CLUB", sub: "Art Projects & Cultural Events" },
];

// category: "ar-vr" | "ai-ml" | "web"
export const projects = [
  {
    id: "ar-navigation",
    name: "AR-Navigation",
    tag: "PROJECT 01",
    title: "Tirumala AR Navigation",
    abstract: "Offline AR Pilgrimage Guidance System",
    category: "ar-vr",
    featured: true,
    tech: ["Unity 6", "AR Foundation 6.5", "ARCore", "URP", "A* Pathfinding"],
    bullets: [
      "Offline augmented-reality navigation for the Alipiri steps route to Tirumala: AR arrows overlaid on the camera view, voice instructions, and landmark recognition, with no internet needed after setup.",
      "Hybrid localization fuses ARCore visual-inertial odometry, Kalman-filtered GPS, route snapping, compass correction, and landmark image recognition into a single correctable yaw+translation transform.",
      "A* pathfinding and turn instruction generation drive live routing; 1.17 km missing from OpenStreetMap is bridged with a flagged, amber-highlighted interpolated connector.",
    ],
    color: "#4F7DF3",
    github: "https://github.com/bhargavm-iiits/AR-Navigation",
    live: null,
  },
  {
    id: "vr-demo-cymax",
    name: "VR_Demo_Cymax",
    tag: "PROJECT 02",
    title: "VR Cinema Platform",
    abstract: "Secure Streaming VR Media Platform",
    category: "ar-vr",
    featured: true,
    tech: ["React Three Fiber", "Three.js", "Gradio", "JWT", "AES", "Argon2"],
    bullets: [
      "360° spherical video playback and stereoscopic side-by-side 3D support for immersive VR cinema, rendered with Three.js and React Three Fiber.",
      "Python/Gradio backend secures the platform end-to-end: Argon2 password hashing, JWT auth, AES-encrypted metadata and streams, and rate limiting against brute force.",
      "Ships with Docker Compose deployment and a dual test suite (pytest backend, npm test frontend).",
    ],
    color: "#8B5CF6",
    github: "https://github.com/bhargavm-iiits/VR_Demo_Cymax",
    live: "https://vr-demo-cymax.vercel.app",
  },
  {
    id: "opthamiss",
    name: "OpthaMiss_V1",
    tag: "PROJECT 03",
    title: "OpthaMiss",
    abstract: "AI Tele-Ophthalmology System",
    category: "ai-ml",
    featured: true,
    tech: ["React", "PyTorch", "ViT", "FastAPI"],
    bullets: [
      "AI tele-ophthalmology screening platform for retinal disease detection, deployed for low-resource environments.",
      "Vision Transformer models achieve AUC-ROC 0.98 with ~92% sensitivity for real-time screening.",
      "The underlying MISS-EyeScreen model placed Top 8 of 150+ teams at IDEAVERSE 2026.",
    ],
    color: "#00E5FF",
    github: "https://github.com/bhargavm-iiits/OpthaMiss_V1",
    live: "https://optha-miss-v1.vercel.app",
  },
  {
    id: "vox-align",
    name: "Vox-Align",
    tag: "PROJECT 04",
    title: "Vox-Align",
    abstract: "Multimodal Emotional Desktop Agent",
    category: "ai-ml",
    featured: true,
    tech: ["Gemini LLM", "ChromaDB", "BERT", "Python"],
    bullets: [
      "Emotion-detecting and responding AI agent combining speech-to-text, Gemini-based RAG, and BERT for conversational reasoning.",
      "Bundled via PyInstaller as a standalone desktop application, no server dependency at runtime.",
    ],
    color: "#C264F0",
    github: "https://github.com/bhargavm-iiits/Vox-Align",
    live: null,
  },
  {
    id: "physics-learning",
    name: "Teaching-and-Learning",
    tag: "PROJECT 05",
    title: "Game-Based Physics Learning",
    abstract: "Unity Physics Concept Suite",
    category: "ar-vr",
    featured: true,
    tech: ["Unity", "C#", "Game Design"],
    bullets: [
      "A suite of five Unity projects teaching kinematics through play: Teaching-and-Learning, Motion-in-Straight-Line, Velocity---Interactive, Interactive-Speed, and Unity-Linear-Motion-.",
      "Interactive scenes let learners manipulate velocity, displacement, and time on straight-line motion to build physical intuition rather than memorize formulas.",
    ],
    color: "#6EA8FF",
    github: "https://github.com/bhargavm-iiits/Teaching-and-Learning",
    live: null,
    group: [
      "https://github.com/bhargavm-iiits/Teaching-and-Learning",
      "https://github.com/bhargavm-iiits/Motion-in-Straight-Line",
      "https://github.com/bhargavm-iiits/Velocity---Interactive",
      "https://github.com/bhargavm-iiits/Interactive-Speed",
      "https://github.com/bhargavm-iiits/Unity-Linear-Motion-",
    ],
  },
  {
    id: "privacy-rag",
    name: "Privacy-Preserving-RAG",
    title: "Privacy-Preserving-RAG",
    abstract: "Generative AI Privacy Model",
    category: "ai-ml",
    tech: ["Python", "LLMs", "RAG"],
    bullets: [
      "Secure Gen-AI architecture focused on strict privacy bounds for LLM processing.",
      "Safe vector retrieval with data anonymization built into the generation path.",
    ],
    color: "#A78BFA",
    github: "https://github.com/bhargavm-iiits/Privacy-Preserving-RAG",
    live: null,
  },
  {
    id: "hate-speech",
    name: "Hate-Speech-Detection",
    title: "Hate-Speech-Detection",
    abstract: "Multimodal NLP Abuse Filter",
    category: "ai-ml",
    tech: ["CLIP", "LoRA", "EasyOCR"],
    bullets: [
      "Multimodal classification via dual-encoder architectures with LoRA fine-tuning.",
      "OCR parsing analyzes text-in-image hostility vectors.",
    ],
    color: "#FF6B6B",
    github: "https://github.com/bhargavm-iiits/Hate-Speech-Detection",
    live: null,
  },
  {
    id: "plant-disease",
    name: "AI-Plant-Disease-Detection",
    title: "AI-Plant-Disease-Detection",
    abstract: "Diagnostic CNN Classification Engine",
    category: "ai-ml",
    tech: ["PyTorch", "MobileNetV2", "Flask"],
    bullets: [
      "13-class plant disease classifier mapping attention filters for diagnosis.",
      "Real-time inference via a lightweight Flask bridge to web dashboards.",
    ],
    color: "#4ADE80",
    github: "https://github.com/bhargavm-iiits/AI-Plant-Disease-Detection",
    live: null,
  },
  {
    id: "jarvis",
    name: "Jarvis",
    title: "Jarvis",
    abstract: "AI Voice Assistant Dashboard",
    category: "ai-ml",
    tech: ["Python", "SpeechRecognition", "pyttsx3"],
    bullets: [
      "Modular voice assistant built on STT + TTS OS-level integrations.",
      "Handles background desktop tasks and query resolution via speech.",
    ],
    color: "#FFD166",
    github: "https://github.com/bhargavm-iiits/Jarvis",
    live: null,
  },
  {
    id: "nav-ar-pages",
    name: "Navigation-AR-pages",
    title: "Navigation-AR-pages",
    abstract: "Individual Scene Pages for Tirumala AR Nav",
    category: "ar-vr",
    tech: ["Unity", "ShaderLab", "AR Foundation"],
    bullets: [
      "Companion scene set to AR-Navigation, splitting the Alipiri route into individually loadable AR waypoint scenes.",
    ],
    color: "#6EA8FF",
    github: "https://github.com/bhargavm-iiits/Navigation-AR-pages",
    live: null,
  },
  {
    id: "e-portfolio",
    name: "E-Portfolio",
    title: "E-Portfolio",
    abstract: "This Website",
    category: "web",
    tech: ["Three.js", "GSAP", "WebGL"],
    bullets: [
      "The interactive 3D portfolio you're looking at right now — source included.",
    ],
    color: "#8E93B8",
    github: "https://github.com/bhargavm-iiits/E-Portfolio",
    live: "https://e-portfolio-xi-bay.vercel.app",
  },
];

export const skills = [
  { icon: "brain", label: "ML & AI MODELS", value: 90, detail: "PyTorch, CNNs, Vision Transformers, Computer Vision" },
  { icon: "vr", label: "AR / VR DEVELOPMENT", value: 88, detail: "Unity, AR Foundation, ARCore, React Three Fiber" },
  { icon: "language", label: "GEN AI & NLP", value: 82, detail: "Gemini LLM, RAG, ChromaDB, BERT, LoRA" },
  { icon: "wave", label: "VOICE & AUTOMATION", value: 75, detail: "Whisper, SpeechRecognition, pyttsx3" },
  { icon: "code", label: "SOFTWARE DEV", value: 85, detail: "Python, C#, JavaScript, Flask, React, FastAPI" },
];
