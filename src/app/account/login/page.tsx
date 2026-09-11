'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SocialAuthButtons from '@/components/SocialAuthButtons';
import { useAuth } from '@/contexts/AuthContext';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const requestedNext = params.get('next');
  const nextPath = requestedNext?.startsWith('/account') ? requestedNext : '/account';
  const { user, loading: authLoading, signIn, signInWithMagicLink } = useAuth();

  const [email, setEmail] = useState(params.get('email') || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push(nextPath);
    }
  }, [user, authLoading, router, nextPath]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      router.push(nextPath);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) { setError('Enter your email first'); return; }
    setError('');
    setLoading(true);
    try {
      await signInWithMagicLink(email);
      setMagicLinkSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div style={{ textAlign: 'center', padding: '200px 24px', color: 'var(--color-neutral-600)' }}>Loading...</div>;
  }

  if (user) return null;

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', padding: '0 28px' }}>
      <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', letterSpacing: '-0.015em', textAlign: 'center', margin: '0 0 8px' }}>
        Sign In
      </h1>
      <p style={{ fontSize: 14.5, color: 'var(--color-neutral-700)', textAlign: 'center', marginBottom: 32 }}>
        Access your purchases and downloads
      </p>

      {magicLinkSent ? (
        <div className="card" style={{ padding: '32px 28px', textAlign: 'center', gap: 12 }}>
          <div style={{ fontSize: '2.5rem' }}>📧</div>
          <h2 style={{ fontSize: 20, margin: 0 }}>Check your email</h2>
          <p style={{ fontSize: 13.5, color: 'var(--color-neutral-700)', lineHeight: 1.6, margin: 0 }}>
            We sent a login link to <strong style={{ color: 'var(--color-text)' }}>{email}</strong>.
            Click the link in the email to sign in.
          </p>
          <button
            onClick={() => setMagicLinkSent(false)}
            className="btn btn-ghost"
            style={{ margin: '4px auto 0' }}
          >
            Try a different method
          </button>
        </div>
      ) : (
        <>
          {/* Social login buttons */}
          <SocialAuthButtons />

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--color-divider)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-neutral-600)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              or
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--color-divider)' }} />
          </div>

          {!showEmailForm ? (
            <button
              onClick={() => setShowEmailForm(true)}
              className="btn btn-secondary btn-block"
            >
              Sign in with email
            </button>
          ) : (
            <form onSubmit={handlePasswordLogin}>
              <div className="field" style={{ marginBottom: 16 }}>
                <label>Email</label>
                <input
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  autoFocus
                />
              </div>

              <div className="field" style={{ marginBottom: 16 }}>
                <label>Password</label>
                <input
                  type="password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-accent-2-100)',
                  color: 'var(--color-accent-2-800)',
                  fontSize: 13.5,
                  marginBottom: 16,
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-block"
                style={{ marginBottom: 12 }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <button
                type="button"
                onClick={handleMagicLink}
                disabled={loading}
                className="btn btn-secondary btn-block"
              >
                Send magic link instead
              </button>
            </form>
          )}

          <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13.5, color: 'var(--color-neutral-700)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/forgot-password" style={{ fontWeight: 600 }}>
              Forgot your password?
            </Link>
            {' · '}
            <Link href="/account/register" style={{ fontWeight: 600 }}>
              Create one
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="cival">
      <Navbar />
      <main className="cival-fade" style={{ paddingTop: 160, paddingBottom: 96 }}>
        <Suspense fallback={<div style={{ textAlign: 'center', color: 'var(--color-neutral-600)', paddingTop: 200 }}>Loading...</div>}>
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
