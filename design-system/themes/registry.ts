/**
 * Theme registry — central catalog for every theme the site can render.
 * Import this on the client to feed a theme picker; import on the server to
 * generate static CSS-in-JS fallbacks per theme at build time.
 */
import defaultTheme from './default.json'
import violetNeon from './violet-neon.json'
import studioLight from './studio-light.json'

import type { Theme } from '../theme-loader'

export const registry: Record<string, Theme> = {
  default: defaultTheme as Theme,
  'violet-neon': violetNeon as Theme,
  'studio-light': studioLight as Theme,
}

export const themeOrder: Array<keyof typeof registry> = [
  'default',
  'violet-neon',
  'studio-light',
]

export function getTheme(name: string): Theme | undefined {
  return registry[name]
}
