'use client';
import { useState, useEffect } from 'react';
import ThemePicker, { ThemeInspector } from '@/components/ThemePicker'

// NOTE: no `export const metadata` here. This page became a Client Component when it was wired to
// /api/admin/settings, and Next.js forbids exporting metadata from a client component (it must be
// resolved on the server before render). The tab title comes from the admin layout instead.

interface StoreSettings {
  theme_choice: string;
  banner_text: string;
  announcement_bar: string;
  maintenance_pause_message: string;
  sales_enabled: boolean;
  updated_at: string;
}

export default function ThemeAdminPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form fields
  const [themeChoice, setThemeChoice] = useState('default');
  const [bannerText, setBannerText] = useState('');
  const [announcementBar, setAnnouncementBar] = useState('');
  const [maintenanceMessage, setMaintenanceMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch settings');

      if (data.settings) {
        setSettings(data.settings);
        setThemeChoice(data.settings.theme_choice || 'default');
        setBannerText(data.settings.banner_text || '');
        setAnnouncementBar(data.settings.announcement_bar || '');
        setMaintenanceMessage(data.settings.maintenance_pause_message || '');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme_choice: themeChoice,
          banner_text: bannerText,
          announcement_bar: announcementBar,
          maintenance_pause_message: maintenanceMessage,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save settings');

      setSettings(data.settings);
      setSuccess('Settings saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

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
          Theme & Storefront Settings
        </h1>
        <p style={{ color: 'var(--gwds-color-text-secondary)', marginTop: '0.5rem', maxWidth: 640 }}>
          Configure theme, banners, announcements, and maintenance settings. Theme changes are reflected live across the storefront.
        </p>
      </header>

      {/* Settings Panel */}
      {loading ? (
        <div style={{ padding: '2rem', color: 'var(--gwds-color-text-secondary)' }}>Loading settings...</div>
      ) : (
        <section style={{ marginBottom: '3rem', maxWidth: 640 }}>
          <form onSubmit={handleSave} style={{
            background: 'var(--gwds-color-card)',
            border: '1px solid var(--gwds-color-border)',
            borderRadius: 'var(--gwds-radius-md)',
            padding: '2rem',
            boxShadow: 'var(--gwds-shadow-md)',
          }}>
            <h2 style={{
              fontFamily: 'var(--gwds-font-display)',
              fontSize: '1.5rem',
              marginBottom: '1.5rem',
              letterSpacing: '-0.03em',
            }}>
              Storefront Configuration
            </h2>

            {error && (
              <div style={{
                background: 'var(--admin-danger)20',
                border: '1px solid var(--admin-danger)',
                color: 'var(--admin-danger)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--gwds-radius-sm)',
                marginBottom: '1rem',
                fontSize: 'var(--gwds-text-sm)',
              }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{
                background: 'var(--admin-success)20',
                border: '1px solid var(--admin-success)',
                color: 'var(--admin-success)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--gwds-radius-sm)',
                marginBottom: '1rem',
                fontSize: 'var(--gwds-text-sm)',
              }}>
                {success}
              </div>
            )}

            {/* Theme Choice */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontWeight: 'var(--gwds-font-w-semibold)',
                marginBottom: '0.5rem',
                color: 'var(--gwds-color-text)',
              }}>
                Active Theme
              </label>
              <select
                value={themeChoice}
                onChange={(e) => setThemeChoice(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  fontFamily: 'var(--gwds-font-body)',
                  color: 'var(--gwds-color-text)',
                  background: 'var(--gwds-color-bg)',
                  border: '1px solid var(--gwds-color-border)',
                  borderRadius: 'var(--gwds-radius-sm)',
                  fontSize: 'var(--gwds-text-sm)',
                }}
              >
                <option value="default">Default</option>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
              <p style={{ fontSize: 'var(--gwds-text-xs)', color: 'var(--gwds-color-text-muted)', marginTop: '0.25rem' }}>
                Choose the default theme for storefront visitors
              </p>
            </div>

            {/* Banner Text */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontWeight: 'var(--gwds-font-w-semibold)',
                marginBottom: '0.5rem',
                color: 'var(--gwds-color-text)',
              }}>
                Banner Text
              </label>
              <input
                type="text"
                value={bannerText}
                onChange={(e) => setBannerText(e.target.value)}
                placeholder="e.g., Summer sale now live!"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  fontFamily: 'var(--gwds-font-body)',
                  color: 'var(--gwds-color-text)',
                  background: 'var(--gwds-color-bg)',
                  border: '1px solid var(--gwds-color-border)',
                  borderRadius: 'var(--gwds-radius-sm)',
                  fontSize: 'var(--gwds-text-sm)',
                  boxSizing: 'border-box',
                }}
              />
              <p style={{ fontSize: 'var(--gwds-text-xs)', color: 'var(--gwds-color-text-muted)', marginTop: '0.25rem' }}>
                Prominent banner at top of storefront (leave empty to hide)
              </p>
            </div>

            {/* Announcement Bar */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontWeight: 'var(--gwds-font-w-semibold)',
                marginBottom: '0.5rem',
                color: 'var(--gwds-color-text)',
              }}>
                Announcement Bar
              </label>
              <textarea
                value={announcementBar}
                onChange={(e) => setAnnouncementBar(e.target.value)}
                placeholder="e.g., New agents available • Flash sale ends Friday"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  fontFamily: 'var(--gwds-font-body)',
                  color: 'var(--gwds-color-text)',
                  background: 'var(--gwds-color-bg)',
                  border: '1px solid var(--gwds-color-border)',
                  borderRadius: 'var(--gwds-radius-sm)',
                  fontSize: 'var(--gwds-text-sm)',
                  minHeight: '60px',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
              <p style={{ fontSize: 'var(--gwds-text-xs)', color: 'var(--gwds-color-text-muted)', marginTop: '0.25rem' }}>
                Secondary announcement area (leave empty to hide)
              </p>
            </div>

            {/* Maintenance Message */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontWeight: 'var(--gwds-font-w-semibold)',
                marginBottom: '0.5rem',
                color: 'var(--gwds-color-text)',
              }}>
                Maintenance Pause Message
              </label>
              <textarea
                value={maintenanceMessage}
                onChange={(e) => setMaintenanceMessage(e.target.value)}
                placeholder="e.g., We're performing scheduled maintenance. Orders will resume shortly."
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  fontFamily: 'var(--gwds-font-body)',
                  color: 'var(--gwds-color-text)',
                  background: 'var(--gwds-color-bg)',
                  border: '1px solid var(--gwds-color-border)',
                  borderRadius: 'var(--gwds-radius-sm)',
                  fontSize: 'var(--gwds-text-sm)',
                  minHeight: '60px',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
              <p style={{ fontSize: 'var(--gwds-text-xs)', color: 'var(--gwds-color-text-muted)', marginTop: '0.25rem' }}>
                Shown when store sales are paused (leave empty for default message)
              </p>
            </div>

            {/* Sales Enabled Status */}
            <div style={{
              background: 'var(--gwds-color-bg)',
              border: '1px solid var(--gwds-color-border)',
              borderRadius: 'var(--gwds-radius-sm)',
              padding: '0.75rem 1rem',
              marginBottom: '1.5rem',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
              }}>
                <div>
                  <div style={{
                    fontWeight: 'var(--gwds-font-w-semibold)',
                    color: 'var(--gwds-color-text)',
                    marginBottom: '0.25rem',
                  }}>
                    Store Sales Status
                  </div>
                  <p style={{ fontSize: 'var(--gwds-text-xs)', color: 'var(--gwds-color-text-muted)' }}>
                    Controlled by server environment variable (read-only)
                  </p>
                </div>
                <div style={{
                  display: 'inline-block',
                  background: settings?.sales_enabled ? 'var(--admin-success)20' : '#F5A62320',
                  border: `1px solid ${settings?.sales_enabled ? 'var(--admin-success)' : '#F5A623'}`,
                  color: settings?.sales_enabled ? 'var(--admin-success)' : '#F5A623',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--gwds-radius-sm)',
                  fontSize: 'var(--gwds-text-sm)',
                  fontWeight: 'var(--gwds-font-w-semibold)',
                }}>
                  {settings?.sales_enabled ? '✓ Enabled' : '○ Paused'}
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving}
              style={{
                width: '100%',
                padding: '0.75rem 1.5rem',
                fontFamily: 'var(--gwds-font-display)',
                fontWeight: 'var(--gwds-font-w-semibold)',
                color: saving ? 'var(--gwds-color-text-muted)' : 'var(--gwds-color-text-inverse)',
                background: saving ? 'var(--gwds-color-muted)' : 'var(--gwds-color-accent)',
                border: `1px solid ${saving ? 'var(--gwds-color-border)' : 'var(--gwds-color-accent)'}`,
                borderRadius: 'var(--gwds-radius-sm)',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: 'var(--gwds-text-base)',
              }}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>

            {settings?.updated_at && (
              <p style={{
                fontSize: 'var(--gwds-text-xs)',
                color: 'var(--gwds-color-text-muted)',
                marginTop: '1rem',
                textAlign: 'center',
              }}>
                Last updated: {new Date(settings.updated_at).toLocaleString()}
              </p>
            )}
          </form>
        </section>
      )}

      {/* Theme Preview Section */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{
          fontFamily: 'var(--gwds-font-display)',
          fontSize: '2rem',
          marginBottom: '1rem',
          letterSpacing: '-0.03em',
        }}>
          Theme Preview
        </h2>
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
