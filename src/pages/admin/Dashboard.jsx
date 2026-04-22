import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { fetchDishes, fetchCategories } from '../../utils/firestore';

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '20px 24px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 16,
      border: `1px solid ${color}22`
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1c1917', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 4 }}>{label}</div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, available: 0, categories: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchDishes(), fetchCategories()])
      .then(([dishes, cats]) => {
        setStats({
          total: dishes.length,
          available: dishes.filter((d) => d.isAvailable).length,
          categories: cats.length,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout title="Dashboard">
      <div style={{ maxWidth: 900 }}>
        <p style={{ color: '#6b7280', marginBottom: 24 }}>
          Welcome back! Here's a snapshot of your restaurant menu.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 92, borderRadius: 16 }} />
            ))
          ) : (
            <>
              <StatCard icon="🍽️" label="Total Dishes" value={stats.total} color="#d97706" />
              <StatCard icon="✅" label="Available Dishes" value={stats.available} color="#22c55e" />
              <StatCard icon="📂" label="Categories" value={stats.categories} color="#6366f1" />
            </>
          )}
        </div>

        {/* Quick links */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>Quick Actions</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { href: '/admin/dishes/new', label: '+ Add Dish', color: '#d97706' },
              { href: '/admin/categories', label: '+ Add Category', color: '#6366f1' },
              { href: '/admin/qr', label: '📱 View QR Code', color: '#0ea5e9' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                style={{
                  padding: '10px 20px', borderRadius: 10,
                  background: `${item.color}18`, color: item.color,
                  fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none',
                  border: `1.5px solid ${item.color}33`,
                  transition: 'all 0.2s'
                }}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
