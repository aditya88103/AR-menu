import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../../hooks/useAuth';
// Biggies brand colours
const BRAND = 'linear-gradient(135deg,#e11d48,#b91c1c)';

const NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: '🏠', exact: true },
  { path: '/admin/dishes', label: 'Dishes', icon: '🍽️' },
  { path: '/admin/categories', label: 'Categories', icon: '📂' },
  { path: '/admin/qr', label: 'QR Code', icon: '📱' },
  { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

export default function AdminLayout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f9fafb' }}>
      {/* Sidebar – desktop */}
      <aside
        style={{
          width: sidebarOpen ? 240 : 68,
          minWidth: sidebarOpen ? 240 : 68,
          background: '#fff',
          borderRight: '1px solid #e5e7eb',
          flexDirection: 'column',
          transition: 'width 0.25s ease, min-width 0.25s ease',
          overflow: 'hidden',
          zIndex: 10,
        }}
        className="admin-sidebar"
      >
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: BRAND,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, flexShrink: 0,
            boxShadow: '0 4px 12px rgba(225,29,72,0.3)'
          }}>🍔</div>
          {sidebarOpen && (
            <div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '1rem', color: '#1c1917' }}>Biggies</div>
              <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Restaurant Admin</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active biggies-active' : ''}`}
              title={!sidebarOpen ? item.label : undefined}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid #f3f4f6' }}>
          <button
            onClick={handleLogout}
            className="sidebar-link"
            style={{ width: '100%', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
            title={!sidebarOpen ? 'Logout' : undefined}
          >
            <span style={{ fontSize: 18 }}>🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'absolute', left: sidebarOpen ? 228 : 56, top: 22,
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: '50%',
            width: 24, height: 24, cursor: 'pointer', fontSize: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20,
            transition: 'left 0.25s ease'
          }}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header className="admin-header">
          <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1c1917', letterSpacing: '-0.02em' }}>{title}</h1>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6, background: '#f3f4f6', padding: '4px 10px', borderRadius: 99 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
            Live
          </div>
        </header>

        {/* Content */}
        <main className="admin-main" style={{ flex: 1, overflow: 'auto' }}>
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav style={{
          background: '#fff',
          borderTop: '1px solid #e5e7eb',
          padding: '8px 0',
          justifyContent: 'space-around',
          zIndex: 100
        }}
          className="admin-bottom-nav"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              style={({ isActive }) => ({
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                fontSize: '0.65rem', fontWeight: 600, padding: '4px 8px',
                color: isActive ? '#e11d48' : '#6b7280', textDecoration: 'none',
                borderRadius: 8, background: isActive ? '#fff1f2' : 'transparent'
              })}
            >
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              fontSize: '0.65rem', fontWeight: 600, padding: '4px 8px',
              color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer',
              borderRadius: 8
            }}
          >
            <span style={{ fontSize: 20 }}>🚪</span>
            Logout
          </button>
        </nav>
      </div>
    </div>
  );
}
