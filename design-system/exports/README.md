# GWDS design system — import bundle

This folder is the **portable export** of the GWDS design system. Upload the whole folder (or zip it) to any design tool. `manifest.json` at the top is the index — everything else is a file tuned for a specific downstream consumer.

## Quick pick by tool

| Consumer | Import this |
|---|---|
| **Claude Design** (or any tool that reads `manifest.json`) | The whole folder. Start with `manifest.json`. |
| Figma + **Tokens Studio** plugin | `tokens.figma.json` (multi-set: `global` + three themes) |
| **Style Dictionary** | `tokens.w3c.json` with `@tokens-studio/sd-transforms` |
| Penpot / Supernova | `tokens.w3c.json` |
| Tailwind v3 / v4 projects | `tailwind.theme.ts` |
| Legacy SCSS codebases | `tokens.scss` |
| Any framework, drop-in CSS | `../tokens.css` |
| Custom importers / AI codegen | `tokens.flat.json` (flat key-value) |
| Runtime theme pickers | `themes.bundle.json` |

## File inventory

```
exports/
├── manifest.json                  ← index + consumer guide (read first)
├── tokens.w3c.json                ← source of truth (W3C DTCG draft)
├── tokens.flat.json               ← flattened key-value form
├── tokens.figma.json              ← Figma Tokens Studio (multi-set w/ themes)
├── tokens.scss                    ← SCSS variables
├── tailwind.theme.ts              ← Tailwind theme.extend
├── themes.bundle.json             ← all themes in one array
├── brand.manifest.json            ← logos, favicons, fonts, voice, mood
├── components.specs.json          ← button, card, input, navbar, hero, product card, etc.
├── typography.specimen.json       ← type scale + rules
├── iconography.json               ← icon style guide + recommended sources
└── README.md                      ← this file
```

Accompanying files outside the folder but part of the system:

- `../tokens.json` — canonical source that generated `tokens.w3c.json` (identical contents)
- `../tokens.css` — CSS custom properties, already wired into `src/app/globals.css`
- `../tokens.ts` — TS constants for JS consumers
- `../theme-loader.ts` — runtime `applyTheme()` / `resetTheme()` API
- `../themes/` — theme JSON split into per-file, with a `registry.ts` consumer

## Importing into Claude Design

1. Zip this folder (`design-system/exports/`).
2. In Claude Design, choose **Import design system → upload bundle**.
3. Claude Design reads `manifest.json`, pulls each listed file, and:
   - Loads `tokens.w3c.json` as the token source of truth.
   - Registers each theme under `themes.bundle.json`.
   - Links logos, favicons, and font URLs from `brand.manifest.json`.
   - Registers component specs from `components.specs.json` so Claude Design can reproduce them in auto-layout.
4. After import, select an active theme from the `themes/` list — it will re-skin every component preview.

Minimum files if Claude Design needs a subset: `tokens.w3c.json`, `themes.bundle.json`, `brand.manifest.json`.

## Round-tripping

Changes made in a downstream tool should export back to W3C DTCG JSON and replace `tokens.w3c.json`. Then run:

```
node design-system/scripts/build-tokens.mjs
```

at the repo root to regenerate `tokens.css` and `tokens.ts`. Commit the result.

## Licensing

Fonts are Google-hosted under SIL OFL 1.1. Logos and product imagery are © Gamma Waves Design Studio — do not redistribute outside first-party surfaces without permission.
