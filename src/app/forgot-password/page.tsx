'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createBrowserClient, isBrowserSupabaseConfigured } from '@/lib/supabase';

/**
 * FORGOT PASSWORD — requests a Supabase recovery email.
 *
 * The response is deliberately identical whether or not the address has an account. Confirming
 * that an email is registered turns this form into a customer-list oracle, which matters more here
 * than usual because the customer list is the buyer list for a paid product.
 *
 * redirectTo must also be present in the Supabase project's URL allow-list
 * (Authentication -> URL Configuration). If it is not, Supabase silently falls back to the project
 * Site URL - which is how recovery links ended up pointing at http://localhost:3000.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!isBrowserSupabaseConfigured()) { setError('Accounts are unavailable right now.'); return; }
    setBusy(true);
    try {
      const site = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      await createBrowserClient().auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${site}/reset-password`,
      });
      // Always report success - see the note above about not leaking who has an account.
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setBusy(false);
    }
  }

  const card: React.CSSProperties = {
    maxWidth: 460, margin: '0 auto', background: 'var(--color-surface)',
    border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-lg)', padding: 32,
  };

  return (
    <div className="cival">
      <Navbar />
      <main style={{ minHeight: '70vh', padding: '140px 24px 80px' }}>
        <div style={card}>
          <h1 style={{ fontSize: 26, margin: '0 0 10px' }}>Reset your password</h1>
          {sent ? (
            <>
              <p style={{ color: 'var(--color-neutral-700)', lineHeight: 1.55 }}>
                If an account exists for that address, a reset link is on its way. The link expires
                shortly and can only be used once.
              </p>
              <Link href="/account/login" className="btn btn-secondary" style={{ marginTop: 16 }}>
                Back to sign in
              </Link>
            </>
          ) : (
            <>
              <p style={{ color: 'var(--color-neutral-700)', margin: '0 0 22px', lineHeight: 1.55 }}>
                Enter the email you bought with and we will send a reset link.
              </p>
              <form onSubmit={onSubmit}>
                <input
                  type="email" required autoComplete="email" placeholder="you@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%', height: 46, padding: '0 14px', marginBottom: 14,
                    background: 'var(--color-bg)', color: 'var(--color-text)',
                    border: '1px solid var(--color-divider)', borderRadius: 8, fontSize: 15,
                  }}
                />
                {error && <p style={{ color: '#ff8f8f', fontSize: 14, margin: '0 0 14px' }}>{error}</p>}
                <button type="submit" className="btn btn-primary" disabled={busy}
                        style={{ width: '100%', height: 46 }}>
                  {busy ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
