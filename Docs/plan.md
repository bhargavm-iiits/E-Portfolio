# NEXUS — Design & Build Plan

The approved design for the cinematic portfolio of **Bhargav M**, plus the plan to build it. Every image in this file is in `Docs/plan/`.

- **Live design canvas** (private; share it from its Share menu): https://claude.ai/artifact/L6YMMdSZVmheWycs8mnMVs
- **Spec:** `Docs/NEXUS-Cinematic/MASTER-PROMPT.md` (16 chapters, 43 transitions, measured tokens)
- **Character:** `Docs/3D Character/…Neon_Virtual_Vanguard….fbx`, with `Docs/Neon Shadow VR Gamer.png` as its concept
- **Content:** `src/data/nexus.ts` and `src/config/site.ts` only. No text is copied from the footage.

> All scene art is our own real-time three.js rendering, made with the pipeline in `Docs/plan/render-pipeline/`. None of it is a frame from the reference videos.

---

## 1 · Artboards (25)

Each artboard is the target for one chapter or route. The key frame next to each title is the reference it matches, from `Docs/NEXUS-Cinematic/reference/keyframes/`.

### 00 · Reference & system

| | |
|---|---|
| ![Character](plan/artboards/Character.jpg) | **Character.** Your Neon Shadow concept beside a front, ¾, side and back turnaround rendered from the FBX, plus the four per-chapter lighting setups. |
| ![System](plan/artboards/System.jpg) | **Design system.** Colour tokens measured from the footage, type specimens, dark and light glass, CTA pill states, menu chip, nav, HUD modules, tech tiles. |
| ![Storyboard](plan/artboards/Storyboard.jpg) | **Reference storyboard** of the footage, kept for layout comparison only. |

### 01 · Entry: CH00–CH04 and Short Entry

| | |
|---|---|
| ![Gate](plan/artboards/Main.jpg) | **CH01 The Gate** (KF02). Plasma portal, wet tiled walkway, fog banks and rim particles. The player is seen from behind and lit violet by the portal. HUD frame with side arcs and modules; SKIP INTRO; ENTER THE NEXUS. |
| ![Entry](plan/artboards/Entry.jpg) | **CH02 World Entry** (KF08). Segmented mechanical torus, a spiral into a white core with an anamorphic flare, bokeh rain. World Entry HUD: ruler, LINK STATUS, NEXUS SECURE, 131° gauge, loader. |
| ![Hub](plan/artboards/Hub.jpg) | **CH03 The Nexus Hub** (KF10). Neon megacity avenue with a second portal showing hyperspace streaks inside; `[ THE NEXUS HUB ]` title. |
| ![Warp](plan/artboards/Warp.jpg) | **CH04 Warp** (KF12). City corridor, wormhole mouth, cyan and violet streaks, laser rails, HUD at 70 %. |
| ![Short Entry](plan/artboards/ShortEntry.jpg) | **SE Short Entry** (KF18). Rooftop portal, first-person reticle, parenthesis arcs, rulers, star streaks. |

### 02 · Home → Dive → VR Main Menu

| | |
|---|---|
| ![Home](plan/artboards/Home.jpg) | **CH05 Home** (KF22). A violet fantasy city seen through a huge ring frame; the player on a tiled cliff ledge; dark neon-edged cubes. Copy: I CREATE / IMMERSIVE (Saira Expanded) / WORLDS (Michroma, crossed W). The nav appears here. |
| ![Dive](plan/artboards/Dive.jpg) | **CH06 Dive** (KF24). Holo rings and data panels materialise around the headset. |
| ![Menu](plan/artboards/Menu.jpg) | **CH07 VR Main Menu** (KF26). A glowing iso cube in counter-rotating rings, seven tilted glass chips with cyan L-corners, the goggle nose-bridge mask. Interactive. |

### 03 · Missions: CH08–CH11

