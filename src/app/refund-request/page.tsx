'use client';
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

export default function RefundRequestPage() {
  const [orderId, setOrderId] = useState('');
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const { user, session, loading: authLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !reason || !session?.access_token) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ orderId, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setStatus('success');
      setMessage(data.message);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Something went wrong. Please use the Cival support form.');
    }
  };

  return (
    <div className="cival">
      <Navbar />
      <main className="cival-fade" style={{ maxWidth: 560, margin: '0 auto', padding: '150px 24px 96px' }}>
        <h1 style={{ fontSize: 'clamp(32px,4vw,44px)', letterSpacing: '-0.015em', margin: '0 0 12px' }}>Request a Refund</h1>
        <p style={{ fontSize: 15, color: 'var(--color-neutral-700)', marginBottom: 32, lineHeight: 1.6 }}>
          We process refunds within 48 hours. See our <a href="/refunds" style={{ color: 'var(--color-accent)' }}>refund policy</a> for details.
          Digital downloads are eligible for refund within 30 days if the product doesn&apos;t function as described.
        </p>

        {status === 'success' ? (
          <div className="card" style={{ padding: 32, background: 'var(--color-accent-2-100)', textAlign: 'center', gap: 4 }}>
            <p style={{ fontSize: '1.4rem', marginBottom: 12 }}>✅</p>
            <p style={{ fontSize: 15, color: 'var(--color-accent-2-800)', fontWeight: 600 }}>{message}</p>
            <p style={{ fontSize: 13, color: 'var(--color-neutral-700)', marginTop: 12 }}>Support will follow up at your verified account email.</p>
          </div>
        ) : !authLoading && !user ? (
          <div className="card" style={{ padding: 32, textAlign: 'center' }}>
            <p style={{ marginBottom: 16 }}>Sign in with the verified account that owns the order.</p>
            <Link href="/account/login" className="btn btn-primary">Sign in</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="field">
              <label>Order ID</label>
              <input className="input" value={orderId} onChange={e => setOrderId(e.target.value)} placeholder="From your confirmation email" required />
            </div>
            <div className="field">
              <label>Verified account email</label>
              <input className="input" type="email" value={user?.email || ''} readOnly />
            </div>
            <div className="field">
              <label>Reason for Refund</label>
              <textarea
                className="input"
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={4}
                placeholder="Tell us what happened..."
                style={{ borderRadius: 'var(--radius-md)', resize: 'vertical', paddingTop: 12, paddingBottom: 12 }}
                required
              />
            </div>
            {status === 'error' && (
              <p style={{ color: 'var(--color-accent-2-700)', fontSize: 13 }}>{message}</p>
            )}
            <button type="submit" disabled={status === 'loading'} className="btn btn-primary btn-block">
              {status === 'loading' ? 'Submitting...' : 'Submit Refund Request'}
            </button>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
}
