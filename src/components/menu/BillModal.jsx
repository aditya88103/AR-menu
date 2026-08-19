import React, { useEffect, useState, useRef } from 'react';
import { useCartStore } from '../../store/cartStore';
import { onSingleOrderChange } from '../../utils/firestore';
import toast from 'react-hot-toast';

export default function BillModal({ order, onClose, onOrderMore }) {
  const storeActiveOrders = useCartStore((state) => state.activeOrders) || [];
  const removeActiveOrder = useCartStore((state) => state.removeActiveOrder);
  const updateActiveOrder = useCartStore((state) => state.updateActiveOrder);
  const tableNumber = useCartStore((state) => state.tableNumber) || '1';

  // Merge provided order with store active orders (STRICTLY for current table)
  const allActiveOrders = React.useMemo(() => {
    const currentTable = String(tableNumber || '1');
    const list = (Array.isArray(storeActiveOrders) ? storeActiveOrders : [])
      .filter((o) => String(o?.table_number) === currentTable);
    if (order && String(order.table_number) === currentTable && !list.find((o) => o?.id === order.id)) {
      list.unshift(order);
    }
    return list;
  }, [storeActiveOrders, order, tableNumber]);

  const [selectedOrderId, setSelectedOrderId] = useState(() => {
    return order?.id || allActiveOrders[0]?.id || 'combined';
  });

  const printRef = useRef(null);

  // Sync selected order if valid
  const currentOrder = allActiveOrders.find((o) => o.id === selectedOrderId) || allActiveOrders[0];
  const isCombinedView = selectedOrderId === 'combined' && allActiveOrders.length > 1;

  // Real-time live status updates for all active orders
  useEffect(() => {
    if (allActiveOrders.length === 0) return;

    const unsubscribes = allActiveOrders.map((ord) => {
      if (!ord?.id) return () => {};
      return onSingleOrderChange(ord.id, (updated) => {
        if (updated) {
          updateActiveOrder(updated);
        }
      });
    });

    return () => {
      unsubscribes.forEach((unsub) => unsub && unsub());
    };
  }, [allActiveOrders.map((o) => o?.id).join(',')]);

  if (allActiveOrders.length === 0 && !currentOrder) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'preparing':
        return { label: '👨‍🍳 In the Kitchen (Preparing)', bg: '#fef3c7', text: '#b45309', border: '#fde68a', step: 2 };
      case 'served':
        return { label: '🍽️ Served at Table', bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd', step: 3 };
      case 'completed':
        return { label: '💳 Bill Paid & Completed', bg: '#dcfce7', text: '#15803d', border: '#bbf7d0', step: 4 };
      case 'cancelled':
        return { label: '❌ Order Cancelled', bg: '#fee2e2', text: '#b91c1c', border: '#fecaca', step: 0 };
      default:
        return { label: '⏳ Order Received (Pending)', bg: '#fff1f2', text: '#be123c', border: '#fecdd3', step: 1 };
    }
  };

  const statusInfo = getStatusBadge(currentOrder?.status);

  // Combined totals calculation
  const combinedItems = allActiveOrders.flatMap((o) => o.items || []);
  const combinedSubtotal = allActiveOrders.reduce((sum, o) => sum + (Number(o.subtotal) || 0), 0);
  const combinedTax = allActiveOrders.reduce((sum, o) => sum + (Number(o.tax) || 0), 0);
  const combinedTotal = allActiveOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        ref={printRef}
        className="printable-bill"
        style={{
          width: '100%',
          maxWidth: 500,
          background: '#fff',
          borderRadius: 24,
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
          animation: 'bounceIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Receipt Top Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #7f1d1d 0%, #be123c 60%, #e11d48 100%)',
            padding: '20px',
            textAlign: 'center',
            color: '#fff',
            position: 'relative',
          }}
        >
          <button
            onClick={onClose}
            type="button"
            className="no-print"
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: '#fff',
              fontSize: 16,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>

          <div style={{ fontSize: 28, marginBottom: 2 }}>🍔</div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
            Biggies Restaurant
          </h1>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>
            Food Stop · Table #{tableNumber}
          </div>
          <div
            style={{
              display: 'inline-block',
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              padding: '4px 14px',
              borderRadius: 99,
              fontSize: '0.75rem',
              fontWeight: 800,
              marginTop: 8,
              letterSpacing: '0.04em',
            }}
          >
            {allActiveOrders.length > 1 ? `ACTIVE ORDERS (${allActiveOrders.length})` : 'ORDER RECEIPT & LIVE TRACKER'}
          </div>
        </div>

        {/* Multi-Order Tabs Switcher (Seamlessly blended into header) */}
        {allActiveOrders.length > 1 && (
          <div
            className="no-print"
            style={{
              background: 'linear-gradient(135deg, #be123c 0%, #e11d48 100%)',
              padding: '0 16px 14px',
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              justifyContent: allActiveOrders.length <= 2 ? 'center' : 'flex-start',
            }}
          >
            {allActiveOrders.map((ord, idx) => {
              const isSelected = selectedOrderId === ord.id;
              const ordStatus = getStatusBadge(ord.status);
              const itemCount = ord.items?.length || 0;
              return (
                <button
                  key={ord.id}
                  type="button"
                  onClick={() => setSelectedOrderId(ord.id)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 99,
                    border: 'none',
                    background: isSelected ? '#fff' : 'rgba(255,255,255,0.18)',
                    color: isSelected ? '#be123c' : 'rgba(255,255,255,0.92)',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.18)' : 'none',
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <span>Order #{idx + 1}</span>
                  <span style={{
                    fontSize: '0.65rem',
                    background: isSelected ? '#fff1f2' : 'rgba(255,255,255,0.22)',
                    color: isSelected ? '#e11d48' : '#fff',
                    padding: '1px 7px',
                    borderRadius: 99,
                    fontWeight: 700,
                  }}>
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </span>
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: isSelected ? ordStatus.text : '#86efac',
                      boxShadow: isSelected ? `0 0 6px ${ordStatus.text}` : 'none',
                    }}
                  />
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setSelectedOrderId('combined')}
              style={{
                padding: '7px 14px',
                borderRadius: 99,
                border: 'none',
                background: isCombinedView ? '#fff' : 'rgba(255,255,255,0.18)',
                color: isCombinedView ? '#be123c' : 'rgba(255,255,255,0.92)',
                fontWeight: 800,
                fontSize: '0.78rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: isCombinedView ? '0 4px 12px rgba(0,0,0,0.18)' : 'none',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <span>📋 Total Bill</span>
            </button>
          </div>
        )}

        {/* Scrollable Bill Body */}
        <div
          style={{
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            background: '#fff',
          }}
        >
          {/* Live Status Tracker for Single Order */}
          {!isCombinedView && currentOrder && (
            <div
              className="no-print"
              style={{
                background: statusInfo.bg,
                border: `1.5px solid ${statusInfo.border}`,
                borderRadius: 16,
                padding: '14px 16px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 800, color: '#6b7280', letterSpacing: '0.05em' }}>
                Live Order Tracker · {currentOrder.order_number}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: statusInfo.text, marginTop: 3 }}>
                {statusInfo.label}
              </div>

              {/* Stepper Progress Bar */}
              {statusInfo.step > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, gap: 4 }}>
                  {[
                    { step: 1, label: 'Received' },
                    { step: 2, label: 'Kitchen' },
                    { step: 3, label: 'Served' },
                    { step: 4, label: 'Paid' },
                  ].map((s) => (
                    <div key={s.step} style={{ flex: 1, textAlign: 'center' }}>
                      <div
                        style={{
                          height: 6,
                          borderRadius: 99,
                          background: statusInfo.step >= s.step ? '#16a34a' : '#e5e7eb',
                          marginBottom: 4,
                          transition: 'all 0.3s ease',
                        }}
                      />
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: statusInfo.step >= s.step ? '#15803d' : '#9ca3af' }}>
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {currentOrder.status === 'completed' && (
                <div style={{ marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => {
                      removeActiveOrder(currentOrder.id);
                      toast.success('Completed order cleared from active tracker.');
                    }}
                    style={{
                      background: '#fff',
                      border: '1px solid #bbf7d0',
                      color: '#15803d',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '4px 12px',
                      borderRadius: 99,
                      cursor: 'pointer',
                    }}
                  >
                    ✓ Dismiss Completed Order
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Combined Orders Header (if combined view) */}
          {isCombinedView && (
            <div
              style={{
                background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
                border: '1.5px solid #fecdd3',
                borderRadius: 16,
                padding: '14px 16px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#be123c', textTransform: 'uppercase' }}>
                Combined Summary for Table #{tableNumber}
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#7f1d1d', marginTop: 2 }}>
                {allActiveOrders.length} Orders Placed
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 4 }}>
                All ongoing orders for your table are listed below.
              </div>
            </div>
          )}

          {/* Metadata Card */}
          <div
            style={{
              background: '#f9fafb',
              borderRadius: 14,
              padding: '14px',
              border: '1px solid #f3f4f6',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
              fontSize: '0.82rem',
            }}
          >
            <div>
              <div style={{ color: '#9ca3af', fontSize: '0.72rem', fontWeight: 600 }}>
                {isCombinedView ? 'ACTIVE ORDERS' : 'ORDER NUMBER'}
              </div>
              <div style={{ fontWeight: 800, color: '#1c1917' }}>
                {isCombinedView ? `${allActiveOrders.length} Orders` : currentOrder.order_number}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#9ca3af', fontSize: '0.72rem', fontWeight: 600 }}>TABLE NUMBER</div>
              <div style={{ fontWeight: 900, color: '#e11d48', fontSize: '1rem' }}>
                Table #{tableNumber}
              </div>
            </div>
            <div>
              <div style={{ color: '#9ca3af', fontSize: '0.72rem', fontWeight: 600 }}>CUSTOMER</div>
              <div style={{ fontWeight: 700, color: '#1c1917' }}>
                {currentOrder.customer_name || 'Guest'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#9ca3af', fontSize: '0.72rem', fontWeight: 600 }}>PHONE</div>
              <div style={{ fontWeight: 600, color: '#1c1917' }}>
                {currentOrder.customer_phone || 'N/A'}
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1c1917', marginBottom: 8 }}>
              {isCombinedView ? `All Ordered Dishes (${combinedItems.length})` : `Order Items (${currentOrder.items?.length || 0})`}
            </div>
            <div
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                    <th style={{ padding: '8px 10px', fontWeight: 700, color: '#4b5563' }}>Item</th>
                    <th style={{ padding: '8px 10px', fontWeight: 700, color: '#4b5563', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '8px 10px', fontWeight: 700, color: '#4b5563', textAlign: 'right' }}>Rate</th>
                    <th style={{ padding: '8px 10px', fontWeight: 700, color: '#4b5563', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(isCombinedView ? combinedItems : currentOrder.items || []).map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 600, color: '#1c1917' }}>
                        <span style={{ marginRight: 5 }}>{item.isVeg ? '🟢' : '🔴'}</span>
                        {item.name}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700 }}>
                        {item.quantity}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: '#6b7280' }}>
                        ₹{item.price}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: '#1c1917' }}>
                        ₹{item.price * item.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Totals */}
          <div
            style={{
              background: '#fef2f2',
              borderRadius: 14,
              padding: '14px 16px',
              border: '1.5px solid #fecdd3',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              fontSize: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280' }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: 700 }}>
                ₹{isCombinedView ? combinedSubtotal : currentOrder.subtotal}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280' }}>
              <span>GST (5%)</span>
              <span style={{ fontWeight: 700 }}>
                ₹{isCombinedView ? combinedTax : currentOrder.tax}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.15rem',
                fontWeight: 900,
                color: '#7f1d1d',
                borderTop: '1.5px dashed #f87171',
                paddingTop: 8,
                marginTop: 4,
              }}
            >
              <span>{isCombinedView ? 'Combined Grand Total' : 'Grand Total'}</span>
              <span style={{ color: '#e11d48' }}>
                ₹{isCombinedView ? combinedTotal : currentOrder.total}
              </span>
            </div>
          </div>

          {/* Footer Note */}
          <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.72rem', paddingBottom: 4 }}>
            Thank you for dining at Biggies Restaurant! You can track live progress or add more dishes anytime.
          </div>
        </div>

        {/* Action Buttons (Hidden on Print) */}
        <div
          className="no-print"
          style={{
            padding: '16px 20px',
            background: '#fafaf9',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {/* Clear Completed/Paid Orders Button */}
          {currentOrder?.status === 'completed' && (
            <button
              onClick={() => {
                removeActiveOrder(currentOrder.id);
                toast.success('Paid order removed from table view! ✨');
                if (allActiveOrders.length <= 1) {
                  onClose();
                }
              }}
              type="button"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 12,
                background: '#f0fdf4',
                color: '#15803d',
                border: '1.5px solid #86efac',
                fontWeight: 800,
                fontSize: '0.86rem',
                cursor: 'pointer',
              }}
            >
              ✓ Clear Paid Order ({currentOrder.order_number})
            </button>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handlePrint}
              type="button"
              style={{
                flex: 1,
                padding: '13px',
                borderRadius: 12,
                background: '#fff',
                border: '1.5px solid #d1d5db',
                color: '#374151',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
              }}
            >
              <span>🖨️</span> Print / Save Bill
            </button>

            <button
              onClick={() => {
                onClose();
                if (onOrderMore) onOrderMore();
              }}
              type="button"
              style={{
                flex: 1.2,
                padding: '13px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #e11d48, #be123c)',
                color: '#fff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(225,29,72,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <span>➕</span> Order More
            </button>
          </div>
        </div>
      </div>

      {/* Print Stylesheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .printable-bill, .printable-bill * {
            visibility: visible !important;
          }
          .printable-bill {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