| | |
|---|---|
| ![Lab](plan/artboards/Lab.jpg) | **CH08 Game-Based Physics Learning** (KF28). Circular lab, glass cube with an atom, molecules, level pads, kinematics and suite panels. |
| ![Case file](plan/artboards/CaseFile.jpg) | **CH08 case-file state** (KF57). Central window with a render, side panels built from `hud[]`, `coreMechanic` and the five repos; OPEN CASE FILE. |
| ![Terrain](plan/artboards/Terrain.jpg) | **CH09 Tirumala AR Navigation** (KF30). Hologram terrain slab, amber route from Alipiri to the Tirumala pin, the **1.17 km interpolated gap** flagged. |
| ![Cinema](plan/artboards/Cinema.jpg) | **CH10 VR Cinema Platform** (no reference; built in the same language). Wireframe dome, stereoscopic SBS screen, 360° sphere, Argon2 / JWT / AES locks, LIVE DEMO card. |
| ![Hangar](plan/artboards/Hangar.jpg) | **CH11 ISRO Launch Pad Simulation** (KF32). Hangar, launch vehicle with strap-ons, lattice gantry with orange arms, plaques. |

### 04 · Abilities → Player Log → Vault → Finale / Comms

| | |
|---|---|
| ![Abilities](plan/artboards/Abilities.jpg) | **CH12 Abilities** (KF34). Hex emblem on a teleporter pad; 12 ability nodes from `abilities` (violet for AI); hover tooltip with `usedIn` evidence. |
| ![Player Log](plan/artboards/PlayerLog.jpg) | **CH13 Player Log** (KF65). The front-facing player with neon ribbons from the controllers; the `log` entries as holo panels; `nextObjective`. |
| ![Vault](plan/artboards/Vault.jpg) | **CH14 The Vault** (KF69). Glass vitrines for all four missions, neon node connectors, domain filter. |
| ![Side quests](plan/artboards/SideQuests.jpg) | **CH14 Side quests** (KF55). Seven `sideQuests` plus a GitHub card, in light and dark glass with hover lift. |
| ![Finale](plan/artboards/Finale.jpg) | **CH15 Finale** (KF36). BHARGAV M, role line, divider, EXPLORE PORTFOLIO pill in its hover state, HUD arcs, side rails, pagination. |
| ![Comms](plan/artboards/Comms.jpg) | **Comms terminal.** LET’S BUILD THE NEXT WORLD., links, and the Firebase contact form (80 / 120 / 2000 limits). |

### 05 · /archive and phone

| | | |
|---|---|---|
| ![Archive](plan/artboards/Archive.jpg) | ![Phone home](plan/artboards/MobileHome.jpg) | ![Phone mission](plan/artboards/MobileMission.jpg) |
| **/archive** (KF44): daylight glass carousel | **Phone · Home**: copy over the scene | **Phone · Mission**: viewport plus glass bottom sheet |

---

## 2 · The character

| Concept | In-engine (FBX → three.js, PBR + emissive) |
|---|---|
| ![concept](<Neon Shadow VR Gamer.png>) | ![turnaround](plan/renders/character/fbx-inspection-grid.jpg) |

| Gate (portal rim) | Home (vista rim) | Player Log (neon rims) | Dive (headset) |
|---|---|---|---|
| ![](plan/renders/character/char_gate.webp) | ![](plan/renders/character/char_home.webp) | ![](plan/renders/character/char_log.webp) | ![](plan/renders/character/char_dive.webp) |

**Mesh facts.** The model is a Meshy static mesh: 3.15 M vertices, no skeleton, about 190 units tall, frozen in the concept's arms-out pose. It has PBR albedo, normal, roughness and metallic maps. The blue texels (headset and controller rings) are used as an emissive mask. For the web build it is welded, simplified and Draco-compressed into `public/nexus/character.glb`. An auto-rig (for idle, look-up and gesture clips) is the open follow-up.

---

## 3 · 3D plates and sprites

### Scene plates (`plan/renders/plates/`)

| | | |
|---|---|---|
| ![](plan/renders/plates/gate.jpg) Gate | ![](plan/renders/plates/entry.jpg) World Entry | ![](plan/renders/plates/hub.jpg) Nexus Hub |
| ![](plan/renders/plates/warp.jpg) Warp | ![](plan/renders/plates/se.jpg) Short Entry | ![](plan/renders/plates/vista.jpg) Home vista |
| ![](plan/renders/plates/lab.jpg) Physics lab | ![](plan/renders/plates/terrain.jpg) Tirumala terrain | ![](plan/renders/plates/cinema.jpg) VR cinema |
| ![](plan/renders/plates/hangar.jpg) ISRO hangar | | |

