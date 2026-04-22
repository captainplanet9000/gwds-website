# GWDS Design System

> Upload this file to **claude.ai/design** under _Create new design system → Add assets_ to register the GWDS visual identity with Claude Design. Claude Design will read every section and apply these tokens automatically to future prototypes, slides, landing pages, and UI artifacts for this brand.
>
> Companion machine-readable tokens live beside this file at `design-system/tokens.json`. Detailed engineering reference at `design-system/CLAUDE.md`.

Brand: **GWDS — Gamma Waves Design Studio**
Domain: **gwds.app**
Industry: AI trading systems, autonomous agents, creator templates.

---

## 1. Visual Theme & Atmosphere

**Aesthetic family:** Editorial-minimal studio site, Raw Materials-inspired, with a selective electric-purple accent for hero and CTA moments.

**Mood words:** nocturnal, premium, confident, technical, considered. Not loud, not playful, not corporate.

**Atmosphere:**
- Pure black canvas (`#000`) everywhere. Light mode does not exist.
- Large editorial headlines in **Syne** (weight 700–800, tight negative tracking).
- Long-form body in **DM Sans** at generous line-height (1.6–1.7).
- Hairline borders (`rgba(232,232,232,0.1)`) instead of solid strokes.
- A fixed, full-viewport noise overlay at `opacity: 0.02; mix-blend-mode: overlay` — barely perceptible film grain on every surface.
- 3D / motion moments live inside Hero, Newsletter, and Featured sections via Three.js (`@react-three/fiber`) and framer-motion. Motion is always scroll-driven or reveal-on-intersection, never autoplay loops on non-hero pages.
- Electric purple (`#8B5CF6` / `oklch(0.65 0.29 295)`) is reserved for: primary CTA, hero gradient headline span, tagline pill, scroll progress bar, featured product hover state. One purple moment per viewport maximum.

**Density:** Generous. Sections are 100vh with `10vh` internal padding. Body copy clamps at ~1.125rem so it breathes. Mobile collapses to single column with 20px gutters.

---

## 2. Color Palette & Roles

CSS variables (copy verbatim into `:root`):

```css
:root {
  /* ── Surface ─────────────────────────────── */
  --bg-canvas:        #000000;                    /* root background */
  --bg-near:          #050505;                    /* one step up */
  --bg-surface:       rgba(255,255,255,0.03);     /* inputs, secondary btn, subtle cards */
  --bg-surface-glass: rgba(18,18,26,0.8);         /* pair with backdrop-filter: blur(20px) */
  --bg-overlay:       rgba(0,0,0,0.5);            /* modal / drawer backdrop */

  /* ── Text ────────────────────────────────── */
  --text-primary:   #E8E8E8;   /* default body + headings */
  --text-muted:     #A8A8A8;   /* paragraphs, descriptions */
  --text-dim:       #666666;   /* metadata, hints */
  --text-faint:     #555555;   /* scroll hint lines */
  --text-headline:  #F0ECF9;   /* hero headline tint only */
  --text-on-accent: #FFFFFF;   /* text on purple fills */
  --text-on-invert: #000000;   /* text when bg inverts on hover */

  /* ── Border ──────────────────────────────── */
  --border-default: rgba(232,232,232,0.1);
  --border-hover:   rgba(232,232,232,0.3);
  --border-accent:  rgba(139,92,246,0.3);

  /* ── Accent (Electric Purple) ────────────── */
  --accent-purple:       #8B5CF6;                 /* canonical brand purple */
  --accent-purple-oklch: oklch(0.65 0.29 295);    /* prefer in new CSS */
  --accent-purple-deep:  #7C3AED;                 /* gradient start, pressed */
  --accent-purple-light: #A78BFA;                 /* gradient mid, hover tint */
  --accent-purple-pale:  #C084FC;                 /* headline gradient end */
  --accent-purple-soft:  rgba(139,92,246,0.08);   /* tagline pill bg */

  /* ── Accent (Warm) ───────────────────────── */
  --accent-warm: #D4A574;                         /* editorial secondary, sparing */

  /* ── Spectrum (per-product / per-category tints) ── */
  --spectrum-purple: oklch(0.65 0.29 295);
  --spectrum-cyan:   oklch(0.75 0.15 195);
  --spectrum-green:  oklch(0.70 0.18 145);
  --spectrum-gold:   oklch(0.82 0.18 85);
  --spectrum-pink:   oklch(0.70 0.25 340);

  /* ── Semantic ────────────────────────────── */
  --success: #10B981;
  --warning: #F59E0B;
  --danger:  #EC4899;
  --info:    #06B6D4;
}
```

