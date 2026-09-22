'use client';
import { useState, useEffect } from 'react';


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
    <div
      style={{
        minHeight: 'auto',
        padding: 0,
        background: 'var(--admin-bg)',
        color: 'var(--admin-text)',
        fontFamily: 'var(--font-body)',
      }}
    >
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontFamily: 'var(--font-body)', fontSize: '3rem', letterSpacing: '-0.03em' }}>
          Storefront settings
        </h1>
        <p style={{ color: 'var(--admin-text-muted)', marginTop: '0.5rem', maxWidth: 640 }}>
          Configure theme, banners, announcements, and maintenance settings. Theme changes are reflected live across the storefront.
        </p>
      </header>

      {/* Settings Panel */}
      {loading ? (
        <div style={{ padding: '24px', color: 'var(--admin-text-muted)' }}>Loading settings...</div>
      ) : (
        <section style={{ marginBottom: '3rem', maxWidth: 640 }}>
          <form onSubmit={handleSave} style={{
            background: 'var(--admin-surface)',
            border: '1px solid var(--admin-border)',
            borderRadius: 'var(--gwds-radius-md)',
            padding: '24px',
            boxShadow: 'var(--admin-shadow)',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1.5rem',
              marginBottom: '1.5rem',
              letterSpacing: '-0.03em',
            }}>
              Appearance and announcements
            </h2>

            {error && (
              <div style={{
                background: 'color-mix(in srgb, var(--admin-danger) 13%, transparent)',
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
                background: 'color-mix(in srgb, var(--admin-success) 13%, transparent)',
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
                color: 'var(--admin-text)',
              }}>
                Active Theme
              </label>
              <select
                value={themeChoice}
                onChange={(e) => setThemeChoice(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  fontFamily: 'var(--font-body)',
                  color: 'var(--admin-text)',
                  background: 'var(--admin-bg)',
                  border: '1px solid var(--admin-border)',
                  borderRadius: 'var(--gwds-radius-sm)',
                  fontSize: 'var(--gwds-text-sm)',
                }}
              >
                <option value="default">Default</option>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
              <p style={{ fontSize: 'var(--gwds-text-xs)', color: 'var(--admin-text-muted)', marginTop: '0.25rem' }}>
                Choose the default theme for storefront visitors
              </p>
            </div>

            {/* Banner Text */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontWeight: 'var(--gwds-font-w-semibold)',
                marginBottom: '0.5rem',
                color: 'var(--admin-text)',
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
                  fontFamily: 'var(--font-body)',
                  color: 'var(--admin-text)',
                  background: 'var(--admin-bg)',
                  border: '1px solid var(--admin-border)',
                  borderRadius: 'var(--gwds-radius-sm)',
                  fontSize: 'var(--gwds-text-sm)',
                  boxSizing: 'border-box',
                }}
              />
              <p style={{ fontSize: 'var(--gwds-text-xs)', color: 'var(--admin-text-muted)', marginTop: '0.25rem' }}>
                Prominent banner at top of storefront (leave empty to hide)
              </p>
            </div>

            {/* Announcement Bar */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontWeight: 'var(--gwds-font-w-semibold)',
                marginBottom: '0.5rem',
                color: 'var(--admin-text)',
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
                  fontFamily: 'var(--font-body)',
                  color: 'var(--admin-text)',
                  background: 'var(--admin-bg)',
                  border: '1px solid var(--admin-border)',
                  borderRadius: 'var(--gwds-radius-sm)',
                  fontSize: 'var(--gwds-text-sm)',
                  minHeight: '60px',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
              <p style={{ fontSize: 'var(--gwds-text-xs)', color: 'var(--admin-text-muted)', marginTop: '0.25rem' }}>
                Secondary announcement area (leave empty to hide)
              </p>
            </div>

            {/* Maintenance Message */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontWeight: 'var(--gwds-font-w-semibold)',
                marginBottom: '0.5rem',
                color: 'var(--admin-text)',
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
                  fontFamily: 'var(--font-body)',
                  color: 'var(--admin-text)',
                  background: 'var(--admin-bg)',
                  border: '1px solid var(--admin-border)',
                  borderRadius: 'var(--gwds-radius-sm)',
                  fontSize: 'var(--gwds-text-sm)',
                  minHeight: '60px',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
              <p style={{ fontSize: 'var(--gwds-text-xs)', color: 'var(--admin-text-muted)', marginTop: '0.25rem' }}>
                Shown when store sales are paused (leave empty for default message)
              </p>
            </div>

            {/* Sales Enabled Status */}
            <div style={{
              background: 'var(--admin-bg)',
              border: '1px solid var(--admin-border)',
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
                    color: 'var(--admin-text)',
                    marginBottom: '0.25rem',
                  }}>
                    Store Sales Status
                  </div>
                  <p style={{ fontSize: 'var(--gwds-text-xs)', color: 'var(--admin-text-muted)' }}>
                    Effective source-sales status, including release-readiness restrictions (read-only)
                  </p>
                </div>
                <div style={{
                  display: 'inline-block',
                  background: settings?.sales_enabled ? 'color-mix(in srgb, var(--admin-success) 13%, transparent)' : '#fff8eb',
                  border: `1px solid ${settings?.sales_enabled ? 'var(--admin-success)' : 'var(--admin-warning)'}`,
                  color: settings?.sales_enabled ? 'var(--admin-success)' : 'var(--admin-warning)',
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
                fontFamily: 'var(--font-body)',
                fontWeight: 'var(--gwds-font-w-semibold)',
                color: saving ? 'var(--admin-text-muted)' : 'var(--admin-button-text)',
                background: saving ? 'var(--admin-surface-raised)' : 'var(--admin-accent)',
                border: `1px solid ${saving ? 'var(--admin-border)' : 'var(--admin-accent)'}`,
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
                color: 'var(--admin-text-muted)',
                marginTop: '1rem',
                textAlign: 'center',
              }}>
                Last updated: {new Date(settings.updated_at).toLocaleString()}
              </p>
            )}
          </form>
        </section>
      )}

      <section>
        <h2>Review your storefront</h2>
        <p style={{ color: 'var(--admin-text-muted)', marginBottom: 12 }}>After saving, open the storefront to check the appearance and announcements customers will see.</p>
        <a href="/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--admin-accent)' }}>Open storefront ↗</a>
      </section>
    </div>
  );
}
