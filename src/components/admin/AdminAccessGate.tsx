'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import type { Session } from '@supabase/supabase-js';
import { createBrowserClient } from '@/lib/supabase';

type Mode = 'checking' | 'sign-in' | 'enroll' | 'challenge' | 'authorizing';

export default function AdminAccessGate({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [mode, setMode] = useState<Mode>('checking');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [factorId, setFactorId] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');

  async function authorize(session: Session) {
    setMode('authorizing');
    const response = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const payload = await response.json() as { ok?: boolean; code?: string; error?: string };
    if (response.ok && payload.ok) {
      onAuthenticated();
      return;
    }
    if (payload.code !== 'MFA_REQUIRED') {
      setError(payload.error || 'Admin access was denied.');
      setMode('sign-in');
      return;
    }

    const supabase = createBrowserClient();
    const factors = await supabase.auth.mfa.listFactors();
    if (factors.error) throw factors.error;
    const verified = factors.data.totp.find((factor) => factor.status === 'verified');
    if (verified) {
      setFactorId(verified.id);
      setMode('challenge');
      return;
    }

    for (const stale of factors.data.all.filter((factor) => factor.factor_type === 'totp' && factor.status !== 'verified')) {
      await supabase.auth.mfa.unenroll({ factorId: stale.id });
    }
    const enrollment = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'Cival Admin' });
    if (enrollment.error) throw enrollment.error;
    setFactorId(enrollment.data.id);
    setQrCode(enrollment.data.totp.qr_code);
    setSecret(enrollment.data.totp.secret);
    setMode('enroll');
  }

  useEffect(() => {
    createBrowserClient().auth.getSession()
      .then(({ data }) => data.session ? authorize(data.session) : setMode('sign-in'))
      .catch(() => setMode('sign-in'));
    // The initial session check only runs once; subsequent authorization is explicit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signIn() {
    setError('');
    setMode('checking');
    const supabase = createBrowserClient();
    const result = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (result.error || !result.data.session) {
      setError(result.error?.message || 'Sign-in failed.');
      setMode('sign-in');
      return;
    }
    await authorize(result.data.session);
  }

  async function verifyMfa() {
    setError('');
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the six-digit code from your authenticator app.');
      return;
    }
    const supabase = createBrowserClient();
    const challenge = await supabase.auth.mfa.challenge({ factorId });
    if (challenge.error) throw challenge.error;
    const verified = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.data.id, code });
    if (verified.error) {
      setError(verified.error.message);
      return;
    }
    const session = await supabase.auth.getSession();
    if (!session.data.session) throw new Error('MFA session was not created.');
    await authorize(session.data.session);
  }

  const busy = mode === 'checking' || mode === 'authorizing';
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#020806', color: '#eefcf6', padding: 24 }}>
      <section style={{ width: 'min(440px, 100%)', border: '1px solid rgba(74,222,159,.24)', borderRadius: 18, padding: 28, background: '#06110e', boxShadow: '0 24px 80px rgba(0,0,0,.45)' }}>
        <div style={{ color: '#4ade9f', fontSize: 12, fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase' }}>Cival Systems</div>
        <h1 style={{ fontSize: 28, margin: '10px 0 8px' }}>Operations console</h1>
        <p style={{ color: '#8aa99c', lineHeight: 1.55, margin: '0 0 22px' }}>Owner account and authenticator verification are required. Shared admin passwords are disabled.</p>

        {mode === 'sign-in' && <>
          <label style={labelStyle}>Email</label>
          <input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} style={inputStyle} />
          <label style={labelStyle}>Password</label>
          <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && void signIn()} style={inputStyle} />
          <button type="button" onClick={() => void signIn().catch((reason) => { setError(reason instanceof Error ? reason.message : 'Sign-in failed.'); setMode('sign-in'); })} style={buttonStyle}>Continue securely</button>
        </>}

        {mode === 'enroll' && <>
          <p style={{ color: '#c8e6da', lineHeight: 1.5 }}>Scan this code in an authenticator app, then enter its six-digit code. This is required once for this account.</p>
          {/* Supabase returns a self-contained SVG data URL for this enrollment. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrCode} alt="Authenticator enrollment QR code" width={220} height={220} style={{ display: 'block', margin: '16px auto', background: '#fff', padding: 10, borderRadius: 12 }} />
          <details style={{ color: '#8aa99c', marginBottom: 16 }}><summary>Can’t scan?</summary><code style={{ display: 'block', overflowWrap: 'anywhere', marginTop: 8, color: '#d8f7e9' }}>{secret}</code></details>
          <MfaCode code={code} setCode={setCode} submit={verifyMfa} />
        </>}

        {mode === 'challenge' && <>
          <p style={{ color: '#c8e6da', lineHeight: 1.5 }}>Enter the six-digit code from your authenticator app.</p>
          <MfaCode code={code} setCode={setCode} submit={verifyMfa} />
        </>}

        {busy && <p style={{ color: '#8aa99c' }}>{mode === 'authorizing' ? 'Verifying role and MFA…' : 'Checking account…'}</p>}
        {error && <p role="alert" style={{ color: '#ff9c9c', marginTop: 16 }}>{error}</p>}
      </section>
    </div>
  );
}

function MfaCode({ code, setCode, submit }: { code: string; setCode: (value: string) => void; submit: () => Promise<void> }) {
  return <>
    <label style={labelStyle}>Authenticator code</label>
    <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} onKeyDown={(event) => event.key === 'Enter' && void submit()} style={{ ...inputStyle, fontSize: 24, letterSpacing: '.25em', textAlign: 'center' }} />
    <button type="button" onClick={() => void submit()} style={buttonStyle}>Verify and open console</button>
  </>;
}

const labelStyle: CSSProperties = { display: 'block', fontSize: 12, fontWeight: 700, color: '#a9c9bb', margin: '14px 0 7px' };
const inputStyle: CSSProperties = { width: '100%', background: '#020806', color: '#eefcf6', border: '1px solid #1b4536', borderRadius: 10, padding: '12px 14px', outline: 'none' };
const buttonStyle: CSSProperties = { width: '100%', marginTop: 18, border: 0, borderRadius: 10, padding: '13px 16px', background: '#4ade9f', color: '#02110a', fontWeight: 850, cursor: 'pointer' };