### Sprites (`plan/renders/sprites/`)

| | | | | | | |
|---|---|---|---|---|---|---|
| ![](plan/renders/sprites/cube_dark_1.webp) | ![](plan/renders/sprites/cube_dark_2.webp) | ![](plan/renders/sprites/cube_dark_3.webp) | ![](plan/renders/sprites/cube_glass_1.webp) | ![](plan/renders/sprites/cube_glass_2.webp) | ![](plan/renders/sprites/cube_glass_3.webp) | ![](plan/renders/sprites/cube_menu.webp) |
| ![](plan/renders/sprites/prop_homering.webp) | ![](plan/renders/sprites/prop_mechring.webp) | ![](plan/renders/sprites/prop_ledge.webp) | ![](plan/renders/sprites/fx_warp.webp) | ![](plan/renders/sprites/fx_se.webp) | ![](plan/renders/sprites/fx_wormhole.webp) | |

**Display-font match** against KF22 (Saira Expanded for IMMERSIVE, Michroma for WORLDS): ![fonts](plan/renders/font-match-KF22.jpg)

---

## 4 · Website build plan

### 4.1 Architecture

- **Next.js 16.3 App Router** (Turbopack). `src/app/page.tsx` renders the client app `src/nexus/NexusSite.tsx`, and `src/app/archive/page.tsx` renders the daylight route. `ssr: false` dynamic imports live only inside client components, per the Next 16 docs.
- **One WebGL engine** (`src/nexus/engine/`). It runs raw three.js r185 with an EffectComposer (Unreal bloom and output tone mapping) behind all DOM. Each chapter's world is a module ported from the plate builders in `Docs/plan/render-pipeline/`, so the live site is the same 3D as the artboards. Worlds are built lazily, one chapter ahead, and disposed when far away.
- **Scroll engine** (`src/nexus/director.ts`). One Lenis instance on the GSAP ticker; ScrollTrigger measures each chapter's spacer section and writes plain numbers (`p` = 0→1 per chapter, `vel`) into a mutable `rig`. The render loop reads the rig. **No React state changes per frame.**
- **Chapter overlays** (`src/nexus/chapters/*`). DOM layers fixed over the canvas, one per chapter, matching the artboards. Each owns a paused GSAP timeline that is scrubbed to the chapter's `p`, so every reveal reverses cleanly when you scroll back up.
- **Cover layer.** One full-screen layer carries the transition covers: white-out ramp (T04, T05), violet bloom (T09/T10), door split (T17), whip blur (T20), iris (T26), black visor (T13). World switches happen while it is opaque.

### 4.2 Chapter map (scroll lengths in vh)

| Chapter | vh | World (3D) | Motion highlights |
|---|---|---|---|
| CH00 Boot | time | gate (dim) | HUD boot (T01) with real load progress |
| CH01 The Gate | 400 | gate + character | Measured dolly `w(t)=.31+.53(t/7.8)³`, plasma twist 0→3 turns, particle swarm, HUD boot, pass over the head, white-out |
| CH02 World Entry | 125 | entry | White bridge in, HUD reboot glitch, NEXUS HUB title, dolly 38→99 %, threshold flash |
| CH03 Nexus Hub | 120 | city/hub | Title brackets slide apart, letter-spacing tightens, glide to the portal, streaks erupt |
| CH04 Warp | 200 | city/warp + streaks | Velocity-coupled streak length, laser rails, wormhole, bloom resolve into Home |
| CH05 Home | 100 | vista + ring + ledge + character + cubes | Copy intro (eyebrow rule, tracking ease, IMMERSIVE clip reveal), cubes rotate and bob, spire beam pulse, mouse parallax |
| CH06 Dive | 100 | home (push-in) | T11 push with copy parallax out; T12 holo rings draw; T13 visor dive to black |
| CH07 VR Menu | 120 | menu (nebula, glass cubes, iso cube) | Rings counter-rotate, chips float in, hover lift and lit connectors, cube turns toward the hovered chip |
| CH08 Physics Lab | 160 | lab | Push-in, atom spin, velocity arrow, pads light in sequence, panels materialise (T27), door split out (T17) |
| CH09 Tirumala | 200 | terrain | Terrain rise (T19), route draws to the pin (T18), flag on the 1.17 km gap |
| CH10 VR Cinema | 160 | cinema | Scanline power-on, sphere spin, lock orbit, whip-pan out (T20) |
| CH11 ISRO Hangar | 160 | hangar | Push-in, gantry arms swing back, strip-light pulse, shrink to orb (T22) |
| CH12 Abilities | 160 | space (streaks, pad) | Emblem rotation, pad ring pulse, nodes fly in on comet paths (T36), hover tooltips |
| CH13 Player Log | 220 | log (front character, cubes) | Hologram-to-solid reveal, ribbons draw, log panels write in, background crossfades to the city |
| CH14 Vault | 240 | space | Vitrines rise (T35), filter, side-quest grid materialises (T27) |
| CH15 Finale + Comms | 120 + flow | space | Logos converge, radial zoom settle, CTA reticle, then the contact terminal |
| `/archive` | page | none (DOM) | Light glass carousel (T39), tile hover tint (T43), RE-ENTER |

