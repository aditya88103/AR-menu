import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { onAvailableDishesChange, onCategoriesChange, onOrdersChange, fetchOrders, fetchOrdersByPhone, getStoredDishes, getStoredCategories } from '../../utils/firestore';
import DishCard from '../../components/menu/DishCard';
import CartDrawer from '../../components/menu/CartDrawer';
import BillModal from '../../components/menu/BillModal';
import { useCartStore } from '../../store/cartStore';
import toast from 'react-hot-toast';

function SkeletonCard() {
  return (
    <div style={{ borderRadius: 18, overflow: 'hidden', background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      <div className="skeleton" style={{ height: 200 }} />
      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="skeleton" style={{ height: 20, width: '65%' }} />
        <div className="skeleton" style={{ height: 13, width: '90%' }} />
        <div className="skeleton" style={{ height: 13, width: '55%' }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <div className="skeleton" style={{ height: 32, width: 100, borderRadius: 99 }} />
          <div className="skeleton" style={{ height: 32, width: 130, borderRadius: 99 }} />
        </div>
      </div>
    </div>
  );
}

export default function MenuPage() {
  const [searchParams] = useSearchParams();

  // Instant 0ms synchronous initialization from local cache
  const [dishes, setDishes]         = useState(() => {
    const all = getStoredDishes();
    return all.filter(d => (d.isAvailable !== undefined ? d.isAvailable : d.isavailable) !== false);
  });
  const [categories, setCategories] = useState(() => getStoredCategories());
  const [activeCategory, setActive] = useState(() => getStoredCategories()[0]?.name || '');
  const [loading, setLoading]       = useState(false); // Cache ready immediately
  const [vegOnly, setVegOnly]       = useState(false);

  // Cart, Bill Modal & Order Lookup Modal state
  const [isCartOpen, setIsCartOpen]     = useState(false);
  const [isBillOpen, setIsBillOpen]     = useState(false);
  const [selectedModalOrder, setSelectedModalOrder] = useState(null);
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [lookupQuery, setLookupQuery]   = useState('');
  const [isSearching, setIsSearching]   = useState(false);
  const [searchedOrders, setSearchedOrders] = useState(null);
  const [hasSearched, setHasSearched]   = useState(false);

  // Store bindings
  const items = useCartStore((state) => state.items) || [];
  const tableNumber = useCartStore((state) => state.tableNumber) || '1';
  const setTableNumber = useCartStore((state) => state.setTableNumber);
  const activeOrders = useCartStore((state) => state.activeOrders) || [];
  const activeOrder = useCartStore((state) => state.activeOrder);
  const setActiveOrder = useCartStore((state) => state.setActiveOrder);
  const addActiveOrder = useCartStore((state) => state.addActiveOrder);
  const syncActiveOrders = useCartStore((state) => state.syncActiveOrders);
  const loadOrdersByCustomer = useCartStore((state) => state.loadOrdersByCustomer);

  // Strictly filter active orders for the CURRENT table only (excluding finished/paid orders)
  const currentTableActiveOrders = useMemo(() => {
    const currentTable = String(tableNumber || '1');
    return (Array.isArray(activeOrders) ? activeOrders : [])
      .filter((o) => String(o?.table_number) === currentTable && o?.status !== 'completed' && o?.status !== 'cancelled');
  }, [activeOrders, tableNumber]);

  const currentTableUnpaidTotal = useMemo(() => {
    return currentTableActiveOrders.reduce((sum, o) => sum + (Number(o?.total) || 0), 0);
  }, [currentTableActiveOrders]);

  const cartList = Array.isArray(items) ? items : [];
  const totalItems = cartList.reduce((sum, i) => sum + (Number(i?.quantity) || 0), 0);
  const subtotal = cartList.reduce((sum, i) => sum + (Number(i?.price) || 0) * (Number(i?.quantity) || 0), 0);
  const grandTotal = subtotal + Math.round(subtotal * 0.05);

  const sectionRefs = useRef({});
  const navRef      = useRef();
  const pillRefs    = useRef({});

  // ── Read table parameter from URL (e.g. ?table=5 or #/menu?table=5) ──
  useEffect(() => {
    let urlTable = searchParams.get('table');
    if (!urlTable && typeof window !== 'undefined') {
      const hash = window.location.hash;
      const match = hash.match(/[?&]table=([^&]+)/);
      if (match) urlTable = match[1];
    }
    if (urlTable) {
      setTableNumber(urlTable);
    }
  }, [searchParams, setTableNumber]);

  // ── Subscribe to real-time updates seamlessly in background ──
  useEffect(() => {
    let isMounted = true;
    
    const unsubscribeDishes = onAvailableDishesChange((dishesList) => {
      if (isMounted && dishesList) {
        setDishes(dishesList);
        setLoading(false);
      }
    });
    
    const unsubscribeCategories = onCategoriesChange((cats) => {
      if (isMounted && cats && cats.length > 0) {
        setCategories(cats);
        if (!activeCategory && cats.length > 0) {
          setActive(cats[0].name);
        }
        setLoading(false);
      }
    });

    const unsubscribeOrders = onOrdersChange((allOrders) => {
      if (isMounted && allOrders && allOrders.length > 0) {
        syncActiveOrders(allOrders);
      }
    });

    return () => {
      isMounted = false;
      unsubscribeDishes();
      unsubscribeCategories();
      unsubscribeOrders();
    };
  }, [syncActiveOrders]);

  // ── Memoized Visible & Grouped Dishes for ultra fast rendering ───
  const visibleDishes = useMemo(() => {
    const list = Array.isArray(dishes) ? dishes : [];
    return vegOnly
      ? list.filter(d => (d.isVeg !== undefined ? d.isVeg : d.isveg) === true)
      : list;
  }, [dishes, vegOnly]);

  const grouped = useMemo(() => {
    const cats = Array.isArray(categories) ? categories : [];
    const list = cats
      .map(cat => ({ category: cat.name, dishes: visibleDishes.filter(d => d.category === cat.name) }))
      .filter(g => g.dishes.length > 0);

    const listed = new Set(cats.map(c => c.name));
    const others = visibleDishes.filter(d => !listed.has(d.category));
    if (others.length) list.push({ category: 'Other', dishes: others });

    return list;
  }, [categories, visibleDishes]);

  // ── IntersectionObserver ─────────────────────────────────────
  useEffect(() => {
    if (!grouped.length) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => e.isIntersecting && setActive(e.target.dataset.category)),
      { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
    );
    Object.values(sectionRefs.current).forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, [grouped.length]);

  useEffect(() => {
    const pill = pillRefs.current[activeCategory];
    if (pill && navRef.current) {
      navRef.current.scrollTo({
        left: pill.offsetLeft - navRef.current.offsetWidth / 2 + pill.offsetWidth / 2,
        behavior: 'smooth'
      });
    }
  }, [activeCategory]);

  const scrollTo = (cat) => {
    const el = sectionRefs.current[cat];
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff8f0', paddingBottom: totalItems > 0 ? 100 : 40 }}>

      {/* ──── COMPACT MOBILE HEADER ──── */}
      <header style={{
        background: 'linear-gradient(135deg, #7f1d1d 0%, #be123c 50%, #e11d48 100%)',
        padding: '24px 16px 20px',
        position: 'relative',
        overflow: 'hidden',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        boxShadow: '0 4px 20px rgba(225,29,72,0.15)'
      }}>
        {/* Subtle decorative elements */}
        <div style={{ position:'absolute', top:-40, right:-20, width:140, height:140, borderRadius:'50%', background:'rgba(255,255,255,0.06)', pointerEvents:'none' }} />
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Logo / icon */}
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
              border: '1.5px solid rgba(255,255,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>🍔</div>

            <div>
              <h1 style={{
                fontFamily: 'Playfair Display, serif',
                color: '#fff', fontSize: '1.35rem',
                fontWeight: 800, margin: 0, letterSpacing: '-0.3px',
                lineHeight: 1.2, textShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}>
                Biggies
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.72rem', margin: '2px 0 0', fontWeight: 500 }}>
                Food Stop · AR Interactive Menu
              </p>
            </div>
          </div>

          {/* Table Indicator Badge */}
          <button
            onClick={() => setIsCartOpen(true)}
            type="button"
            style={{
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              border: '1.5px solid rgba(255,255,255,0.35)',
              borderRadius: 14,
              padding: '6px 12px',
              color: '#fff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#fecdd3' }}>
              DINING AT
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 900, lineHeight: 1.2 }}>
              Table #{tableNumber}
            </div>
          </button>
        </div>

        {/* ── Compact Controls Row ── */}
        <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          {/* Veg Toggle */}
          <button
            onClick={() => setVegOnly(v => !v)}
            type="button"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 14px', borderRadius: 99, cursor: 'pointer',
              border: `1.5px solid ${vegOnly ? '#86efac' : 'rgba(255,255,255,0.25)'}`,
              background: vegOnly ? 'linear-gradient(135deg,#16a34a,#15803d)' : 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              color: '#fff', fontWeight: 700, fontSize: '0.75rem',
              boxShadow: vegOnly ? '0 4px 16px rgba(22,163,74,0.4)' : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            <span style={{
              width: 26, height: 15, borderRadius: 10,
              background: vegOnly ? '#fff' : 'rgba(255,255,255,0.3)',
              display: 'inline-flex', alignItems: 'center',
              padding: '0 2px', transition: 'all 0.3s', flexShrink: 0,
            }}>
              <span style={{
                width: 11, height: 11, borderRadius: '50%', flexShrink: 0,
                background: vegOnly ? '#16a34a' : '#fff',
                transform: vegOnly ? 'translateX(11px)' : 'translateX(0)',
                transition: 'all 0.3s ease',
              }} />
            </span>
            <span>{vegOnly ? 'Veg Only' : 'Veg + Non-Veg'}</span>
          </button>

          {/* Active Orders / Bill Shortcut button (strictly for this table) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {currentTableActiveOrders.length > 0 ? (
              <button
                onClick={() => setIsBillOpen(true)}
                type="button"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 99,
                  background: '#fff', color: '#be123c',
                  border: 'none', fontWeight: 800, fontSize: '0.75rem',
                  cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                <span>🧾</span>
                <span>{currentTableActiveOrders.length === 1 ? 'Track Order' : `${currentTableActiveOrders.length} Active Orders`}</span>
                <span style={{
                  background: '#e11d48',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 900,
                  padding: '1px 6px',
                  borderRadius: 99,
                }}>
                  {currentTableActiveOrders.length}
                </span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setSearchedOrders(null);
                  setHasSearched(false);
                  setIsLookupOpen(true);
                }}
                type="button"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 99,
                  background: 'rgba(255,255,255,0.22)',
                  backdropFilter: 'blur(8px)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.35)',
                  fontWeight: 800, fontSize: '0.75rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                <span>📱</span>
                <span>Track By Mobile</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ──── ACTIVE ORDERS LIVE TRACKER BANNER (TABLE ISOLATED) ──── */}
      {currentTableActiveOrders.length > 0 && (
        <div
          onClick={() => setIsBillOpen(true)}
          style={{
            margin: '12px 16px 0',
            background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
            border: '1.5px solid #fecdd3',
            borderRadius: 16,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(225,29,72,0.08)',
            animation: 'fadeIn 0.3s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #e11d48, #be123c)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.15rem',
                boxShadow: '0 3px 10px rgba(225,29,72,0.3)',
                flexShrink: 0,
              }}
            >
              🔔
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#be123c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {currentTableActiveOrders.length === 1 ? '1 Active Order in Kitchen' : `${currentTableActiveOrders.length} Active Orders`} · ₹{currentTableUnpaidTotal} Unpaid
              </div>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#1c1917', lineHeight: 1.2, marginTop: 2 }}>
                Table #{tableNumber} · Tap to view live receipts & status
              </div>
            </div>
          </div>
          <div style={{
            background: '#fff',
            color: '#e11d48',
            fontWeight: 800,
            fontSize: '0.75rem',
            padding: '6px 12px',
            borderRadius: 99,
            border: '1px solid #fecdd3',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            flexShrink: 0,
          }}>
            <span>₹{currentTableUnpaidTotal} Due</span>
            <span>➔</span>
          </div>
        </div>
      )}

      {/* ──── PREMIUM STICKY CATEGORY NAV ──── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
      }}>
        <div ref={navRef} style={{
          display: 'flex', gap: 10, overflowX: 'auto',
          padding: '12px 16px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
          alignItems: 'center'
        }}>
          {loading
            ? Array.from({length:8}).map((_,i) => (
                <div key={i} className="skeleton" style={{ height:38, width:110, borderRadius:14, flexShrink:0 }} />
              ))
            : grouped.map(({ category }) => (
                <button
                  key={category}
                  ref={el => pillRefs.current[category] = el}
                  onClick={() => scrollTo(category)}
                  type="button"
                  style={{
                    flexShrink: 0,
                    padding: '8px 18px', borderRadius: 14,
                    fontSize: '0.88rem', fontWeight: 700,
                    cursor: 'pointer', whiteSpace: 'nowrap',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '1.5px solid',
                    borderColor: activeCategory === category ? '#e11d48' : 'rgba(0,0,0,0.04)',
                    background: activeCategory === category ? 'linear-gradient(135deg, #fff1f2, #ffe4e6)' : '#fff',
                    color: activeCategory === category ? '#be123c' : '#6b7280',
                    boxShadow: activeCategory === category
                      ? '0 6px 16px rgba(225,29,72,0.18)'
                      : '0 2px 6px rgba(0,0,0,0.02)',
                    transform: activeCategory === category ? 'scale(1.02) translateY(-1px)' : 'scale(1) translateY(0)',
                  }}
                >
                  {category}
                </button>
              ))}
        </div>
      </div>

      {/* ──── MENU BODY ──── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 16px 60px' }}>
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))', gap:20 }}>
            {Array.from({length:9}).map((_,i) => <SkeletonCard key={i} />)}
          </div>
        ) : grouped.length === 0 ? (
          <div style={{ textAlign:'center', padding:80 }}>
            <div style={{ fontSize:64, marginBottom:16 }}>🍽️</div>
            <h2 style={{ fontFamily:'Playfair Display,serif', fontSize:'1.5rem', fontWeight:700, color:'#1c1917', marginBottom:8 }}>
              Menu coming soon
            </h2>
            <p style={{ color:'#9ca3af' }}>We're setting up the menu. Check back soon!</p>
          </div>
        ) : (
          grouped.map(({ category, dishes: catDishes }) => (
            <section
              key={category}
              data-category={category}
              ref={el => sectionRefs.current[category] = el}
              style={{ marginBottom: 48 }}
              className="animate-fade-in-up"
            >
              {/* Category heading */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20, paddingLeft: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h2 style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '1.45rem',
                    fontWeight: 900, color: '#1c1917',
                    letterSpacing: '-0.03em', margin: 0,
                    textTransform: 'capitalize'
                  }}>
                    {category}
                  </h2>
                  <span style={{
                    background: '#f3f4f6', color: '#6b7280',
                    borderRadius: 10, padding: '3px 10px', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0,
                  }}>
                    {catDishes.length} Items
                  </span>
                </div>
                <div style={{ width: 42, height: 3.5, borderRadius: 4, background: 'linear-gradient(135deg, #e11d48, #f59e0b)' }} />
              </div>

              {/* Cards grid */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:14 }}>
                {catDishes.map((dish, i) => (
                  <div key={dish.id} style={{ animationDelay:`${i*0.05}s` }}>
                    <DishCard dish={dish} accentColor="#e11d48" />
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {/* ──── FLOATING BOTTOM CART BAR ──── */}
      {totalItems > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: 16,
            left: 16,
            right: 16,
            maxWidth: 500,
            margin: '0 auto',
            zIndex: 9999,
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <button
            onClick={() => setIsCartOpen(true)}
            type="button"
            style={{
              width: '100%',
              padding: '14px 20px',
              borderRadius: 20,
              background: 'linear-gradient(135deg, #7f1d1d 0%, #be123c 60%, #e11d48 100%)',
              color: '#fff',
              border: '2px solid rgba(255,255,255,0.25)',
              boxShadow: '0 12px 36px rgba(225,29,72,0.5), 0 4px 12px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                🛒
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 900, fontSize: '1rem', lineHeight: 1.1 }}>
                  {totalItems} {totalItems === 1 ? 'Item' : 'Items'} · ₹{grandTotal}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>
                  Table #{tableNumber} · Tap to place order
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: 900,
                fontSize: '0.9rem',
                background: '#fff',
                color: '#be123c',
                padding: '8px 16px',
                borderRadius: 99,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              <span>View Cart</span>
              <span>→</span>
            </div>
          </button>
        </div>
      )}

      {/* ──── CART DRAWER & BILL MODAL ──── */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderPlaced={(order) => {
          setIsBillOpen(true);
        }}
      />

      {isBillOpen && (selectedModalOrder || currentTableActiveOrders.length > 0 || activeOrder || activeOrders.length > 0) && (
        <BillModal
          order={selectedModalOrder || activeOrder || currentTableActiveOrders[0] || activeOrders[0]}
          onClose={() => {
            setIsBillOpen(false);
            setSelectedModalOrder(null);
          }}
          onOrderMore={() => {
            setIsBillOpen(false);
            setSelectedModalOrder(null);
          }}
        />
      )}

      {/* ──── CUSTOMER ORDER LOOKUP MODAL (STRICTLY BY MOBILE NUMBER) ──── */}
      {isLookupOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999999,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            animation: 'fadeIn 0.2s ease',
          }}
          onClick={() => setIsLookupOpen(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 24,
              padding: '24px 20px',
              maxWidth: 480,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              animation: 'bounceIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: '#fff1f2', color: '#e11d48',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0,
                }}>
                  📱
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#1c1917' }}>
                    Track Orders By Mobile
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: '#6b7280' }}>
                    Enter mobile number to view all your database orders
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLookupOpen(false)}
                type="button"
                style={{
                  background: '#f3f4f6', border: 'none', borderRadius: '50%',
                  width: 32, height: 32, cursor: 'pointer', fontWeight: 800,
                  fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#4b5563',
                }}
              >✕</button>
            </div>

            {/* Search Input Form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const cleanPhone = String(lookupQuery).trim().replace(/\D/g, '');
                if (cleanPhone.length < 4) {
                  toast.error('Please enter a valid mobile number (at least 4-10 digits)');
                  return;
                }
                setIsSearching(true);
                try {
                  const found = await fetchOrdersByPhone(cleanPhone);
                  setSearchedOrders(found || []);
                  setHasSearched(true);
                  if (found && found.length > 0) {
                    toast.success(`Found ${found.length} order(s) for ${cleanPhone}! 🎉`);
                  }
                } catch (err) {
                  toast.error('Failed to search database orders.');
                } finally {
                  setIsSearching(false);
                }
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                  Customer Mobile Number:
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>📞</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="Enter mobile number (e.g. 8810328594)"
                    value={lookupQuery}
                    onChange={(e) => setLookupQuery(e.target.value)}
                    className="admin-input"
                    style={{
                      width: '100%',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      padding: '13px 14px 13px 42px',
                      borderRadius: 14,
                      border: '1.5px solid #d1d5db',
                      background: '#fff',
                    }}
                    autoFocus
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="submit"
                  disabled={isSearching}
                  style={{
                    flex: 1,
                    padding: '13px',
                    borderRadius: 12,
                    background: 'linear-gradient(135deg,#e11d48,#be123c)',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: isSearching ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(225,29,72,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  {isSearching ? 'Searching Database...' : '🔍 Find All Orders'}
                </button>
              </div>
            </form>

            {/* In-Modal Search Results List */}
            {hasSearched && (
              <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1c1917' }}>
                    {searchedOrders && searchedOrders.length > 0
                      ? `Found ${searchedOrders.length} Order(s)`
                      : 'No Orders Found'}
                  </span>
                  {searchedOrders && searchedOrders.length > 0 && (
                    <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Tap card to view full bill</span>
                  )}
                </div>

                {searchedOrders && searchedOrders.length === 0 ? (
                  <div style={{
                    padding: '24px 16px',
                    background: '#f9fafb',
                    borderRadius: 14,
                    textAlign: 'center',
                    border: '1px dashed #d1d5db',
                  }}>
                    <div style={{ fontSize: 32, marginBottom: 6 }}>🔍</div>
                    <div style={{ fontWeight: 800, color: '#374151', fontSize: '0.88rem' }}>
                      No orders found for this mobile number
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 3 }}>
                      Please verify your number or place a new order from your table.
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 320, overflowY: 'auto', paddingRight: 4 }}>
                    {(searchedOrders || []).map((ord) => {
                      const isCompleted = ord.status === 'completed';
                      const isPreparing = ord.status === 'preparing';
                      const isServed = ord.status === 'served';
                      
                      let statusBadge = { label: '⏳ Received', bg: '#fff1f2', text: '#be123c', border: '#fecdd3' };
                      if (isPreparing) statusBadge = { label: '👨‍🍳 In Kitchen', bg: '#fef3c7', text: '#b45309', border: '#fde68a' };
                      if (isServed) statusBadge = { label: '🍽️ Served', bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' };
                      if (isCompleted) statusBadge = { label: '💳 Bill Paid', bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' };

                      const itemsSummary = (ord.items || []).map((i) => `${i.name} (x${i.quantity})`).join(', ');

                      return (
                        <div
                          key={ord.id}
                          onClick={() => {
                            setSelectedModalOrder(ord);
                            setIsLookupOpen(false);
                            setIsBillOpen(true);
                          }}
                          style={{
                            background: '#f9fafb',
                            border: `1.5px solid ${isCompleted ? '#e5e7eb' : '#fecdd3'}`,
                            borderRadius: 14,
                            padding: '12px 14px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 6,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                              <span style={{ fontWeight: 900, color: '#1c1917', fontSize: '0.88rem' }}>
                                {ord.order_number}
                              </span>
                              <span style={{ marginLeft: 8, fontSize: '0.75rem', fontWeight: 800, color: '#e11d48', background: '#fff1f2', padding: '2px 8px', borderRadius: 99 }}>
                                Table #{ord.table_number}
                              </span>
                            </div>
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              color: statusBadge.text,
                              background: statusBadge.bg,
                              border: `1px solid ${statusBadge.border}`,
                              padding: '2px 8px',
                              borderRadius: 99,
                            }}>
                              {statusBadge.label}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.75rem', color: '#4b5563', lineHeight: 1.3 }}>
                            {itemsSummary || 'Dishes ordered'}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px dashed #e5e7eb', paddingTop: 6, marginTop: 2 }}>
                            <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                              {ord.created_at ? new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontWeight: 900, color: '#1c1917', fontSize: '0.92rem' }}>
                                ₹{ord.total}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: '#e11d48', fontWeight: 800 }}>
                                View Receipt ➔
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──── FOOTER ──── */}
      <footer style={{
        background: 'linear-gradient(135deg, #7f1d1d, #b91c1c)',
        padding: '32px 20px', textAlign:'center', color: '#fff'
      }}>
        <div style={{ fontSize:28, marginBottom:8 }}>🍔</div>
        <p style={{ color:'rgba(255,255,255,0.95)', fontFamily:'Playfair Display,serif', fontWeight:700, fontSize:'1.1rem', marginBottom:4 }}>
          Biggies Restaurant · Food Stop
        </p>
        <p style={{ color:'rgba(255,255,255,0.65)', fontSize:'0.78rem', maxWidth: 400, margin: '0 auto' }}>
          Scan the QR at your table to view dishes in 3D AR & place your order directly.
        </p>
      </footer>
    </div>
  );
}
