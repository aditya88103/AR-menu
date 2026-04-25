import React, { useEffect, useState } from 'react';

/* ─────────────────────────────────────────────────────────────────
   AR Modal – Simple & Working
───────────────────────────────────────────────────────────────── */

const IS_MOBILE = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const IS_IOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

export default function ARModal({ modelUrl, dishName, onClose }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(0,0,0,0.9)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header with Close Button */}
      <div style={{
        background: 'linear-gradient(135deg,#be123c,#e11d48)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>🪄</span>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: '1rem' }}>
              Try on Table
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>
              {dishName}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            border: '2px solid rgba(255,255,255,0.3)',
            color: '#fff',
            fontSize: 20,
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.95)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onTouchStart={(e) => {
            e.currentTarget.style.transform = 'scale(0.95)';
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        gap: 30,
        overflowY: 'auto',
      }}>
        {/* Icon */}
        <div style={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(225,29,72,0.2), rgba(190,18,60,0.2))',
          border: '3px solid rgba(225,29,72,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 60,
          animation: 'float 3s ease-in-out infinite',
        }}>
          📱
        </div>

        {/* Instructions */}
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <h2 style={{
            color: '#fff',
            fontSize: '1.5rem',
            fontWeight: 800,
            marginBottom: 12,
          }}>
            View in Augmented Reality
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: '0.95rem',
            lineHeight: 1.6,
            marginBottom: 20,
          }}>
            {IS_IOS 
              ? 'Tap the button below to open AR Quick Look and place this dish on your table in real size.'
              : 'Tap the button below to open your camera and see this dish on your table in real size.'}
          </p>
        </div>

        {/* Steps */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          width: '100%',
          maxWidth: 400,
        }}>
          {[
            { icon: '📷', text: 'Open Camera' },
            { icon: '🎯', text: 'Point at Table' },
            { icon: '✨', text: 'See Dish' },
          ].map((step, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              padding: '16px 8px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{step.icon}</div>
              <div style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}>
                {step.text}
              </div>
            </div>
          ))}
        </div>

        {/* Hidden model-viewer for AR */}
        <model-viewer
          src={modelUrl}
          ar
          ar-modes="webxr scene-viewer quick-look"
          style={{
            position: 'absolute',
            width: 1,
            height: 1,
            opacity: 0,
            pointerEvents: 'none',
          }}
          loading="eager"
          onLoad={() => setLoaded(true)}
        >
          {/* AR Launch Button */}
          <button
            slot="ar-button"
            disabled={!loaded}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 400,
              padding: '18px 32px',
              borderRadius: 999,
              background: loaded
                ? 'linear-gradient(135deg,#e11d48,#be123c)'
                : 'rgba(100,100,100,0.5)',
              color: '#fff',
              border: 'none',
              fontSize: '1.1rem',
              fontWeight: 900,
              cursor: loaded ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              boxShadow: loaded
                ? '0 8px 32px rgba(225,29,72,0.6)'
                : 'none',
              transition: 'all 0.3s',
              fontFamily: 'inherit',
              opacity: loaded ? 1 : 0.6,
            }}
          >
            {loaded ? (
              <>
                <span style={{ fontSize: 24 }}>📷</span>
                {IS_IOS ? 'View in Your Space' : 'Open AR Camera'}
              </>
            ) : (
              <>
                <div style={{
                  width: 20,
                  height: 20,
                  border: '3px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
                Loading AR Model...
              </>
            )}
          </button>
        </model-viewer>
      </div>

      {/* Bottom Close Button */}
      <div style={{
        padding: '16px 20px',
        background: 'rgba(0,0,0,0.5)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}>
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          Close
        </button>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
