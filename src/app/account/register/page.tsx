'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SocialAuthButtons from '@/components/SocialAuthButtons';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading: authLoading, signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/account');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const result = await signUp(email, password);
      if (result.needsVerification) {
        setSuccess(true);
      } else {
        router.push('/account');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <>
        <Navbar />
        <main style={{ background: '#000', minHeight: '100vh', paddingTop: 160, paddingBottom: 80 }}>
          <div style={{ textAlign: 'center', color: '#555', paddingTop: 100 }}>Loading...</div>
        </main>
        <Footer />
      </>
    );
  }

  if (user) return null;

  return (
    <>
      <Navbar />
      <main style={{ background: '#000', minHeight: '100vh', paddingTop: 160, paddingBottom: 80 }}>
        <div style={{ maxWidth: 420, margin: '0 auto', padding: '0 24px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.6rem, 3.5vw, 2rem)',
              fontWeight: 800,
              color: '#E8E8E8',
              letterSpacing: '-0.03em',
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            Create Account
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              color: '#666',
              textAlign: 'center',
              marginBottom: 32,
            }}
          >
            Track your purchases and access downloads
          </p>

          {success ? (
            <div
              style={{
                padding: 24,
                borderRadius: 10,
                background: '#0a0a0a',
                border: '1px solid #1a1a1a',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>✉️</div>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#E8E8E8',
                  marginBottom: 8,
                }}
              >
                Check your email
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.85rem',
                  color: '#888',
                  lineHeight: 1.6,
                }}
              >
                We sent a verification link to <strong style={{ color: '#E8E8E8' }}>{email}</strong>.
                Click the link to activate your account.
              </p>
              <Link
                href="/account/login"
                style={{
                  display: 'inline-block',
                  marginTop: 20,
                  color: '#8B5CF6',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.85rem',
                  textDecoration: 'underline',
                }}
              >
                Go to login
              </Link>
            </div>
          ) : (
            <>
              {/* Social login */}
              <SocialAuthButtons />

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '24px 0' }}>
                <div style={{ flex: 1, height: 1, background: '#1a1a1a' }} />
                <span style={{ fontSize: '0.75rem', color: '#555', fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>or create with email</span>
                <div style={{ flex: 1, height: 1, background: '#1a1a1a' }} />
              </div>

              <form onSubmit={handleSubmit}>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#888',
                    marginBottom: 6,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  style={{
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
                  }}
                />

                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#888',
                    marginBottom: 6,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="At least 6 characters"
                  style={{
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
                  }}
                />

                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#888',
                    marginBottom: 6,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{
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
                  }}
                />

                {error && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: 8,
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#ef4444',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.82rem',
                      marginBottom: 16,
                    }}
                  >
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
                  }}
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>

              <div
                style={{
                  marginTop: 24,
                  textAlign: 'center',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.85rem',
                  color: '#555',
                }}
              >
                Already have an account?{' '}
                <Link
                  href="/account/login"
                  style={{ color: '#8B5CF6', textDecoration: 'none', fontWeight: 600 }}
                >
                  Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
