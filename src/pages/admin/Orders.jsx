import React, { useEffect, useState, useRef } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { onOrdersChange, updateOrderStatus, deleteOrder, getStoredOrders } from '../../utils/firestore';
import toast from 'react-hot-toast';

// Web Audio API chime for zero-dependency instant sound alerts
function playOrderChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const now = ctx.currentTime;
    
    // First chime note (E5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    // Second chime note (A5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.15);
    gain2.gain.setValueAtTime(0.3, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.7);
  } catch (e) {
    console.warn('Audio chime warning:', e);
  }
}

export default function OrdersPage() {
  // Instant 0ms synchronous load
  const [orders, setOrders] = useState(() => getStoredOrders());
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'preparing' | 'served' | 'completed' | 'cancelled'
  const [search, setSearch] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState(null);

  const prevOrderCountRef = useRef(getStoredOrders().length);
  const isFirstLoadRef = useRef(true);

  useEffect(() => {
    const unsubscribe = onOrdersChange((allOrders) => {
      // If new orders arrived after initial load, play chime!
      if (!isFirstLoadRef.current && allOrders && allOrders.length > prevOrderCountRef.current && soundEnabled) {
        playOrderChime();
        toast('🔔 New Order Received!', { icon: '🍔', style: { background: '#7f1d1d', color: '#fff' } });
      }
      if (allOrders) {
        prevOrderCountRef.current = allOrders.length;
        setOrders(allOrders);
      }
      isFirstLoadRef.current = false;
      setLoading(false);
    });

    return () => unsubscribe();
  }, [soundEnabled]);

  const handleStatusChange = async (orderId, newStatus) => {
    // Instant optimistic update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, updated_at: new Date().toISOString() } : o));
    toast.success(`Order updated to: ${newStatus.toUpperCase()}`);
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (err) {
      console.warn('Background status sync note:', err);
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order record?')) return;
    setOrders(prev => prev.filter(o => o.id !== orderId));
    toast.success('Order deleted');
    try {
      await deleteOrder(orderId);
    } catch (err) {
      console.warn('Background delete sync note:', err);
    }
  };

  const handlePrint = (order) => {
    setSelectedOrderForPrint(order);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Filter & search
  const filteredOrders = orders.filter((o) => {
    const matchesFilter = filter === 'all' ? true : o.status === filter;
    const q = search.toLowerCase();
    const matchesSearch =
      (o.order_number || '').toLowerCase().includes(q) ||
      (o.table_number || '').toLowerCase().includes(q) ||
      (o.customer_name || '').toLowerCase().includes(q) ||
      (o.customer_phone || '').toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  // Calculate quick stats
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const preparingCount = orders.filter((o) => o.status === 'preparing').length;
  const servedCount = orders.filter((o) => o.status === 'served').length;
  const completedCount = orders.filter((o) => o.status === 'completed').length;
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  return (
    <AdminLayout title="Live Kitchen & Orders">
      {/* Top Controls & KPI Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
        
        {/* KPI Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          {[
            { label: 'Pending Orders', val: pendingCount, icon: '⏳', color: '#e11d48', bg: '#fff1f2' },
            { label: 'In Kitchen', val: preparingCount, icon: '👨‍🍳', color: '#d97706', bg: '#fef3c7' },
            { label: 'Served at Tables', val: servedCount, icon: '🍽️', color: '#0284c7', bg: '#e0f2fe' },
            { label: 'Completed', val: completedCount, icon: '✅', color: '#16a34a', bg: '#f0fdf4' },
            { label: 'Total Revenue', val: `₹${totalRevenue}`, icon: '💰', color: '#7c3aed', bg: '#f5f3ff' },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: '#fff',
                borderRadius: 14,
                padding: '14px 16px',
                border: `1.5px solid ${stat.color}22`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: stat.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                {stat.icon}
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: stat.color, lineHeight: 1 }}>
                  {stat.val}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 600, marginTop: 4 }}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Tabs & Search Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
            {[
              { id: 'all', label: `All (${orders.length})` },
              { id: 'pending', label: `⏳ Pending (${pendingCount})` },
              { id: 'preparing', label: `👨‍🍳 Preparing (${preparingCount})` },
              { id: 'served', label: `🍽️ Served (${servedCount})` },
              { id: 'completed', label: `💳 Completed (${completedCount})` },
              { id: 'cancelled', label: `❌ Cancelled` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 10,
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: filter === tab.id ? '1.5px solid #e11d48' : '1px solid #e5e7eb',
                  background: filter === tab.id ? '#fff1f2' : '#fff',
                  color: filter === tab.id ? '#be123c' : '#4b5563',
                  boxShadow: filter === tab.id ? '0 2px 8px rgba(225,29,72,0.15)' : 'none',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search + Sound Toggle */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginLeft: 'auto' }}>
            <input
              type="text"
              placeholder="🔍 Search table, name, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input"
              style={{ width: 220, fontSize: '0.85rem', padding: '8px 12px' }}
            />

            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playOrderChime();
              }}
              type="button"
              title={soundEnabled ? 'Order Alert Chime Enabled' : 'Order Alert Chime Muted'}
              style={{
                padding: '8px 12px',
                borderRadius: 10,
                background: soundEnabled ? '#dcfce7' : '#f3f4f6',
                border: soundEnabled ? '1.5px solid #86efac' : '1px solid #d1d5db',
                color: soundEnabled ? '#15803d' : '#6b7280',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>{soundEnabled ? '🔔 Sound ON' : '🔕 Muted'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Orders Grid / Cards */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#9ca3af' }}>Loading live orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div
          style={{
            background: '#fff',
            borderRadius: 20,
            padding: '60px 20px',
            textAlign: 'center',
            border: '1px solid #e5e7eb',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>🧾</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1c1917', marginBottom: 4 }}>
            No orders found in this view
          </h3>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
            New customer orders placed from tables will appear here instantly.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {filteredOrders.map((order) => {
            const isPending = order.status === 'pending';
            const isPreparing = order.status === 'preparing';
            const isServed = order.status === 'served';
            const isCompleted = order.status === 'completed';
            const isCancelled = order.status === 'cancelled';

            return (
              <div
                key={order.id}
                style={{
                  background: '#fff',
                  borderRadius: 18,
                  border: isPending
                    ? '2px solid #f43f5e'
                    : isPreparing
                    ? '2px solid #f59e0b'
                    : isServed
                    ? '2px solid #0ea5e9'
                    : '1px solid #e5e7eb',
                  boxShadow: isPending
                    ? '0 6px 20px rgba(244,63,94,0.15)'
                    : '0 2px 10px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {/* Card Header */}
                <div
                  style={{
                    padding: '14px 16px',
                    background: isPending
                      ? 'linear-gradient(135deg, #fff1f2, #ffe4e6)'
                      : isPreparing
                      ? 'linear-gradient(135deg, #fef3c7, #fef9c3)'
                      : isServed
                      ? 'linear-gradient(135deg, #e0f2fe, #f0f9ff)'
                      : '#f9fafb',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      style={{
                        background: '#7f1d1d',
                        color: '#fff',
                        fontWeight: 900,
                        fontSize: '0.92rem',
                        padding: '4px 10px',
                        borderRadius: 8,
                        letterSpacing: '0.02em',
                      }}
                    >
                      TABLE {order.table_number}
                    </span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1c1917' }}>
                        {order.order_number}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                        {new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  {/* Status Pill */}
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: 99,
                      background: isPending
                        ? '#ffe4e6'
                        : isPreparing
                        ? '#fde68a'
                        : isServed
                        ? '#bae6fd'
                        : isCompleted
                        ? '#dcfce7'
                        : '#fee2e2',
                      color: isPending
                        ? '#be123c'
                        : isPreparing
                        ? '#b45309'
                        : isServed
                        ? '#0369a1'
                        : isCompleted
                        ? '#15803d'
                        : '#b91c1c',
                      textTransform: 'uppercase',
                    }}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Customer Info */}
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', background: '#fafaf9', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, color: '#1c1917' }}>
                      👤 {order.customer_name}
                    </div>
                    {order.customer_phone && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <a
                          href={`tel:${order.customer_phone}`}
                          style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 700 }}
                        >
                          📞 Call
                        </a>
                        <a
                          href={`https://wa.me/91${order.customer_phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#16a34a', textDecoration: 'none', fontWeight: 700 }}
                        >
                          💬 WhatsApp
                        </a>
                      </div>
                    )}
                  </div>
                  {order.notes && (
                    <div
                      style={{
                        marginTop: 6,
                        background: '#fff1f2',
                        padding: '6px 10px',
                        borderRadius: 6,
                        fontSize: '0.76rem',
                        color: '#9f1239',
                        fontWeight: 600,
                        border: '1px solid #fecdd3',
                      }}
                    >
                      📝 <strong>Note:</strong> {order.notes}
                    </div>
                  )}
                </div>

                {/* Ordered Items List */}
                <div style={{ padding: '14px 16px', flex: 1, overflowY: 'auto', maxHeight: 200 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {(order.items || []).map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.85rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flex: 1 }}>
                          <span style={{ fontSize: 10 }}>{item.isVeg ? '🟢' : '🔴'}</span>
                          <span style={{ fontWeight: 700, color: '#1c1917' }}>{item.quantity}×</span>
                          <span
                            style={{
                              color: '#374151',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {item.name}
                          </span>
                        </div>
                        <div style={{ fontWeight: 800, color: '#1c1917', flexShrink: 0 }}>
                          ₹{item.price * item.quantity}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bill Amount Row */}
                <div
                  style={{
                    padding: '10px 16px',
                    background: '#f9fafb',
                    borderTop: '1px solid #f3f4f6',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>
                    Subtotal ₹{order.subtotal} + GST ₹{order.tax}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#e11d48' }}>
                    ₹{order.total}
                  </div>
                </div>

                {/* Status Action Buttons */}
                <div
                  style={{
                    padding: '12px 16px',
                    background: '#fff',
                    borderTop: '1px solid #e5e7eb',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  {/* Primary Workflow Buttons */}
                  {isPending && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => handleStatusChange(order.id, 'preparing')}
                        type="button"
                        style={{
                          flex: 2,
                          padding: '10px',
                          borderRadius: 10,
                          background: 'linear-gradient(135deg, #e11d48, #be123c)',
                          color: '#fff',
                          border: 'none',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(225,29,72,0.3)',
                        }}
                      >
                        👨‍🍳 Accept & Prepare
                      </button>
                      <button
                        onClick={() => handleStatusChange(order.id, 'cancelled')}
                        type="button"
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: 10,
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {isPreparing && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => handleStatusChange(order.id, 'served')}
                        type="button"
                        style={{
                          flex: 2,
                          padding: '10px',
                          borderRadius: 10,
                          background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                          color: '#fff',
                          border: 'none',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(2,132,199,0.3)',
                        }}
                      >
                        🍽️ Mark as Served
                      </button>
                      <button
                        onClick={() => handleStatusChange(order.id, 'cancelled')}
                        type="button"
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: 10,
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {isServed && (
                    <button
                      onClick={() => handleStatusChange(order.id, 'completed')}
                      type="button"
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: 10,
                        background: 'linear-gradient(135deg, #16a34a, #15803d)',
                        color: '#fff',
                        border: 'none',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(22,163,74,0.3)',
                      }}
                    >
                      💳 Mark as Paid & Completed
                    </button>
                  )}

                  {/* Secondary Tools: Print & Delete */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                    <button
                      onClick={() => handlePrint(order)}
                      type="button"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#4b5563',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      🖨️ Print KOT / Bill
                    </button>

                    <button
                      onClick={() => handleDelete(order.id)}
                      type="button"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#9ca3af',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Printable Receipt Hidden Element for Direct Admin Print */}
      {selectedOrderForPrint && (
        <div
          id="admin-print-target"
          style={{ display: 'none' }}
          className="admin-printable"
        >
          <div style={{ padding: 20, maxWidth: 350, fontFamily: 'monospace' }}>
            <h2 style={{ textAlign: 'center', margin: '0 0 4px' }}>BIGGIES RESTAURANT</h2>
            <div style={{ textAlign: 'center', fontSize: '0.8rem', marginBottom: 12 }}>KITCHEN ORDER TICKET (KOT)</div>
            <div style={{ borderBottom: '1px dashed #000', marginBottom: 8 }} />
            <div><strong>ORDER #:</strong> {selectedOrderForPrint.order_number}</div>
            <div><strong>TABLE:</strong> Table #{selectedOrderForPrint.table_number}</div>
            <div><strong>CUSTOMER:</strong> {selectedOrderForPrint.customer_name}</div>
            <div><strong>TIME:</strong> {new Date(selectedOrderForPrint.created_at).toLocaleTimeString()}</div>
            {selectedOrderForPrint.notes && <div><strong>NOTE:</strong> {selectedOrderForPrint.notes}</div>}
            <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }} />
            <table style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Item</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Amt</th>
                </tr>
              </thead>
              <tbody>
                {(selectedOrderForPrint.items || []).map((it, i) => (
                  <tr key={i}>
                    <td>{it.name}</td>
                    <td style={{ textAlign: 'center' }}>{it.quantity}</td>
                    <td style={{ textAlign: 'right' }}>₹{it.price * it.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>TOTAL PAYABLE:</span>
              <span>₹{selectedOrderForPrint.total}</span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .admin-printable, .admin-printable * {
            visibility: visible !important;
            display: block !important;
          }
          .admin-printable {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
          }
        }
      `}</style>
    </AdminLayout>
  );
}
