'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function SuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get('session_id');
  const [orderId, setOrderId] = useState<string | null>(params.get('orderId'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Look up the real order ID from the Stripe session
    if (sessionId && !orderId) {
      fetch(`/api/orders/lookup?session_id=${sessionId}`)
        .then(r => r.json())
        .then(d => {
          if (d.orderId) setOrderId(d.orderId);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [sessionId, orderId]);

  return (
    <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto', padding: '0 24px' }}>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        style={{ fontSize: '4rem', marginBottom: 24 }}
      >
        ✅
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
          fontWeight: 800, color: '#E8E8E8',
          letterSpacing: '-0.03em', marginBottom: 16,
        }}
      >
        Order Confirmed!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{
          fontSize: '0.95rem', color: '#888', lineHeight: 1.6,
          fontFamily: 'var(--font-body)', marginBottom: 32,
        }}
      >
        Your download links have been sent to your email.
        Check your inbox (and spam folder) for the delivery.
      </motion.p>

      {orderId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            padding: '16px 24px', borderRadius: 10,
            background: '#0a0a0a', border: '1px solid #1a1a1a',
            marginBottom: 32, display: 'inline-block',
          }}
        >
          <span style={{ fontSize: '0.72rem', color: '#555', fontFamily: 'var(--font-body)' }}>Order ID: </span>
          <span style={{ fontSize: '0.82rem', color: '#E8E8E8', fontFamily: 'var(--font-mono, monospace)', fontWeight: 600 }}>
            {orderId.substring(0, 8)}...
          </span>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
      >
        {orderId && (
          <Link href={`/downloads/${orderId}`} style={{ textDecoration: 'none' }}>
            <button style={{
              padding: '14px 28px', borderRadius: 8, border: 'none',
              background: '#8B5CF6', color: '#fff',
              fontFamily: 'var(--font-display)', fontSize: '0.82rem',
              fontWeight: 700, letterSpacing: '0.05em',
              textTransform: 'uppercase', cursor: 'pointer',
            }}>
              Download Files
            </button>
          </Link>
        )}
        {loading && !orderId && (
          <p style={{ fontSize: '0.85rem', color: '#555' }}>Loading your order...</p>
        )}
        <Link href="/store" style={{ textDecoration: 'none' }}>
          <button style={{
            padding: '14px 28px', borderRadius: 8,
            border: '1px solid #333', background: 'transparent',
            color: '#E8E8E8', fontFamily: 'var(--font-display)',
            fontSize: '0.82rem', fontWeight: 600,
            letterSpacing: '0.05em', textTransform: 'uppercase',
            cursor: 'pointer',
          }}>
            Continue Shopping
          </button>
        </Link>
      </motion.div>
    </div>
  );
}

export default function CheckoutSuccess() {
  return (
    <>
      <Navbar />
      <main style={{ background: '#000', minHeight: '100vh', paddingTop: 160, paddingBottom: 80 }}>
        <Suspense fallback={<div style={{ textAlign: 'center', color: '#555', paddingTop: 200 }}>Loading...</div>}>
          <SuccessContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
