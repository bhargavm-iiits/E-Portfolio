# NEXUS — Motion

The default reading view is quiet: ordinary document scrolling, a few one-time reveals, and the 3D windows idling. The only choreographed sequence is the optional **ENTER THE NEXUS** entry (`src/lib/director.ts`). GSAP writes plain values on `rig` (`src/lib/rig.ts`) and the render loop reads them. No React state changes per frame.

## Scrolling and navigation

| Behaviour | Spec | Reduced motion |
|---|---|---|
| Smooth scrolling | Lenis, `lerp 0.12`, driven from GSAP's ticker (prioritised, so the 3D renders after the scroll update in the same frame) | Native scrolling |
| Section links | Scroll below the fixed header in 0.6–1.6 s (by distance), cubic out; focus moves to the section heading | Instant jump, focus moves |
| Hero drift | While the hero scrolls away the camera rises 0.9 m and pushes 1.6 m (`rig.heroScroll`) | Off |
| Pointer parallax | Camera offset ±0.45 m / ±0.22 m (hero), damped at 2.5/s | Off |

## ENTER THE NEXUS (≈ 2.4 s, skippable)

States: `idle → activating → approaching → crossing → arrived → idle`, mirrored on `html[data-entry]`. Duplicate starts are ignored.

| t (s) | Beat | Spec | Ease |
|---|---|---|---|
| 0 | activating | Page scroll locked; CTA `data-state="engaged"` | — |
| 0.15–0.50 | Energise | Emitters 0.35 → 1, explorer emblem/strap glow 0.25 → 1 (0.35 s) | power2.out |
| 0.20–0.80 | Sparks | Rim sparks spin up and spiral inward (0.6 s) | power2.out |
| 0.50 | approaching | Camera leaves the rest pose along the line of sight through the aperture, rising just over the explorer's head (`rig.entry` 0 → 0.78, 0.95 s) | power2.in |
| 0.50–0.95 | UI retract | Hero copy −6% x, blur 4 px, fade (0.45 s); bottom HUD fades, header dims to 25% (0.3 s) | power2.in / none |
| 0.85–1.45 | Speed | Radial blur 0 → 0.18 (0.6 s); FOV widens with the approach | power2.in |
| 1.45 | crossing | Camera reaches the aperture plane (`rig.entry` → 1, 0.3 s). The disc now fills the frame | none |
| 1.60–2.35 | Into the city | The city camera keeps flying toward the main island (`rig.cityPush` 0 → 1, 0.75 s) | power1.inOut |
| 1.95–2.30 | Veil | A soft fade to the page's dark (no flash) | power1.in |
| 2.32 | arrived | Under the veil: rig reset, copy/header restored, scroll unlocked, jump to **Missions**, focus on its heading | — |
| 2.36–2.81 | Reveal | Veil fades out | sine.out |
| +0.4 | idle | Ready to replay | — |

**SKIP** (in the header during the entry) and **Esc** jump straight to the arrival state. Under reduced motion, or without WebGL, the CTA navigates directly to the missions and focuses their heading.

## Idle motion in the 3D windows

| Element | Motion |
|---|---|
| Portal | Emitters flicker ±3%; the counter-ring turns 0.012 rad/s (0.06 when energised); broken-away blocks bob ±0.12 m; debris orbits; the energy rim shimmers |
| Aperture city | Craft cross slowly; waterfalls stream; clouds drift |
| Explorer | Mixamo idle clip (phase seeded per instance) |
| Mist, stars | Billboards drift and turn slowly; stars twinkle |
| Water (comms) | Two ripple layers; reflections stretched vertically; moon glitter path |
| Comms camera | Lateral drift ±0.8 m over ~2 min |
| Briefing dioramas | Camera sway ±0.07 rad; on open, the signature animation plays once: M01 route draws on (3.2 s), M02 level pads light in sequence (2.2 s), M04 service arms retract (2.2 s); all power2.inOut, 0.35 s delay |

All idle motion reads `view.time`, which is frozen under reduced motion.

## UI motion

| Pattern | Duration / ease | Reduced motion |
|---|---|---|
| Hover / focus | 220 ms (`--t-hover`), ease-out; arrow nudges 4 px | Colour change only |
| Ability node select | 260 ms (`--t-node`) route + glow | Instant |
| Hero copy arrival (load) | 0.9 s rise, 90 ms stagger | Off |
| Section headings | Type-on clip, 0.6 s `steps(16)`, once | Off |
| Mission cards | Rise 0.7 s, 80 ms stagger, once | Off |
| Briefing | In 0.42 s power3.out (y 22 → 0); out 0.28 s power2.in | 0.2 s fade |
| Terminal | In 0.42 s power3.out | Instant |
| Bottom-HUD chevrons | 2.4 s nudge loop | Off |

## Safety rules

- No bounce or elastic easing, no per-letter scrambles, no random glitching.
- No flashes: the entry ends in a fade to the page's own dark.
- Radial blur only during the crossing.
- Reduced motion (`prefers-reduced-motion` or the header toggle → `html[data-motion="reduced"]`): no Lenis, no entry flight, no reveals, CSS transitions and animations ≈ 0 ms, frozen 3D time, and frames rendered only when something changes.
