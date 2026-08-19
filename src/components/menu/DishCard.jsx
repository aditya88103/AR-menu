import React, { useState, useRef, useEffect } from 'react';
import ARModal from './ARModal';
import { useCartStore } from '../../store/cartStore';

/* Fast image with native lazy loading and smooth fallback */
function LazyImage({ src, alt }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#fef2f2', overflow: 'hidden' }}>
      {!error ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            opacity: loaded ? 1 : 0.4,
            transition: 'opacity 0.2s ease',
          }}
        />
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 32, background: '#fef2f2' }}>
          🍽️
        </div>
      )}
      {!loaded && !error && <div className="skeleton" style={{ position: 'absolute', inset: 0 }} />}
    </div>
  );
}

/* Floating "3D AR" badge on image */
function ARBadge() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 6,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'linear-gradient(135deg, rgba(0,0,0,0.85), rgba(30,0,15,0.92))',
        backdropFilter: 'blur(8px)',
        color: '#fff',
        fontSize: '0.58rem',
        fontWeight: 800,
        padding: '3px 9px',
        borderRadius: 99,
        letterSpacing: '0.06em',
        border: '1px solid rgba(255,255,255,0.25)',
        whiteSpace: 'nowrap',
        boxShadow: '0 2px 12px rgba(225,29,72,0.4)',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: '#e11d48',
          display: 'inline-block',
          boxShadow: '0 0 6px #e11d48',
        }}
      />
      ✨ 3D AR
    </div>
  );
}

/* Gradient "Try on Table" button */
function TryOnTableBtn({ onClick }) {
  const [hovered, setHovered] = useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      type="button"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '6px 12px',
        borderRadius: 99,
        fontSize: '0.7rem',
        fontWeight: 800,
        border: '1.5px solid rgba(225,29,72,0.3)',
        cursor: 'pointer',
        background: hovered ? 'linear-gradient(135deg, #ffe4e6, #fff1f2)' : '#fff',
        color: '#be123c',
        boxShadow: hovered ? '0 4px 14px rgba(225,29,72,0.2)' : '0 1px 4px rgba(0,0,0,0.03)',
        transform: hovered ? 'scale(1.02)' : 'scale(1)',
        transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
        fontFamily: 'Inter, sans-serif',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ fontSize: 12 }}>🪄</span>
      <span>Try on Table</span>
    </button>
  );
}

/* Add to Cart / Quantity Stepper */
function AddToCartBtn({ dish }) {
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);

  const cartList = Array.isArray(items) ? items : [];
  const currentItem = cartList.find((i) => i?.id === dish?.id);
  const quantity = Number(currentItem?.quantity) || 0;

  if (quantity > 0) {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #e11d48, #be123c)',
          borderRadius: 99,
          padding: '2px 4px',
          boxShadow: '0 4px 14px rgba(225,29,72,0.35)',
          gap: 6,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => removeItem(dish.id)}
          type="button"
          aria-label="Decrease quantity"
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.25)',
            border: 'none',
            color: '#fff',
            fontWeight: 900,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s',
          }}
        >
          -
        </button>
        <span
          style={{
            color: '#fff',
            fontWeight: 900,
            fontSize: '0.85rem',
            minWidth: 16,
            textAlign: 'center',
          }}
        >
          {quantity}
        </span>
        <button
          onClick={() => addItem(dish)}
          type="button"
          aria-label="Increase quantity"
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: '#fff',
            border: 'none',
            color: '#be123c',
            fontWeight: 900,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            transition: 'transform 0.15s',
          }}
        >
          +
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(dish);
      }}
      type="button"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '7px 16px',
        borderRadius: 99,
        background: 'linear-gradient(135deg, #e11d48, #be123c)',
        color: '#fff',
        border: 'none',
        fontWeight: 800,
        fontSize: '0.78rem',
        cursor: 'pointer',
        boxShadow: '0 3px 12px rgba(225,29,72,0.3)',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px) scale(1.03)';
        e.currentTarget.style.boxShadow = '0 6px 18px rgba(225,29,72,0.45)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 3px 12px rgba(225,29,72,0.3)';
      }}
    >
      <span>+</span>
      <span>Add</span>
    </button>
  );
}

export default function DishCard({ dish, accentColor = '#e11d48' }) {
  const [showAR, setShowAR] = useState(false);

  // Handle both column name cases
  const isVeg = dish.isVeg !== undefined ? dish.isVeg : dish.isveg;
  const imageURL = dish.imageURL || dish.imageurl || '';
  const modelURL = dish.modelURL || dish.modelurl || '';

  return (
    <>
      <div
        style={{
          background: '#fff',
          borderRadius: 20,
          boxShadow: '0 2px 14px rgba(0,0,0,0.05)',
          border: '1px solid rgba(0,0,0,0.05)',
          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
          display: 'flex',
          flexDirection: 'row',
          padding: 12,
          gap: 14,
          position: 'relative',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = `0 12px 28px rgba(225,29,72,0.12)`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 14px rgba(0,0,0,0.05)';
        }}
      >
        {/* Left: Image + AR badge */}
        <div
          style={{
            width: 110,
            height: 110,
            borderRadius: 16,
            overflow: 'hidden',
            position: 'relative',
            flexShrink: 0,
            boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
          }}
        >
          {imageURL ? (
            <LazyImage src={imageURL} alt={dish.name} />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #fef2f2, #fecdd3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 36,
              }}
            >
              🍽️
            </div>
          )}
          {modelURL && <ARBadge />}
        </div>

        {/* Right: Info */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 2 }}>
              {/* Veg / Non-Veg Indicator Dot */}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 15,
                  height: 15,
                  borderRadius: 4,
                  flexShrink: 0,
                  marginTop: 2,
                  border: `1.5px solid ${isVeg === true ? '#16a34a' : '#dc2626'}`,
                  background: isVeg === true ? '#f0fdf4' : '#fef2f2',
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: isVeg === true ? '#16a34a' : '#dc2626',
                    display: 'block',
                  }}
                />
              </span>
              <h3
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  color: '#1c1917',
                  lineHeight: 1.3,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  margin: 0,
                  flex: 1,
                }}
              >
                {dish.name}
              </h3>
            </div>

            <div style={{ fontWeight: 900, color: '#e11d48', fontSize: '1rem', marginBottom: 4, letterSpacing: '-0.02em' }}>
              ₹{dish.price}
            </div>

            {dish.description && (
              <p
                style={{
                  fontSize: '0.72rem',
                  color: '#6b7280',
                  lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  marginBottom: 8,
                  margin: '0 0 8px',
                }}
              >
                {dish.description}
              </p>
            )}
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 4 }}>
            {modelURL ? (
              <TryOnTableBtn onClick={() => setShowAR(true)} />
            ) : <div />}
            <AddToCartBtn dish={dish} />
          </div>
        </div>
      </div>

      {showAR && (
        <ARModal
          modelUrl={modelURL}
          dishName={dish.name}
          dishPrice={dish.price}
          dishImage={imageURL}
          isVeg={isVeg}
          onClose={() => setShowAR(false)}
        />
      )}
    </>
  );
}
