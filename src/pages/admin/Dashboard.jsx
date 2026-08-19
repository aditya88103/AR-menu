import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { fetchDishes, fetchCategories, onOrdersChange, getStoredDishes, getStoredCategories, getStoredOrders } from '../../utils/firestore';

function StatCard({ icon, label, value, color, bg, link }) {
  const content = (
    <div
      style={{
        background: '#fff',
        borderRadius: 16,
        padding: '20px 24px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        border: `1.5px solid ${color}22`,
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: bg || `${color}18`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1c1917', lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 4, fontWeight: 600 }}>
          {label}
        </div>
      </div>
    </div>
  );

  if (link) {
    return (
      <Link to={link} style={{ textDecoration: 'none' }}>
        {content}
      </Link>
    );
  }
  return content;
}

export default function AdminDashboard() {
  // Synchronous instant initialization
  const [stats, setStats] = useState(() => {
    const dishes = getStoredDishes();
    const cats = getStoredCategories();
    return {
      totalDishes: dishes.length,
      availableDishes: dishes.filter((d) => (d.isAvailable !== undefined ? d.isAvailable : d.isavailable) !== false).length,
      categories: cats.length,
    };
  });
  const [orders, setOrders] = useState(() => getStoredOrders());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDishes().then(dishes => {
      fetchCategories().then(cats => {
        setStats({
          totalDishes: dishes.length,
          availableDishes: dishes.filter((d) => (d.isAvailable !== undefined ? d.isAvailable : d.isavailable) !== false).length,
          categories: cats.length,
        });
      });
    });

    const unsubscribe = onOrdersChange((allOrders) => {
      if (allOrders) setOrders(allOrders);
    });

    return () => unsubscribe();
  }, []);

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  return (
    <AdminLayout title="Dashboard Overview">
      <div style={{ maxWidth: 1000, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1c1917', margin: 0 }}>
            Welcome back to Biggies Management!
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: 4 }}>
            Here is a live summary of kitchen orders, sales revenue, and menu catalog.
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
          {loading ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton" style={{ height: 92, borderRadius: 16 }} />
            ))
          ) : (
            <>
              <StatCard
                icon="⏳"
                label="Pending Orders"
                value={pendingOrders.length}
                color="#e11d48"
                bg="#fff1f2"
                link="/admin/orders"
              />
              <StatCard
                icon="💰"
                label="Today's Revenue"
                value={`₹${totalRevenue}`}
                color="#7c3aed"
                bg="#f5f3ff"
                link="/admin/orders"
              />
              <StatCard
                icon="🍽️"
                label="Active Menu Dishes"
                value={stats.availableDishes}
                color="#16a34a"
                bg="#f0fdf4"
                link="/admin/dishes"
              />
              <StatCard
                icon="📂"
                label="Categories"
                value={stats.categories}
                color="#0284c7"
                bg="#e0f2fe"
                link="/admin/categories"
              />
            </>
          )}
        </div>

        {/* Recent Orders Section */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1c1917', margin: 0 }}>
                Live Incoming Orders
              </h3>
              <p style={{ color: '#9ca3af', fontSize: '0.78rem', margin: '2px 0 0' }}>
                Orders placed in real-time from customer dining tables
              </p>
            </div>
            <Link
              to="/admin/orders"
              style={{
                background: 'linear-gradient(135deg,#e11d48,#be123c)',
                color: '#fff',
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: 10,
                fontSize: '0.82rem',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(225,29,72,0.25)',
              }}
            >
              Open Kitchen Dashboard →
            </Link>
          </div>

          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: '#9ca3af' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🧾</div>
              <div style={{ fontWeight: 600 }}>No orders recorded yet</div>
              <div style={{ fontSize: '0.8rem' }}>When customers scan table QR codes and order, they appear here.</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px', fontWeight: 700, color: '#4b5563' }}>Table</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, color: '#4b5563' }}>Order #</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, color: '#4b5563' }}>Customer</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, color: '#4b5563' }}>Items</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, color: '#4b5563' }}>Total</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, color: '#4b5563' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px', fontWeight: 900, color: '#7f1d1d' }}>
                        Table {order.table_number}
                      </td>
                      <td style={{ padding: '12px', fontWeight: 700, color: '#1c1917' }}>
                        {order.order_number}
                      </td>
                      <td style={{ padding: '12px', color: '#374151' }}>
                        {order.customer_name}
                      </td>
                      <td style={{ padding: '12px', color: '#6b7280' }}>
                        {(order.items || []).length} items
                      </td>
                      <td style={{ padding: '12px', fontWeight: 800, color: '#e11d48' }}>
                        ₹{order.total}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span
                          style={{
                            padding: '3px 9px',
                            borderRadius: 99,
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            background:
                              order.status === 'pending'
                                ? '#ffe4e6'
                                : order.status === 'preparing'
                                ? '#fde68a'
                                : order.status === 'served'
                                ? '#bae6fd'
                                : order.status === 'completed'
                                ? '#dcfce7'
                                : '#fee2e2',
                            color:
                              order.status === 'pending'
                                ? '#be123c'
                                : order.status === 'preparing'
                                ? '#b45309'
                                : order.status === 'served'
                                ? '#0369a1'
                                : order.status === 'completed'
                                ? '#15803d'
                                : '#b91c1c',
                          }}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 14 }}>Quick Actions</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { to: '/admin/orders', label: '🧾 Manage Live Orders', color: '#e11d48', bg: '#fff1f2' },
              { to: '/admin/dishes/new', label: '+ Add New Dish', color: '#d97706', bg: '#fef3c7' },
              { to: '/admin/categories', label: '+ Add Category', color: '#6366f1', bg: '#eef2ff' },
              { to: '/admin/qr', label: '📱 Table QR Codes', color: '#0ea5e9', bg: '#e0f2fe' },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  padding: '10px 18px',
                  borderRadius: 12,
                  background: item.bg,
                  color: item.color,
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  border: `1.5px solid ${item.color}33`,
                  transition: 'all 0.2s',
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