### 4.3 Smooth-animation rules

- Lenis lerp 0.1; every chapter timeline is scrubbed, so nothing pops.
- Idle loops never freeze: plasma, fog, particles, cubes, beam and city lights keep animating when scrolling stops.
- Easing follows the spec (`power2.in` dollies, `power3.out` settles), and timelines are authored in reference seconds.
- No flashes faster than 3 per second; every white-out ramps over at least 0.8 s.
- `prefers-reduced-motion` switches to **Lite**: native scroll, static posters from our own renders, 200 ms crossfades. The content is identical.

### 4.4 Quality and access

- DPR capped at 1.75 (1.25 on medium), bloom on high and medium, and reflections at half resolution on medium. Only the world nearest the current chapter is rendered.
- SKIP INTRO is the first focusable element. Esc skips. Every interactive element is a real button or link, the HUD is `aria-hidden`, a polite live region announces chapters, and touch targets are at least 44 px.

### 4.5 Status

- [x] Analysis of the spec, key frames and character
- [x] Design canvas (25 artboards) and image library
- [x] Character GLB optimisation: `public/nexus/character.glb` (105 k tris, 1.75 MB, meshopt + WebP PBR) and `character-lite.glb` (42 k tris, 0.6 MB)
- [x] Engine (`src/nexus/engine/`) and director (`src/nexus/director.ts`)
- [x] Chapters CH00–CH15, Comms, `/archive`, phone layouts, Lite mode
- [x] Screenshot QA against the artboards (`.analysis/site-qa.mjs`, `site-extra.mjs`, `site-verify.mjs`)

**Scroll transitions (built):** nothing cuts. Each chapter boundary has a scroll window (`TRANSITIONS` in `src/nexus/story.ts`). Inside it both worlds render into their own HDR buffers with their own bloom, and `src/nexus/engine/transition.ts` blends them by the scrubbed `t`, in one of seven modes: fade, colour dip, slit doors, radial zoom, iris, push or whip. The DOM overlays crossfade in the same window. Scrolling back reverses each transition exactly.

**Not built yet:** the Short Entry (SE) route for return visits and phones; T28 split-zoom for side quests (cards link straight to GitHub); character rigging.

**Run:** `npm run dev`, then open `/`. Dev-only hook: `window.__nexus.seek("terrain", 0.6)` jumps to any chapter at a given progress.

---

## 5 · Files in `Docs/plan/`

| Path | Contents |
|---|---|
| `artboards/*.jpg` | All 25 artboards at 1.5×, with the canvas runtime emulated |
| `renders/plates/*.jpg` | Full-resolution 3D scene plates |
| `renders/character/*.webp` | Character renders (Gate, Home, Dive, Player Log, hero, turnaround) and the FBX inspection grid |
| `renders/sprites/*.webp` | Cubes, ring frame, ledge, mechanical ring, streak and wormhole overlays |
| `render-pipeline/` | The three.js scene builders, shooter and local server that produced every render |
| `canvas-source/` | Source of every `.dc.html` artboard plus `canvas.json` |
| `keyframe-notes.md` | Measured layout notes from the key frames |
