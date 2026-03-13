'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: '📊' },
  { name: 'Orders', href: '/admin/orders', icon: '🛒' },
  { name: 'Customers', href: '/admin/customers', icon: '👥' },
  { name: 'Products', href: '/admin/products', icon: '📦' },
  { name: 'Coupons', href: '/admin/coupons', icon: '🎟️' },
  { name: 'Subscribers', href: '/admin/subscribers', icon: '📧' },
  { name: 'Messages', href: '/admin/messages', icon: '💬' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

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
        .skeleton { animation: skeleton-pulse 1.5s ease-in-out infinite; background: #1a1a1a; border-radius: 6px; }
        
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
      
      <div style={{ display: 'flex', minHeight: '100vh', background: '#000', color: '#E8E8E8' }}>
        {/* Mobile overlay */}
        {menuOpen && (
          <div 
            onClick={() => setMenuOpen(false)} 
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99 }} 
          />
        )}
        
        {/* Sidebar */}
        <aside 
          className={`admin-sidebar-wrap ${menuOpen ? 'mobile-open' : ''}`}
          style={{
            width: 240,
            minWidth: 240,
            background: '#0a0a0a',
            borderRight: '1px solid #1a1a1a',
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
          <div style={{ padding: '24px 20px', borderBottom: '1px solid #1a1a1a', flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800, color: '#E8E8E8', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>🌊</div>
              <span>GWDS</span>
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
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 12px',
                    borderRadius: 8,
                    fontSize: '0.85rem',
                    color: isActive ? '#E8E8E8' : '#888',
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
          <div style={{ padding: 16, borderTop: '1px solid #1a1a1a', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#111', borderRadius: 8, border: '1px solid #1a1a1a' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, flexShrink: 0 }}>A</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#E8E8E8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Admin</div>
                <div style={{ fontSize: '0.7rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Superuser</div>
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
            style={{ background: '#0a0a0a', borderBottom: '1px solid #1a1a1a', padding: '12px 32px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}
          >
            <button 
              className="admin-hamburger-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: 'none', border: '1px solid #1a1a1a', borderRadius: 6, color: '#888', padding: '8px 12px', fontSize: '1.1rem', cursor: 'pointer', marginRight: 'auto', display: 'none', alignItems: 'center', justifyContent: 'center' }}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link href="/" style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #1a1a1a', background: 'transparent', color: '#888', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}>
                ← Store
              </Link>
              <button 
                onClick={() => { 
                  sessionStorage.removeItem('gwds-admin'); 
                  document.cookie = 'gwds-admin-session=; Max-Age=0; Path=/'; 
                  window.location.href = '/admin'; 
                }}
                style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #1a1a1a', background: 'transparent', color: '#888', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
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
