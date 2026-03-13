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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        .admin-layout { display: flex; min-height: 100vh; background: #000; color: #E8E8E8; }
        
        /* Sidebar */
        .admin-sidebar { 
          width: 240px; 
          background: #0a0a0a; 
          border-right: 1px solid #1a1a1a; 
          display: flex; 
          flex-direction: column;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          z-index: 100;
          transition: transform 0.2s ease;
        }
        .admin-sidebar.collapsed { transform: translateX(-240px); }
        
        .admin-sidebar-header { 
          padding: 24px 20px; 
          border-bottom: 1px solid #1a1a1a;
        }
        .admin-brand { 
          font-family: var(--font-display); 
          font-size: 1.1rem; 
          font-weight: 800; 
          color: #E8E8E8;
          letter-spacing: -0.02em;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .admin-brand-icon {
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #8B5CF6, #EC4899);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
        }
        
        .admin-nav { 
          flex: 1; 
          padding: 16px 12px;
          overflow-y: auto;
        }
        .admin-nav-item { 
          display: flex; 
          align-items: center; 
          gap: 12px; 
          padding: 10px 12px; 
          border-radius: 8px; 
          font-size: 0.85rem; 
          color: #888; 
          text-decoration: none;
          margin-bottom: 4px;
          transition: all 0.15s ease;
          font-family: var(--font-body);
          font-weight: 500;
        }
        .admin-nav-item:hover { 
          background: #111; 
          color: #E8E8E8;
        }
        .admin-nav-item.active { 
          background: linear-gradient(135deg, #8B5CF620, #EC489920);
          color: #E8E8E8;
          font-weight: 600;
          box-shadow: 0 0 0 1px #8B5CF640;
        }
        .admin-nav-icon { 
          font-size: 1.1rem; 
          width: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .admin-sidebar-footer {
          padding: 16px;
          border-top: 1px solid #1a1a1a;
        }
        .admin-user-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          background: #111;
          border-radius: 8px;
          border: 1px solid #1a1a1a;
        }
        .admin-user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8B5CF6, #EC4899);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 700;
        }
        .admin-user-info {
          flex: 1;
          min-width: 0;
        }
        .admin-user-name {
          font-size: 0.82rem;
          font-weight: 600;
          color: #E8E8E8;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .admin-user-role {
          font-size: 0.7rem;
          color: #555;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        /* Main Content */
        .admin-main { 
          flex: 1; 
          margin-left: 240px;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          transition: margin-left 0.2s ease;
        }
        .admin-main.expanded { margin-left: 0; }
        
        .admin-topbar {
          background: #0a0a0a;
          border-bottom: 1px solid #1a1a1a;
          padding: 16px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .admin-topbar-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .admin-hamburger {
          background: none;
          border: 1px solid #1a1a1a;
          border-radius: 6px;
          color: #888;
          padding: 8px 12px;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.15s ease;
          display: none;
        }
        .admin-hamburger:hover {
          background: #111;
          color: #E8E8E8;
          border-color: #333;
        }
        .admin-topbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .admin-btn {
          padding: 8px 16px;
          border-radius: 6px;
          border: 1px solid #1a1a1a;
          background: transparent;
          color: #888;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          text-decoration: none;
          display: inline-block;
        }
        .admin-btn:hover {
          background: #111;
          color: #E8E8E8;
          border-color: #333;
        }
        .admin-btn-primary {
          background: linear-gradient(135deg, #8B5CF6, #EC4899);
          border: none;
          color: #fff;
        }
        .admin-btn-primary:hover {
          background: linear-gradient(135deg, #9D6EFF, #F768AA);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }
        
        .admin-content { 
          flex: 1;
          padding: 32px;
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
        }
        
        /* Utility Classes */
        .admin-stat-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .admin-stat-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .admin-stat-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .admin-link-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .admin-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .admin-table-wrap table { min-width: 600px; }
        
        /* Mobile */
        @media (max-width: 768px) {
          .admin-sidebar { 
            transform: translateX(-240px);
          }
          .admin-sidebar.mobile-open {
            transform: translateX(0);
          }
          .admin-main {
            margin-left: 0;
          }
          .admin-hamburger { display: block; }
          .admin-topbar { padding: 12px 16px; }
          .admin-content { padding: 20px 16px; }
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
      
      <div className="admin-layout">
        {/* Sidebar */}
        <aside className={`admin-sidebar ${menuOpen ? 'mobile-open' : ''}`}>
          <div className="admin-sidebar-header">
            <div className="admin-brand">
              <div className="admin-brand-icon">🌊</div>
              <span>GWDS</span>
            </div>
          </div>
          
          <nav className="admin-nav">
            {navItems.map(item => (
              <Link 
                key={item.name}
                href={item.href}
                className={`admin-nav-item ${pathname === item.href ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <span className="admin-nav-icon">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
          
          <div className="admin-sidebar-footer">
            <div className="admin-user-pill">
              <div className="admin-user-avatar">A</div>
              <div className="admin-user-info">
                <div className="admin-user-name">Admin</div>
                <div className="admin-user-role">Superuser</div>
              </div>
            </div>
          </div>
        </aside>
        
        {/* Main */}
        <main className={`admin-main ${!sidebarOpen ? 'expanded' : ''}`}>
          <div className="admin-topbar">
            <div className="admin-topbar-left">
              <button 
                className="admin-hamburger" 
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? '✕' : '☰'}
              </button>
            </div>
            <div className="admin-topbar-right">
              <Link href="/" className="admin-btn">
                ← Store
              </Link>
              <button 
                onClick={() => { 
                  sessionStorage.removeItem('gwds-admin'); 
                  document.cookie = 'gwds-admin-session=; Max-Age=0; Path=/'; 
                  window.location.href = '/admin'; 
                }}
                className="admin-btn"
              >
                Logout
              </button>
            </div>
          </div>
          
          <div className="admin-content">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
