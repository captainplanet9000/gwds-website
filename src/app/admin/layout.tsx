'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: '📊' },
  { name: 'Analytics', href: '/admin/analytics', icon: '📈' },
  { name: 'Orders', href: '/admin/orders', icon: '🛒' },
  { name: 'Customers', href: '/admin/customers', icon: '👥' },
  { name: 'Products', href: '/admin/products', icon: '📦' },
  { name: 'Coupons', href: '/admin/coupons', icon: '🎟️' },
  { name: 'Subscribers', href: '/admin/subscribers', icon: '📧' },
  { name: 'Messages', href: '/admin/messages', icon: '💬' },
  { name: 'Artifacts', href: '/admin/artifacts', icon: '📀' },
  { name: 'Entitlements', href: '/admin/entitlements', icon: '🔑' },
  { name: 'Refunds', href: '/admin/refunds', icon: '↩️' },
  { name: 'Audit Log', href: '/admin/audit', icon: '🧾' },
  { name: 'Store Settings', href: '/admin/theme', icon: '🎨' },
  { name: 'Hosting Ops', href: '/admin/hosting', icon: '⚙️' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authState, setAuthState] = useState<'checking' | 'authenticated' | 'guest'>('checking');
  const [admin, setAdmin] = useState<{ email: string; role: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/auth', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) {
          setAdmin(null);
          setAuthState('guest');
          return;
        }
        const body = await response.json();
        setAdmin(body.admin || null);
        setAuthState('authenticated');
      })
      .catch(() => setAuthState('guest'));
  }, [pathname]);

  useEffect(() => {
    if (authState === 'guest' && pathname !== '/admin') window.location.replace('/admin');
  }, [authState, pathname]);

  if (authState === 'checking') {
    return <div style={{ minHeight: '100vh', background: '#000', color: 'var(--admin-text-muted)', display: 'grid', placeItems: 'center' }}>Checking admin session...</div>;
  }
  if (authState === 'guest') return pathname === '/admin' ? <>{children}</> : null;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        
        /* Utility Classes */
        .admin-stat-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .admin-stat-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .admin-stat-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .admin-link-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .admin-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .admin-table-wrap table { min-width: 600px; }
        
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .skeleton { animation: skeleton-pulse 1.5s ease-in-out infinite; background: var(--admin-border); border-radius: 6px; }
        
        /* Mobile */
        @media (max-width: 768px) {
          .admin-sidebar-wrap { transform: translateX(-240px) !important; }
          .admin-sidebar-wrap.mobile-open { transform: translateX(0) !important; box-shadow: 4px 0 24px rgba(0,0,0,0.5); }
          .admin-main-wrap { margin-left: 0 !important; }
          .admin-hamburger-btn { display: flex !important; }
          .admin-topbar-inner { padding: 12px 16px !important; }
          .admin-content-inner { padding: 20px 16px !important; }
          .admin-stat-grid-4 { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .admin-stat-grid-3 { grid-template-columns: 1fr; gap: 12px; }
          .admin-stat-grid-2 { grid-template-columns: 1fr; gap: 12px; }
          .admin-link-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
        }
        @media (max-width: 480px) {
          .admin-stat-grid-4 { grid-template-columns: 1fr; }
          .admin-link-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      
      <div style={{ display: 'flex', minHeight: '100vh', background: '#000', color: 'var(--admin-text)' }}>
        {/* Mobile overlay */}
        {menuOpen && (
          <div 
            onClick={() => setMenuOpen(false)} 
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99 }} 
          />
        )}
        
        {/* Sidebar */}
        <aside
          className={`admin-sidebar admin-sidebar-wrap ${menuOpen ? 'mobile-open' : ''}`}
          style={{
            width: 240,
            minWidth: 240,
            background: 'var(--admin-surface)',
            borderRight: '1px solid var(--admin-border)',
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            overflow: 'hidden',
            transition: 'transform 0.2s ease',
          }}
        >
          {/* Brand */}
          <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--admin-border)', flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--admin-text)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, var(--admin-accent), var(--admin-accent))', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>🌊</div>
              <span>Cival</span>
            </div>
          </div>
          
          {/* Nav Links */}
          <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto', minHeight: 0 }}>
            {navItems.map(item => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.name}
                  href={item.href}
                  className="admin-nav-link"
                  data-active={isActive ? "true" : "false"}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 12px',
                    borderRadius: 8,
                    fontSize: '0.85rem',
                    color: isActive ? 'var(--admin-text)' : 'var(--admin-text-muted)',
                    textDecoration: 'none',
                    marginBottom: 4,
                    fontFamily: 'var(--font-body)',
                    fontWeight: isActive ? 600 : 500,
                    background: isActive ? 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(236,72,153,0.12))' : 'transparent',
                    boxShadow: isActive ? '0 0 0 1px rgba(139,92,246,0.25)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: '1.1rem', width: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
          
          {/* User Pill */}
          <div style={{ padding: 16, borderTop: '1px solid var(--admin-border)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--admin-surface-raised)', borderRadius: 8, border: '1px solid var(--admin-border)' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #4ade9f, #14b8a6)', color: '#03110b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, flexShrink: 0 }}>{admin?.email?.slice(0, 1).toUpperCase() || 'A'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--admin-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{admin?.email || 'Admin'}</div>
                <div style={{ fontSize: '0.7rem', color: '#6c8f80', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{admin?.role || 'admin'}</div>
              </div>
            </div>
          </div>
        </aside>
        
        {/* Main */}
        <main 
          className="admin-main-wrap"
          style={{ flex: 1, marginLeft: 240, minHeight: '100vh', display: 'flex', flexDirection: 'column', transition: 'margin-left 0.2s ease' }}
        >
          {/* Top Bar */}
          <div 
            className="admin-topbar-inner"
            style={{ background: 'var(--admin-surface)', borderBottom: '1px solid var(--admin-border)', padding: '12px 32px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}
          >
            <button 
              className="admin-hamburger-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: 'none', border: '1px solid var(--admin-border)', borderRadius: 6, color: 'var(--admin-text-muted)', padding: '8px 12px', fontSize: '1.1rem', cursor: 'pointer', marginRight: 'auto', display: 'none', alignItems: 'center', justifyContent: 'center' }}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link href="/" style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid var(--admin-border)', background: 'transparent', color: 'var(--admin-text-muted)', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}>
                ← Store
              </Link>
              <button 
                onClick={async () => {
                  await fetch('/api/admin/auth', { method: 'DELETE' }).catch(() => undefined);
                  await signOut().catch(() => undefined);
                  router.replace('/admin');
                  router.refresh();
                }}
                style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid var(--admin-border)', background: 'transparent', color: 'var(--admin-text-muted)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Logout
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="admin-content-inner" style={{ flex: 1, padding: 32, maxWidth: 1400, width: '100%', margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
