# GWDS Design System

Extracted from the live `gwds.app` codebase. Supersedes the older `DESIGN-SYSTEM.md` / `BRAND-GUIDE.md` / `README-DESIGN-SYSTEM.md` at the repo root (those describe an aspirational glass-morphism system that was never shipped).

## Files

| File | Purpose |
|------|---------|
| `CLAUDE.md`   | Human + Claude-readable spec. Load this as context when asking Claude to design or build UI for GWDS. |
| `tokens.json` | Machine-readable design tokens (W3C-format flavored). Import into Figma, Style Dictionary, or reference by path from prompts. |

## Usage with Claude

1. Paste or attach `CLAUDE.md` when starting a UI design session.
2. Reference tokens by path — e.g. `color.accent.purple.base`, `gradient.buttonPrimary`, `radius.xl`. Claude will resolve them against `tokens.json`.
3. State which role the surface plays: **editorial** (default, monochrome) or **electric** (hero/CTA/featured, purple glow).

## Aesthetic in one line

> Black editorial canvas (Syne + DM Sans, hairline borders, fluid typography) with a sparing electric-purple accent layer for hero moments and primary CTAs.

## Extracted from

- `src/app/globals.css`            — base tokens, typography, `.btn`, `.container`, `.section`
- `src/app/layout.tsx`             — font loading, global providers
- `src/components/Hero.tsx`        — electric accent patterns (gradient headline, primary CTA, tagline pill, radial glow wash)
- `src/components/Navbar.tsx`      — sticky glass navbar pattern
- `src/components/Footer.tsx`      — editorial footer
- `src/components/ProductCard.tsx` — card variants, per-product color tinting
- `src/components/Newsletter.tsx`  — OKLCH gradient CTA, section wash
- `src/components/ui/*`            — base primitives
