# TrackFinder site — Design system

Direction: **Underground Signal**, with editorial asymmetry borrowed from *Modern Record Culture*.
One idea runs through the page: **the page is a tracklist**. Messy sets become one clean list.

## Colour

| Token | HEX | Use | Contrast on `night` |
|---|---|---|---|
| `night` | `#0B0C0A` | Page background | — |
| `deck` | `#151713` | Raised surfaces, hover fills | — |
| `groove` | `#24271F` | Hairlines, borders | decorative only |
| `dust` | `#8A9080` | Secondary text, labels | 5.96 : 1 (AA) |
| `bone` | `#ECEEE4` | Primary text | 16.7 : 1 |
| `acid` | `#C8FF2E` | The only accent: CTA, "More mixing.", played signal | 16.6 : 1 |
| `acid-deep` | `#A8DC12` | CTA pressed state | — |

Rules
- Acid is spent on **one headline phrase, the primary CTA and live signal**. Never as a background for whole sections, never as gradient text.
- Text on acid is always `night` (16.6 : 1).
- No glass, no glows, no gradient meshes. Depth comes from the hairline `groove` border or a `deck` fill, never both.
- The site is dark only. The audience arrives from phones at night, from TikTok and IG.

## Type

| Role | Font | Settings |
|---|---|---|
| Display | Archivo Variable | width 125%, weight 800, tracking −0.03em, leading 0.92, uppercase |
| Body / UI | Instrument Sans Variable | 17px base, leading 1.55, semibold for emphasis |
| Data | JetBrains Mono Variable | **only** for real data: timestamps, counters, labels like "Example · 3 sets" |

Scale (fluid)
- Display XL (hero): `clamp(2.9rem, 11.6vw, 6rem)`, and `min(6rem, 8vw)` from 1024px
- Display L (section headings): `clamp(2.25rem, 7vw, 4.5rem)`
- Lead: 17 → 20px
- Body: 17px
- Small: 15px
- Mono label: 11px, tracking 0.06em, uppercase

All fonts are self-hosted via Fontsource: no Google request, and only the Latin subset loads.

## Space and layout

- 4px base. Steps used: 8 · 12 · 16 · 24 · 32 · 40 · 56 · 96 · 160.
- Gutters: 20px on phones, 32px on tablets, 48px on desktop. Max width is 1440px.
- Desktop grid is 7/5. Text sits on the left; the signal and the list sit on the right.
- More space above a heading than below it. Sections are separated by 96–160px.
- Phones get their own order, not a shrunken desktop: headline → waveform → copy → CTAs → list.

## Components

- **PrimaryCta**: acid pill, 56px tall (40px in the nav), arrow ↗ that nudges on hover, presses to 97%. Magnetic on desktop.
- **GhostCta**: hairline pill with the GitHub mark, `deck` fill on hover.
- **SendToComputer**: shown only on touch screens. Uses the native share sheet and falls back to copying the link. Collects nothing.
- **SignalDeck**: Canvas waveform of three example sets, plus the animated list. The data is invented and labelled "Example".
- **Track row**: index · **Artist** – Title · timestamp. A filtered row gets an acid strike-through, then collapses.
- **Focus**: 2px acid outline, 3px offset, on every interactive element.

## Motion

| Token | Value | Use |
|---|---|---|
| `ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrances, CTA hover |
| Fast | 300ms | Hover and press |
| Base | 500–700ms | Rows, fade-ups |
| Reveal | 900ms | Headline lines rising from a mask |
| Signal sweep | 13s sweep + 3.2s hold, then loops | Hero waveform |

Rules
- **One authored moment per section.** In the hero, that moment is the sweep that turns sets into a list. No generic fade on every block.
- The headline and CTAs animate with CSS and are on screen in under 400ms. Nothing waits for JavaScript.
- The canvas pauses when it is off screen or the tab is hidden. Its pixel ratio is capped at 2.
- A subtle 124 BPM pulse plays just behind the playhead, so it feels like rhythm without any sound. Audio never plays.
- `prefers-reduced-motion`: no reveal, no sweep. The waveform renders fully played and the list shows its final state.