**Role map (what to grab when):**

| When you need…                         | Token                        |
|----------------------------------------|------------------------------|
| Page background                        | `--bg-canvas`                |
| Default body text                      | `--text-primary`             |
| Secondary description text             | `--text-muted`               |
| Any hairline border                    | `--border-default`           |
| Primary CTA fill                       | `linear-gradient(135deg, var(--accent-purple-deep), var(--accent-purple))` |
| Icon / small accent                    | `--accent-purple`            |
| Elevated card on black                 | `--bg-surface-glass` + `backdrop-filter: blur(20px)` + `border: 1px solid var(--border-default)` |
| Per-product category tint              | One of the `--spectrum-*` hues (match product slot) |
| Success / warning / error state        | `--success` / `--warning` / `--danger` |

---

## 3. Typography Rules

**Font stacks (Google Fonts):**
```html
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet">
```

```css
--font-display: 'Syne', sans-serif;                          /* all headings, logo, CTA labels */
--font-body:    'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif; /* body, nav, inputs */
--font-mono:    'JetBrains Mono', 'Fira Code', Consolas, monospace;        /* code, tickers, prices */
```

**Type scale (fluid; always use `clamp()`):**

| Element              | `font-size`                         | Weight | `letter-spacing` | Notes |
|----------------------|-------------------------------------|--------|------------------|-------|
| Hero headline        | `clamp(2.5rem, 6vw, 4.5rem)`        | 800    | `-0.03em`        | Syne. Gradient-fill the climactic word only. |
| Section `<h2>`       | `clamp(1.6rem, 6vw, 5rem)`          | 700    | `-0.03em`        | Syne. |
| Subsection `<h3>`    | `clamp(1.3rem, 4vw, 3rem)`          | 600    | `-0.03em`        | Syne. |
| Body `<p>`           | `clamp(0.95rem, 1.2vw, 1.125rem)`   | 400    | `0`              | DM Sans. Line-height 1.6. |
| Subtitle / lede      | `clamp(0.9rem, 1.8vw, 1.1rem)`      | 400    | `0`              | DM Sans. `--text-muted`. |
| CTA button label     | `0.82rem`                           | 600–700| `0.06em` UPPERCASE | Syne. |
| Eyebrow / tag        | `0.7rem`                            | 600    | `0.15em` UPPERCASE | DM Sans. |
| Scroll hint          | `0.6rem`                            | 400    | `0.2em` UPPERCASE  | DM Sans. `--text-faint`. |

**Fallbacks:** If Syne or DM Sans fail to load, fall back to `-apple-system` for DM Sans and `Georgia` (not Times) for Syne — never Arial, never Inter.

**Rules:**
- Never pure white for text; always `--text-primary` (`#E8E8E8`).
- Never use Inter, Space Grotesk, Roboto, or Arial. These are explicitly banned.
- One gradient-fill `<span>` per headline. Never two.
- Tracking is negative on headings (`-0.03em`), neutral on body, wide-positive on uppercase labels.

---

## 4. Component Stylings

