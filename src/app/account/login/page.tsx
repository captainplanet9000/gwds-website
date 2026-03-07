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
  const { user, loading: authLoading, signIn, signInWithMagicLink } = useAuth();

  const [email, setEmail] = useState(params.get('email') || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/account');
    }
  }, [user, authLoading, router]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      router.push('/account');
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
    return <div style={{ textAlign: 'center', padding: '200px 24px', color: '#555' }}>Loading...</div>;
  }

  if (user) return null;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 8,
    border: '1px solid #1a1a1a',
    background: '#0a0a0a',
    color: '#E8E8E8',
    fontFamily: 'var(--font-body)',
    fontSize: '0.9rem',
    outline: 'none',
    marginBottom: 16,
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: 'var(--font-body)',
    fontSize: '0.78rem',
    fontWeight: 600,
    color: '#888',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', padding: '0 24px' }}>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(1.6rem, 3.5vw, 2rem)',
        fontWeight: 800,
        color: '#E8E8E8',
        letterSpacing: '-0.03em',
        marginBottom: 8,
        textAlign: 'center',
      }}>
        Sign In
      </h1>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '0.9rem',
        color: '#666',
        textAlign: 'center',
        marginBottom: 32,
      }}>
        Access your purchases and downloads
      </p>

      {magicLinkSent ? (
        <div style={{
          padding: 24,
          borderRadius: 10,
          background: '#0a0a0a',
          border: '1px solid #1a1a1a',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>📧</div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#E8E8E8',
            marginBottom: 8,
          }}>
            Check your email
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: '#888', lineHeight: 1.6 }}>
            We sent a login link to <strong style={{ color: '#E8E8E8' }}>{email}</strong>.
            Click the link in the email to sign in.
          </p>
          <button
            onClick={() => setMagicLinkSent(false)}
            style={{
              marginTop: 20,
              background: 'transparent',
              border: 'none',
              color: '#8B5CF6',
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Try a different method
          </button>
        </div>
      ) : (
        <>
          {/* Social login buttons */}
          <SocialAuthButtons />

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            margin: '24px 0',
          }}>
            <div style={{ flex: 1, height: 1, background: '#1a1a1a' }} />
            <span style={{ fontSize: '0.75rem', color: '#555', fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              or
            </span>
            <div style={{ flex: 1, height: 1, background: '#1a1a1a' }} />
          </div>

          {!showEmailForm ? (
            <button
              onClick={() => setShowEmailForm(true)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 8,
                border: '1px solid #1a1a1a',
                background: 'transparent',
                color: '#999',
                fontFamily: 'var(--font-body)',
                fontSize: '0.88rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#ccc'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.color = '#999'; }}
            >
              Sign in with email
            </button>
          ) : (
            <form onSubmit={handlePasswordLogin}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={inputStyle}
                autoFocus
              />

              <label style={labelStyle}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={inputStyle}
              />

              {error && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.82rem',
                  marginBottom: 16,
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 8,
                  border: 'none',
                  background: loading ? '#5b3aa0' : '#8B5CF6',
                  color: '#fff',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s ease',
                  opacity: loading ? 0.7 : 1,
                  marginBottom: 12,
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <button
                type="button"
                onClick={handleMagicLink}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 8,
                  border: '1px solid #1a1a1a',
                  background: 'transparent',
                  color: '#888',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Send magic link instead
              </button>
            </form>
          )}

          <div style={{
            marginTop: 24,
            textAlign: 'center',
            fontFamily: 'var(--font-body)',
            fontSize: '0.85rem',
            color: '#555',
          }}>
            Don&apos;t have an account?{' '}
            <Link href="/account/register" style={{ color: '#8B5CF6', textDecoration: 'none', fontWeight: 600 }}>
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
    <>
      <Navbar />
      <main style={{ background: '#000', minHeight: '100vh', paddingTop: 160, paddingBottom: 80 }}>
        <Suspense fallback={<div style={{ textAlign: 'center', color: '#555', paddingTop: 200 }}>Loading...</div>}>
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
