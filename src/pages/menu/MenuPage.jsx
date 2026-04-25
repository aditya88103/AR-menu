import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { onAvailableDishesChange, onCategoriesChange, initializeDemoData } from '../../utils/firestore';
import DishCard from '../../components/menu/DishCard';

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

  const [dishes, setDishes]         = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActive] = useState('');
  const [loading, setLoading]       = useState(true);
  const [vegOnly, setVegOnly]       = useState(false);

  const sectionRefs = useRef({});
  const navRef      = useRef();
  const pillRefs    = useRef({});

  // ── Load data with real-time listeners ──────────────────────
  useEffect(() => {
    // Initialize demo data on first load
    initializeDemoData().catch(err => console.warn('Demo data init failed:', err));
    
    // Set up real-time listeners
    const unsubscribeDishes = onAvailableDishesChange((dishesList) => {
      setDishes(dishesList);
      setLoading(false);
    });
    
    const unsubscribeCategories = onCategoriesChange((cats) => {
      setCategories(cats);
      if (cats.length) setActive(prev => prev || cats[0].name);
      setLoading(false);
    });

    return () => {
      unsubscribeDishes();
      unsubscribeCategories();
    };
  }, []);

  // ── Group dishes ─────────────────────────────────────────────
  // vegOnly: only show dishes where isVeg is EXPLICITLY true
  const visibleDishes = vegOnly ? dishes.filter(d => d.isVeg === true) : dishes;

  const grouped = categories
    .map(cat => ({ category: cat.name, dishes: visibleDishes.filter(d => d.category === cat.name) }))
    .filter(g => g.dishes.length > 0);

  const listed = new Set(categories.map(c => c.name));
  const others = visibleDishes.filter(d => !listed.has(d.category));
  if (others.length) grouped.push({ category: 'Other', dishes: others });

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
    <div style={{ minHeight: '100vh', background: '#fff8f0' }}>

      {/* ──── COMPACT MOBILE HEADER ──── */}
      <header style={{
        background: 'linear-gradient(135deg, #7f1d1d 0%, #be123c 50%, #e11d48 100%)',
        padding: '24px 16px 24px',
        position: 'relative',
        overflow: 'hidden',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        boxShadow: '0 4px 20px rgba(225,29,72,0.15)'
      }}>
        {/* Subtle decorative elements */}
        <div style={{ position:'absolute', top:-40, right:-20, width:140, height:140, borderRadius:'50%', background:'rgba(255,255,255,0.06)', pointerEvents:'none' }} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Logo / icon */}
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
            border: '1.5px solid rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>🍔</div>

          <div>
            <h1 style={{
              fontFamily: 'Playfair Display, serif',
              color: '#fff', fontSize: '1.4rem',
              fontWeight: 800, margin: 0, letterSpacing: '-0.3px',
              lineHeight: 1.2, textShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}>
              Biggies
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.75rem', margin: '2px 0 0', letterSpacing: '0.02em', fontWeight: 500 }}>
              Serving Love Since 2015
            </p>
          </div>
        </div>

        {/* ── Compact Veg / Non-Veg Toggle ── */}
        <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => setVegOnly(v => !v)}
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
            {/* Toggle track */}
            <span style={{
              width: 28, height: 16, borderRadius: 10,
              background: vegOnly ? '#fff' : 'rgba(255,255,255,0.3)',
              display: 'inline-flex', alignItems: 'center',
              padding: '0 2px', transition: 'all 0.3s', flexShrink: 0,
            }}>
              <span style={{
                width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
                background: vegOnly ? '#16a34a' : '#fff',
                transform: vegOnly ? 'translateX(12px)' : 'translateX(0)',
                transition: 'all 0.3s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </span>
            <span>{vegOnly ? 'Veg Only' : 'Veg + Non-Veg'}</span>
          </button>

          {!loading && (
             <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.75rem', fontWeight: 600 }}>
               {visibleDishes.length} Dishes
             </div>
          )}
        </div>
      </header>

      {/* ──── PREMIUM STICKY CATEGORY NAV ──── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
      }}>
        <div ref={navRef} style={{
          display: 'flex', gap: 10, overflowX: 'auto',
          padding: '14px 16px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
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
                  style={{
                    flexShrink: 0,
                    padding: '8px 20px', borderRadius: 14,
                    fontSize: '0.9rem', fontWeight: 700,
                    cursor: 'pointer', whiteSpace: 'nowrap',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px 80px' }}>
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
          grouped.map(({ category, dishes: catDishes }, gi) => (
            <section
              key={category}
              data-category={category}
              ref={el => sectionRefs.current[category] = el}
              style={{ marginBottom: 60 }}
              className="animate-fade-in-up"
            >
              {/* Premium Category heading */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24, paddingLeft: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h2 style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '1.6rem',
                    fontWeight: 900, color: '#1c1917',
                    letterSpacing: '-0.04em', margin: 0,
                    textTransform: 'capitalize'
                  }}>
                    {category}
                  </h2>
                  <span style={{
                    background: '#f3f4f6', color: '#6b7280',
                    borderRadius: 10, padding: '4px 10px', fontSize: '0.8rem', fontWeight: 800, flexShrink: 0,
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                  }}>
                    {catDishes.length} Items
                  </span>
                </div>
                {/* Sleek accent line */}
                <div style={{ width: 48, height: 4, borderRadius: 4, background: 'linear-gradient(135deg, #e11d48, #f59e0b)' }} />
              </div>

              {/* Cards grid */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:12 }}>
                {catDishes.map((dish, i) => (
                  <div key={dish.id} style={{ animationDelay:`${i*0.06}s` }}>
                    <DishCard dish={dish} accentColor="#e11d48" />
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {/* ──── FOOTER ──── */}
      <footer style={{
        background: 'linear-gradient(135deg, #7f1d1d, #b91c1c)',
        padding: '28px 20px', textAlign:'center'
      }}>
        <div style={{ fontSize:28, marginBottom:8 }}>🍔</div>
        <p style={{ color:'rgba(255,255,255,0.9)', fontFamily:'Playfair Display,serif', fontWeight:700, fontSize:'1.1rem', marginBottom:4 }}>
          Biggies Restaurant
        </p>
        <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.78rem' }}>
          Food Stop · Scan QR at your table to view full menu & place dishes in AR
        </p>
      </footer>
    </div>
  );
}
