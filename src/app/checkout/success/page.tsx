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
    if (sessionId && !orderId) {
      fetch(`/api/orders/lookup?session_id=${sessionId}`)
        .then(r => r.json())
        .then(d => { if (d.orderId) setOrderId(d.orderId); setLoading(false); })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [sessionId, orderId]);

  return (
    <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto', padding: '0 28px' }}>
      <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', duration: 0.6 }}
        style={{ width: 72, height: 72, borderRadius: 99, background: 'var(--color-accent-2-100)', display: 'grid', placeItems: 'center', margin: '0 auto 28px' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-2-700)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
      </motion.div>

      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        style={{ fontSize: 'clamp(34px,4.2vw,50px)', letterSpacing: '-0.015em', margin: '0 0 16px' }}>
        You own it.
      </motion.h1>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--color-neutral-800)', margin: '0 auto 32px', maxWidth: '46ch' }}>
        Download links are in your inbox and on your account page. Run QUICK-START, connect a Hyperliquid key, and your first agent is live.
      </motion.p>

      {orderId && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          style={{ padding: '14px 22px', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface)', marginBottom: 28, display: 'inline-block' }}>
          <span style={{ fontSize: 12, color: 'var(--color-neutral-600)' }}>Order ID: </span>
          <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{orderId.substring(0, 8)}...</span>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        {orderId && <Link href={`/downloads/${orderId}`} className="btn btn-primary" style={{ height: 48, padding: '0 24px' }}>Download files</Link>}
        {loading && !orderId && <p style={{ fontSize: 14, color: 'var(--color-neutral-600)' }}>Loading your order…</p>}
        <Link href="/store" className="btn btn-secondary" style={{ height: 48, padding: '0 24px' }}>Continue shopping</Link>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        style={{ marginTop: 32, padding: 26, borderRadius: 'calc(var(--radius-lg) * 1.15)', background: 'var(--color-accent-100)', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, margin: '0 0 8px', color: 'var(--color-accent-900)' }}>Access your downloads anytime</h2>
        <p style={{ fontSize: 14, color: 'var(--color-accent-800)', lineHeight: 1.6, margin: '0 0 16px' }}>
          Create a free account to view purchase history and regenerate download links.
        </p>
        <Link href="/account/register" className="btn btn-secondary" style={{ height: 42, padding: '0 20px' }}>Create account</Link>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
        style={{ marginTop: 16, padding: 32, borderRadius: 'calc(var(--radius-lg) * 1.15)', background: 'var(--color-surface)', textAlign: 'left' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, margin: '0 0 20px' }}>What to do next</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            'Click "Download Files" above to get your zip file',
            'Extract it to a folder on your computer',
            'Double-click QUICK-START.bat (Windows) or QUICK-START.command (Mac)',
            'The Setup Wizard will guide you through connecting your API keys',
          ].map((text, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ minWidth: 24, height: 24, borderRadius: 99, background: 'var(--color-accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                {i + 1}
              </span>
              <span style={{ fontSize: 14, color: 'var(--color-neutral-800)' }}>{text}</span>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 16, fontSize: 13, color: 'var(--color-neutral-700)', lineHeight: 1.6, padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--color-accent-100)' }}>
          For plugins and extensions, see the included README for install instructions.
        </p>
        <p style={{ marginTop: 16, fontSize: 12.5, color: 'var(--color-neutral-600)', lineHeight: 1.5 }}>
          Need help? Email <a href="mailto:gammawavesdesign@gmail.com">gammawavesdesign@gmail.com</a>
        </p>
      </motion.div>
    </div>
  );
}

export default function CheckoutSuccess() {
  return (
    <div className="cival">
      <Navbar />
      <main style={{ paddingTop: 160, paddingBottom: 80 }}>
        <Suspense fallback={<div style={{ textAlign: 'center', color: 'var(--color-neutral-600)', paddingTop: 200 }}>Loading...</div>}>
          <SuccessContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
