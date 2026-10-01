# BHARGAV M // NEXUS — Master Design Prompt v2

**Reference-video edition** · 1 October 2026
Built from: `Ref_Videos/portfolio_4.mp4`, `portfolio_5.mp4`, `portfolio_6.mp4` (frame-by-frame review) · `src/data/portfolio.ts` (content facts) · `Docs/portfolio.md` (codebase audit) · the NEXUS brief v1.
Companion file: `NEXUS_Master_Prompt.html` (same content plus storyboard frames, palette swatches and pacing charts).

---

## 0. How to use this document

| Part | What it is | Who it's for |
|---|---|---|
| **A. Reference analysis** (§1–3) | What the three videos actually show, beat by beat, and how they combine into one direction | You, as the evidence behind the prompt |
| **B. Master prompt** (§4) | Self-contained brief. Copy everything between **BEGIN PROMPT** and **END PROMPT** into your AI builder (Claude Code, Cursor, v0 or similar) or hand it to a designer | The builder |
| **C. Appendices** (§5–7) | Facts to verify, corrections compared with brief v1 and the videos, and a do/don't list | You, before shipping |

Items marked **[VERIFY]** are claims that show up in the videos or in brief v1 but aren't backed by the repo's data file. Confirm them against your resume, or remove them.

---

# PART A — REFERENCE ANALYSIS

## 1. What was analysed

| File | Duration | Resolution | FPS | Frames | Audio | Hard cuts |
|---|---|---|---|---|---|---|
| portfolio_4.mp4 | 10.0 s | 1280×720 | 24 | 240 | Yes, music bed | None (continuous camera) |
| portfolio_5.mp4 | 10.0 s | 1280×720 | 24 | 240 | Yes, same bed | None |
| portfolio_6.mp4 | 10.0 s | 1280×720 | 24 | 240 | Yes, same bed | None |

**Key findings**

1. **One key art, three takes.** All three clips open on the *same* hero frame: a VR player with his back to the camera, a segmented portal ring, a megacity, floating cubes and a ringed planet. They are three alternative answers to one question: *"what happens when the player enters the world?"* Treat them as a menu of transitions, not as three different websites.
2. **Everything happens in-camera.** Scene detection (threshold 0.25) found **no hard cuts** in any clip. Every scene change is a dolly, whip-pan, panel wipe, grid split, morph or warp. This is the single most important motion rule for the site.
3. **Shared soundtrack.** All three clips have an identical loudness envelope: a swell from −41 to −19 dB over 0–3 s, a dip at about 5.5 s, and a second lift at about 8.5 s. It's a riser → breath → lift structure you can mirror in optional sound design.
4. **They are AI-generated concept clips.** On-screen text is garbled ("LET MORE", "ACITES", "DEPERNCES", "Ecact object", "Gyber Design", "UNIMEA", "CH J.TX"). Some project labels are wrong too; the Tirumala card reads "VR-Based • Unreal Engine". **Take the layout, hierarchy and motion. Never take the copy.** The facts are in §4.9.
5. **The ✦ four-point sparkle** in the bottom-right corner of every frame is the video generator's watermark, not a UI element.
6. **Other items in the folder.** `portfolio_1–3.mp4` weren't analysed (outside this request). There's a working Next.js 16 + React Three Fiber build, live at e-portfolio-xi-bay.vercel.app, with a portal, a procedural city, glass project cubes and a VR figure. There's also a full codebase audit in `Docs/portfolio.md` and a `legacy-static/` vanilla build. **This prompt evolves that repo. It isn't a rewrite from zero.**

**Pacing data** (mean luminance 0–255 and frame-to-frame motion, sampled at 8 fps)

| Second | p4 lum | p4 motion | p5 lum | p5 motion | p6 lum | p6 motion |
|---|---|---|---|---|---|---|
| 0–1 | 52 | 6.7 | 52 | 5.0 | 50 | 2.6 |
| 1–2 | 93 | **36.1** | 64 | 14.8 | 63 | 14.9 |
| 2–3 | 124 | 23.0 | 45 | 16.5 | **96** | **36.0** |
| 3–4 | 141 | 19.0 | 40 | 14.7 | 62 | **35.7** |
| 4–5 | 170 | 7.5 | 46 | 17.4 | 51 | 27.7 |
| 5–6 | 172 | 29.7 | 60 | 17.4 | 52 | 32.0 |
| 6–7 | 176 | 11.5 | 62 | 16.1 | 55 | 11.1 |
| 7–8 | 151 | 17.1 | 45 | 14.3 | 57 | 6.1 |
| 8–9 | 146 | 15.4 | 40 | 17.3 | 60 | 27.6 |
| 9–10 | 147 | 1.2 | 26 | 5.0 | 20 | 1.2 |

What the numbers say:

- **Hold → move → settle.** Every clip opens with about 1 s of near-stillness and ends with about 1 s of settle. Big motion peaks only happen at thresholds (portal crossing, digitisation, warp).
- **p4 goes from dark to daylight**: luminance rises from 52 to 176, an exposure bloom into a bright world. **p5 stays at night the whole way** (40–64). **p6 spikes once** (96 at the shatter) and ends at its darkest (20) on the end card.
- **The end card is always the darkest, calmest frame.** Make Comms feel like arriving somewhere quiet.

---

## 2. Video-by-video breakdown

<!-- STORYBOARD:portfolio_4 -->

### 2.1 portfolio_4: "Through the Ring → Frosted-Glass Sky Deck"

