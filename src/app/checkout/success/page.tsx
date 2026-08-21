'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

type CheckoutState = 'checking' | 'paid' | 'pending' | 'failed' | 'invalid';

function SuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get('session_id');
  const { session, loading: authLoading } = useAuth();
  const { dispatch } = useCart();
  const [state, setState] = useState<CheckoutState>('checking');
  const [orderId, setOrderId] = useState<string | null>(null);
  const attempts = useRef(0);

  useEffect(() => {
    if (authLoading) return;
    if (!sessionId || !session?.access_token) {
      setState('invalid');
      return;
    }

    let canceled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const check = async () => {
      try {
        const response = await fetch(`/api/orders/lookup?session_id=${encodeURIComponent(sessionId)}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: 'no-store',
        });
        const data = await response.json();
        if (canceled) return;
        if (!response.ok) {
          setState(response.status === 404 && attempts.current < 8 ? 'checking' : 'invalid');
        } else {
          setOrderId(data.orderId || null);
          if (data.paid) {
            dispatch({ type: 'CLEAR_CART' });
            setState('paid');
            return;
          }
          if (['payment_failed', 'expired', 'refunded', 'disputed', 'dispute_lost'].includes(data.status)) {
            setState('failed');
            return;
          }
          setState('pending');
        }
      } catch {
        if (!canceled) setState('pending');
      }

      attempts.current += 1;
      if (!canceled && attempts.current < 10) timer = setTimeout(check, 2000);
    };
    void check();
    return () => { canceled = true; if (timer) clearTimeout(timer); };
  }, [authLoading, dispatch, session?.access_token, sessionId]);

  const paid = state === 'paid';
  const title = paid ? 'Payment confirmed.'
    : state === 'failed' ? 'Payment was not completed.'
      : state === 'invalid' ? 'We could not verify this checkout.'
        : 'Confirming your payment…';
  const message = paid
    ? 'Your licenses are in your account. Create a short-lived download link there whenever you need the verified release files.'
    : state === 'failed'
      ? 'No new access was granted. Check your payment method or return to the store to try again.'
      : state === 'invalid'
        ? 'Sign in with the account used at checkout, or contact support if you were charged.'
        : 'Stripe is finishing the payment and our signed webhook is granting your licenses. This normally takes a few seconds.';

  return (
    <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto', padding: '0 28px' }}>
      <div style={{ width: 72, height: 72, borderRadius: 99, background: paid ? 'var(--color-accent-2-100)' : 'var(--color-surface)', display: 'grid', placeItems: 'center', margin: '0 auto 28px', fontSize: 28 }}>
        {paid ? '✓' : state === 'failed' || state === 'invalid' ? '!' : '…'}
      </div>
      <h1 style={{ fontSize: 'clamp(34px,4.2vw,50px)', letterSpacing: '-0.015em', margin: '0 0 16px' }}>{title}</h1>
      <p style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--color-neutral-800)', margin: '0 auto 28px', maxWidth: '50ch' }}>{message}</p>
      {orderId && <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-neutral-600)', marginBottom: 24 }}>Order {orderId}</p>}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        {paid && <Link href="/account" className="btn btn-primary" style={{ height: 48, padding: '0 24px' }}>Open my account</Link>}
        <Link href={state === 'failed' ? '/checkout' : '/store'} className="btn btn-secondary" style={{ height: 48, padding: '0 24px' }}>
          {state === 'failed' ? 'Try checkout again' : 'Return to store'}
        </Link>
        {(state === 'invalid' || state === 'failed') && <Link href="/contact" className="btn btn-secondary" style={{ height: 48, padding: '0 24px' }}>Contact support</Link>}
      </div>
      <div style={{ marginTop: 34, padding: 24, borderRadius: 'var(--radius-lg)', background: 'var(--color-surface)', textAlign: 'left' }}>
        <strong>Before using the software</strong>
        <p style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--color-neutral-700)', margin: '8px 0 0' }}>
          Read the included setup and security documentation, begin in paper or simulation mode, protect API keys, and never deploy funds you cannot afford to lose. Software templates do not guarantee trading results.
        </p>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="cival">
      <Navbar />
      <main className="cival-fade" style={{ minHeight: '80vh', padding: '160px 0 96px' }}>
        <Suspense fallback={<p style={{ textAlign: 'center' }}>Confirming payment…</p>}><SuccessContent /></Suspense>
      </main>
      <Footer />
    </div>
  );
}
