'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { getProduct } from '@/lib/products';

interface DownloadInfo {
  id: string;
  product_id: string;
  download_token: string;
  expires_at: string;
  downloaded_count: number;
  max_downloads: number;
}

interface OrderItemInfo {
  id: string;
  product_id: string;
  quantity: number;
  price_cents: number;
  downloads: DownloadInfo[];
}

interface OrderInfo {
  id: string;
  customer_email: string;
  customer_name: string | null;
  total_cents: number;
  status: string;
  created_at: string;
  items: OrderItemInfo[];
}

export default function AccountPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut, session } = useAuth();

  const [orders, setOrders] = useState<OrderInfo[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState('');
  const [regenerating, setRegenerating] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!session?.access_token) return;
    try {
      const res = await fetch('/api/account/orders', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) throw new Error('Failed to load orders');
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingOrders(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/account/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && session) {
      fetchOrders();
    }
  }, [user, session, fetchOrders]);

  const handleRegenerateDownload = async (orderId: string, productId: string) => {
    const key = `${orderId}-${productId}`;
    setRegenerating(key);
    try {
      const res = await fetch('/api/account/regenerate-download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ orderId, productId }),
      });
      if (!res.ok) throw new Error('Failed to regenerate download');
      await fetchOrders();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRegenerating(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

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

  if (!user) return null;

  return (
    <div className="cival">
      <Navbar />
      <main className="cival-fade" style={{ minHeight: '100vh', paddingTop: 140, paddingBottom: 80 }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 40,
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)',
                  letterSpacing: '-0.015em',
                  marginBottom: 4,
                }}
              >
                Your Account
              </h1>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  color: 'var(--color-neutral-600)',
                }}
              >
                {user.email}
              </p>
            </div>
            <button onClick={handleSignOut} className="btn btn-secondary" style={{ height: 40, fontSize: '0.82rem' }}>
              Sign Out
            </button>
          </div>

          {/* Purchases */}
          <section style={{ marginBottom: 48 }}>
            <h2
              style={{
                fontSize: '1.3rem',
                marginBottom: 20,
                paddingBottom: 12,
                borderBottom: '1px solid var(--color-divider)',
              }}
            >
              Your Purchases
            </h2>

            {loadingOrders ? (
              <div style={{ textAlign: 'center', color: 'var(--color-neutral-600)', padding: '40px 0' }}>
                Loading your orders...
              </div>
            ) : error ? (
              <div
                style={{
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-accent-2-100)',
                  color: 'var(--color-accent-2-800)',
                  fontSize: '0.85rem',
                }}
              >
                {error}
              </div>
            ) : orders.length === 0 ? (
              <div
                style={{
                  padding: 40,
                  borderRadius: 'calc(var(--radius-lg) * 1.15)',
                  background: 'var(--color-surface)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>🛒</div>
                <p
                  style={{
                    fontSize: '0.9rem',
                    color: 'var(--color-neutral-600)',
                    marginBottom: 20,
                  }}
                >
                  No purchases yet
                </p>
                <Link href="/store" className="btn btn-primary">
                  Browse Store
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {orders.map((order) => (
                  <div
                    key={order.id}
                    style={{
                      padding: 24,
                      borderRadius: 'calc(var(--radius-lg) * 1.15)',
                      background: 'var(--color-surface)',
                    }}
                  >
                    {/* Order header */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 16,
                        flexWrap: 'wrap',
                        gap: 8,
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.72rem',
                            color: 'var(--color-neutral-600)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                          }}
                        >
                          {formatDate(order.created_at)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            color: 'var(--color-text)',
                          }}
                        >
                          {formatCurrency(order.total_cents)}
                        </span>
                        <span className={order.status === 'completed' ? 'tag tag-accent-2' : 'tag tag-neutral'}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Order items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {order.items.map((item) => {
                        const product = getProduct(item.product_id);
                        const download = item.downloads?.[0];
                        const expired = download ? isExpired(download.expires_at) : false;
                        const maxedOut = download
                          ? download.downloaded_count >= download.max_downloads
                          : false;
                        const canDownload = download && !expired && !maxedOut;
                        const regKey = `${order.id}-${item.product_id}`;

                        return (
                          <div
                            key={item.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '12px 16px',
                              borderRadius: 'var(--radius-md)',
                              background: 'var(--color-neutral-100)',
                              border: '1px solid var(--color-divider)',
                              flexWrap: 'wrap',
                              gap: 12,
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 200 }}>
                              <div
                                style={{
                                  fontSize: '0.9rem',
                                  fontWeight: 600,
                                  color: 'var(--color-text)',
                                  marginBottom: 4,
                                }}
                              >
                                {product?.emoji || '📦'} {product?.name || item.product_id}
                              </div>
                              {download && (
                                <div
                                  style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.72rem',
                                    color: 'var(--color-neutral-600)',
                                  }}
                                >
                                  Downloaded {download.downloaded_count}/{download.max_downloads} times
                                  {expired && (
                                    <span style={{ color: 'var(--color-accent-2-700)', marginLeft: 8 }}>
                                      • Link expired
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            <div style={{ display: 'flex', gap: 8 }}>
                              {canDownload ? (
                                <a
                                  href={`/api/downloads/${order.id}/${item.product_id}?token=${download.download_token}`}
                                  className="btn btn-primary"
                                  style={{ height: 38, fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                                >
                                  Download
                                </a>
                              ) : (
                                <button
                                  onClick={() => handleRegenerateDownload(order.id, item.product_id)}
                                  disabled={regenerating === regKey}
                                  className="btn btn-secondary"
                                  style={{
                                    height: 38,
                                    fontSize: '0.78rem',
                                    color: 'var(--color-accent)',
                                    borderColor: 'var(--color-accent)',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {regenerating === regKey ? 'Regenerating...' : 'New Download Link'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Browse more */}
          {orders.length > 0 && (
            <div style={{ textAlign: 'center' }}>
              <Link href="/store" className="btn btn-secondary">
                Browse More Products
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
