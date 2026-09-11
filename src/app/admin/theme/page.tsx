import ThemePicker, { ThemeInspector } from '@/components/ThemePicker'

export const metadata = {
  title: 'Theme Preview — Cival Admin',
}

export default function ThemeAdminPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '5vw',
        background: 'var(--gwds-color-bg)',
        color: 'var(--gwds-color-text)',
        fontFamily: 'var(--gwds-font-body)',
      }}
    >
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontFamily: 'var(--gwds-font-display)', fontSize: '3rem', letterSpacing: '-0.03em' }}>
          Theme Preview
        </h1>
        <p style={{ color: 'var(--gwds-color-text-secondary)', marginTop: '0.5rem', maxWidth: 640 }}>
          Pick a theme. Every swatch, button, card, and typographic sample on this page responds to CSS
          variables — no reload. Persists to localStorage so the rest of the store shows the same theme.
        </p>
      </header>

      <section style={{ marginBottom: '3rem' }}>
        <ThemePicker />
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem',
          marginBottom: '4rem',
        }}
      >
        {[
          { label: 'bg', var: 'gwds-color-bg' },
          { label: 'bg elevated', var: 'gwds-color-bg-elevated' },
          { label: 'card', var: 'gwds-color-card' },
          { label: 'muted', var: 'gwds-color-muted' },
          { label: 'accent', var: 'gwds-color-accent' },
          { label: 'accent warm', var: 'gwds-color-accent-warm' },
          { label: 'text', var: 'gwds-color-text' },
          { label: 'text secondary', var: 'gwds-color-text-secondary' },
          { label: 'text muted', var: 'gwds-color-text-muted' },
          { label: 'border', var: 'gwds-color-border' },
        ].map((s) => (
          <div
            key={s.var}
            style={{
              border: '1px solid var(--gwds-color-border)',
              borderRadius: 'var(--gwds-radius-md)',
              overflow: 'hidden',
              background: 'var(--gwds-color-card)',
            }}
          >
            <div style={{ height: 96, background: `var(--${s.var})` }} />
            <div style={{ padding: '0.75rem 1rem' }}>
              <div style={{ fontFamily: 'var(--gwds-font-mono)', fontSize: 'var(--gwds-text-sm)' }}>
                {s.label}
              </div>
              <div
                style={{
                  fontFamily: 'var(--gwds-font-mono)',
                  fontSize: 'var(--gwds-text-xs)',
                  color: 'var(--gwds-color-text-muted)',
                }}
              >
                --{s.var}
              </div>
            </div>
          </div>
        ))}
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem', alignItems: 'start' }}>
        <div>
          <h2
            style={{
              fontFamily: 'var(--gwds-font-display)',
              fontSize: '2rem',
              marginBottom: '1rem',
              letterSpacing: '-0.03em',
            }}
          >
            Component samples
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '2rem' }}>
            <button
              style={{
                padding: '0.75rem 1.5rem',
                fontFamily: 'var(--gwds-font-display)',
                fontWeight: 'var(--gwds-font-w-semibold)',
                color: 'var(--gwds-color-text-inverse)',
                background: 'var(--gwds-color-accent)',
                border: '1px solid var(--gwds-color-accent)',
                borderRadius: 'var(--gwds-radius-sm)',
                cursor: 'pointer',
              }}
            >
              Primary button
            </button>
            <button
              style={{
                padding: '0.75rem 1.5rem',
                fontFamily: 'var(--gwds-font-display)',
                fontWeight: 'var(--gwds-font-w-semibold)',
                color: 'var(--gwds-color-text)',
                background: 'transparent',
                border: '1px solid var(--gwds-color-border)',
                borderRadius: 'var(--gwds-radius-sm)',
                cursor: 'pointer',
              }}
            >
              Secondary button
            </button>
            <input
              placeholder="Email"
              style={{
                padding: '0.75rem 1rem',
                fontFamily: 'var(--gwds-font-body)',
                color: 'var(--gwds-color-text)',
                background: 'var(--gwds-color-card)',
                border: '1px solid var(--gwds-color-border)',
                borderRadius: 'var(--gwds-radius-sm)',
                minWidth: 240,
              }}
            />
          </div>

          <article
            style={{
              padding: '1.5rem',
              background: 'var(--gwds-color-card)',
              border: '1px solid var(--gwds-color-border)',
              borderRadius: 'var(--gwds-radius-md)',
              boxShadow: 'var(--gwds-shadow-md)',
              maxWidth: 520,
              marginBottom: '2rem',
            }}
          >
            <h3 style={{ fontFamily: 'var(--gwds-font-display)', marginBottom: '0.5rem' }}>Card title</h3>
            <p style={{ color: 'var(--gwds-color-text-secondary)', lineHeight: 'var(--gwds-leading-relaxed)' }}>
              Typography, surface, and border all respond to the active theme. Swap themes above and watch
              this panel re-skin in real time — no bundler involved.
            </p>
          </article>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', maxWidth: 720 }}>
            <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1.05 }}>The quick brown fox</h1>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.1 }}>jumps over the lazy dog</h2>
            <p style={{ color: 'var(--gwds-color-text-secondary)', fontSize: 'var(--gwds-text-lg)' }}>
              Body copy in DM Sans — kept stable at 16–20px for legibility while display type scales with the
              viewport.
            </p>
          </div>
        </div>

        <aside>
          <h2
            style={{
              fontFamily: 'var(--gwds-font-display)',
              fontSize: '1.5rem',
              marginBottom: '1rem',
              letterSpacing: '-0.03em',
            }}
          >
            Resolved tokens
          </h2>
          <ThemeInspector />
        </aside>
      </section>
    </main>
  )
}
