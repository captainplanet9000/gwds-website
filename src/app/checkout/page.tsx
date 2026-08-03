'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import { track } from '@vercel/analytics';

function money(n: number) {
  return '$' + n.toFixed(2).replace(/\.00$/, '');
}

export default function CheckoutPage() {
  const { state, dispatch, totalPrice } = useCart();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPluginDisclaimer, setAgreedToPluginDisclaimer] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; discount_type: string; discount_value: number } | null>(null);
  const [couponError, setCouponError] = useState('');

  const hasPluginRequiringDashboard = state.items.some(item => item.product.requiresDashboard);
  const hasDashboard = state.items.some(item => item.product.id === 'trading-dashboard-template');
  const showPluginWarning = hasPluginRequiringDashboard && !hasDashboard;

  const discountedTotal = appliedCoupon ? Math.max(0, totalPrice - appliedCoupon.discount) : totalPrice;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), total: totalPrice }),
      });
      const data = await res.json();
      if (data.valid) {
        track('coupon_applied', { code: data.coupon.code, discount_type: data.coupon.discount_type, discount_value: data.coupon.discount_value });
        setAppliedCoupon({ code: data.coupon.code, discount: data.discount, discount_type: data.coupon.discount_type, discount_value: data.coupon.discount_value });
        setCouponError('');
      } else {
        setCouponError(data.error || 'Invalid coupon');
        setAppliedCoupon(null);
      }
    } catch {
      setCouponError('Failed to validate coupon');
    }
    setCouponLoading(false);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handleCheckout = async () => {
    if (!email || !name) { setError('Please fill in all fields'); return; }
    if (!agreedToTerms) { setError('You must agree to the Terms of Service and Trading Disclaimer to proceed'); return; }
    if (hasPluginRequiringDashboard && !agreedToPluginDisclaimer) { setError('You must acknowledge that plugin products require Core Edition'); return; }
    if (state.items.length === 0) { setError('Your cart is empty'); return; }

    setLoading(true);
    setError('');

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: state.items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
          email, name,
          couponCode: appliedCoupon?.code || undefined,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || `Server error (${res.status}) — please try again`);
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (data.free) {
        track('purchase', { value: 0, coupon: couponCode || undefined, items: state.items.length });
        dispatch({ type: 'CLEAR_CART' });
        router.push(`/checkout/success?orderId=${data.orderId}`);
      } else if (data.stripeUrl) {
        track('checkout_start', { value: discountedTotal, items: state.items.length, coupon: couponCode || undefined });
        window.location.href = data.stripeUrl;
      } else if (data.orderId) {
        track('purchase', { value: discountedTotal, items: state.items.length });
        dispatch({ type: 'CLEAR_CART' });
        router.push(`/checkout/success?orderId=${data.orderId}`);
      } else {
        setError(data.error || 'Checkout failed — please try again');
      }
    } catch (err: any) {
      setError(err.name === 'AbortError' ? 'Request timed out — please try again' : 'Network error — please try again');
    } finally {
      setLoading(false);
    }
  };

  const canCheckout = agreedToTerms && (!hasPluginRequiringDashboard || agreedToPluginDisclaimer) && !loading;

  return (
    <div className="cival">
      <Navbar />
      <main className="cival-fade" style={{ maxWidth: 1000, margin: '0 auto', padding: '150px 28px 96px' }}>
        <h1 style={{ fontSize: 'clamp(36px,4.4vw,54px)', letterSpacing: '-0.015em', margin: '0 0 8px' }}>Checkout</h1>
        <p style={{ color: 'var(--color-neutral-700)', margin: '0 0 34px' }}>Files are on the download page the second this clears.</p>

        {showPluginWarning && (
          <div style={{ background: 'var(--color-accent-2-100)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: 32 }}>
            <div style={{ color: 'var(--color-accent-2-900)', fontSize: 15, lineHeight: 1.6, marginBottom: 8 }}>
              Your cart contains add-ons that require Core Edition. They cannot function independently.
            </div>
            <Link href="/store/trading-dashboard-template" style={{ color: 'var(--color-accent-2-700)', fontWeight: 600, fontSize: 14 }}>
              View Core Edition →
            </Link>
          </div>
        )}

        {state.items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: 16 }}>Your cart is empty</p>
            <Link href="/store" style={{ color: 'var(--color-accent)' }}>← Back to store</Link>
          </div>
        ) : (
          <div data-cv-2col style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.35fr) minmax(0,0.95fr)', gap: 36, alignItems: 'start' }}>
            <div style={{ display: 'grid', gap: 18 }}>
              <div className="field"><label>Full name</label><input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Alex Rowan" /></div>
              <div className="field">
                <label>Email for delivery</label>
                <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@fund.xyz" />
                <p style={{ fontSize: 12, color: 'var(--color-neutral-600)', marginTop: 6 }}>Download links will be sent to this email</p>
              </div>

              <div style={{ padding: '16px 20px', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface)' }}>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-neutral-700)' }}>Coupon code</label>
                {appliedCoupon ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--color-accent-2-100)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-accent-2-800)', fontWeight: 700, letterSpacing: '0.05em' }}>{appliedCoupon.code}</span>
                      <span style={{ fontSize: 12.5, color: 'var(--color-accent-2-800)', marginLeft: 8 }}>
                        {appliedCoupon.discount_type === 'percentage' ? `${appliedCoupon.discount_value}% off` : `$${appliedCoupon.discount_value} off`}
                      </span>
                    </div>
                    <button onClick={removeCoupon} className="btn btn-ghost" style={{ height: 30, padding: '0 10px', fontSize: 12.5 }}>Remove</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input className="input" value={couponCode} onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                      onKeyDown={e => e.key === 'Enter' && applyCoupon()} placeholder="Enter code" style={{ flex: 1, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }} />
                    <button onClick={applyCoupon} disabled={couponLoading || !couponCode.trim()} className="btn btn-secondary" style={{ whiteSpace: 'nowrap' }}>
                      {couponLoading ? '…' : 'Apply'}
                    </button>
                  </div>
                )}
                {couponError && <p style={{ fontSize: 12.5, color: 'var(--color-accent-2-700)', marginTop: 8 }}>{couponError}</p>}
              </div>

              <label className="radio" style={{ alignItems: 'flex-start', gap: 11, padding: '16px 20px', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface)' }}>
                <input type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} style={{ marginTop: 3, width: 16, height: 16, accentColor: 'var(--color-accent)' }} />
                <span style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--color-neutral-800)' }}>
                  I agree to the <Link href="/terms">Terms of Service</Link> and acknowledge the <Link href="/disclaimer">Trading Disclaimer</Link>.
                  I understand I am purchasing software source code and architecture, not financial advice or guaranteed returns.
                </span>
              </label>

              {hasPluginRequiringDashboard && (
                <label className="radio" style={{ alignItems: 'flex-start', gap: 11, padding: '16px 20px', border: '1.5px solid var(--color-accent-2-500)', borderRadius: 'var(--radius-lg)', background: 'var(--color-accent-2-100)' }}>
                  <input type="checkbox" checked={agreedToPluginDisclaimer} onChange={e => setAgreedToPluginDisclaimer(e.target.checked)} style={{ marginTop: 3, width: 16, height: 16, accentColor: 'var(--color-accent-2)' }} />
                  <span style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--color-accent-2-900)', fontWeight: 600 }}>
                    I understand that add-on products require Core Edition and cannot function independently.
                  </span>
                </label>
              )}

              {error && <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--color-accent-2-100)', color: 'var(--color-accent-2-800)', fontSize: 13.5 }}>{error}</div>}

              <button onClick={handleCheckout} disabled={!canCheckout} className="btn btn-primary btn-block" style={{ height: 52, fontSize: 15 }}>
                {loading ? 'Processing…' : discountedTotal === 0 ? 'Complete order (free)' : `Pay ${money(discountedTotal)}`}
              </button>
              <p style={{ fontSize: 12, color: 'var(--color-neutral-600)', textAlign: 'center' }}>
                Secure payment via Stripe. Your card details never touch our servers.
              </p>
            </div>

            <aside data-cv-sticky style={{ padding: '30px 28px', borderRadius: 'calc(var(--radius-lg) * 1.15)', background: 'var(--color-surface)', position: 'sticky', top: 100 }}>
              <h3 style={{ fontSize: 20, margin: '0 0 18px' }}>Order</h3>
              {state.items.map(item => (
                <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 14, fontSize: 14, padding: '9px 0', borderBottom: '1px solid var(--color-divider)' }}>
                  <span>{item.product.name}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{money(item.product.price)}</span>
                </div>
              ))}
              <div style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14.5, marginBottom: 9 }}>
                  <span>Subtotal</span>
                  <span style={{ fontFamily: 'var(--font-mono)', textDecoration: appliedCoupon ? 'line-through' : 'none', opacity: appliedCoupon ? 0.6 : 1 }}>{money(totalPrice)}</span>
                </div>
                {appliedCoupon && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--color-accent-2-700)', marginBottom: 9 }}>
                    <span>Discount ({appliedCoupon.code})</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>−{money(appliedCoupon.discount)}</span>
                  </div>
                )}
                <hr className="hr" />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: 18 }}>Total</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 500 }}>{discountedTotal === 0 ? 'FREE' : money(discountedTotal)}</span>
                </div>
              </div>
              <p style={{ fontSize: 12, lineHeight: 1.55, color: 'var(--color-neutral-600)', marginTop: 16 }}>
                Lifetime license, one year of updates, Discord access. Source code — refunds per our <Link href="/refunds">refund policy</Link>.
              </p>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
