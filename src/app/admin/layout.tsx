'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = ['Dashboard', 'Products', 'Orders', 'Customers', 'Coupons', 'Subscribers', 'Messages'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const current = navItems.find(item => {
    const href = item === 'Dashboard' ? '/admin' : `/admin/${item.toLowerCase()}`;
    return pathname === href;
  }) || 'Dashboard';

  return (
    <>
      <style>{`
        .admin-nav { padding: 16px 32px; border-bottom: 1px solid #1a1a1a; display: flex; justify-content: space-between; align-items: center; position: relative; }
        .admin-nav-links { display: flex; gap: 24; align-items: center; }
        .admin-nav-right { display: flex; gap: 16; align-items: center; }
        .admin-hamburger { display: none; background: none; border: 1px solid #333; border-radius: 6px; color: #ccc; padding: 6px 10px; font-size: 1.2rem; cursor: pointer; }
        .admin-mobile-menu { display: none; }
        .admin-content { padding: 24px 32px; max-width: 1200px; margin: 0 auto; }
        .admin-stat-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16; margin-bottom: 24; }
        .admin-stat-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16; margin-bottom: 40; }
        .admin-stat-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16; }
        .admin-link-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16; margin-top: 32; }
        .admin-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .admin-table-wrap table { min-width: 600px; }

        @media (max-width: 768px) {
          .admin-nav { padding: 12px 16px; flex-wrap: wrap; }
          .admin-nav-links > a { display: none; }
          .admin-hamburger { display: block; }
          .admin-mobile-menu.open { display: flex; flex-direction: column; gap: 4px; position: absolute; top: 100%; left: 0; right: 0; background: #0a0a0a; border-bottom: 1px solid #1a1a1a; padding: 12px 16px; z-index: 50; }
          .admin-mobile-menu.open a { padding: 10px 12px; border-radius: 8px; font-size: 0.85rem; }
          .admin-mobile-menu.open a:hover { background: #111; }
          .admin-nav-right { gap: 8; }
          .admin-nav-right a { display: none; }
          .admin-content { padding: 16px; }
          .admin-content h1 { font-size: 1.4rem !important; margin-bottom: 20px !important; }
          .admin-stat-grid-4 { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .admin-stat-grid-3 { grid-template-columns: 1fr; gap: 10px; margin-bottom: 24px; }
          .admin-stat-grid-2 { grid-template-columns: 1fr; gap: 10px; }
          .admin-link-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .admin-card { padding: 16px !important; }
          .admin-card .stat-value { font-size: 1.4rem !important; }
        }

        @media (max-width: 480px) {
          .admin-stat-grid-4 { grid-template-columns: repeat(2, 1fr); }
          .admin-link-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      <div style={{ minHeight: '100vh', background: '#000', color: '#E8E8E8' }}>
        <nav className="admin-nav">
          <div className="admin-nav-links">
            <Link href="/admin" style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800, textDecoration: 'none', color: '#E8E8E8', marginRight: 8 }}>GWDS Admin</Link>
            {navItems.map(item => (
              <Link key={item} href={item === 'Dashboard' ? '/admin' : `/admin/${item.toLowerCase()}`}
                style={{ fontSize: '0.78rem', color: item === current ? '#8B5CF6' : '#888', textDecoration: 'none', fontFamily: 'var(--font-body)', fontWeight: item === current ? 700 : 500 }}>{item}</Link>
            ))}
            <button className="admin-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
          <div className="admin-nav-right">
            <Link href="/" style={{ fontSize: '0.72rem', color: '#555', textDecoration: 'none' }}>← Site</Link>
            <button onClick={() => { sessionStorage.removeItem('gwds-admin'); document.cookie = 'gwds-admin-session=; Max-Age=0; Path=/'; window.location.href = '/admin'; }}
              style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #333', background: 'transparent', color: '#888', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}>Logout</button>
          </div>
          <div className={`admin-mobile-menu ${menuOpen ? 'open' : ''}`}>
            {navItems.map(item => (
              <Link key={item} href={item === 'Dashboard' ? '/admin' : `/admin/${item.toLowerCase()}`}
                onClick={() => setMenuOpen(false)}
                style={{ fontSize: '0.85rem', color: item === current ? '#8B5CF6' : '#ccc', textDecoration: 'none', fontFamily: 'var(--font-body)', fontWeight: item === current ? 700 : 400 }}>{item}</Link>
            ))}
          </div>
        </nav>
        <div className="admin-content">
          {children}
        </div>
      </div>
    </>
  );
}
