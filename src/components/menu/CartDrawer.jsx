import React, { useState } from 'react';
import { useCartStore } from '../../store/cartStore';
import { createOrder } from '../../utils/firestore';
import toast from 'react-hot-toast';

export default function CartDrawer({ isOpen, onClose, onOrderPlaced }) {
  const items = useCartStore((state) => state.items) || [];
  const tableNumber = useCartStore((state) => state.tableNumber) || '1';
  const customerInfo = useCartStore((state) => state.customerInfo) || { name: '', phone: '', notes: '' };
  const setCustomerInfo = useCartStore((state) => state.setCustomerInfo);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const deleteItem = useCartStore((state) => state.deleteItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const addActiveOrder = useCartStore((state) => state.addActiveOrder);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const cartList = Array.isArray(items) ? items : [];
  const subtotal = cartList.reduce((sum, i) => sum + (Number(i?.price) || 0) * (Number(i?.quantity) || 0), 0);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;

  if (!isOpen) return null;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error('Your cart is empty! Please add some dishes.');
      return;
    }

    if (!tableNumber || tableNumber.trim() === '') {
      toast.error('Please enter or select your Table Number.');
      return;
    }

    if (!customerInfo.name || customerInfo.name.trim() === '') {
      toast.error('Please enter your Name.');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        table_number: tableNumber.trim(),
        customer_name: customerInfo.name.trim(),
        customer_phone: customerInfo.phone ? customerInfo.phone.trim() : '',
        notes: customerInfo.notes ? customerInfo.notes.trim() : '',
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          isVeg: i.isVeg,
          subtotal: i.price * i.quantity,
        })),
        subtotal: subtotal,
        tax: tax,
        total: total,
      };

      const placed = await createOrder(orderPayload);
      addActiveOrder(placed);
      clearCart();
      toast.success('🎉 Order Placed Successfully!');
      onClose();
      if (onOrderPlaced) onOrderPlaced(placed);
    } catch (err) {
      console.error('Order creation error:', err);
      toast.error('Failed to place order. Please try again or inform staff.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 460,
          height: '100%',
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 30px rgba(0,0,0,0.2)',
          animation: 'slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #7f1d1d 0%, #be123c 60%, #e11d48 100%)',
            padding: '20px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            boxShadow: '0 4px 14px rgba(225,29,72,0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>🛒</span>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
                Your Order Cart
              </h2>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>
                Biggies Food Stop · Table #{tableNumber}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: '#fff',
              fontSize: 18,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            background: '#fafaf9',
          }}
        >
          {/* Fixed Table Number Display (Locked from QR Code) */}
          <div
            style={{
              background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
              borderRadius: 16,
              padding: '14px 16px',
              border: '1.5px solid #fecdd3',
              boxShadow: '0 2px 8px rgba(225,29,72,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #e11d48, #be123c)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '1.2rem',
                  boxShadow: '0 2px 8px rgba(225,29,72,0.3)',
                }}
              >
                🪑
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#9f1239', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Dining Table (QR Scanned)
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#7f1d1d' }}>
                  Table #{tableNumber}
                </div>
              </div>
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                background: '#fff',
                color: '#16a34a',
                padding: '5px 12px',
                borderRadius: 99,
                border: '1px solid #bbf7d0',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}
            >
              <span>🔒</span> Fixed Table
            </div>
          </div>

          {/* Items List */}
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: '16px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1c1917', margin: 0 }}>
                Ordered Dishes ({items.length})
              </h3>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Clear All
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: '#9ca3af' }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🍽️</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#6b7280' }}>Your cart is empty</div>
                <div style={{ fontSize: '0.78rem', marginTop: 4 }}>Add items from the menu to place an order.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      paddingBottom: 12,
                      borderBottom: '1px solid #f3f4f6',
                    }}
                  >
                    {/* Item Thumbnail */}
                    <div
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 10,
                        overflow: 'hidden',
                        background: '#fef2f2',
                        flexShrink: 0,
                      }}
                    >
                      {item.imageURL ? (
                        <img src={item.imageURL} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 20 }}>
                          🍽️
                        </div>
                      )}
                    </div>

                    {/* Item Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: item.isVeg ? '#16a34a' : '#dc2626',
                            display: 'inline-block',
                            flexShrink: 0,
                          }}
                        />
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: '0.88rem',
                            color: '#1c1917',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.name}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#e11d48', fontWeight: 800, marginTop: 2 }}>
                        ₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}
                      </div>
                    </div>

                    {/* Stepper */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: '#f3f4f6',
                        borderRadius: 99,
                        padding: '2px 4px',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: '#fff',
                          border: 'none',
                          color: '#e11d48',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        }}
                      >
                        -
                      </button>
                      <span style={{ fontWeight: 800, fontSize: '0.85rem', minWidth: 16, textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => addItem(item)}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: '#e11d48',
                          border: 'none',
                          color: '#fff',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        }}
                      >
                        +
                      </button>
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => deleteItem(item.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#9ca3af',
                        cursor: 'pointer',
                        padding: '4px',
                        fontSize: 16,
                      }}
                      title="Remove"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customer Details Form */}
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: '16px',
              border: '1px solid #e5e7eb',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <h3 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1c1917', margin: 0 }}>
              Customer Details
            </h3>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: 4 }}>
                Your Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ name: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1.5px solid #e5e7eb',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: 4 }}>
                Phone Number (for order & bill updates)
              </label>
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({ phone: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1.5px solid #e5e7eb',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: 4 }}>
                Special Cooking Instructions / Notes
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Extra spicy, no onions, bring water..."
                value={customerInfo.notes}
                onChange={(e) => setCustomerInfo({ notes: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1.5px solid #e5e7eb',
                  fontSize: '0.85rem',
                  outline: 'none',
                  resize: 'none',
                }}
              />
            </div>
          </div>

          {/* Bill Summary Breakdown */}
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: '16px',
              border: '1px solid #e5e7eb',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <h3 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1c1917', margin: 0, marginBottom: 4 }}>
              Bill Breakdown
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#6b7280' }}>
              <span>Items Subtotal</span>
              <span>₹{subtotal}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#6b7280' }}>
              <span>GST (5%)</span>
              <span>₹{tax}</span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.1rem',
                fontWeight: 900,
                color: '#1c1917',
                paddingTop: 8,
                borderTop: '1px dashed #e5e7eb',
                marginTop: 4,
              }}
            >
              <span>Total Payable</span>
              <span style={{ color: '#e11d48' }}>₹{total}</span>
            </div>
          </div>
        </div>

        {/* Bottom Place Order Button */}
        <div
          style={{
            padding: '16px 20px',
            background: '#fff',
            borderTop: '1px solid #e5e7eb',
            boxShadow: '0 -4px 16px rgba(0,0,0,0.05)',
            flexShrink: 0,
          }}
        >
          <button
            onClick={handlePlaceOrder}
            disabled={isSubmitting || items.length === 0}
            type="button"
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: 16,
              background: items.length > 0 && !isSubmitting
                ? 'linear-gradient(135deg, #e11d48 0%, #be123c 50%, #9f1239 100%)'
                : '#d1d5db',
              color: '#fff',
              border: 'none',
              fontSize: '1.05rem',
              fontWeight: 900,
              cursor: items.length > 0 && !isSubmitting ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              boxShadow: items.length > 0 && !isSubmitting ? '0 8px 24px rgba(225,29,72,0.4)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            {isSubmitting ? (
              <>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    border: '3px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
                <span>Placing Your Order...</span>
              </>
            ) : (
              <>
                <span>🛍️ Place Order</span>
                <span>·</span>
                <span>₹{total}</span>
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
