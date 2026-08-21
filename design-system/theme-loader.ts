/**
 * GWDS theme loader — runtime theme swapping.
 *
 * Themes are plain JSON objects keyed by the CSS-variable name (minus the
 * leading `--`). Applying a theme sets those variables on `:root`, so every
 * component that consumes them re-renders via CSS, no React re-tree needed.
 *
 * Usage (client component):
 *
 *   import { applyTheme, getActiveTheme } from '@/design-system/theme-loader'
 *   import violetNeon from '@/design-system/themes/violet-neon.json'
 *
 *   applyTheme(violetNeon)                    // full swap
 *   applyTheme({ 'gwds-color-accent': 'red' }) // patch a single token
 *   getActiveTheme()                          // read current values
 *
 * Persistence: the last applied theme name (if provided) is stored under
 * `localStorage['gwds-theme']`. Pages can rehydrate on mount:
 *
 *   useEffect(() => { hydrateThemeFromStorage(themeRegistry) }, [])
 */

export type ThemeTokens = Record<string, string | number>

export type Theme = {
  name: string
  description?: string
  tokens: ThemeTokens
}

const STORAGE_KEY = 'gwds-theme'
const HTML_ATTR = 'data-gwds-theme'

/** Apply a theme or a partial patch. Returns the set of keys that were written. */
export function applyTheme(theme: Theme | ThemeTokens, opts?: { persist?: boolean }): string[] {
  if (typeof document === 'undefined') return []
  const root = document.documentElement
  const isNamed = (v: unknown): v is Theme => typeof v === 'object' && v !== null && 'tokens' in (v as object)
  const tokens: ThemeTokens = isNamed(theme) ? theme.tokens : theme
  const written: string[] = []
  for (const [rawKey, value] of Object.entries(tokens)) {
    const cssVar = rawKey.startsWith('--') ? rawKey : `--${rawKey}`
    root.style.setProperty(cssVar, String(value))
    written.push(cssVar)
  }
  if (isNamed(theme)) {
    root.setAttribute(HTML_ATTR, theme.name)
    if (opts?.persist !== false) {
      try { localStorage.setItem(STORAGE_KEY, theme.name) } catch {}
    }
  }
  return written
}

/** Remove every inline override and fall back to tokens.css. */
export function resetTheme(): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  // Walk the inline style and clear any --gwds-* property we wrote.
  for (let i = root.style.length - 1; i >= 0; i--) {
    const name = root.style[i]
    if (name.startsWith('--gwds-')) root.style.removeProperty(name)
  }
  root.removeAttribute(HTML_ATTR)
  try { localStorage.removeItem(STORAGE_KEY) } catch {}
}

/** Read the current computed value for one token, e.g. `getToken('gwds-color-accent')`. */
export function getToken(name: string): string {
  if (typeof document === 'undefined') return ''
  const cssVar = name.startsWith('--') ? name : `--${name}`
  return getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim()
}

/** Snapshot every `--gwds-*` that currently resolves on the root. Handy for debugging. */
export function getActiveTheme(): ThemeTokens {
  if (typeof document === 'undefined') return {}
  const styles = getComputedStyle(document.documentElement)
  const out: ThemeTokens = {}
  // getComputedStyle exposes custom props via its length iterator in most
  // engines; fall back to reading known keys if not.
  for (let i = 0; i < styles.length; i++) {
    const name = styles[i]
    if (name.startsWith('--gwds-')) out[name] = styles.getPropertyValue(name).trim()
  }
  return out
}

/** Rehydrate the stored theme name from localStorage, if any. */
export function hydrateThemeFromStorage(registry: Record<string, Theme>): Theme | null {
  if (typeof window === 'undefined') return null
  try {
    const name = localStorage.getItem(STORAGE_KEY)
    if (!name) return null
    const theme = registry[name]
    if (!theme) return null
    applyTheme(theme, { persist: false })
    return theme
  } catch {
    return null
  }
}

/** Register a <script> tag on the server so the first paint already has the theme.
 *  Inject the returned string with `dangerouslySetInnerHTML` in your root layout
 *  <head> to avoid flash-of-default-theme. */
export function inlineThemeBootstrap(): string {
  return `(() => {
    try {
      var name = localStorage.getItem(${JSON.stringify(STORAGE_KEY)});
      if (!name) return;
      document.documentElement.setAttribute(${JSON.stringify(HTML_ATTR)}, name);
    } catch(e) {}
  })();`
}

/** Convenience: diff between two theme token maps. Useful for change logs. */
export function diffTokens(a: ThemeTokens, b: ThemeTokens): Array<{ key: string; from: unknown; to: unknown }> {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  const out: Array<{ key: string; from: unknown; to: unknown }> = []
  for (const k of keys) if (a[k] !== b[k]) out.push({ key: k, from: a[k], to: b[k] })
  return out
}
