import React, { useState, useRef, useEffect } from 'react';
import ARModal from './ARModal';

/* Lazy-load image with blur-up + skeleton */
function LazyImage({ src, alt }) {
  const imgRef  = useRef();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!imgRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && imgRef.current) imgRef.current.src = src; },
      { rootMargin: '120px' }
    );
    obs.observe(imgRef.current);
    return () => obs.disconnect();
  }, [src]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#fef2f2', overflow: 'hidden' }}>
      <img
        ref={imgRef}
        alt={alt}
        className={`img-blur-up ${loaded ? 'loaded' : ''}`}
        onLoad={() => setLoaded(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      {!loaded && <div className="skeleton" style={{ position: 'absolute', inset: 0 }} />}
    </div>
  );
}

/* Floating "3D AR" badge on image */
function ARBadge() {
  return (
    <div style={{
      position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)',
      background: 'linear-gradient(135deg, rgba(0,0,0,0.75), rgba(0,0,20,0.85))',
      backdropFilter: 'blur(8px)',
      color: '#fff', fontSize: '0.58rem', fontWeight: 800,
      padding: '3px 9px', borderRadius: 99,
      letterSpacing: '0.08em',
      border: '1px solid rgba(255,255,255,0.2)',
      whiteSpace: 'nowrap',
      boxShadow: '0 2px 12px rgba(225,29,72,0.4)',
      display: 'flex', alignItems: 'center', gap: 4,
      animation: 'float-badge 3s ease-in-out infinite',
    }}>
      {/* Animated dot */}
      <span style={{
        width: 5, height: 5, borderRadius: '50%',
        background: '#e11d48',
        display: 'inline-block',
        boxShadow: '0 0 6px #e11d48',
        animation: 'pulse-dot 1.2s ease-in-out infinite',
        flexShrink: 0,
      }} />
      ✨ 3D AR
    </div>
  );
}

/* Gradient "Try on Table" button with shimmer sweep */
function TryOnTableBtn({ onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        alignSelf: 'flex-start',
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '7px 16px', borderRadius: 99,
        fontSize: '0.72rem', fontWeight: 800,
        border: 'none', cursor: 'pointer',
        background: hovered
          ? 'linear-gradient(135deg, #f43f5e, #be123c)'
          : 'linear-gradient(135deg, #e11d48, #9f1239)',
        color: '#fff',
        boxShadow: hovered
          ? '0 6px 24px rgba(225,29,72,0.6)'
          : '0 3px 12px rgba(225,29,72,0.35)',
        transform: hovered ? 'translateY(-1px) scale(1.02)' : 'translateY(0) scale(1)',
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
        fontFamily: 'Inter, sans-serif',
        letterSpacing: '-0.01em',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Shimmer sweep */}
      <span style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)',
        backgroundSize: '200% 100%',
        animation: 'btn-shimmer 2.5s ease-in-out infinite',
        borderRadius: 'inherit',
        pointerEvents: 'none',
      }} />
      <span style={{ fontSize: 13, filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))', zIndex: 1 }}>🪄</span>
      <span style={{ zIndex: 1 }}>Try on Table</span>
    </button>
  );
}

export default function DishCard({ dish, accentColor = '#e11d48' }) {
  const [showAR, setShowAR] = useState(false);

  return (
    <>
      <div
        style={{
          background: '#fff',
          borderRadius: 20,
          boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
          border: '1px solid rgba(0,0,0,0.04)',
          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
          display: 'flex', flexDirection: 'row',
          padding: 12, gap: 14,
          position: 'relative',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = `0 12px 32px rgba(225,29,72,0.1)`;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.05)';
        }}
      >
        {/* Left: Image + AR badge */}
        <div style={{
          width: 110, height: 110, borderRadius: 14,
          overflow: 'hidden', position: 'relative',
          flexShrink: 0,
          boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
        }}>
          {dish.imageURL
            ? <LazyImage src={dish.imageURL} alt={dish.name} />
            : (
              <div style={{
                width: '100%', height: '100%',
                background: 'linear-gradient(135deg, #fef2f2, #fecdd3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 36,
              }}>🍽️</div>
            )
          }
          {dish.modelURL && <ARBadge />}
        </div>

        {/* Right: Info */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 2 }}>
            {/* Veg/Non-Veg dot */}
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 14, height: 14, borderRadius: 3, flexShrink: 0, marginTop: 3,
              border: `1.5px solid ${dish.isVeg === true ? '#16a34a' : '#dc2626'}`,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: dish.isVeg === true ? '#16a34a' : '#dc2626',
                display: 'block',
              }} />
            </span>
            <h3 style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700, fontSize: '0.95rem',
              color: '#1c1917', lineHeight: 1.3,
              display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical', overflow: 'hidden',
              margin: 0, flex: 1,
            }}>
              {dish.name}
            </h3>
          </div>

          <div style={{ fontWeight: 800, color: '#1c1917', fontSize: '0.95rem', marginBottom: 5 }}>
            ₹{dish.price}
          </div>

          {dish.description && (
            <p style={{
              fontSize: '0.72rem', color: '#6b7280', lineHeight: 1.4,
              display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical', overflow: 'hidden',
              marginBottom: 10, margin: '0 0 10px',
            }}>
              {dish.description}
            </p>
          )}

          {dish.modelURL && <TryOnTableBtn onClick={() => setShowAR(true)} />}
        </div>
      </div>

      {showAR && (
        <ARModal
          modelUrl={dish.modelURL}
          dishName={dish.name}
          onClose={() => setShowAR(false)}
        />
      )}
    </>
  );
}
