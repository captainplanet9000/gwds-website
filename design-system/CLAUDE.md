# GWDS Design System — Claude Reference

> **For Claude:** This file is the canonical design spec for `gwds.app` (Gamma Waves Design Studio). Treat it as a system prompt when producing UI for this brand. Machine-readable tokens live in `./tokens.json`. When a conflict exists between this file and `src/app/globals.css`, this file wins — the CSS is legacy and being migrated.

---

## 1. Identity

GWDS sells AI trading systems, autonomous agents, and creator templates. The site is a **dark, editorial studio site** with an **electric-purple accent layer** for brand moments (hero, CTAs, featured products).

Two voices coexist on purpose:
- **Editorial base** — Raw Materials-style minimalism. Black canvas, large Syne headlines, fluid `vw`-based typography, hairline `rgba(232,232,232,0.1)` borders, monochrome buttons that invert on hover.
- **Electric accent** — Purple (#8B5CF6 / oklch(0.65 0.29 295)) with soft glows, gradient headlines, glass surfaces, backdrop blur. Used sparingly for CTAs, hero, tagline pills, progress bar, featured cards.

**Rule:** Editorial is the default. Reach for electric only when a surface needs to *sell* (primary CTA, hero, featured product, newsletter). Never drench a page in purple.

## 2. Non-Negotiables

1. **Background is always `#000`.** Light mode does not exist.
2. **Text is never pure white.** Use `#E8E8E8`; headline tint `#F0ECF9` is allowed on Hero only.
3. **Headings use Syne**, weight 600–800, `letter-spacing: -0.03em`. Always.
4. **Body uses DM Sans.** Line-height `1.6`–`1.7`.
5. **Small uppercase labels** (eyebrows, tags, CTA text) get `letter-spacing: 0.06em`–`0.2em` depending on size; smaller = wider.
6. **Fluid typography.** Prefer `clamp()` over fixed `px`. Headings scale with viewport; caps listed in tokens.
7. **Hairline borders** (`rgba(232,232,232,0.1)`) not solid ones. Elevate by brightening the border, not by shadow — except for purple glow CTAs.
8. **Respect `prefers-reduced-motion`.** All keyframes already collapse in `globals.css` — don't add raw `animation:` without a fallback.
9. **Noise overlay** (`body::before`, opacity 0.02, `mix-blend-mode: overlay`) is baked into layout. Don't duplicate it per-page.
10. **Navbar is `z: 10000`.** Nothing goes above it.

## 3. Color Palette (authoritative)

| Role            | Token                         | Value                                  | Where |
|-----------------|-------------------------------|----------------------------------------|-------|
| Canvas          | `color.background.canvas`     | `#000000`                              | Body, all full-bleed sections |
| Elevated        | `color.background.surface`    | `rgba(255,255,255,0.03)`               | Secondary buttons, inputs |
| Glass           | `color.background.surfaceGlass`| `rgba(18,18,26,0.8)` + blur(20px)     | Feature cards, sticky navbar |
| Text primary    | `color.text.primary`          | `#E8E8E8`                              | Default |
| Text muted      | `color.text.muted`            | `#A8A8A8`                              | Paragraphs under headlines |
| Text dim        | `color.text.dim`              | `#666666`                              | Metadata, hints |
| Border default  | `color.border.default`        | `rgba(232,232,232,0.1)`                | All hairlines |
| Border hover    | `color.border.hover`          | `rgba(232,232,232,0.3)`                | Hover/focus |
| Purple base     | `color.accent.purple.base`    | `#8B5CF6` / `oklch(0.65 0.29 295)`     | Primary accent |
| Purple gradient | `gradient.buttonPrimary`      | `linear-gradient(135deg,#7C3AED,#8B5CF6)` | Primary CTA |
| Warm            | `color.accent.warm`           | `#D4A574`                              | Editorial-only secondary accent |

**Spectrum (per-product tints):** cyan `oklch(0.75 0.15 195)`, green `oklch(0.70 0.18 145)`, gold `oklch(0.82 0.18 85)`, pink `oklch(0.70 0.25 340)`. Always match lightness neighborhood `0.65–0.82` so no hue dominates on black.

**Semantic:** success `#10B981`, warning `#F59E0B`, danger `#EC4899`, info `#06B6D4`. Use only for admin / status / toasts.

## 4. Typography

```
display: 'Syne', sans-serif       — h1–h6, logo, button labels
body:    'DM Sans', sans-serif    — paragraphs, nav, inputs
mono:    'JetBrains Mono'         — code, tickers, prices
```

Size recipe (use these clamps, not raw vw):

| Element            | Size                             | Weight | Tracking   |
|--------------------|----------------------------------|--------|------------|
| Hero headline      | `clamp(2.5rem, 6vw, 4.5rem)`     | 800    | `-0.03em`  |
| Section heading    | `clamp(1.6rem, 6vw, 5rem)`       | 700    | `-0.03em`  |
| Subheading         | `clamp(1.3rem, 4vw, 3rem)`       | 600    | `-0.03em`  |
| Body               | `clamp(0.95rem, 1.2vw, 1.125rem)`| 400    | `0`        |
| Subtitle / lede    | `clamp(0.9rem, 1.8vw, 1.1rem)`   | 400    | `0`        |
| CTA label          | `0.82rem`                        | 600–700| `0.06em` + UPPERCASE |
| Eyebrow / tag      | `0.7rem`                         | 600    | `0.15em` + UPPERCASE |
| Scroll hint        | `0.6rem`                         | 400    | `0.2em` + UPPERCASE |

**Gradient headlines:** Wrap the climactic word in a `<span>` with `background: var(--gradient-headline)` and `-webkit-background-clip: text`. Never more than one gradient span per headline.

## 5. Layout

- **Container:** `.container` → `max-width: 1600px; padding: 0 5vw;`
- **Narrow:** `.container-narrow` → `max-width: 1200px`
- **Hero text block:** `max-width: 700px`
- **Section rhythm:** full-bleed sections are `min-height: 100vh; padding: 10vh 0;` (`.section`). Half-height is `50vh; padding: 8vh 0` (`.section-half`).
- **Dividers:** `1px` or `2px` in `color.border.default`, margin `8vh 0`.
- **Grid gap:** `3vw` default; asymmetric hero grids use `1fr 1.5fr` with `5vw` gap.
- **Mobile breakpoint:** `768px`. Below this, all multi-column grids collapse to single column, vw typography falls back to rem, containers pad to `20px`.

## 6. Components

### 6.1 Primary Button (electric CTA)
```
padding:        15px 36px
border-radius:  radius.sm (8px)
background:     gradient.buttonPrimary
color:          #FFFFFF
font-family:    display (Syne)
font-size:      0.82rem
font-weight:    700
letter-spacing: 0.06em
text-transform: uppercase
box-shadow:     shadow.glowSm
transition:     box-shadow 300ms
hover:          scale(1.04) + shadow.glowMd
active:         scale(0.97)
```

### 6.2 Secondary Button (glass)
```
padding:         15px 36px
border-radius:   radius.sm (8px)
border:          1px solid color.border.default
background:      color.background.surface
color:           color.text.primary
backdrop-filter: effect.blur.standard
font:            same label treatment as primary
hover:           border-color → color.accent.purple.base
```

### 6.3 Editorial Button (monochrome, default `.btn` class)
```
padding:        1.2vw 2.5vw     /* mobile: 3vw 6vw */
border:         1px solid color.border.default
background:     transparent
color:          color.text.primary
hover:          background → color.text.primary; color → #000
```
Use this for *most* secondary actions on editorial pages (store, docs, about). Use glass secondary only in hero / high-contrast moments.

### 6.4 Tagline Pill (eyebrow)
```
display:         inline-flex; align-items:center; gap: 8px
padding:         6px 16px
border-radius:   radius.pill (999px)
border:          1px solid color.border.accent
background:      color.accent.purple.softBg  /* rgba(139,92,246,0.08) */
backdrop-filter: effect.blur.standard
```
Contents: pulsing dot (5×5, `#8B5CF6`, `animation: pulse 2s infinite`) + eyebrow label.

### 6.5 Card — Glass (featured)
```
background:      color.background.surfaceGlass
border:          1px solid color.border.default
border-radius:   radius.xl (16px)
backdrop-filter: effect.blur.heavy
hover:           translateY(-8px); box-shadow: shadow.glowLg; border-color: color.border.hover
```

### 6.6 Card — Editorial
```
background:    transparent
border:        1px solid color.border.default
border-radius: radius.xl (16px) or none
hover:         border-color → color.border.hover
```

### 6.7 Input
```
padding:        12px 16px
border:         1px solid color.border.default
background:     color.background.surface
border-radius:  radius.lg (12px)
color:          color.text.primary
placeholder:    color.text.muted
focus:          border-color → color.accent.purple.base; no glow
error:          border-color → color.semantic.danger
```

### 6.8 Section Background Recipes
- **Hero:** 3D element + `gradient.heroWash` radial + `gradient.topVignette` + bottom fade (`linear-gradient(to bottom, transparent, #000)`, 250px).
- **Feature section:** flat `#000` + optional `gradient.sectionWash` radial.
- **Transition:** always end sections with a `linear-gradient(to bottom, transparent, #000)` bottom fade when the next section starts at `#000`.

## 7. Motion

- **Default transition:** `300ms ease` on color/border. `200ms` on micro-interactions.
- **Entrances:** `fadeInUp` 1.2s for headlines, staggered 100ms between siblings. Use `ScrollReveal`-style IntersectionObserver or `framer-motion` `initial/animate` with `delay`.
- **Hero scroll:** opacity + translateY driven by `useScroll` / `useTransform` (framer-motion). Headline fades out by scrollYProgress 0.5.
- **Pulsing dot** on tagline pill: custom `@keyframes pulse` 2s infinite.
- **3D:** Three.js via `@react-three/fiber`. Keep 3D objects behind content with `pointer-events: none` overlay and `z-index: 1`.
- **Respect `prefers-reduced-motion`** — globals.css already collapses durations; don't re-enable.

## 8. Iconography & Imagery

- Flat SVG line icons, 1.5–2px stroke, `currentColor`.
- Product art: 3D `ProductOrb3D` or `ProductArt` placeholder on cards. No stock photography.
- Noise overlay applied globally — don't add per-surface grain.

## 9. Do / Don't

**Do**
- Pair a Syne heading with a DM Sans paragraph in every content block.
- Use the purple gradient on exactly one element per viewport (headline span *or* primary button — rarely both).
- Use OKLCH for new accent colors so hues balance on black.
- Reach for `clamp()` before hard `px`.
- Keep section rhythm at `100vh` for statement content, `50vh` for transitions.

**Don't**
- Don't introduce new font families. Syne + DM Sans only.
- Don't use pure white (`#FFF`) for text or borders.
- Don't stack multiple purple glows in one view — one hero glow + one CTA glow is the limit.
- Don't use `box-shadow` for elevation on editorial surfaces; use border brightness.
- Don't add Tailwind utility classes — the project does not compile them.
- Don't reference `var(--font-display)` / `var(--font-body)` in new code; write the family explicitly until those variables are wired in globals.css.
- Don't use Space Grotesk or Inter. The `<head>` preloads them but nothing uses them; treat as legacy.

## 10. Known Debt (read before extending)

- `globals.css` **does not define** `--font-display`, `--font-body`, or `--font-mono`; components referencing them fall back to body inheritance. Prefer direct `font-family` strings or add these variables to `:root` in a dedicated migration.
- `layout.tsx` preloads Inter + Space Grotesk but nothing consumes them — safe to remove.
- Tailwind is in `postcss.config.mjs` but there is no `tailwind.config.*` and no utilities are used — treat CSS as vanilla.
- Legacy `DESIGN-SYSTEM.md` / `BRAND-GUIDE.md` / `README-DESIGN-SYSTEM.md` describe a *different* aesthetic (Space Grotesk + Inter, glass-morphism everywhere). Those docs are superseded by this file.
- `Hero.tsx` uses inline styles for all tokens. When refactoring, map every hex to the tokens above; do not invent new purples.

## 11. Using This File with Claude

When prompting Claude for UI work on GWDS:

1. Include this file (or the JSON) as context.
2. State which **role** the surface plays: `editorial` (default) or `electric` (hero/CTA/featured).
3. Name tokens by path — `color.text.muted`, `radius.sm`, `gradient.buttonPrimary` — and Claude will resolve them against `tokens.json`.
4. If a value is missing from tokens, ask before inventing one; the palette is intentionally narrow.

---

*Source of truth:* `design-system/tokens.json` (machine) + this file (human + Claude). Both are versioned with the repo. Bump `$version` in `tokens.json` on every token change.
