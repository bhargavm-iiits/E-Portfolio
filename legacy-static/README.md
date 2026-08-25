# Bhargav M. — Immersive 3D E-Portfolio

**🔴 LIVE DEPLOYMENT:** [https://e-portfolio-xi-bay.vercel.app/](https://e-portfolio-xi-bay.vercel.app/)

A fully interactive, cinematic 3D WebGL portfolio built with Three.js, GSAP, and vanilla ES modules — no build step. Scrolling flies the camera through a glowing portal into a procedurally generated city, past floating glass project cubes you can drag, hover, and click.

## 🚀 Key Features

* **3D Portal Fly-Through:** A GSAP-scrubbed camera timeline carries the viewer from the hero straight through an emissive portal ring into a procedural city — instanced towers, a light-beam spire, and a distant planet, all built at runtime, no external 3D assets.
* **Interactive Glass Project Cubes:** Featured projects float as raycast-hoverable `MeshPhysicalMaterial` glass cubes with mouse parallax. Hover for a HUD label, click to open the project's detail modal.
* **Filterable Project Grid:** All 15 repositories render from a single data file (`js/data.js`) into a tilt-on-hover card grid, filterable by AR/VR, AI/ML, or Web.
* **Data-Driven Content:** Every project, skill, and bio line comes from `js/data.js` — adding a new repo is a single object, not a new HTML section.
* **Accessible by Default:** Respects `prefers-reduced-motion` (disables scroll-scrub and bloom, renders content statically), keyboard-navigable modal and grid, skip link, focus-visible states, and a mobile fallback that drops heavy post-processing.

## 🛠️ Technology Stack

* **3D Rendering:** `Three.js` (ES modules via import map) + `UnrealBloomPass` / `ACESFilmicToneMapping`
* **Animation & Scroll:** `GSAP 3` + `ScrollTrigger`, `Lenis` smooth scroll
* **Structure & Styling:** Semantic HTML5, vanilla CSS3 (custom properties, `backdrop-filter`, CSS Grid)
* **Logic:** Vanilla ES6+ JavaScript, modularized (`js/data.js`, `scene.js`, `portal.js`, `cubes.js`, `scroll.js`, `ui.js`, `main.js`)
* **Iconography:** FontAwesome (CDN)

## 📁 Source Architecture

```text
/E-Portfolio
├── index.html        Semantic shell — sections are populated from data at runtime
├── styles.css         Design system: deep-space navy/violet palette, cards, modal, nav rail
├── js/
│   ├── data.js        Single source of truth: profile, education, experience, 15 projects, skills
│   ├── scene.js        Renderer, camera, bloom composer, render loop (pauses off-tab)
│   ├── portal.js       Portal ring, procedural city, spire beam, planet, debris field
│   ├── cubes.js        Raycast-interactive glass project cubes
│   ├── scroll.js        Lenis + GSAP ScrollTrigger camera fly-through and reveal timelines
│   ├── ui.js            Renders all sections from data.js; grid filters, modal, cursor, nav rail
│   └── main.js          Orchestrator
└── README.md
```

## ⚙️ How to Run Locally

The 3D engine loads as ES modules, which browsers block over `file://`. Serve it:

```bash
git clone https://github.com/bhargavm-iiits/E-Portfolio.git
cd E-Portfolio
python -m http.server 8000
# then open http://localhost:8000
```

## 📬 Contact & Links

* **Name:** Bhargav M
* **Email:** [bhargav.m23@iiits.in](mailto:bhargav.m23@iiits.in)
* **Phone:** +91 7795036940
* **LinkedIn:** [linkedin.com/in/bhargav-ai](https://www.linkedin.com/in/bhargav-ai)
* **GitHub:** [github.com/bhargavm-iiits](https://github.com/bhargavm-iiits)

---
*SYS.ONLINE // PORTAL STABLE*
