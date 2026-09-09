'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createBrowserClient, isBrowserSupabaseConfigured } from '@/lib/supabase';

/**
 * PASSWORD RESET — the page a Supabase recovery link lands on.
 *
 * WHY IT EXISTS
 * There was no password reset anywhere in this app: not for the admin owner, and not for paying
 * customers. Someone who bought a $99-$399 product and forgot their password had no route back to
 * their downloads at all, and the only recovery path was an operator editing the row by hand.
 *
 * HOW THE LINK WORKS
 * Supabase recovery links carry their token in the URL FRAGMENT (#access_token=...&type=recovery),
 * which is never sent to the server - so this must be a client component. The Supabase JS client
 * parses that fragment on load and promotes it to a session; from there updateUser({ password })
 * is authorised. If the fragment is missing or stale the session never appears, and we say so
 * plainly rather than showing a form that cannot work.
 */

function ResetPasswordInner() {
  const [ready, setReady] = useState<'checking' | 'ok' | 'invalid'>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isBrowserSupabaseConfigured()) { setReady('invalid'); return; }
    const supabase = createBrowserClient();

    // The client picks the token out of the URL fragment asynchronously, so watch for the session
    // rather than reading it once and assuming.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) setReady('ok');
      else if (event === 'SIGNED_OUT') setReady('invalid');
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady('ok');
      else {
        // Give the fragment a moment to be consumed before declaring the link dead.
        setTimeout(() => {
          supabase.auth.getSession().then(({ data: d2 }) => setReady(d2.session ? 'ok' : 'invalid'));
        }, 1200);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 10) { setError('Use at least 10 characters.'); return; }
    if (password !== confirm) { setError('The two passwords do not match.'); return; }
    setSaving(true);
    try {
      const { error: err } = await createBrowserClient().auth.updateUser({ password });
      if (err) throw err;
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not update the password.');
    } finally {
      setSaving(false);
    }
  }

  const card: React.CSSProperties = {
    maxWidth: 460, margin: '0 auto', background: 'var(--color-surface)',
    border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-lg)', padding: 32,
  };
  const field: React.CSSProperties = {
    width: '100%', height: 46, padding: '0 14px', marginBottom: 14,
    background: 'var(--color-bg)', color: 'var(--color-text)',
    border: '1px solid var(--color-divider)', borderRadius: 8, fontSize: 15,
  };

  return (
    <div className="cival">
      <Navbar />
      <main style={{ minHeight: '70vh', padding: '140px 24px 80px' }}>
        <div style={card}>
          <h1 style={{ fontSize: 26, margin: '0 0 8px' }}>Set a new password</h1>

          {ready === 'checking' && (
            <p style={{ color: 'var(--color-neutral-700)' }}>Checking your reset link…</p>
          )}

          {ready === 'invalid' && (
            <>
              <p style={{ color: 'var(--color-neutral-700)', lineHeight: 1.55 }}>
                This reset link is invalid or has expired. Recovery links can only be used once and
                are short-lived.
              </p>
              <Link href="/account/login" className="btn btn-secondary" style={{ marginTop: 16 }}>
                Back to sign in
              </Link>
            </>
          )}

          {ready === 'ok' && !done && (
            <>
              <p style={{ color: 'var(--color-neutral-700)', margin: '0 0 22px', lineHeight: 1.55 }}>
                Choose a new password. Ten characters or more.
              </p>
              <form onSubmit={onSubmit}>
                <input style={field} type="password" autoComplete="new-password" placeholder="New password"
                       value={password} onChange={(e) => setPassword(e.target.value)} required />
                <input style={field} type="password" autoComplete="new-password" placeholder="Confirm new password"
                       value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
                {error && (
                  <p style={{ color: '#ff8f8f', fontSize: 14, margin: '0 0 14px' }}>{error}</p>
                )}
                <button type="submit" className="btn btn-primary" disabled={saving}
                        style={{ width: '100%', height: 46 }}>
                  {saving ? 'Saving…' : 'Update password'}
                </button>
              </form>
            </>
          )}

          {done && (
            <>
              <p style={{ color: 'var(--color-accent)', lineHeight: 1.55 }}>
                Password updated. You can sign in with it now.
              </p>
              <Link href="/account/login" className="btn btn-primary" style={{ marginTop: 16 }}>
                Sign in
              </Link>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordInner />
    </Suspense>
  );
}