### 4.1 Primary Button (electric CTA)
```css
padding: 15px 36px;
border-radius: 8px;
border: none;
background: linear-gradient(135deg, var(--accent-purple-deep), var(--accent-purple));
color: var(--text-on-accent);
font-family: var(--font-display);
font-size: 0.82rem;
font-weight: 700;
letter-spacing: 0.06em;
text-transform: uppercase;
box-shadow: 0 0 20px rgba(139,92,246,0.25);
transition: box-shadow 0.3s, transform 0.2s;

/* :hover */
transform: scale(1.04);
box-shadow: 0 0 30px rgba(139,92,246,0.4);

/* :active */
transform: scale(0.97);
```

### 4.2 Secondary Button (glass, hero context)
```css
padding: 15px 36px;
border-radius: 8px;
border: 1px solid var(--border-default);
background: var(--bg-surface);
color: var(--text-primary);
backdrop-filter: blur(8px);
font-family: var(--font-display);
font-size: 0.82rem;
font-weight: 600;
letter-spacing: 0.06em;
text-transform: uppercase;
transition: border-color 0.3s;

/* :hover */
border-color: var(--accent-purple);
```

### 4.3 Editorial Button (default `.btn`, monochrome)
```css
padding: 1.2vw 2.5vw;  /* mobile: 3vw 6vw */
border: 1px solid var(--border-default);
background: transparent;
color: var(--text-primary);
font-family: var(--font-display);
font-size: 1vw;
font-weight: 600;
letter-spacing: -0.01em;
transition: all 0.3s ease;

/* :hover */
background: var(--text-primary);
color: var(--text-on-invert);
border-color: var(--text-primary);
```

### 4.4 Tagline Pill (eyebrow with pulsing dot)
```css
display: inline-flex;
align-items: center;
gap: 8px;
padding: 6px 16px;
border-radius: 999px;
border: 1px solid var(--border-accent);
background: var(--accent-purple-soft);
backdrop-filter: blur(8px);
```
Inside: a `5×5` dot at `--accent-purple` with `animation: pulse 2s ease-in-out infinite`, followed by a `0.7rem`, `letter-spacing: 0.15em`, uppercase label in `--accent-purple-light`.

### 4.5 Card — Glass (featured product / hero panel)
```css
background: var(--bg-surface-glass);
border: 1px solid var(--border-default);
border-radius: 16px;
backdrop-filter: blur(20px);
transition: transform 0.3s, border-color 0.3s, box-shadow 0.3s;

/* :hover */
transform: translateY(-8px);
border-color: var(--border-hover);
box-shadow: 0 20px 60px rgba(139,92,246,0.1), 0 8px 24px rgba(0,0,0,0.4);
```

### 4.6 Card — Editorial (catalogue, docs)
```css
background: transparent;
border: 1px solid var(--border-default);
border-radius: 16px;
transition: border-color 0.3s;

/* :hover */
border-color: var(--border-hover);
```

### 4.7 Input
```css
padding: 12px 16px;
border: 1px solid var(--border-default);
background: var(--bg-surface);
border-radius: 12px;
color: var(--text-primary);
font-family: var(--font-body);
transition: border-color 0.3s;

/* ::placeholder */
color: var(--text-muted);

/* :focus */
outline: none;
border-color: var(--accent-purple);

/* [aria-invalid="true"] */
border-color: var(--danger);
```

### 4.8 Navbar
- Fixed, `z-index: 10000`, above all 3D canvases.
- Default: transparent background.
- Scrolled (>40px): `background: rgba(0,0,0,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border-default);`
- Links: `--font-body`, `0.85rem`, `--text-muted`, hover → `--text-primary`.

### 4.9 Footer
- `background: var(--bg-canvas)`, `border-top: 1px solid var(--border-default)`.
- Link columns in `--text-muted`, section headers in `--text-primary` at `0.75rem` uppercase `letter-spacing: 0.15em`.

---

## 5. Layout Principles

**Containers:**
```css
.container       { max-width: 1600px; margin: 0 auto; padding: 0 5vw; }
.container-narrow{ max-width: 1200px; margin: 0 auto; padding: 0 5vw; }
.prose           { max-width: 700px;  margin: 0 auto; }   /* hero text */
```