| Time | Camera | On screen | UI / typography | Transition |
|---|---|---|---|---|
| 0.0–1.0 | Locked, micro-drift | **Hero key art.** VR player seen from behind on a cracked stone platform, facing a segmented portal ring with alternating magenta and cyan light bars. Floating dark cubes with violet edge-light, a megacity with a vertical light-beam spire, a ringed planet, a sea of clouds | Left column: "I CREATE" (tracked-out caps) / **"IMMERSIVE"** (blue→violet gradient, wide geometric bold) / **"WORLDS"** (white, angular) / "PLAY • EXPERIENCE • BELIEVE" (violet caps) / a 3-line intro / 4 line-icon capabilities with vertical dividers. Top nav, a segmented pill toggle, a gradient pill CTA. Bottom-left: "SCROLL TO EXPLORE" with a mouse icon inside an angled HUD plate | Hold |
| 1.0–2.0 | Fast dolly **through the ring** (motion peak 36) | The ring scales past the frame edges. The hero copy is scaled *with* the world: it sits on a plane in the scene, not fixed to the screen, and slides out left. The sky brightens | Nav fades | **Portal dolly + exposure bloom** (lum 52 → 124) |
| 2.0–3.5 | Continuing dolly, slight descent | Emerges into a bright daylight cloudscape. Frosted-glass project panels float at *different depths* among the cubes | Panels: ~20 px radius, white frost at 60–70%, soft drop shadow | Depth-parallax reveal |
| 3.5–5.0 | Settle on the centre panel | "Projects" glass dashboard: header with a star glyph, a nav with an active underline, a left intro column with a black pill button, and a featured media card, "VR Physics Learning", with tag chips and media controls. Vertical scroll rail on the right | Light theme, dark ink text | Hold (motion 7.5) |
| 5.0–7.0 | Vertical crane down | Card 2, "Tirumala AR Navigation": a wireframe terrain hologram in a dark media well. The focused card gets a **cyan edge glow**. Side mini-tiles. Pagination is an active pill plus 5 dots | Focus = cyan edge + outer glow | Scroll-linked pan |
| 7.0–7.5 | Lateral whip | The current panel sweeps left with motion blur and reveals the next scene | — | **Panel wipe** |
| 7.5–8.5 | Slow push | "ISRO Launch Pad Simulation": a 3D rocket and launch tower on a pad inside a rounded glass frame. **HUD callouts** with corner brackets and leader lines to anchor dots ("Blender • Unreal Engine • 3D Simulation"). A ghost pill, "EXPLORE PORTFOLIO →". The cursor hovers the pad | Cool studio grey (#848D9E) | — |
| 8.5–10.0 | Crane down, settle | "Tech Stack": a wide name card, "BHARGAV M / UNITY • XR • AR/VR • GAME DEVELOPMENT", plus 4 logo tiles (Unity, Unreal, Blender, C#). **Hovering Blender tints the tile edge with Blender's own orange** and shows a ring cursor | — | Settle (motion 1.2) |

**Take:** the portal dolly with the UI living *in* the world; the exposure bloom; depth-staggered glass panels; HUD callouts pinned to 3D objects; brand-tinted hover glow; pagination and the scroll rail.
**Leave:** a light theme across the whole site, which fights the NEXUS identity. Use the frosted look **only** for the Mission Briefing reading mode. Also leave the generic dashboard nav inside the panel.

<!-- STORYBOARD:portfolio_5 -->

### 2.2 portfolio_5: "Dark HUD Mission Deck"

| Time | Camera | On screen | UI / typography | Transition |
|---|---|---|---|---|
| 0.0–1.0 | Locked | Same hero key art | Same hero UI; nav with a HOME active underline and a blue pill button | Hold |
| 1.0–2.0 | Slow push | **The portal "opens"**: the view *through* the ring brightens into a daylight utopian city (white towers, greenery) while the rest of the frame stays night. A window into another world | Hero copy starts drifting left | **Portal-window reveal** |
| 2.0–3.0 | Fly forward into space | Dark space with violet nebula haze and sparse star dust. A 2×3 grid of **dark glass category cards**, each with a 3D-object thumbnail, a title and an outline button with an arrow. **The top row lifts and the bottom row drops** to reveal a central hologram | Chamfered HUD corners; cyan corner ticks on the focused card | **Grid-split reveal** |
| 3.0–4.5 | Push in on the centre | Glowing title "VR-Based Physics Learning / Unity + C# + VR". A central **"WebGL" window with a notched tab header**: a glowing cube on a circular emissive pedestal, with smaller orbiting cubes and a triangle. Flanking data panels (bar chart, % stats), an angled label plate, a "CONTACT" button with a target icon | Holographic cyan text glow | Dolly |
| 4.5–6.0 | Orbit right + push | "Tirumala AR Navigation": a 3D terrain block with a **cyan wireframe contour mesh** and cyan river/paths. An **orange route line draws on** from a start ring to a map pin on a peak. A floating glass header panel with a blue "WebGL" pill; small side HUD cards; a floor grid | — | Orbit + **route draw-on** |
| 6.0–7.5 | **Whip-pan right** with heavy motion blur | Into a dark hangar | — | Whip-pan |
| 7.5–8.5 | Settle | "ISRO Launch Pad Simulation" inside a **wide curved glass frame** with cyan rim light, in a hangar with ceiling light strips. Left text column with tech chips; a "WEBGL →" ghost pill; a circular HUD pedestal under the frame. The nav returns: hex emblem + "Portfolio" | — | — |
| 8.5–9.0 | Pull back | Plate labelled "Tech Stack". A **staggered 3-column tile cluster** where the centre column is offset down by half a tile; engine logos inside; ring cursor | Dark glass tiles, 1 px cool-white edge, inner top highlight | — |
| 9.0–10.0 | Dissolve | **End card**: BHARGAV M / UNITY • XR • AR/VR • GAME DEVELOPMENT / thin divider / "Creating interactive worlds through immersive technology" / a glass pill, "EXPLORE PORTFOLIO →", with a hover ripple. Corner orbital arcs, dashed edge rails with dot markers, a 3-segment progress bar | Centred, calm | Cross-dissolve |

**Take:** the dark mission deck, the grid-split reveal, notched window frames, the terrain with its route draw-on, hangar framing, the staggered tile cluster, and the end card.
**Leave:** data panels full of meaningless percentages. Show real facts or nothing. Also leave the generic "LOG IN" button.

<!-- STORYBOARD:portfolio_6 -->

### 2.3 portfolio_6: "Digitisation & Energy Paths" (closest to the requested headset sequence)

| Time | Camera | On screen | Transition |
|---|---|---|---|
| 0.0–1.5 | Locked (motion 2.6) | Same hero key art; subtle portal energy | Hold |
| 1.5–2.2 | Slow push; **the ring rotates** | The ring's light segments shift to **amber + cyan**. Glass shards start peeling off the ring's left arc | Portal activation |
| 2.2–2.8 | Push | Shards burst outward and to the left. **The player's body turns into a glowing blue holographic wireframe/voxel mesh**, sweeping from the bottom up. The headset stays solid and lit (luminance peak 96) | **Digitisation** |
| 2.8–3.5 | **The camera passes through the player** | The voxel head breaks into cubes as the camera enters it, then emerges on the other side facing the player (front view). This is literally "the camera enters the headset" | Through-body pass |
| 3.5–4.5 | Slow pull-back | Front medium shot: the player in a hoodie and headset, holding **wireframe-glass controllers** that emit **cyan (left) and magenta (right) light ribbons**. Floating cubes, neon city | — |
| 4.5–5.2 | **Zoom burst** / radial blur | The city streaks. **The world folds**: city on the floor, a mirrored city upside-down on the ceiling | Fold |
| 5.2–6.0 | Fly forward through the fold | The **energy ribbons** snake through space and **hook into skill nodes**: a ringed glowing orb plus a bracketed label plate ("XR / VR / AR", "Game Design", …). Glass panels in the centre | Ribbon connect |
| 6.0–6.6 | Lateral glide with blur | Nodes slide past; project cases come into view | Glide |
| 6.6–8.0 | Settle + drift | **Three glass display cases** (thick transparent boxes with cyan edges) with content *inside*: VR Physics Learning (sandbox images + node diagram), Tirumala AR Navigation, and ISRO Launch Pad Simulation (a terrain diorama with the tower inside the case). Header tabs with bracket plates | Hold |
| 8.0–8.8 | **Vortex** | Tech logos (Unity, Blender, C#) spiral out of a vortex between the cases; a comet trail sweeps the foreground | Vortex |
| 8.8–9.3 | **Warp tunnel** | Star streaks, with logos flying past the camera | Warp |
| 9.3–10.0 | Settle | Same end card as p5. **Hovering the CTA draws a targeting reticle** (crosshair ring) to the left of the button | Settle |

**Take:** the whole entry sequence. The **energy ribbons** as the site's connective tissue (navigation, the ability tree, links between sections), glass display cases for missions, and the warp into Comms.
**Leave:** a realistic generated face. Keep the player as a silhouette, a back view or a stylised avatar, and never imply it's you unless it's your own photo or scan.

---

## 3. Synthesis: one consolidated direction

**Shared DNA across all three clips**

| Element | What all three agree on |
|---|---|
| Palette | Near-black navy space, electric blue→violet gradient headline, cyan focus light, magenta/amber accent lights |
| Material | Glass everywhere: frosted (p4), dark smoked (p5), thick transparent cases (p6). 1 px cool-white edges, inner top highlight |
| Props | Floating cubes (dark with violet edge-light, or frosted), sparse star dust, a ringed planet, a megacity with a light-beam spire |
| Hero layout | Copy column on the left (about 40%), key art on the right, nav along the top, "scroll to explore" bottom-left |
| Motion | Continuous camera, no cuts. Hold → move → settle. Peaks only at thresholds |
| Finale | Centred minimal name card, "EXPLORE PORTFOLIO →", orbital corner arcs, edge rails, segmented progress |

**Decisions this prompt makes**

1. **Dark first.** The base is the p5/p6 night palette. p4's daylight appears only (a) *through* the portal before entry and (b) as the frosted **Mission Briefing** reading mode, where long text needs calm and contrast.
2. **The entry sequence comes from p6** (ring spin-up → shatter → digitisation → camera through the headset), with **p5's portal-window brightening** before it and **p4's exposure bloom** at the moment of crossing.
3. **Missions:** p5's deck (grid split) → p6's glass cases → p5's per-project worlds (terrain, lab, hangar), linked by p4/p5 whip-pans and panel wipes.
4. **Ability Tree:** p6's ribbons and nodes laid out radially. p5's staggered tile cluster is the mobile fallback. p4's brand-tinted hover glow.
5. **Comms:** p6's warp → the p5/p6 end card, extended into a transmission terminal.
6. **Rhythm:** each beat holds about 0.8–1 s, moves for 1.5–2.5 s, then settles for about 1 s.

**Final flow**

```
BOOT → 01 WORLD ENTRY → PORTAL ACTIVATION → DIGITISATION (camera enters headset)
     → 02 NEXUS HUB (energy ribbons) → 03 MISSION DECK → MISSION WORLDS ×4
     → MISSION BRIEFING (frosted overlay) → SIDE QUESTS → 04 ABILITY TREE
     → 05 PLAYER LOG → WARP → 06 COMMS / END CARD
```

---

# PART B — THE MASTER PROMPT

<!-- PROMPT:START -->

> **BEGIN PROMPT**

## 4. Master prompt: BHARGAV M // NEXUS

### 4.1 Role and goal

You are a senior creative developer and game-UI designer: Unreal/Unity front-end sensibility, WebGL, and award-level motion. Evolve the existing Next.js portfolio of **Bhargav M** into **NEXUS**, a cinematic, playable-world portfolio. The visitor is a **PLAYER** entering Bhargav's universe: they activate a portal, get digitised through a VR headset, arrive in a hub linked by energy ribbons, pick **missions** (projects), read **mission briefings**, explore an **ability tree** (skills) and a **player log** (journey), and finally **establish contact**.

It should feel like a premium AAA sci-fi game menu wrapped around an immersive XR developer portfolio: a player entering Bhargav's digital universe rather than a recruiter reading a resume. Every professional claim must stay grounded in the content data in §4.9.

### 4.2 Non-negotiables

- **No hard cuts.** Every scene change is in-camera: dolly, whip-pan, panel wipe, grid split, morph, fold or warp.
- **Beat rhythm:** hold ~0.8–1 s → move 1.5–2.5 s → settle ~1 s. Big motion only at thresholds (portal, digitisation, warp).
- **Dark first.** Near-black navy space. Daylight appears only *through* the portal and in the frosted Mission Briefing.
- **Game UI, not a template.** No generic cards, generic gradients, corporate navbar, stock-business visuals, bouncing, random glitching or neon flashing.
- **All content lives in the DOM.** The canvas is decoration and navigation sugar; every fact, link and action also exists as semantic HTML.
- **Real facts only.** Take copy and stacks from §4.9, never from the reference videos, whose text is AI-garbled. Anything marked [VERIFY] ships only once confirmed.
- **Accessible and fast.** Reduced-motion, keyboard and mobile paths are first-class (§4.12–4.13).

### 4.3 World concept

A persistent sci-fi universe called **NEXUS**. Sections are game spaces:

| # | HUD label | Game space | Portfolio meaning |
|---|---|---|---|
| 01 | WORLD | World Entry, the portal platform | Hero / identity |
| 02 | NEXUS | Hub with energy ribbons and nodes | Overview / quick nav |
| 03 | MISSIONS | Mission Deck → Mission Worlds → Briefings; Side Quests drawer | Projects |
| 04 | ABILITIES | Ability Tree | Skills and tools |
| 05 | PLAYER LOG | Quest log timeline | Education, experience, awards |
| 06 | COMMS | Transmission terminal + end card | Contact |
| ↗ | GITHUB | External link | github.com/bhargavm-iiits |

### 4.4 Visual system

**Colour tokens** (sampled from the reference videos and tuned for contrast; they replace the current `--bg-void`, `--blue` and similar tokens in `globals.css`):

```css
:root {
  /* space */
  --void:        #020A1C;  /* page base, fog */
  --space:       #050D25;
  --navy:        #0D1434;
  --navy-2:      #18234D;
  --dusk:        #2F427C;
  --atmos:       #4667AC;  /* atmospheric haze, clouds lit from the portal */
  --sky:         #7CA3D6;  /* daylight through the portal */
  /* accents */
  --cyan:        #5CE1FF;  /* focus, edges, wireframe, left ribbon */
  --blue:        #54A8E6;  /* headline gradient start */
  --indigo:      #4478E3;  /* primary pill */
  --violet:      #6458EC;  /* headline gradient end */
  --violet-2:    #845EF5;  /* CTA gradient end */
  --magenta:     #D96BFF;  /* right ribbon, portal light bars */
  --amber:       #FFB547;  /* route lines, ring lights after activation, warnings */
  --holo:        #3944C6;  /* digitised-body glow */
  /* frosted briefing mode */
  --frost:       #E8EEF6;
  --frost-2:     #C8CFDB;
  --slate:       #848D9E;
  --ink:         #161C22;
  /* text */
  --text:        #F5F8FF;
  --text-2:      #A9B6CC;
  --text-3:      #6B7A93;
  /* gradients */
  --grad-headline: linear-gradient(90deg, var(--blue) 0%, var(--violet) 100%);
  --grad-cta:      linear-gradient(90deg, var(--indigo) 0%, var(--violet-2) 100%);
}
```

Use accents sparingly. Cyan is for focus and structure, magenta and amber are for energy and events, and the violet gradient is reserved for the hero word and the primary CTA.

**Typography**

| Role | Font | Use |
|---|---|---|
| Display | **Orbitron 800** (alt: Michroma) | *Only* the two hero words and mission codes. Wide, geometric, tracked 0.02em |
| Headings / HUD labels | **Rajdhani 600/700** (alt: Chakra Petch, whose chamfered letters suit notched frames) | Section titles, mission titles, nav, buttons, uppercase labels tracked 0.12–0.4em |
| Body | **Inter 400/500** | Paragraphs, briefing text. 16–18 px, line-height 1.6 |
| Data / terminal | **JetBrains Mono 500** (already loaded) | Codes (`MISSION // 001`), tech chips, status lines, coordinates |

Fluid sizes: hero word `clamp(3.25rem, 8.5vw, 8rem)`; section title `clamp(2rem, 4.5vw, 4rem)`; eyebrow `0.75–0.85rem`, tracked 0.4em.

**Materials**

- **Dark glass (default):** `background: rgba(12,20,40,.55); backdrop-filter: blur(18px) saturate(140%); border: 1px solid rgba(160,200,255,.18); box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 20px 60px rgba(0,0,0,.45);`
- **Focus/active edge:** `0 0 0 1px rgba(92,225,255,.6), 0 0 24px rgba(92,225,255,.25)`, plus cyan corner ticks.
- **Frosted glass (Briefing only):** `background: rgba(232,238,246,.66); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,.7); color: var(--ink); box-shadow: 0 30px 80px rgba(20,30,60,.28);`, radius 20 px.
- **HUD frame:** 6 px radius plus **chamfered corners** via `clip-path` (14 px cut top-left and bottom-right). Window frames get a **notched tab header** (from p5's "WebGL" window).
- **Glass display case (3D):** a thick transparent box (drei `MeshTransmissionMaterial`, thickness 0.6, roughness 0.08, chromaticAberration 0.02) with emissive cyan edge lines and a diorama inside.
- **Callout:** a translucent label bar with corner brackets and a 1 px leader line to an anchor dot on a 3D object (from p4's ISRO shot).

**Recurring props:** floating cubes (instanced; dark with violet edge-light in night scenes, frosted in briefing backdrops), sparse white star dust drifting slowly, a ringed planet, a megacity with a vertical light-beam spire, volumetric fog, a floor grid in the worlds, orbital arcs in the screen corners, and dashed vertical rails with dot markers at the screen edges.

**HUD chrome**

- **Top nav:** hex emblem "BM" + `// NEXUS` on the left. Links WORLD · MISSIONS · ABILITIES · PLAYER LOG · COMMS · GITHUB ↗. The active link gets a **short cyan underline bar**. On the right: a SOUND toggle (off by default), SKIP INTRO (during entry only), and a gradient pill **ESTABLISH CONTACT**.
- **Section indicator:** bottom-left `01 / WORLD ENTRY` in mono. Bottom-centre: a segmented progress bar (one segment per section; the active segment is white and longer).
- **Side rail:** a dashed vertical line at the left edge with one dot per section. The active dot glows cyan. It's clickable and keyboard-focusable.
- **Cursor (pointer devices only):** a small ring plus a dot. Over buttons it becomes a **targeting reticle** (crosshair ring) that locks onto the element. Over 3D objects, **corner brackets snap** around the object. Hidden on touch and under reduced motion.

### 4.5 Scene-by-scene specification

Each scene has a scroll-scrubbed timeline. The entry sequence can also **play on click**. Both drive one shared GSAP master timeline.

#### S0 — BOOT (≤ 1.2 s, tied to real readiness)

Mono status lines on `--void`: `NEXUS OS v2 // INITIALISING`, `RENDERER ... OK`, `WORLD DATA ... OK`, `SYS.ONLINE`. The loader resolves when fonts, the hero poster and the R3F `onCreated` callback are all ready (minimum 600 ms, maximum 2.5 s, then it falls back to the static hero). Skipped entirely under reduced motion and on repeat visits in the same session.

#### S1 — 01 WORLD ENTRY (100 vh, sticky)

- **Key art:** the supplied VR hero artwork, split into depth layers (sky + planet, far city + spire beam, cloud sea, platform, player silhouette with alpha, foreground cubes). The **portal ring is real 3D**: 24 instanced segments with alternating magenta and cyan emissive light bars, rotating slowly. Floating cubes are instanced 3D with violet edge-light. Mouse parallax is ±1.5° camera yaw and ±1° pitch, with foreground layers moving more.
- **Ambient life:** cloud drift, portal energy shimmer, twinkling city lights, the light-beam spire pulsing on a 4 s sine cycle, dust particles, a slow holographic scan line crossing the ring every 6 s.
- **Copy (left column, ~40% width):**
  - Eyebrow: `BHARGAV M` (Rajdhani, tracked 0.4em)
  - Line 1: `I BUILD` (small, tracked caps)
  - Hero word 1: **`PLAYABLE`** (Orbitron 800, `--grad-headline`)
  - Hero word 2: **`WORLDS.`** (Orbitron 800, white)
  - Tagline: `UNITY • AR/VR • XR • AI ENGINEERING` (violet caps)
  - Support: "Blending real and virtual worlds through interactive experiences, intelligent systems and immersive gameplay."
  - Capability row: 4 line icons with vertical dividers: `UNITY / C#` · `AR FOUNDATION` · `XR SYSTEMS` · `3D / SIMULATION`
  - CTAs: primary gradient pill **`ENTER THE NEXUS →`**; ghost pill **`VIEW MISSIONS →`**, which skips the sequence and goes straight to S4
- **Bottom HUD:** `01 / WORLD ENTRY` · `SCROLL TO EXPLORE ↓` with a mouse icon, inside an angled HUD plate (bottom-left).
- The copy column sits on a plane *in* the scene so it recedes with the camera during entry (p4 behaviour). Duplicate it in the DOM for accessibility; the DOM copy is what's visible when WebGL is off.

#### S2 — ENTRY SEQUENCE: "the camera enters the headset" (300 vh scrub, or 4.6 s click-play)

| t (click-play) | Beat | Spec |
|---|---|---|
| 0.00–0.25 | **Lock-on** | The CTA reticle locks; a mono HUD line types `LINK ESTABLISHING…`; ambient sound starts rising if enabled |
| 0.25–1.05 | **Portal spin-up** (p6) | Ring rotation speeds up 1× → 6× (ease `power2.in`). Light segments re-light in sequence (40 ms stagger) and shift magenta → **amber + cyan**. The view *through* the ring brightens to daylight (p5): exposure inside the ring mask goes from 0.6 to 1.4 |
| 0.90–1.50 | **UI retract** | The hero copy plane recedes and slides left (x −8%, blur 0 → 6 px, opacity → 0). Nav chrome fades to 30% |
| 1.10–1.80 | **Shatter** (p6) | ~120 instanced glass shards peel off the ring's left arc and scatter outward and left with spin (`power2.out`); refraction on the shards |
| 1.40–2.20 | **Digitise** (p6) | The player layer dissolves **bottom → top** into a glowing `--holo` wireframe/voxel grid (shader: noise + grid quantise + scanline). The headset stays solid and emissive cyan |
| 2.10–2.90 | **Push-through** (p6 + p4) | Dolly into the headset. FOV 40° → 75°, radial blur up to 0.35, **one** exposure bloom peak (+0.8 EV for 250 ms). The voxel head breaks into cubes around the camera |
| 2.90–3.30 | **Emerge** | A soft cyan-white veil (not a strobe) fades out and reveals the Nexus Hub from the front: an avatar (stylised or silhouette, no realistic face) holding wireframe-glass controllers |
| 3.30–4.50 | **Ribbons fire** (p6) | The left controller emits a **cyan** ribbon and the right a **magenta** ribbon. They draw along Catmull-Rom curves (1.2 s) and hook into the hub nodes (stagger 120 ms) |
| 4.50–4.60 | **HUD online** | Nav brackets draw in; the indicator reads `02 / NEXUS`; input is released |

- **SKIP INTRO** (top-right, and Esc) jumps straight to the end state. The sequence can replay from the end card.
- **Scroll-scrub equivalent:** the same timeline mapped to 300 vh with `scrub: 1`.
- **Reduced motion:** a 400 ms cross-fade from hero to hub. No shatter, voxel effect, blur or bloom; ribbons appear static.
- **Mobile:** a pre-rendered 5 s clip of this sequence (H.264 + VP9, ≤ 2.5 MB, 720p, poster frame) plays on tap. Otherwise it's a 3-layer parallax + cross-fade.

#### S3 — 02 NEXUS HUB (150 vh)

- **World fold** (p6): the city lies on the floor, with a mirrored city upside-down on the ceiling (a group with `scale.y = −1`) and fog between them, so the camera flies through a canyon of light.
- **Energy ribbons** (tube geometry with a flowing-pulse shader, cyan and magenta) snake through the fold and connect **six hub nodes**. Each node is a ringed glowing orb plus a bracketed label plate: `MISSIONS` · `ABILITIES` · `PLAYER LOG` · `COMMS` · `XR / AR / VR` · `GAME DESIGN`.
- Nodes are real links (`<a>` in a DOM overlay positioned from 3D). Hover or focus sends a pulse along the ribbon to that node and shows a one-line preview. Click flies the camera there.
- This hub doubles as a **visual sitemap**. Returning players can use it instead of scrolling.

#### S4 — 03 MISSION DECK (150 vh)

- Title: **`SELECT YOUR NEXT MISSION`**. Subtitle: `REAL PROJECTS. TANGIBLE IMPACT.`
- A 2×2 deck of **dark HUD mission cards** (chamfered corners, notched headers). Each card has a mission code, title, type, a one-line objective, stack chips, a 3D-object thumbnail (a live mini-diorama or a looping WebM) and `VIEW BRIEF →`.
- **Grid-split reveal** (p5): as the deck scrolls in, the top row lifts and the bottom row drops to open a gap where the **selected mission's glass display case** (p6) rises into view. Keyboard ← → and 1–4 cycle missions; Enter opens the briefing.
- Below the deck, a slim **SIDE QUESTS** drawer (collapsed by default): AI/ML and web projects as small glass tiles with a filter (AI/ML · WEB · ALL).

#### S5 — MISSION WORLDS (4 × 150 vh)

Each main mission gets its own diorama world. Move between worlds with a **whip-pan** (0.5 s, `expo.inOut`, directional motion blur, subtle chromatic aberration only during the whip) or a **panel wipe** (p4).

| Mission | World (diorama) | Signature animation |
|---|---|---|
| **M01 Tirumala AR Navigation** | A terrain block with a cyan wireframe contour mesh over shaded relief, a floor grid, floating glass header "MISSION // 001", and HUD side cards: `MODE: OFFLINE`, `LOCALISATION: VIO + GPS (KALMAN) + COMPASS + LANDMARKS`, `ROUTING: A*` | An **amber route draws on** (1.4 s) from a start ring at Alipiri to a pin at the summit. The **1.17 km interpolated connector** renders as a *dashed* amber segment with an `INTERPOLATED — FLAGGED` callout, true to the project. POI nodes pop along the route. AR arrow chevrons slide along the path |
| **M02 Game-Based Physics Learning** | A holographic **physics lab**: a notched "SIMULATION" window, a circular emissive pedestal, and a cube moving along a straight track with a velocity-vector arrow and live readouts `v`, `s`, `t` | Five **level pads** light up in sequence, one per Unity project in the suite (Teaching-and-Learning, Motion-in-Straight-Line, Velocity—Interactive, Interactive-Speed, Unity-Linear-Motion). Hovering a pad runs that level's motion. This renders the currently unused `project.group` data |
| **M03 VR Cinema Platform** | An **observatory / VR cinema**: a dome with a giant curved screen, a sphere-mapped 360° preview, and a floating headset | A mode switch, `360° MONO` ↔ `SBS 3D`, morphs the screen. A security HUD pulses lock icons `ARGON2 · JWT · AES · RATE-LIMIT`. `LAUNCH DEMO` links to the live site |
| **M04 ISRO Launch Pad Simulation [VERIFY]** | A **hangar** with ceiling light strips, and a rocket on a launch pad inside a wide curved glass frame with a circular HUD pedestal (p5) | HUD callouts with leader lines (p4): `BLENDER • UNREAL ENGINE • 3D SIMULATION`. The service tower arms retract on scroll |

Each world ends with a settle beat and a **`VIEW BRIEF →`** callout anchored to the diorama.

#### S6 — MISSION BRIEFING (overlay, not a modal box)

- Opens from any `VIEW BRIEF →`. The world behind stays live but blurs and dims (to 40%). A **full-screen frosted-glass sheet** slides up (0.7 s, `power3.out`). This is the only light surface on the site, and it exists for readability (p4).
- Layout: a mono code line `MISSION // 001`; the title in Rajdhani 700; type chips; a media carousel with pagination (active pill + dots) and **HUD callouts pinned to media**; a right-side scroll rail.
- Fields: **OBJECTIVE · SYSTEM · CORE MECHANIC · CHALLENGE · RESULT** (content in §4.9).
- Actions: `LAUNCH DEMO` (only if a live URL exists) · `VIEW SOURCE` · `BACK TO NEXUS` (also Esc).
- Accessibility: `role="dialog"` + `aria-modal`, focus moves to the title, Tab is trapped, focus returns to the trigger, `inert` is set on the page behind, and the URL hash updates (`#mission-tirumala`) so briefs are deep-linkable.

#### S7 — 04 ABILITY TREE (200 vh)

- Title: **`ABILITY TREE`**. Subtitle: `TOOLS. TECHNOLOGIES. SUPERPOWERS.`
- A **radial skill graph** drawn with p6's energy ribbons. The core node is **UNITY**. The inner ring is XR: C#, AR FOUNDATION / ARCORE, UNREAL ENGINE, BLENDER, XR INTERACTION TOOLKIT [VERIFY]. The outer ring is WEB 3D (THREE.JS / R3F) and BACKEND (PYTHON, FASTAPI, DOCKER). A separate **AI constellation** (PYTORCH · ViT · RAG · LoRA) links in through PYTHON.
- Nodes are ringed orbs with bracket labels. **Hover or focus** lights the node, sends pulses to its neighbours, dims the rest to 25%, and opens a tooltip plate with a one-line explanation and **"USED IN →" mission chips** as evidence.
- **No percentage bars or fake skill levels.** Evidence replaces numbers.
- Tile hover (p4): each tool tile's edge glows in *that tool's brand colour* (Blender orange, Unity white, C# purple).
- Mobile / reduced-motion fallback: p5's **staggered 3-column tile cluster** (centre column offset down half a tile), with tap-to-expand tooltips.

#### S8 — 05 PLAYER LOG (200 vh)

- Title: **`PLAYER LOG`**. Subtitle: `JOURNEY • MILESTONES • WHAT'S NEXT`.
- A vertical **quest log**. The spine is a ribbon that fills as you scroll. Each entry is a chamfered HUD plate with a chapter code (`LOG 01`…), organisation, role, dates and 1–2 bullets (§4.9). Achievements get an **amber "ACHIEVEMENT UNLOCKED"** plate. It animates once, with no flashing.
- The final entry, **NEXT OBJECTIVE**, is an open slot: "Graduating 2027 — open to Unity / XR roles", with a pulsing cyan outline.

#### S9 — WARP → 06 COMMS (150 vh + static content)

- **Warp** (p6): 1.0 s of star streaks (instanced lines stretched along the view axis), with engine logos flying past. It decelerates into the quietest, darkest frame on the site.
- **Comms terminal:** heading **`ESTABLISH CONTACT`**, support line `IDEAS → EXPERIENCES → REAL IMPACT`.
  - Channels: Email `bhargav.m23@iiits.in` · LinkedIn `linkedin.com/in/bhargav-ai` · GitHub `github.com/bhargavm-iiits` · Portfolio `e-portfolio-xi-bay.vercel.app`
  - Form fields: `CALLSIGN` (name), `RETURN FREQUENCY` (email), `TRANSMISSION` (message). Button **`TRANSMIT`**.
  - **Transmission effect:** on submit, the message text compresses into a beam and shoots up to a satellite dot. Status lines map to *real* Firestore states: `ENCRYPTING…` (validating) → `UPLINK…` (request pending) → `TRANSMISSION RECEIVED` (success) or `SIGNAL LOST — RETRY` (error). Status is announced via `aria-live="polite"`.
- **End card** (p5/p6), last on the page: `BHARGAV M` / `UNITY • XR • AR/VR • GAME DEVELOPMENT` / divider / "Creating interactive worlds through immersive technology" / glass pill **`REPLAY ENTRY ↺`** (reticle hover). Corner orbital arcs, edge rails and the segmented progress bar complete the frame.

### 4.6 Scroll and camera map (desktop)

| Scene | Scroll length | Camera (world units) | Key tweens | Ease |
|---|---|---|---|---|
| S1 World Entry | 100 vh sticky | (0, 0.2, 18), look-at portal | Parallax, idle loops | `sine.inOut` |
| S2 Entry | 300 vh or click | (0, 0.2, 18) → through ring (9, 0, −13) → headset | Spin-up, shatter, digitise, push, emerge | `expo.inOut` (camera), `power2.out` (FX) |
| S3 Hub | 150 vh | Inside the fold, (0, 0, −30) → (0, 0.5, −48) | Ribbon draw, node pop | `power3.out` |
| S4 Deck | 150 vh | Locked, slight push | Grid split, case rise | `power3.inOut` |
| S5 Worlds | 4 × 150 vh | Orbit ~25° per world + push; whip between worlds | Route draw, lab levels, screen morph, tower arms | `expo.inOut` (whip, 0.5 s) |
| S7 Ability Tree | 200 vh | Top-down tilt 35° over the graph | Pulses, dim, tooltip | `power2.out` |
| S8 Player Log | 200 vh | Canvas becomes a slow backdrop drift | Spine fill, plate reveal | `power3.out` |
| S9 Warp → Comms | 150 vh | Forward warp, then stop | Streak stretch, decelerate | `expo.out` |

**Motion tokens:** hover 180–240 ms · UI in 600 ms `power3.out` · UI out 350 ms `power2.in` · camera beats 1.6–2.4 s `expo.inOut` · hold 0.8–1.0 s · whip 0.5 s · idle loops 4–8 s `sine.inOut`. Text reveals: line-by-line masks (GSAP SplitText) with a 60 ms stagger. No per-letter scramble.

### 4.7 Components to build

| Component | Kind | Notes |
|---|---|---|
| `BootSequence` | UI | Real readiness; skippable; session-once |
| `HudNav`, `SideRail`, `SectionIndicator`, `SegmentedProgress` | UI | One source of section truth (IntersectionObserver with `rootMargin: "-50% 0px -50% 0px"`) |
| `Reticle` | UI | Pointer-only; bracket snap on 3D targets via raycast |
| `PortalRing` | 3D | Instanced segments; per-instance emissive colour; spin-up uniform |
| `KeyArtLayers` | 3D | Textured planes at depth; alpha player layer with a `digitize` shader |
| `ShardBurst` | 3D | InstancedMesh ~120; transmission-lite material |
| `EnergyRibbon` | 3D | `CatmullRomCurve3` → `TubeGeometry`; shader uniforms `uProgress`, `uPulse`, `uColor` |
| `HubNode` + `NodeLabel` | 3D + DOM | Ringed orb; DOM label via drei `Html` (occlude) |
| `FoldedCity` | 3D | Instanced towers, mirrored on the ceiling; fog |
| `MissionCard`, `MissionDeck`, `SideQuests` | UI | Data-driven from `missions[]` / `sideQuests[]` |
| `GlassCase` | 3D | `MeshTransmissionMaterial` box + edge lines; slot for a diorama |
| `TerrainWorld`, `PhysicsLab`, `CinemaDome`, `LaunchHangar` | 3D | One per mission; lazy-loaded chunks |
| `Callout` | 3D + DOM | Bracketed label + leader line to an anchor |
| `MissionBriefing` | UI | Frosted overlay, carousel, focus trap, hash routing |
| `AbilityTree` + `AbilityTiles` (fallback) | 3D/SVG + UI | Graph from `abilities[]` with `edges[]` |
| `PlayerLog` | UI | From `log[]` |
| `WarpField` | 3D | Instanced streaks |
| `CommsTerminal`, `EndCard` | UI | Firestore submit; honeypot; App Check |
| `SoundManager` | Lib | Off by default; ambient pad + riser (0–3 s swell), whoosh on whips, soft ticks on hover |

### 4.8 Technology and implementation (evolve the existing repo)

**Stack (already in `package.json`):** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · three 0.185 · @react-three/fiber 9 · @react-three/drei 10 (installed, now actually used: `MeshTransmissionMaterial`, `Html`, `Instances`, `useGLTF`, `AdaptiveDpr`) · @react-three/postprocessing 3 (Bloom with mipmapBlur, Vignette, Noise 0.03, ChromaticAberration only during whips) · GSAP 3 + ScrollTrigger (+ SplitText) · Lenis · Firebase 12 (Firestore + App Check) · Vercel.

**Repo mapping**

| Existing | Becomes |
|---|---|
| `components/three/Environment.tsx` (portal torus, city, moon, debris) | `PortalRing` (segmented), `FoldedCity`, planet; debris → a single `InstancedMesh`, motion scaled by `dt` |
| `components/three/VRFigure.tsx` | `KeyArtLayers` player layer + `digitize` shader, or a glTF avatar |
| `components/three/ProjectCubes.tsx` | `GlassCase` + mission dioramas |
| `sections/Hero.tsx` | S1 World Entry |
| `sections/FeaturedProjects.tsx` + `ProjectGrid.tsx` | S4 Mission Deck + Side Quests |
| `sections/Skills.tsx` | S7 Ability Tree (remove percentages) |
| `sections/Education.tsx` + `Experience.tsx` + `Achievement.tsx` | S8 Player Log |
| `sections/Contact.tsx` | S9 Comms terminal |
| `ui/NavRail.tsx` | `HudNav` + `SideRail` (fix order and observer) |
| `ui/ProjectModal.tsx` | `MissionBriefing` (focus trap, inert, hash) |
| `ui/Loader.tsx` | `BootSequence` (real readiness) |
| `ui/Cursor.tsx` | `Reticle` |
| `lib/useSmoothScroll.ts` + `lib/cameraRig.ts` | One paused **master timeline** with labels (`entry`, `hub`, `deck`, `m01`…). ScrollTrigger scrubs it; buttons call `tl.tweenTo(label)`. Camera damping via `THREE.MathUtils.damp` |
| `data/portfolio.ts` | Typed `missions`, `sideQuests`, `abilities` + `edges`, `log`, `comms` (see §4.9) |

**Content model (TypeScript)**

```ts
type MissionType = "AR / NAVIGATION" | "UNITY / GAME-BASED LEARNING" | "VR / IMMERSIVE MEDIA" | "3D / SIMULATION";
interface Mission {
  code: string;            // "001"
  slug: string;            // "tirumala"
  title: string;
  type: MissionType;
  objective: string; system: string[]; coreMechanic: string; challenge: string; result: string;
  world: "terrain" | "lab" | "cinema" | "hangar";
  media: { src: string; alt: string; callouts?: { x: number; y: number; label: string }[] }[];
  source?: string; live?: string; related?: string[]; verify?: boolean;
}
interface AbilityNode { id: string; label: string; ring: 0 | 1 | 2 | "ai"; blurb: string; usedIn: string[]; brandColor?: string; verify?: boolean; }
interface LogEntry { code: string; org: string; role: string; period: string; bullets: string[]; kind: "education" | "work" | "achievement" | "next"; }
```

**Assets**

- Key art: export at 2560×1440, split into 6–7 layers (AVIF/WebP, alpha where needed), plus a depth map for subtle 2.5D displacement. Serve a single flattened AVIF as the LCP poster.
- Replace every AI mock-up with **real footage**: Unity screen captures of AR Navigation and the physics scenes, a recording of the VR Cinema demo, Blender/Unreal renders for ISRO. Loop as muted WebM/MP4, ≤ 1.5 MB each, poster first.
- 3D: glTF + Draco/Meshopt, textures as KTX2. Keep the portal, shards, ribbons and warp procedural.

### 4.9 Content (the single source of truth)

**Identity**

- Name: **BHARGAV M**
- Primary identity: `UNITY • AR/VR • XR • GAME DEVELOPMENT`
- Supporting identity: `AI • 3D • INTERACTIVE SYSTEMS`
- Education: B.Tech Artificial Intelligence & Data Science, IIIT Sri City, 2023 – present (graduating 2027)
- Links: bhargav.m23@iiits.in · linkedin.com/in/bhargav-ai · github.com/bhargavm-iiits · e-portfolio-xi-bay.vercel.app

**MISSION // 001 — TIRUMALA AR NAVIGATION** · `AR / NAVIGATION`

- OBJECTIVE: Offline augmented-reality guidance for pilgrims on the Alipiri steps route to Tirumala.
- SYSTEM: Unity 6 · AR Foundation 6.5 · ARCore · URP · C# · A* pathfinding
- CORE MECHANIC: Hybrid localisation fuses ARCore visual-inertial odometry, Kalman-filtered GPS, route snapping, compass correction and landmark image recognition into a single correctable yaw + translation transform. A* routing generates turn instructions. AR arrows are overlaid on the camera view, with voice guidance.
- CHALLENGE: Works with no internet after setup; 1.17 km of the route is missing from OpenStreetMap.
- RESULT: The gap is bridged with a flagged, amber-highlighted interpolated connector, and landmark recognition supports POI discovery along the route.
- SOURCE: github.com/bhargavm-iiits/AR-Navigation · RELATED: Navigation-AR-pages (the route split into individually loadable AR waypoint scenes)

**MISSION // 002 — GAME-BASED PHYSICS LEARNING** · `UNITY / GAME-BASED LEARNING` (add "VR" only if [VERIFY] passes)

- OBJECTIVE: Teach straight-line kinematics through play instead of formulas.
- SYSTEM: Unity · C# · game design
- CORE MECHANIC: Interactive scenes let learners manipulate velocity, displacement and time to build physical intuition.
- STRUCTURE: A suite of five Unity projects: Teaching-and-Learning, Motion-in-Straight-Line, Velocity—Interactive, Interactive-Speed, Unity-Linear-Motion.
- SOURCE: github.com/bhargavm-iiits/Teaching-and-Learning (+ the four related repos)

**MISSION // 003 — VR CINEMA PLATFORM** · `VR / IMMERSIVE MEDIA`

- OBJECTIVE: A secure, immersive VR cinema for streamed media.
- SYSTEM: React Three Fiber · Three.js · Python / Gradio · JWT · AES · Argon2 · Docker Compose
- CORE MECHANIC: 360° spherical video playback and stereoscopic side-by-side 3D.
- CHALLENGE: Protecting content end to end: Argon2 password hashing, JWT auth, AES-encrypted metadata and streams, and rate limiting against brute force.
- RESULT: A live demo, a Docker Compose deployment and a dual test suite (pytest backend, npm test frontend).
- LIVE: vr-demo-cymax.vercel.app · SOURCE: github.com/bhargavm-iiits/VR_Demo_Cymax
- CONTEXT: related to the CYMAX internship (secure VR media platform; see the Player Log).

**MISSION // 004 — ISRO LAUNCH PAD SIMULATION** · `3D / SIMULATION` · **[VERIFY: scope, your role, shareable visuals]**

- SYSTEM: Blender · Unreal Engine · 3D simulation
- CONTEXT: Built during the IIIT Sri City summer internship (ISRO project line).
- Fill in OBJECTIVE / CORE MECHANIC / CHALLENGE / RESULT from your own notes before publishing.

**SIDE QUESTS** (AI/ML and web)

- OpthaMiss: AI tele-ophthalmology (React · PyTorch · ViT · FastAPI; AUC-ROC 0.98, ~92% sensitivity) · live: optha-miss-v1.vercel.app
- Vox-Align: multimodal emotional desktop agent (Gemini RAG · ChromaDB · BERT · Python; PyInstaller build)
- Privacy-Preserving-RAG: privacy-bounded Gen-AI retrieval with anonymisation (Python · LLMs · RAG)
- Hate-Speech-Detection: multimodal abuse filter (CLIP · LoRA · EasyOCR)
- AI-Plant-Disease-Detection: 13-class classifier (PyTorch · MobileNetV2 · Flask)
- Jarvis: voice assistant (Python · SpeechRecognition · pyttsx3)
- E-Portfolio: this site (Next.js · React Three Fiber · TypeScript)

**ABILITY TREE** (node → one-line blurb → used in)

| Node | Ring | Blurb | Used in |
|---|---|---|---|
| UNITY | core | Unity 6 + URP for AR and learning experiences | M01, M02 |
| C# | 1 | Gameplay, systems and AR logic | M01, M02 |
| AR FOUNDATION / ARCORE | 1 | AR Foundation 6.5, ARCore visual-inertial odometry | M01 |
| UNREAL ENGINE | 1 | 3D content and simulation | M04, internship |
| BLENDER | 1 | Modelling and scene building for simulations | M04, internship |
| XR INTERACTION TOOLKIT **[VERIFY]** | 1 | Headset/controller interaction | — |
| THREE.JS / R3F | 2 | Web-based 360° and stereoscopic playback; this portfolio | M03, E-Portfolio |
| PYTHON | 2 | Backends and ML | M03, side quests |
| FASTAPI | 2 | Model-serving APIs | OpthaMiss |
| DOCKER | 2 | Docker Compose deployment | M03 |
| PYTORCH · ViT · RAG · LoRA | AI | Vision Transformers, RAG agents, LoRA fine-tuning | Side quests, IDEAVERSE |

**PLAYER LOG**

1. `LOG 01` · **IIIT SRI CITY**: B.Tech Artificial Intelligence & Data Science · 2023 – present
2. `LOG 02` · **CYMAX**: AR/VR Developer Intern · Hyderabad · Jan 2026 – present. Developing a secure VR media platform with a web-based controller interface, one-to-one device pairing, user authentication and subscription-based access; building an encrypted VR video player with secure streaming, runtime decryption and DRM-based protection.
3. `LOG 03` · **IIIT SRI CITY: XR & SIMULATION**: Summer Intern · May – Jul 2026. Worked across the Teaching-and-Learning, AR-Navigation and ISRO project lines; built and iterated 3D content and simulations in Unity, Blender and Unreal Engine.
4. `ACHIEVEMENT` · **IDEAVERSE 2026: TOP 8 / 150+ TEAMS**. MISS-EyeScreen, an AI tele-ophthalmology system (ViT · PyTorch · FastAPI · React; AUC-ROC up to 0.98, sensitivity ~92%).
5. `NEXT OBJECTIVE` · Graduating 2027, open to Unity / XR roles.

### 4.10 Motion do's and don'ts

**Do:** slow cinematic camera moves, layered parallax, scroll-linked choreography, holographic interfaces powering up, energy pulses along ribbons, particle drift, depth-based movement, hover illumination, cursor-reactive brackets, one exposure bloom at the portal, motion blur only during whips.

**Don't:** bounce or elastic easing, generic fade-up-on-scroll for every element, random or fast glitch effects, strobing or neon flashing, more than one flash in any 3-second window, constant chromatic aberration, per-letter text scrambles.

### 4.11 Responsive behaviour

| Breakpoint | Experience |
|---|---|
| **Desktop ≥ 1200 px** | Full cinematic: all 3D scenes, postprocessing, reticle cursor, 300 vh entry scrub or click-play |
| **Tablet 768–1199 px** | Simplified 3D: no shards, fewer instances (towers 50%, particles 40%), no chromatic aberration, bloom at half resolution; Ability Tree as a 2D SVG radial graph |
| **Mobile < 768 px** | HUD identity kept; heavy 3D replaced by optimised layers. Hero = parallax layers + CSS ring glow; entry = pre-rendered clip on tap; worlds = looping WebM + DOM callouts; Ability Tree = staggered tile cluster; nav = a compact **`≡ NEXUS`** HUD button opening a full-screen list menu with section codes. Never cluttered: one focal element per viewport |

### 4.12 Accessibility (must pass)

- Semantic landmarks, one `<h1>` (the hero), logical `h2`/`h3` order, and a skip link to `#missions`.
- Every interactive element is reachable by keyboard, with visible focus: a 2 px `--cyan` outline plus corner ticks.
- `prefers-reduced-motion`: no scrubbed camera, shatter, voxel, bloom, blur or warp; cross-fades of 400 ms or less; ribbons static. Also provide a manual **"Reduce motion"** toggle in the HUD.
- Contrast: body text ≥ 4.5:1 and HUD labels ≥ 3:1 at their size. On frosted glass, text is `--ink`.
- Photosensitivity: no content flashes more than 3 times per second (WCAG 2.3.1). The portal bloom is a single soft rise and fall.
- Canvas content is mirrored in the DOM. The canvas is `aria-hidden`; 3D nodes are backed by real `<a>`/`<button>` elements.
- Briefing: dialog semantics, focus trap, Esc to close, focus restore, `inert` background.
- Form: labelled inputs, `aria-live` status, error text tied via `aria-describedby`, `maxLength` limits, a honeypot, and App Check.
- Sound is off by default and never autoplays.

### 4.13 Performance budgets

- **LCP ≤ 2.5 s** (4G, mid-range phone): the hero poster is AVIF with the hero copy in HTML; the 3D chunk loads after first paint (dynamic import, `ssr: false`).
- **Frame rate:** 60 fps on a mid-range desktop GPU; ≥ 30 fps for the tablet scene. `AdaptiveDpr`, with DPR clamped to [1, 1.75] on desktop and [1, 1.25] on tablet.
- **≤ 150 draw calls.** Instancing for cubes, shards, towers, particles and warp streaks.
- **3D payload** ≤ 6 MB on desktop, ≤ 2 MB on mobile. Mission worlds lazy-load when their scene comes within one viewport.
- Pause rendering when the canvas is off-screen or the tab is hidden (`frameloop="demand"` or invalidate on scroll).
- No render-blocking icon CDN. Use tree-shaken SVG icons (e.g., lucide-react).

### 4.14 Acceptance criteria

1. Clicking **ENTER THE NEXUS** plays the 4.6 s entry (spin-up → shatter → digitise → through-headset → ribbons) with no hard cut. Skip and Esc work; scroll-scrub gives the same result.
2. All four missions render their worlds with the signature animation from §4.5 S5, and M01 shows the dashed "INTERPOLATED" connector.
3. Every mission briefing is reachable by keyboard and by URL hash, traps focus and restores it on close.
4. The Ability Tree shows no percentages; every node shows "USED IN" evidence; [VERIFY] nodes are hidden until confirmed.
5. The Comms form writes to Firestore, shows real status states, and is protected by rules, a honeypot and App Check.
6. With reduced motion on, the whole site is usable with cross-fades only; with WebGL disabled, all content is readable in the DOM.
7. Lighthouse (mobile): Performance ≥ 85, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95. OG image, `metadataBase`, `robots.ts` and `sitemap.ts` are present.
8. No text from the reference videos appears anywhere; all copy comes from §4.9.

### 4.15 Deliverables

1. Updated source in the existing repo (typed data, components from §4.7, scenes from §4.5).
2. `DESIGN_TOKENS.md` generated from `globals.css`.
3. A short `MOTION.md` listing every timeline label, its duration and its reduced-motion fallback.
4. A before/after Lighthouse report and a 30 s screen recording of the desktop flow.

> **END PROMPT**

<!-- PROMPT:END -->

---

# PART C — APPENDICES

## 5. Verify before shipping

| # | Claim | Where it came from | Repo evidence | Action |
|---|---|---|---|---|
| 1 | **"VR"** in Game-Based Physics Learning ("VR Physics Learning", "Unity + C# + VR") | Videos, brief v1 | Data file lists Unity · C# · Game Design, with no VR | Confirm headset support, or label it "Unity / Game-Based Learning" |
| 2 | **ISRO Launch Pad Simulation** as a mission | All three videos | Only "ISRO project line" in the summer-internship bullet; no repo | Confirm scope, your role and whether visuals can be shown publicly |
| 3 | **XR Interaction Toolkit** | Brief v1 | Not in the data file | Confirm, or drop the node |
| 4 | CYMAX title **"Unity & XR Developer Intern"** | Brief v1 | Data file: **"AR/VR Developer Intern"**, Hyderabad, Jan 2026 – present | Use your offer-letter title; the prompt uses the data-file title |
| 5 | VR Cinema as **Unity/headset rendering** | Brief v1 wording ("headset rendering") | Repo stack is React Three Fiber / Three.js / Gradio (web-based) | The prompt uses the web stack. If there's also a Unity/headset build at CYMAX, add it to Player Log, not to M03 |
| 6 | Graduation **2027** | Brief v1 | Data file: "2023 – present" | Confirm the expected year |
| 7 | "Sensor fusion" wording | Brief v1 | Repo: VIO + Kalman-filtered GPS + compass + landmarks, which is sensor fusion | OK |

## 6. Corrections applied (compared with brief v1 and the videos)

- The tech stack for **Tirumala** now comes from the repo (Unity 6, AR Foundation 6.5, ARCore, URP, A*). The video's "VR-Based • Unreal Engine" label is AI noise.
- **VR Cinema** stack corrected to R3F / Three.js / Gradio / JWT / AES / Argon2 / Docker Compose, with the live demo link added.
- **Physics Learning** now shows its real structure (five Unity projects on straight-line kinematics), which also puts the unused `project.group` data to work.
- **Skill percentages removed.** The current `skills[]` values (90, 88, 82…) have no source. Evidence chips replace them.
- **IDEAVERSE 2026** is kept as an achievement, with its real system (MISS-EyeScreen) and metrics.
- **Hero copy** keeps brief v1's words ("I BUILD PLAYABLE WORLDS") in the videos' typographic structure (small line → gradient word → white word → violet caps tagline).
- Known issues from `Docs/portfolio.md` §13 are folded into the acceptance criteria: modal focus trap, nav order and observer, debris instancing and `dt`, real loader, unused `group`, SEO metadata, and form hardening.

## 7. Generation prompts for matching assets (optional)

You produced the reference clips with an AI video tool. If you regenerate assets, these prompts keep them consistent with the system above. Always generate **without text** and add all typography in code.

- **Hero key art (layer source):** "Cinematic wide shot, lone figure seen from behind wearing a VR headset and holding two controllers, standing on a cracked dark stone platform above a sea of clouds at night, facing a massive segmented circular portal ring with alternating magenta and cyan light bars, a futuristic megacity with a vertical light-beam spire in the distance, a large ringed planet upper right, floating dark cubes with violet edge-light, deep navy and violet palette, volumetric fog, high-end game key art, no text, no logos, 16:9."
- **Entry clip (mobile fallback, 5 s):** "Continuous camera push, no cuts: the portal ring spins faster and its lights shift to amber and cyan, glass shards peel off the ring's left side and scatter, the figure's body dissolves from bottom to top into a glowing blue holographic voxel wireframe while the headset stays lit, the camera passes through the headset and emerges facing a stylised faceless avatar holding glowing controllers that emit cyan and magenta light ribbons, deep navy palette, no text."
- **Mission world stills:** "Holographic 3D terrain block with a cyan wireframe contour mesh over shaded mountain relief, an amber route line climbing from a glowing start ring to a map pin on the summit, dark space background with a floor grid, no text" · "Futuristic holographic physics lab, a glowing cube on a circular emissive pedestal moving along a straight track with a velocity arrow, dark navy, cyan and violet light, no text" · "Futuristic observatory VR cinema with a giant curved screen and a floating VR headset, dark dome with cyan rim light, no text" · "Rocket on a launch pad inside a dark hangar with ceiling light strips, seen through a curved glass frame with cyan rim light, no text."

---

*SYS.ONLINE // PORTAL STABLE — generated from frame-level analysis of portfolio_4–6 (60 contact-sheet frames at 2 fps, 240 analysis frames at 8 fps, 26 storyboard keyframes), luminance/motion/audio envelopes, and the repo's content data.*
