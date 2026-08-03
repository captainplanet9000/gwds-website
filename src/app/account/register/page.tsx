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
      <div className="cival">
        <Navbar />
        <main style={{ minHeight: '100vh', paddingTop: 160, paddingBottom: 80 }}>
          <div style={{ textAlign: 'center', color: 'var(--color-neutral-600)', paddingTop: 100 }}>Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="cival">
      <Navbar />
      <main className="cival-fade" style={{ minHeight: '100vh', paddingTop: 160, paddingBottom: 80 }}>
        <div style={{ maxWidth: 420, margin: '0 auto', padding: '0 24px' }}>
          <h1
            style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)',
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            Create Account
          </h1>
          <p
            style={{
              fontSize: '0.9rem',
              color: 'var(--color-neutral-700)',
              textAlign: 'center',
              marginBottom: 32,
            }}
          >
            Track your purchases and access downloads
          </p>

          {success ? (
            <div className="card elev-md" style={{ padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>&#9993;&#65039;</div>
              <h2 style={{ fontSize: '1.3rem', marginBottom: 8 }}>Check your email</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-neutral-700)', lineHeight: 1.6 }}>
                We sent a verification link to <strong style={{ color: 'var(--color-text)' }}>{email}</strong>.
                Click the link to activate your account.
              </p>
              <Link href="/account/login" className="btn btn-ghost" style={{ marginTop: 20 }}>
                Go to login
              </Link>
            </div>
          ) : (
            <>
              {/* Social login */}
              <SocialAuthButtons />

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '24px 0' }}>
                <div style={{ flex: 1, height: 1, background: 'var(--color-divider)' }} />
                <h6 style={{ margin: 0 }}>or create with email</h6>
                <div style={{ flex: 1, height: 1, background: 'var(--color-divider)' }} />
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
                <div className="field">
                  <label>Email</label>
                  <input
                    className="input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                  />
                </div>

                <div className="field">
                  <label>Password</label>
                  <input
                    className="input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="At least 6 characters"
                  />
                </div>

                <div className="field">
                  <label>Confirm Password</label>
                  <input
                    className="input"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-accent-2-100)',
                      color: 'var(--color-accent-2-800)',
                      fontSize: '0.82rem',
                    }}
                  >
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn btn-primary btn-block" style={{ height: 50 }}>
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>

              <div
                style={{
                  marginTop: 24,
                  textAlign: 'center',
                  fontSize: '0.85rem',
                  color: 'var(--color-neutral-700)',
                }}
              >
                Already have an account?{' '}
                <Link href="/account/login" style={{ fontWeight: 600 }}>
                  Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
