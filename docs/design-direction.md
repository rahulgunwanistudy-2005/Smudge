# Design direction — "forensic light table, night shift"

Written before any screen was built. Every screen is checked against this page.

## Reference and how we use it
The builder chose the Dribbble shot **"Vizo — Neuro-Optical Health Scan UI"** (Jack R. / RonDesignLab) as the aesthetic reference: a dark instrument-grade health app, a glowing green scan of the user's face as the dashboard hero, dense but calm readouts.

We take the *language*, not the layout:

| Vizo does | Smudge does instead |
|---|---|
| Green wireframe **face** scan on the dashboard | Green ridge-flow **thumbprint** scan: concentric ridge lines drawn from a real orientation field, a sweeping scan line, minutiae glyphs blooming in |
| Health scores ("neuro-optical index") | Cloneability score 0–100 with a tier, and the matcher dial with its calibrated threshold line |
| Biometric trend charts | Lab charts: cloneability vs capture distance, match score before/after per attacker |
| "Scan complete" state | "Neutralised — a fingerprint matcher no longer accepts this print" |

The thumbprint hero is not decoration: on the home screen it previews exactly what the scan screen will do to the user's own photo.

## Concept
An evidence lab at night. Near-black surfaces, instruments glowing softly, one green that means "the instrument is looking", one red-orange that means "this is exposed". Numbers are always in mono, always with units.

## Colour tokens
Dark is the primary theme (like the reference). Light is designed separately ("paper light table"), not inverted.

| Token | Dark | Light | Use |
|---|---|---|---|
| `--bg` | `#050706` | `#ECEEE8` | page |
| `--surface` | `#0C100E` | `#F7F8F4` | panels |
| `--card` | `#121815` | `#FFFFFF` | cards |
| `--raised` | `#1A221E` | `#E3E6DE` | chips, inputs |
| `--line` | `#25302A` | `#CDD3C8` | hairlines |
| `--fg` | `#E8EEE9` | `#0B0E0C` | text |
| `--fg-dim` | `#9BA69F` | `#4A544E` | secondary text (≥ 4.5:1 on card) |
| `--scan` | `#C6F24E` | `#C6F24E` (fill) / `#3B6A00` (text) | the instrument: scan lines, focus ring, "neutralised" |
| `--risk` | `#FF5A36` | `#C2361A` | **only** exposed ridges, minutiae, "High/Critical" |
| `--warn` | `#F2B84B` | `#8A5A00` | "Low" tier, partial results |

Rules: `--risk` is never used for buttons, links or decoration. `--scan` never appears on an exposed print. Tier is always text + icon + colour.

## Type
- **Display:** Bricolage Grotesque (variable, self-hosted, Latin subset) — statements and big numbers in headings. Tight tracking, optical size high.
- **Mono:** JetBrains Mono (self-hosted, Latin subset) — every number, unit, code, label in caps.
- Scale (rem): 0.75 / 0.875 / 1 / 1.25 / 1.625 / 2.25 / 3.25. Labels: 0.75 mono, uppercase, +0.08em tracking.
- `font-display: swap`. No CDN fonts.

## Shape and layout
- Cards: radius 24 px, 1 px `--line` border, no drop shadows; depth comes from surface steps.
- Pills and segmented controls: radius 999 px.
- Mobile-first at 360 px. One column, 16 px gutters. A bottom tab bar (Scan · Documents · Proof · Lab) on mobile; a left rail on ≥ 1024 px.
- The scan viewport is a circle-in-square instrument: concentric range rings, tick marks every 6°, a mono readout in the corners.

## Motion (meaning only)
1. **Bloom** — ridge lines draw along the orientation field (600 ms), then minutiae pop in staggered (12 ms each). Means: "we found these."
2. **Sweep** — a single green scan line passes over a print while Smudge runs; glyphs it crosses dissolve. Means: "we are erasing these."
3. **Needle** — the matcher dial needle eases from the before score to the after score. Means: "the attack now fails."
Nothing else moves. `prefers-reduced-motion`: bloom and sweep become a static overlay; the needle jumps.

## Banned
Purple-blue gradients · glassmorphism/frosted cards · emoji icons · stock 3D blobs · "Revolutionize your…" copy · centred hero with three feature cards · lorem ipsum · fake testimonials or user counts · colour as the only signal · decorative motion.

## Copy voice
Calm, specific, honest. Grade 6–8. Never "100% safe". Say "a fingerprint matcher no longer accepts this print." Always say when something is simulated.
