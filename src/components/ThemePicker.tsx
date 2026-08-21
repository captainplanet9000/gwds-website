'use client'

import { useEffect, useState } from 'react'
import { applyTheme, resetTheme, hydrateThemeFromStorage, getToken } from '@design/theme-loader'
import { registry, themeOrder } from '@design/themes/registry'

type Props = {
  /** Compact inline mode (no chrome). Good for embedding in a navbar. */
  inline?: boolean
  onChange?: (themeName: string) => void
}

/** Minimal, unstyled theme picker. Swaps themes at runtime with no re-render
 *  of the React tree — only the CSS custom properties on `:root` change.
 *  Persists the choice to `localStorage['gwds-theme']`. */
export default function ThemePicker({ inline, onChange }: Props) {
  const [active, setActive] = useState<string>('default')

  useEffect(() => {
    // Rehydrate from localStorage on mount in case the SSR bootstrap only
    // set the attribute but the inline style didn't survive reconciliation.
    const hydrated = hydrateThemeFromStorage(registry)
    if (hydrated) setActive(hydrated.name)
  }, [])

  const select = (name: string) => {
    const theme = registry[name]
    if (!theme) return
    applyTheme(theme)
    setActive(name)
    onChange?.(name)
  }

  const reset = () => {
    resetTheme()
    setActive('default')
    onChange?.('default')
  }

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      style={{
        display: 'flex',
        gap: inline ? '0.5rem' : '0.75rem',
        alignItems: 'center',
        padding: inline ? 0 : '1rem',
        border: inline ? 'none' : '1px solid var(--gwds-color-border)',
        borderRadius: 'var(--gwds-radius-md)',
        background: inline ? 'transparent' : 'var(--gwds-color-bg-elevated)',
      }}
    >
      {themeOrder.map((id) => {
        const theme = registry[id as string]
        if (!theme) return null
        const isActive = active === theme.name
        const swatch = (theme.tokens?.['gwds-color-accent'] as string) || 'var(--gwds-color-accent)'
        return (
          <button
            key={id as string}
            role="radio"
            aria-checked={isActive}
            onClick={() => select(theme.name)}
            title={theme.description}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.45rem 0.75rem',
              cursor: 'pointer',
              fontFamily: 'var(--gwds-font-body)',
              fontSize: 'var(--gwds-text-sm)',
              color: isActive ? 'var(--gwds-color-text)' : 'var(--gwds-color-text-secondary)',
              background: isActive ? 'var(--gwds-color-muted)' : 'transparent',
              border: `1px solid ${isActive ? 'var(--gwds-color-border-hover)' : 'var(--gwds-color-border)'}`,
              borderRadius: 'var(--gwds-radius-sm)',
              transition: 'all var(--gwds-duration-base) var(--gwds-ease-out)',
            }}
          >
            <span
              aria-hidden
              style={{
                width: 12,
                height: 12,
                borderRadius: 'var(--gwds-radius-full)',
                background: swatch,
                boxShadow: '0 0 0 1px var(--gwds-color-border)',
              }}
            />
            {theme.name}
          </button>
        )
      })}
      <button
        onClick={reset}
        style={{
          padding: '0.45rem 0.6rem',
          fontFamily: 'var(--gwds-font-body)',
          fontSize: 'var(--gwds-text-sm)',
          color: 'var(--gwds-color-text-muted)',
          background: 'transparent',
          border: '1px solid var(--gwds-color-border)',
          borderRadius: 'var(--gwds-radius-sm)',
          cursor: 'pointer',
        }}
        title="Clear overrides and fall back to tokens.css defaults."
      >
        Reset
      </button>
    </div>
  )
}

/** Tiny read-only panel that shows the currently-resolved values for the most
 *  important tokens. Handy during design reviews. */
export function ThemeInspector() {
  const [, tick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => tick((n) => (n + 1) % 1_000_000), 250)
    return () => clearInterval(id)
  }, [])

  const keys = [
    'gwds-color-accent',
    'gwds-color-bg',
    'gwds-color-card',
    'gwds-color-text',
    'gwds-color-text-secondary',
    'gwds-color-border',
    'gwds-radius-md',
    'gwds-font-display',
  ]

  return (
    <table
      style={{
        borderCollapse: 'collapse',
        fontFamily: 'var(--gwds-font-mono)',
        fontSize: 'var(--gwds-text-sm)',
        color: 'var(--gwds-color-text-secondary)',
        minWidth: 360,
      }}
    >
      <tbody>
        {keys.map((k) => (
          <tr key={k} style={{ borderBottom: '1px solid var(--gwds-color-border)' }}>
            <td style={{ padding: '0.4rem 0.75rem', whiteSpace: 'nowrap' }}>--{k}</td>
            <td style={{ padding: '0.4rem 0.75rem', color: 'var(--gwds-color-text)' }}>{getToken(k)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
