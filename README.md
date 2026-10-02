# BHARGAV M // NEXUS — Portfolio

**Live:** [e-portfolio-xi-bay.vercel.app](https://e-portfolio-xi-bay.vercel.app/)

A compact, game-flavoured portfolio built to the `Docs/Game` specification (`MASTER-PROMPT.md` and the reference screenshot, which is authoritative for layout). The page reads **World → Missions → Ability Tree + Player Log → Comms**. The default reading view is quiet. An optional, skippable **ENTER THE NEXUS** entry flies through the portal and lands on the missions.

## The page

| # | Section | What it is |
|---|---|---|
| 01 | **World** | Copy on the left. On the right, a real-time 3D world: a mechanical, asymmetric segmented portal (cyan emitters on the right/upper arc, violet on the left/lower, broken-away blocks). Through its aperture is a bright daylight floating city with spires and waterfalls. In front, a small explorer seen from behind (cyan back emblem, headset) stands on a cracked, wet stone ledge that mirrors the portal. Around it: mist, floating rocks, weathered spires and a dim planet. A bottom HUD reads `01 / WORLD ENTRY … SCROLL TO EXPLORE`. |
| 02 | **Missions** | Three image-first mission cards (Tirumala AR Navigation, Game-Based Physics Learning, VR Cinema Platform), the additional ISRO mission, and the side builds. **VIEW BRIEF →** opens a briefing. |
| — | **Briefing** | A dialog with a notched evidence window and a context panel. The window shows the mission's live diorama (illustrative 3D) or fact-derived system diagrams; the panel holds objective, tools, core interaction, challenge, result, structure, context and links. Deep-linkable as `#mission-<slug>`. |
| 03 | **Ability Tree** | A Unity-centred cross: C# above, AR Foundation left, PyTorch right (violet), RAG below, joined by stepped connectors. Each node explains its role and links to the work that uses it. No percentages. |
| 04 | **Player Log** | Education, experience and the award on a hex-icon rail. Amber is reserved for the award. |
| 05 | **Comms** | A night panorama band (towers across the water, the moon, mist, the explorer on the shore). **ESTABLISH CONTACT** opens the transmission terminal. |

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · three.js 0.185 · React Three Fiber 9 · drei 10 · postprocessing 6 / @react-three/postprocessing 3 · GSAP 3 (ScrollTrigger) · Lenis · Firebase 12 (Firestore, optional App Check) · Vercel.

## Rendering strategy

- **Semantic DOM, one decorative canvas.** All facts, links and actions are HTML. One fixed WebGL canvas (`aria-hidden`) sits behind the page.
- **3D windows.** DOM elements register as windows onto the canvas (`lib/windows.ts`): the hero, the contact band and the briefing's evidence frame. Each frame, `three/WindowRig.tsx` picks the visible window, poses the camera in that window's world, and projects it into the element's rectangle (`camera.aspect = w/h`, `setViewOffset(w, h, −left, −top, canvasW, canvasH)`). The 3D therefore scrolls with its section like an image. Everything else on the page is opaque, so only windows reveal the canvas. The briefing sits under a modal sheet, so its window's pixels are copied each frame into a small 2D mirror canvas inside the dialog.
- **The city through the aperture** is a separate scene, rendered each frame into a render target. Its camera mirrors the main camera relative to the portal frame, so parallax is correct. The aperture disc samples it with the main camera's view-projection, which keeps it correct inside mirror passes too. For ENTER THE NEXUS the main camera flies along the line of sight and stops at the aperture plane while the city camera keeps going (`rig.cityPush`).
- **Mirrors.** The wet ledge and the water are three's `Reflector` with custom shaders (cracks, puddles, roughness blur, Fresnel; ripples and stretched light reflections). They render only when drawn.
- **Frame driving.** `frameloop="never"`: GSAP's ticker calls R3F's `advance()` right after Lenis updates the scroll, so the 3D never lags its section by a frame. Nothing renders when no window is visible. Under reduced motion a frame renders only when something changes.
- **Loading.** The hero poster (a render of the same scene) is the first-paint image. On desktop the 3D stage loads when the main thread is idle after `load`; phones load it on first interaction. The worlds mount one per task, and every shader is pre-compiled for the variants actually used: the composer's linear target, the city target, and the post-processing passes. Uniform tables are warmed in small chunks. The canvas fades in over the identical poster.
- **Tiers** (`config/quality.ts`): DPR, mirror resolution, city render scale, mist, sparks, stars and post-processing scale with the device; `PerformanceMonitor` lowers DPR on sustained drops.
- **Fallbacks.** Without WebGL (or `?webgl=off`), the posters stand in for the hero and the contact band, briefings open on their system diagrams, and all content is readable. Reduced motion (system setting or the header toggle) removes the entry flight, smooth scrolling, reveals and idle animation.

## Architecture

```text
src/
├── app/                layout (fonts, metadata, pre-paint motion flag), page, OG image, robots, sitemap, icon
├── config/
│   ├── site.ts         URL, links, section map, [VERIFY] switches, contact limits
│   ├── world.ts        world-space layout + framing for the hero, comms band and briefing dioramas
│   └── quality.ts      device tiers
├── data/
│   ├── nexus.ts        ALL content: missions, side builds, abilities + evidence, log, hero / comms copy
│   ├── diagrams.ts     fact-derived briefing system diagrams
│   └── brandIcons.ts   Simple Icons paths (CC0)
├── lib/
│   ├── director.ts     Lenis, navigation, ENTER THE NEXUS state machine, skip
│   ├── windows.ts      DOM-rect windows + mirror canvases (no three.js import)
│   ├── rig.ts          mutable values GSAP writes and the render loop reads
│   ├── store.ts        tiny external store (useSyncExternalStore)
│   ├── focusTrap.ts, nav.ts, sound.ts (opt-in WebAudio), firebase.ts (lazy)
├── components/
│   ├── NexusApp.tsx    orchestrator: tier, WebGL capability, motion, stage loading, active section
│   ├── site/           SiteHeader (+ mobile menu), ContactTerminal
│   ├── sections/       Hero, Missions, AbilityTree, PlayerLog, Comms
│   ├── briefing/       MissionBriefing, Diagram
│   ├── hud/            HudFrame (measured SVG frame grammar), RailHead, Monogram, Icons
│   ├── fx/Motion.tsx   quiet reveals (type-on headings, staggered cards)
│   └── three/
│       ├── Stage.tsx, WindowRig.tsx, LightRig.tsx, Effects.tsx, view.ts
│       ├── hero/       HeroWorld, PortalRing + ringGeometry, SkyCity (aperture), Ledge
│       ├── comms/      CommsWorld (towers, water, moon, mountains, shore)
│       ├── brief/      BriefWorld (the four mission dioramas)
│       ├── missions/   TerrainWorld, PhysicsLab, CinemaDome, LaunchHangar (+ shared)
│       └── shared/     Explorer, Mist, Stars, util (seeded noise, rocks, spires, baked textures)
└── styles/             tokens, base, hud (header/stage), sections, briefing, fx
scripts/gen-textures.mjs  bakes public/nexus/tex/*.png (no dependencies)
```

See `DESIGN_TOKENS.md` for the design system and `MOTION.md` for every timing. Delivery notes, the asset inventory and the validation report live in `Docs/Game/delivery/DELIVERY.md`.

## Run locally

```bash
npm install
npm run dev                     # http://localhost:3000
npm run build && npm start
node scripts/gen-textures.mjs   # only if you change the baked stone / smoke textures
```

QA helpers: `?webgl=off` forces the no-WebGL fallback. The header's motion toggle persists per browser.

## Content and `[VERIFY]` switches

All copy lives in `src/data/nexus.ts`. Claims that still need confirmation are gated in `src/config/site.ts → verified`:

| Switch | Default | Effect |
|---|---|---|
| `isroMission` | `true` | Shows the ISRO Launch Pad Simulation as an additional mission, limited to tools and context |
| `physicsVR` | `false` | Uses "VR LEARNING" instead of "GAME-BASED LEARNING" for the physics mission |
| `xrInteractionToolkit` | `false` | Reserved: the site makes no XR Interaction Toolkit claim (nothing reads it yet) |
| `graduation2027` | `false` | Shows "2023 – 2027" and the graduation year in the next objective |

The screenshot's dates and degree differ from the source data. The site uses the source data, and the conflicts are listed in the delivery notes.

## Contact form (Firestore)

Without configuration, **TRANSMIT** hands the message to the visitor's mail client with everything prefilled. It never shows a fake success. To store transmissions:

1. Create a Firebase project, enable **Firestore**, and set these env vars (in `.env.local`, and in Vercel):
   `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`.
2. Optional App Check: set `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` (reCAPTCHA v3) and enforce App Check for Firestore.
3. Rules (create-only, typed, length-limited to match `CONTACT_LIMITS`):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    match /messages/{id} {
      allow create: if request.resource.data.keys().hasOnly(['name','email','message','createdAt'])
        && request.resource.data.name is string && request.resource.data.name.size() <= 80
        && request.resource.data.email is string && request.resource.data.email.size() <= 120
        && request.resource.data.message is string && request.resource.data.message.size() <= 2000
        && request.resource.data.createdAt == request.time;
      allow read, update, delete: if false;
    }
  }
}
```

The form also has a hidden honeypot, client validation with `aria-describedby` errors, and an `aria-live` status line tied to real states (checking → uplink → received / signal lost, or the mail hand-off).

## Contact

- **Email:** [bhargav.m23@iiits.in](mailto:bhargav.m23@iiits.in)
- **LinkedIn:** [linkedin.com/in/bhargav-ai](https://www.linkedin.com/in/bhargav-ai)
- **GitHub:** [github.com/bhargavm-iiits](https://github.com/bhargavm-iiits)

> The previous zero-build Three.js version lives in [`legacy-static/`](./legacy-static) for reference.
