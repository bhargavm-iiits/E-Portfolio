# NEXUS — Design Tokens

Source of truth: `src/styles/tokens.css` (custom properties on `:root`). Values were sampled from the reference screenshot (`Docs/Game`) and tuned for contrast. **Dark first**: daylight appears only *through* the portal, in the 3D.

## Colour

### Surfaces and lines

| Token | Value | Use |
|---|---|---|
| `--void` | `#030910` | Page base, canvas clear colour, opaque section backgrounds |
| `--void-2` | `#050c16` | Alternate deep surface |
| `--panel` | `#040a12` | Lower panels, briefing sheet |
| `--card` | `#070d14` | Mission cards, context panel, chips |
| `--card-2` | `#0a121c` | Raised card surface |
| `--line` | `rgba(120,168,214,.32)` | Thin outer strokes, rails |
| `--line-soft` | `rgba(120,168,214,.16)` | Inset strokes, separators |
| `--line-strong` | `rgba(150,200,240,.55)` | Outlined plates (the 1 px frame) |

### Accents

| Token | Value | Role |
|---|---|---|
| `--cyan` / `--cyan-hi` | `#4bdcfd` / `#8fefff` | The single action colour: CTAs, text actions, selected states, right/upper portal emitters |
| `--cyan-dim` | `rgba(75,220,253,.55)` | Tag outlines, hover borders |
| `--violet` / `--violet-hi` | `#8b6cff` / `#b49bff` | Portal / AI / media energy: left/lower emitters, PyTorch node, the Unity core's lower glow |
| `--amber` / `--amber-dim` | `#ffc23d` / 55% | **Only** the award (trophy icon, badge, rail end) and route lines in the M01 diorama |

### Text (contrast measured on `--void` / `--card`)

| Token | Value | Contrast |
|---|---|---|
| `--text` | `#eef6ff` | 18.3 : 1 / 17.9 : 1 |
| `--text-2` | `#a9b9cf` | 10.0 : 1 / 9.8 : 1 (prose) |
| `--text-3` | `#7488a3` | 5.5 : 1 / 5.4 : 1 (metadata only) |
| `--text-ink` | `#04111a` | 11.8 : 1 on `--cyan` (primary plate label) |

Cyan text reaches 12.3 : 1 on `--void`; violet-hi 8.6 : 1; amber 12.4 : 1.

## Typography — four roles

| Role | Font (CSS var) | Weights | Use |
|---|---|---|---|
| Identity | Oxanium (`--font-id`) | 800 | The name only |
| Technical headings / metadata | Chakra Petch (`--font-h`) | 500–700 | Statement, section titles (tracked 0.2em), nav, plates, tags, dates, `.t-meta` labels |
| Prose | Inter (`--font-b`) | 400–500 | Descriptions, briefing text, timeline prose |

The fonts were chosen by glyph comparison against the reference and are self-hosted by `next/font` (SIL OFL). Oxanium and Chakra Petch are preloaded; Inter swaps in.

| Token | Value |
|---|---|
| `--fs-name` | `clamp(2.9rem, 6.4vw, 6.1rem)` |
| `--fs-statement` | `clamp(1.02rem, 1.95vw, 1.8rem)`, tracked 0.36em |
| `--fs-h2` | `clamp(1.35rem, 2.35vw, 2.15rem)` |
| `--fs-h3` | `clamp(1.02rem, 1.25vw, 1.2rem)` |
| `--fs-body` | `clamp(1rem, 0.25vw + 0.94rem, 1.1rem)` |
| `--fs-meta` / `--fs-micro` | `0.78rem` / `0.7rem` |

## Frame grammar

| Element | Definition |
|---|---|
| Panels and cards (`HudFrame`) | One measured SVG layer: a thin outer stroke with true 45° chamfers (fixed pixel sizes at any element size), an optional inset stroke, short bright cyan edge accents and small junction dots at chamfer vertices. The fill uses the same path, so frame and surface never drift. |
| Plates (CTAs) | `.plate`: clipped upper-right and lower-left corners (`--c` 13 px, 9 px small). `--primary` is a cyan gradient with a local glow; `--outline` is a 1 px frame drawn by layering the face inside the clipped edge. |
| Text action | `VIEW BRIEF →`: cyan, light, never a second solid button |
| Tags | `.tag`: small chamfered outline label, specific category text |
| Section rail | `RailHead`: tracked title, a fine divider with one diagonal jog, right-aligned subtitle |
| Hexagons | Ability nodes (layered core with cyan/violet glow) and log icons; amber hexagon only for the award |

## 3D materials (not CSS)

Portal armour: dark machined metal with object-space wear (roughness and tone variation). Emitters: vertex-coloured unlit strips (cyan → violet by angle). Aperture disc: screen-space city render with rim dispersion and an emitter-tinted haze. Wet stone: a mirror with a baked crack/puddle map, roughness blur and Fresnel. Night water: a mirror with ripple normals and vertically stretched reflections. Mist: soft billboards from a baked smoke atlas. Shader colours are authored in sRGB and converted with `toLin()`, because the pipeline is linear (ACES tone mapping at the end).

## Motion tokens

| Token | Value |
|---|---|
| `--t-hover` | 220 ms |
| `--t-node` | 260 ms |
| `--t-brief` | 420 ms |
| `--ease-out` | `cubic-bezier(.22,1,.36,1)` (≈ power3.out) |
| `--ease-in` | `cubic-bezier(.55,.06,.68,.19)` (≈ power2.in) |

See `MOTION.md` for every timing.

## Layout and layers

| Token | Value |
|---|---|
| `--gutter` | `clamp(16px, 3.2vw, 46px)` |
| `--wrap` | 1400px |
| `--header-h` | 76px (62px on phones) |
| `--cut` / `--cut-sm` | 14px / 9px (10px / 7px on phones) |
| Z layers | stage 0 · content 1 · entry veil 45 · header 50 · menu 60 · dialogs 70 |

Breakpoints: three mission columns ≥ 1024px and two at 680–1023px; the lower panels stack below 1024px; the header collapses to MENU ≤ 1080px. Phones and portrait tablets (≤ 1100px with aspect ≤ 1) stack the hero copy under the world; the ability cross becomes a grid ≤ 560px.
