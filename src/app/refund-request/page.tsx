'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function RefundRequestPage() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !email || !reason) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, email, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setStatus('success');
      setMessage(data.message);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Something went wrong. Email us at gammawavesdesign@gmail.com');
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px', background: '#0a0a0a', border: '1px solid #1a1a1a',
    borderRadius: 8, color: '#E8E8E8', fontSize: '0.88rem', outline: 'none', fontFamily: 'inherit',
  };

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '15vh', minHeight: '100vh', background: '#000', paddingBottom: '10vh' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 24px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: '#E8E8E8', marginBottom: 12 }}>Request a Refund</h1>
          <p style={{ fontSize: '0.88rem', color: '#888', marginBottom: 32, lineHeight: 1.6 }}>
            We process refunds within 48 hours. See our <a href="/refunds" style={{ color: '#8B5CF6' }}>refund policy</a> for details.
            Digital downloads are eligible for refund within 30 days if the product doesn&apos;t function as described.
          </p>

          {status === 'success' ? (
            <div style={{ padding: 32, borderRadius: 12, background: '#10B98110', border: '1px solid #10B98130', textAlign: 'center' }}>
              <p style={{ fontSize: '1.4rem', marginBottom: 12 }}>✅</p>
              <p style={{ fontSize: '0.95rem', color: '#10B981', fontWeight: 600 }}>{message}</p>
              <p style={{ fontSize: '0.82rem', color: '#888', marginTop: 12 }}>Check your email for confirmation.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, fontWeight: 600 }}>Order ID</label>
                <input value={orderId} onChange={e => setOrderId(e.target.value)} placeholder="From your confirmation email" style={inputStyle} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, fontWeight: 600 }}>Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email used at checkout" style={inputStyle} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, fontWeight: 600 }}>Reason for Refund</label>
                <textarea value={reason} onChange={e => setReason(e.target.value)} rows={4} placeholder="Tell us what happened..." style={{ ...inputStyle, resize: 'vertical' }} required />
              </div>
              {status === 'error' && (
                <p style={{ color: '#EF4444', fontSize: '0.82rem' }}>{message}</p>
              )}
              <button type="submit" disabled={status === 'loading'}
                style={{ padding: '14px', borderRadius: 8, border: 'none', background: '#8B5CF6', color: '#fff', fontSize: '0.88rem', fontWeight: 700, cursor: status === 'loading' ? 'not-allowed' : 'pointer', opacity: status === 'loading' ? 0.5 : 1 }}>
                {status === 'loading' ? 'Submitting...' : 'Submit Refund Request'}
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
