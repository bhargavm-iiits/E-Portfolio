# Bhargav M. — Immersive 3D E-Portfolio (Next.js / React Three Fiber)

**🔴 LIVE DEPLOYMENT:** [https://e-portfolio-xi-bay.vercel.app/](https://e-portfolio-xi-bay.vercel.app/)

A fully interactive, cinematic 3D portfolio built on Next.js, TypeScript, Tailwind CSS, and React Three Fiber. Scrolling flies the camera through a bloom-lit portal into a procedural city, past holographic project cubes and a VR-headset figure, with a Firebase-backed contact form.

> The previous zero-build vanilla Three.js version of this site lives in [`legacy-static/`](./legacy-static) for reference.

## 🚀 Key Features

* **3D Portal Fly-Through:** A GSAP-scrubbed camera timeline carries the viewer from the hero through an emissive portal ring into a procedural city — instanced towers, a light-beam spire, a "giant moon," and a VR-headset figure standing on a platform — all built at runtime with React Three Fiber, no external 3D assets.
* **Interactive Holographic Project Cubes:** Featured projects float as raycast-hoverable, iridescent glass cubes (native R3F pointer events). Hover for a HUD label, click to open the project's detail modal.
* **Filterable Project Grid:** All 15 repositories render from a single typed data file (`src/data/portfolio.ts`) into a tilt-on-hover card grid, filterable by AR/VR, AI/ML, or Web.
* **Working Contact Form:** Submits to Firestore via the Firebase client SDK (see setup below).
* **Accessible by Default:** Respects `prefers-reduced-motion` (disables scroll-scrub and bloom, renders content statically), keyboard-navigable modal and grid, skip link, focus-visible states, and a mobile fallback that drops heavy post-processing.

## 🛠️ Technology Stack

* **Framework:** Next.js (App Router) + TypeScript + Tailwind CSS v4
* **3D Rendering:** `three` + `@react-three/fiber` + `@react-three/drei` + `@react-three/postprocessing` (Bloom)
* **Animation & Scroll:** `GSAP 3` + `ScrollTrigger`, `lenis` smooth scroll, `framer-motion`
* **Backend:** Firebase (Firestore) for the contact form
* **Iconography:** FontAwesome (CDN)

## 📁 Source Architecture

```text
src/
├── app/
│   ├── layout.tsx        Root layout: fonts, metadata, Font Awesome, noscript fallback
│   ├── page.tsx          Renders <PortfolioApp />
│   └── globals.css       Design tokens + all component styling
├── components/
│   ├── PortfolioApp.tsx  Orchestrator: shared state (modal), mounts every section
│   ├── three/            Environment (portal/city/moon), ProjectCubes, VRFigure, Scene (Canvas)
│   ├── sections/         Hero, Education, Experience, Achievement, FeaturedProjects, ProjectGrid, Skills, Contact
│   └── ui/                AuroraBackground, Cursor, NavRail, ProjectModal, Toast, Loader
├── data/
│   └── portfolio.ts      Single source of truth: profile, education, experience, 15 projects, skills
└── lib/
    ├── firebase.ts        Firestore contact-form submission
    ├── useSmoothScroll.ts Lenis + GSAP ScrollTrigger camera fly-through and reveal timelines
    ├── cameraRig.ts        Shared mutable state bridging GSAP (outside React) and R3F's render loop
    ├── constants.ts, useMediaQuery.ts, toast.ts
legacy-static/             The previous vanilla Three.js version (index.html/styles.css/js/*.js), kept for reference
```

## ⚙️ How to Run Locally

```bash
git clone https://github.com/bhargavm-iiits/E-Portfolio.git
cd E-Portfolio
npm install
npm run dev
# open http://localhost:3000
```

## 🔥 Firebase Setup (contact form)

The contact form is inert (shows a note instead of erroring) until you configure Firebase:

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com) and enable **Firestore**.
2. Copy `.env.local.example` to `.env.local` and fill in your project's SDK config values.
3. Add a Firestore security rule allowing client-side `create` on a `messages` collection (see the comment in `.env.local.example`).
4. Add the same `NEXT_PUBLIC_FIREBASE_*` variables to your Vercel project's Environment Variables for production.

## 📬 Contact & Links

* **Name:** Bhargav M
* **Email:** [bhargav.m23@iiits.in](mailto:bhargav.m23@iiits.in)
* **Phone:** +91 7795036940
* **LinkedIn:** [linkedin.com/in/bhargav-ai](https://www.linkedin.com/in/bhargav-ai)
* **GitHub:** [github.com/bhargavm-iiits](https://github.com/bhargavm-iiits)

---
*SYS.ONLINE // PORTAL STABLE*