**Section rhythm:**
- Full statement section: `min-height: 100vh; padding: 10vh 0;` (`.section`)
- Half section: `min-height: 50vh; padding: 8vh 0;` (`.section-half`)
- Divider: `1px` or `2px` in `--border-default`, `margin: 8vh 0`.

**Grid system (fluid gap):**
```css
.grid       { display: grid; gap: 3vw; }
.grid-2     { grid-template-columns: repeat(2, 1fr); }
.grid-3     { grid-template-columns: repeat(3, 1fr); }
.grid-4     { grid-template-columns: repeat(4, 1fr); }
.grid-asym  { grid-template-columns: 1fr 1.5fr; gap: 5vw; }  /* hero & philosophy */
```

**Spacing scale (for component internals; use `px`, not `vw`):**
`4, 8, 12, 16, 20, 24, 32, 40, 48, 64` — nothing in between.

**Whitespace rhythm:** Prefer vertical `10vh` between sections over horizontal padding tricks. Copy breathes; never cram more than one H1+paragraph+CTA cluster above the fold.

---

## 6. Depth & Elevation

GWDS is **border-first**, not shadow-first. Elevate by brightening the border, not by stacking shadows — except on accent surfaces.

**Shadow tokens:**
```css
--shadow-sm:        0 2px 8px rgba(0,0,0,0.2);
--shadow-md:        0 4px 12px rgba(0,0,0,0.4);
--shadow-lg:        0 20px 60px rgba(0,0,0,0.4);
--glow-sm:          0 0 20px rgba(139,92,246,0.25);   /* primary CTA resting */
--glow-md:          0 0 30px rgba(139,92,246,0.4);    /* primary CTA hover */
--glow-lg:          0 20px 60px rgba(139,92,246,0.1), 0 8px 24px rgba(0,0,0,0.4); /* featured card hover */
--glow-oklch:       0 0 8px oklch(0.65 0.29 295 / 0.8); /* scroll progress bar */
```

**Surface hierarchy (dark → light):**
1. `--bg-canvas` (z-0, pure black)
2. `--bg-near` (z-1, minor step up)
3. `--bg-surface` (z-2, translucent white tint)
4. `--bg-surface-glass` + `blur(20px)` (z-3, elevated glass — featured cards, sticky navbar)
5. Accent gradient fills (z-4, only for CTAs)

**Backdrop blur scale:** `blur(4px)` drawer backdrops → `blur(8px)` glass buttons / pills → `blur(20px)` navbar and featured cards. No `blur(>20px)`.

**Noise overlay:** Applied globally via `body::before { opacity: 0.02; mix-blend-mode: overlay; background-image: <svg noise>; }`. Never duplicate per-surface.

---

## 7. Do's and Don'ts

### ✅ Do
- Pair a Syne heading with a DM Sans paragraph in every content block.
- Use one gradient-fill headline span OR one glowing CTA per viewport. Never both.
- Use `clamp()` for anything that scales across viewports.
- Keep section rhythm at `100vh` for statement content, `50vh` for transitions.
- Use OKLCH for new accent hues to keep the spectrum balanced on black.
- Terminate every full-bleed section in a `linear-gradient(to bottom, transparent, #000)` bottom fade before the next section starts.
- Respect `prefers-reduced-motion`: all keyframes collapse to `0.01ms`.

### ❌ Don't
- Don't use pure white (`#FFF`) for text, borders, or icons. Ever.
- Don't use Inter, Space Grotesk, Roboto, or Arial. Syne + DM Sans only.
- Don't stack multiple purple glows in one view.
- Don't use `box-shadow` for elevation on editorial (non-accent) surfaces; brighten the border instead.
- Don't introduce new brand colors. The purple spectrum and warm `#D4A574` are the full palette.
- Don't autoplay non-hero motion. Motion must be scroll-driven or reveal-on-intersection.
- Don't use Tailwind utility classes (project's PostCSS does not compile them).
- Don't saturate a page in purple — editorial is the default, electric is the garnish.

