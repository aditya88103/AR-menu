import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { onAvailableDishesChange, onCategoriesChange, getStoredDishes, getStoredCategories } from '../../utils/firestore';
import DishCard from '../../components/menu/DishCard';
import CartDrawer from '../../components/menu/CartDrawer';
import BillModal from '../../components/menu/BillModal';
import { useCartStore } from '../../store/cartStore';

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

  // Cart & Bill Modal state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isBillOpen, setIsBillOpen] = useState(false);

  // Store bindings
  const items = useCartStore((state) => state.items) || [];
  const tableNumber = useCartStore((state) => state.tableNumber) || '1';
  const setTableNumber = useCartStore((state) => state.setTableNumber);
  const activeOrder = useCartStore((state) => state.activeOrder);

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

    return () => {
      isMounted = false;
      unsubscribeDishes();
      unsubscribeCategories();
    };
  }, []);

  // ── Memoized Grouped Dishes for ultra fast rendering ───────────
  const grouped = useMemo(() => {
    const visibleDishes = vegOnly
      ? dishes.filter(d => (d.isVeg !== undefined ? d.isVeg : d.isveg) === true)
      : dishes;

    const list = categories
      .map(cat => ({ category: cat.name, dishes: visibleDishes.filter(d => d.category === cat.name) }))
      .filter(g => g.dishes.length > 0);

    const listed = new Set(categories.map(c => c.name));
    const others = visibleDishes.filter(d => !listed.has(d.category));
    if (others.length) list.push({ category: 'Other', dishes: others });

    return list;
  }, [categories, dishes, vegOnly]);

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

          {/* Active Order / Bill Shortcut button */}
          {activeOrder && (
            <button
              onClick={() => setIsBillOpen(true)}
              type="button"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 99,
                background: '#fff', color: '#be123c',
                border: 'none', fontWeight: 800, fontSize: '0.75rem',
                cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              <span>🧾</span>
              <span>View Active Bill</span>
            </button>
          )}

          {!loading && !activeOrder && (
             <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.75rem', fontWeight: 600 }}>
               {visibleDishes.length} Dishes
             </div>
          )}
        </div>
      </header>

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

      {isBillOpen && activeOrder && (
        <BillModal
          order={activeOrder}
          onClose={() => setIsBillOpen(false)}
          onOrderMore={() => setIsBillOpen(false)}
        />
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
