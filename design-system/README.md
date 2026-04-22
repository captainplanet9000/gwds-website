# GWDS Design System

Extracted from the live `gwds.app` codebase and packaged for use with **Claude Design** (claude.ai/design), **Claude Code**, and any downstream tooling. Supersedes the older `DESIGN-SYSTEM.md` / `BRAND-GUIDE.md` / `README-DESIGN-SYSTEM.md` at the repo root — those describe an aspirational glass-morphism system that was never shipped.

## What's in this directory

| File           | Purpose                                                                                   | Consumer                   |
|----------------|-------------------------------------------------------------------------------------------|----------------------------|
| `DESIGN.md`    | Canonical 9-section spec in the format Claude Design ingests during onboarding.           | **claude.ai/design**       |
| `CLAUDE.md`    | Longer-form human + Claude-readable engineering reference. Rules, recipes, known debt.    | Claude Code, reviewers     |
| `tokens.json`  | Machine-readable design tokens (W3C-format flavored).                                     | Figma, Style Dictionary, Claude |
| `README.md`    | This file.                                                                                | Humans                     |

---

## 1. Use with Claude Design (claude.ai/design)

**What it is:** Anthropic Labs' design workspace, launched April 17 2026. Included at no extra charge for Claude Pro, Max, Team, and Enterprise subscribers. Powered by Claude Opus 4.7.

**Upload flow (Option A — design-system setup):**
1. Go to [claude.ai/design](https://claude.ai/design).
2. Click the org switcher → **Create new design system**.
3. Under **Add assets**, upload `design-system/DESIGN.md`. Optionally also upload `tokens.json`.
4. Claude Design reads all 9 sections and registers the GWDS brand. Every subsequent prototype — pitch decks, landing pages, mockups — will automatically use these colors, type, components, and guardrails.

**Upload flow (Option B — per-prototype attach):**
1. Start a new prototype in the Claude Design dashboard.
2. Attach `DESIGN.md` in the chat composer.
3. Prompt: `"Create a design system from this DESIGN.md, then apply it."`

**Refinement inside Claude Design:**
- Comment inline on any generated element.
- Edit text directly in the canvas.
- Use adjustment knobs to tweak spacing, color, and layout; ask Claude to propagate changes.

**Exports Claude Design supports:** Canva, PDF, PowerPoint, standalone HTML, and direct handoff to Claude Code.

## 2. Use with Claude Code (this repo)

Two Anthropic skills are vendored into `.claude/skills/` so they apply automatically when Claude Code runs in this repo:

| Skill              | Triggers on                                                                 | Role                                                                                   |
|--------------------|-----------------------------------------------------------------------------|----------------------------------------------------------------------------------------|
| `frontend-design`  | Any UI / component / page / artifact work                                    | Enforces distinctive design, steers away from generic AI aesthetics, pairs with DESIGN.md. |
| `brand-guidelines` | When brand colors / typography / visual formatting are involved              | Applies the GWDS palette + type via DESIGN.md (overrides Anthropic's default brand).   |

Both live at:
```
.claude/skills/frontend-design/SKILL.md
.claude/skills/brand-guidelines/SKILL.md
```

**Prompting pattern:**
> Load `design-system/DESIGN.md` and build [component] in the **electric** role. Use tokens by name (`--accent-purple`, `--glow-sm`, etc.). Respect §7 Do's/Don'ts.

## 3. Use the tokens programmatically

```ts
import tokens from './design-system/tokens.json';
tokens.color.accent.purple.base.$value        // "#8B5CF6"
tokens.gradient.buttonPrimary.$value          // "linear-gradient(135deg,#7C3AED,#8B5CF6)"
tokens.radius.xl.$value                       // "16px"
```

Or pipe into **Style Dictionary** to emit `.css`, `.scss`, `.js`, or platform-specific outputs.

## 4. Aesthetic in one line

> Black editorial canvas (Syne + DM Sans, hairline borders, fluid `clamp()` typography) with a sparing electric-purple accent layer (`#8B5CF6` / `oklch(0.65 0.29 295)`) reserved for hero moments and primary CTAs.

## 5. Extracted from

- `src/app/globals.css`            — base tokens, typography, `.btn`, `.container`, `.section`, noise overlay
- `src/app/layout.tsx`             — font loading (flagged: preloads Inter/Space Grotesk that nothing consumes)
- `src/components/Hero.tsx`        — electric accent patterns (gradient headline span, primary CTA, tagline pill, radial glow wash)
- `src/components/Navbar.tsx`      — sticky glass navbar pattern, `z: 10000`
- `src/components/Footer.tsx`      — editorial footer, hairline top border
- `src/components/ProductCard.tsx` — card variants, per-product `--spectrum-*` tinting
- `src/components/Newsletter.tsx`  — OKLCH gradient CTA, section wash
- `src/components/ui/*`            — base primitives (Button, Card, Badge, Container, Section)

## 6. Known debt (unchanged from the initial extraction)

- `globals.css` does **not** define `--font-display` / `--font-body` / `--font-mono`; components that reference them fall back to body inheritance. See `DESIGN.md §3` for the values to wire up.
- `layout.tsx` preloads Inter + Space Grotesk — nothing uses them. Safe to remove.
- Tailwind is in `postcss.config.mjs` with no config file; no utilities are used. Treat CSS as vanilla.
- Root-level `DESIGN-SYSTEM.md` / `BRAND-GUIDE.md` / `README-DESIGN-SYSTEM.md` describe an older, aspirational glass-morphism system. Superseded by the files in this directory.