---

## 8. Responsive Behavior

**Primary breakpoint: `768px`** (mobile / desktop split).

**Below 768px:**
- All multi-column grids collapse to single column: `grid-template-columns: 1fr`.
- Containers: `padding: 0 20px` (override the `5vw`).
- Section padding: `48px 0` instead of `10vh 0`.
- Typography falls back to fixed rem:
  ```
  h1: 2.2rem | h2: 1.6rem | h3: 1.3rem | h4: 1.1rem | h5: 1rem | h6: 0.9rem | p: 0.95rem
  ```
- `.btn { padding: 3vw 6vw; font-size: 3.5vw; }` on the editorial button.
- Sticky side panels (`product-hero-grid > div:last-child`, `checkout-grid > div:last-child`) become `position: static`.
- Cart drawer expands to `width: 100%`.
- Store filter pills become horizontal scroll (`overflow-x: auto; flex-wrap: nowrap`) with hidden scrollbar.

**Additional breakpoints (desktop):**
- `640px`  — small tablets (rarely targeted)
- `1024px` — laptops
- `1280px` — desktop baseline
- `1920px+` — ultra-wide: body text downscales to `1.1vw` to prevent over-inflation.

**Touch targets:** minimum `44×44px` for any tap target on mobile. Editorial `.btn` already exceeds this via `3vw 6vw` on mobile.

**Motion on mobile:** 3D hero elements (`GWDSLogo3D`, `WaveTerrain3D`) stay; complex scroll-triggered parallax degrades gracefully via framer-motion's viewport detection.

---

## 9. Agent Prompt Guide

When asking Claude (Design or Code) to produce UI for GWDS, include:

> **Brand:** GWDS — black editorial canvas, Syne + DM Sans, electric-purple (`#8B5CF6` / `oklch(0.65 0.29 295)`) accent only for hero/CTA/featured.
>
> **Role this surface plays:** `editorial` (default, monochrome, hairline borders, `.btn` inverts on hover) **or** `electric` (hero/CTA/featured, purple gradient, glow shadow, glass blur, gradient headline span).
>
> **Non-negotiables:** pure black bg, `#E8E8E8` text (never `#FFF`), Syne headings at `-0.03em` tracking, `clamp()` for all sizes, hairline `rgba(232,232,232,0.1)` borders, one gradient-fill span per headline max, one glow CTA per viewport max, respect `prefers-reduced-motion`.
>
> **Banned:** Inter, Space Grotesk, Roboto, Arial, pure white, Tailwind utility classes, solid borders, double-purple layouts, autoplay non-hero motion.
>
> **Tokens to use:** reference by name — `--bg-canvas`, `--text-primary`, `--accent-purple`, `--border-default`, `--glow-sm`, `gradient.buttonPrimary`, etc. Full list in §2–§6 above.

**Reusable prompts:**

- _"Build a [feature] section for GWDS in the **editorial** role. Hairline borders, monochrome only, Syne headline with no gradient."_
- _"Build a [feature] section for GWDS in the **electric** role. One gradient headline span, one primary CTA with `--glow-sm` resting / `--glow-md` hover, subtle radial purple wash behind content."_
- _"Refactor this inline-styled component to use GWDS tokens. Replace every hex and rgba with a `--variable` from `§2` and every font-family with `--font-display` or `--font-body`."_
- _"Generate a product card for a new category tinted in `--spectrum-green`. Keep the glass card recipe from §4.5; swap the hover box-shadow's purple for the spectrum hue."_

---

*Version 1.0.0. Source of truth: this file + `design-system/tokens.json`. Extracted from `gwds.app` shipped code (src/app/globals.css, src/components/Hero.tsx, Navbar.tsx, Footer.tsx, ProductCard.tsx, Newsletter.tsx, ui/*).*
