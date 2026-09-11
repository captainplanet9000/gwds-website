# GWDS Design System

The live source of truth for gwds.app. One JSON file (`tokens.json`) drives CSS variables, typed TS constants, Tailwind theming, and every runtime theme swap. Edit the JSON, run the build script, and every surface updates together.

## What's in this folder

```
design-system/
├── tokens.json              ← source of truth (W3C Design Tokens format)
├── tokens.css               ← generated CSS custom properties (import in globals.css)
├── tokens.ts                ← generated TS constants (import in components / motion)
├── theme-loader.ts          ← runtime theme swap API (applyTheme, reset, persist, SSR bootstrap)
├── themes/
│   ├── default.json         ← the canonical GWDS dark theme
│   ├── violet-neon.json     ← amplified drop / campaign theme
│   ├── studio-light.json    ← light studio theme for press / editorial
│   └── registry.ts          ← catalog consumed by the theme picker
└── scripts/
    └── build-tokens.mjs     ← regenerates tokens.css + tokens.ts from tokens.json
```

## How tokens flow

```
tokens.json  ──► build-tokens.mjs ──► tokens.css, tokens.ts
      ▲                                    │
      │                                    ▼
 designers / AI                    components, pages, Tailwind

themes/*.json  ──► theme-loader.ts ──► :root inline style (runtime)
```

Primitive tokens (`gwds-color-bg`, `gwds-radius-md`, etc.) are written once into `tokens.css`. Themes under `themes/` are partial maps of *only* the primitives they override — that keeps theme files small and merges predictable.

## Apply it to the store

1. Import the tokens stylesheet in `src/app/globals.css`:

   ```css
   @import '../../design-system/tokens.css';
   /* existing globals.css content below */
   ```

   Existing selectors (`--color-accent`, `--color-text-primary`, etc.) keep working because `tokens.css` aliases them to the new `--gwds-*` names. Migrate selectors file-by-file as you touch each component.

2. Mount the theme-loader bootstrap in `src/app/layout.tsx` to avoid flash-of-default-theme on first paint:

   ```tsx
   import { inlineThemeBootstrap } from '@/design-system/theme-loader'

   export default function RootLayout({ children }) {
     return (
       <html lang="en">
         <head>
           <script dangerouslySetInnerHTML={{ __html: inlineThemeBootstrap() }} />
         </head>
         <body>{children}</body>
       </html>
     )
   }
   ```

3. Expose a theme picker in any client component:

   ```tsx
   'use client'
   import { applyTheme } from '@/design-system/theme-loader'
   import { registry, themeOrder } from '@/design-system/themes/registry'

   export function ThemePicker() {
     return (
       <div style={{ display: 'flex', gap: '0.5rem' }}>
         {themeOrder.map((id) => (
           <button key={id} onClick={() => applyTheme(registry[id])}>
             {registry[id].name}
           </button>
         ))}
       </div>
     )
   }
   ```

## Dynamic upgrades

Three ways the design system can change after deploy, in increasing blast radius:

1. **Per-user preference** — call `applyTheme(theme)` from the theme picker. Persists to `localStorage['gwds-theme']`.
2. **Merchandising push** — the store admin publishes a theme JSON to a CMS or Supabase row. On page load, fetch it and call `applyTheme(json)` — no rebuild needed.
3. **Brand refresh** — edit `tokens.json`, run `node design-system/scripts/build-tokens.mjs`, commit and deploy. Every theme automatically picks up the new primitives.

## Adding a theme

1. Copy `themes/default.json` to `themes/your-theme.json`.
2. Override only the tokens you want to change (the rest fall through to `tokens.css` defaults).
3. Register it in `themes/registry.ts`.
4. Done. It shows up in any picker that reads the registry.

## Keeping outputs in sync

Add to your CI:

```yaml
- run: node design-system/scripts/build-tokens.mjs --check
```

That fails the build if `tokens.css` or `tokens.ts` drift from `tokens.json`. Locally, run the same script without `--check` to regenerate.

## Why W3C Design Tokens format

`tokens.json` is shaped to match the [W3C Design Tokens Community Group draft](https://tr.designtokens.org/format/). That means any design tool that speaks the spec — Figma Tokens Studio, Style Dictionary, Penpot, Supernova, and the major "Cloud Design" platforms — can import and round-trip this file. Designers edit in Figma, export as DTCG JSON, replace `tokens.json`, rerun the build script, ship.
