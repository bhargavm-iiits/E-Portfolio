# Bhargav M. - Neural Prototype 3D E-Portfolio

A highly immersive, cinematic, and interactive 3D WebGL portfolio built strictly with Vanilla Javascript, Three.js, GSAP, and native CSS. 

Designed to mimic an "Engineering Blueprint / Sci-Fi HUD" product launch, the entire portfolio acts as a single continuous timeline where user scrolling orchestrates a 13-scene 3D camera fly-through deeply into the background matrix.

## 🚀 Key Features

* **Cinematic 3D Scroll Journey:** Abandoned traditional scroll behavior. The user's scroll wheel is mathematically locked to a `gsap.timeline()` that directly scrubs the underlying Three.js canvas forward and backwards seamlessly.
* **Deep Space Geometric Engine:** A massive background `THREE.Group` consisting of floating 3D mathematical primitives (Tetrahedrons, Octahedrons, Tori, etc.), infinitely scaling grid floors, and massive navigational rings dynamically moving along the Z-axis.
* **Scroll-Triggered Visual Context:** As users scroll through different projects (*OpthaMiss, Hate-Speech-Detection, Jarvis, etc.*), the Three.js mesh colors dynamically interpolate to match the mood of the dataset.
* **Sequential Layer Revealing:** Native CSS layout architecture separating `<div class="title-layer">` and `<div class="detail-layer">`, allowing GSAP to orchestrate highly controlled fade-in sequences so the UI is parsed sequentially by the user.
* **Lenis Smooth Scroll:** Hardware accelerated page inertia ensuring buttery smooth scrub interactions across the 3D timeline regardless of the mouse input variant.

## 🛠️ Technology Stack

* **Structure:** HTML5
* **Styling:** Vanilla CSS3 (Custom Variables, absolute sequencing, `backdrop-filter`, and CSS variable neon grids)
* **Logic & Canvas Engine:** Vanilla ES6+ JavaScript
* **3D Rendering:** `Three.js` (r134)
* **Animation & Scroll:** `GSAP 3` & `ScrollTrigger`
* **Inertia Scaling:** `@studio-freight/lenis`
* **Iconography:** `FontAwesome` (via CDN)

## 📁 Source Architecture

```text
/e-portfolio-3d
├── index.html   # 13-Scene Semantic Storyboard structure
├── styles.css   # Engineering Blueprint Design System & HUD Setup
├── main.js      # Three.js Environment, GSAP tl3D engine, and Lenis hook
└── README.md
```

## ⚙️ How to Run Locally

Because the project relies entirely on Vanilla JS and CDN-delivered dependencies with no Node compilation step, deployment is instantaneous.

1. **Clone the repo:**
   ```bash
   git clone https://github.com/bhargavm-iiits/[repo-name].git
   ```

2. **Serve it locally:**
   Since Three.js loads a WebGL canvas and some browsers flag CORS loading issues for local files across the `file://` protocol, it is recommended to run a super lightweight local server.
   
   If you have Python installed:
   ```bash
   python -m http.server 8000
   ```
   *Then navigate to `http://localhost:8000` in your browser.*

## 📬 Contact & Links

* **Engineering Mind:** Bhargav M
* **Email:** [bhargav.m23@iiits.in](mailto:bhargav.m23@iiits.in)
* **Phone:** +91 7795036940
* **LinkedIn:** [linkedin.com/in/bhargav-m-304b12289](https://www.linkedin.com/in/bhargav-m-304b12289/)
* **GitHub:** [github.com/bhargavm-iiits](https://github.com/bhargavm-iiits)

---
*SYS.ONLINE // INITIALIZING TRAJECTORY DATA...*
