/**
 * GWDS design tokens shaped for Tailwind CSS.
 *
 * Tailwind v3:
 *   // tailwind.config.ts
 *   import { gwdsTheme } from './design-system/exports/tailwind.theme'
 *   export default {
 *     theme: { extend: gwdsTheme },
 *   }
 *
 * Tailwind v4 (CSS-first):
 *   /* globals.css *\/
 *   @theme {
 *     --color-accent: var(--gwds-color-accent);
 *     --font-display: var(--gwds-font-display);
 *     ...etc — point Tailwind's @theme at the CSS vars so runtime theme swaps work.
 *   }
 */

export const gwdsTheme = {
  colors: {
    accent: 'var(--gwds-color-accent)',
    'accent-warm': 'var(--gwds-color-accent-warm)',
    bg: 'var(--gwds-color-bg)',
    'bg-elevated': 'var(--gwds-color-bg-elevated)',
    card: 'var(--gwds-color-card)',
    muted: 'var(--gwds-color-muted)',
    border: 'var(--gwds-color-border)',
    'border-hover': 'var(--gwds-color-border-hover)',
    text: {
      DEFAULT: 'var(--gwds-color-text)',
      secondary: 'var(--gwds-color-text-secondary)',
      muted: 'var(--gwds-color-text-muted)',
      inverse: 'var(--gwds-color-text-inverse)',
    },
    success: 'var(--gwds-color-success)',
    warning: 'var(--gwds-color-warning)',
    error: 'var(--gwds-color-error)',
    info: 'var(--gwds-color-info)',
  },

  fontFamily: {
    display: ['Syne', 'Space Grotesk', 'sans-serif'],
    body: ['DM Sans', 'Inter', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
  },

  fontSize: {
    xs: '0.64rem',
    sm: '0.8rem',
    base: '1rem',
    lg: '1.25rem',
    xl: '1.563rem',
    '2xl': '1.953rem',
    '3xl': '2.441rem',
    '4xl': '3.052rem',
    '5xl': '3.815rem',
    '6xl': '4.768rem',
    // Fluid (vw-based) sizes retain their units
    'h1-fluid': '10vw',
    'h2-fluid': '6vw',
    'h3-fluid': '4vw',
    'body-fluid': '1.2vw',
  },

  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    black: '800',
  },

  lineHeight: {
    tight: '1.1',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.7',
    loose: '2',
  },

  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.03em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  spacing: {
    0: '0',
    px: '1px',
    '0.5': '0.125rem',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem',
  },

  borderRadius: {
    none: '0',
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },

  borderWidth: {
    0: '0',
    DEFAULT: '1px',
    2: '2px',
    3: '3px',
  },

  boxShadow: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.2)',
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.5)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.6)',
    'glow-sm': '0 0 20px rgba(139, 92, 246, 0.15)',
    'glow-md': '0 0 30px rgba(139, 92, 246, 0.25)',
    'glow-lg': '0 0 40px rgba(139, 92, 246, 0.35)',
  },

  transitionDuration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '400ms',
  },

  transitionTimingFunction: {
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  zIndex: {
    base: '0',
    dropdown: '10',
    sticky: '20',
    fixed: '30',
    'modal-backdrop': '40',
    modal: '50',
    popover: '60',
    tooltip: '70',
    toast: '80',
    max: '999',
  },

  screens: {
    xs: '375px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1600px',
  },

  maxWidth: {
    container: '1600px',
    'container-narrow': '1200px',
  },
} as const

export default gwdsTheme
