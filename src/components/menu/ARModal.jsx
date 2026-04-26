import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const IS_IOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

export default function ARModal({ modelUrl, dishName, onClose }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    // Handle escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const modalContent = (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        background: 'rgba(0,0,0,0.95)',
        display: 'flex',
        flexDirection: 'column',
        touchAction: 'none',
      }}
    >
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg,#be123c,#e11d48)',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ 
            color: '#fff', 
            fontWeight: 800, 
            fontSize: '1.1rem',
            marginBottom: 4,
          }}>
            🪄 Try on Table
          </div>
          <div style={{ 
            color: 'rgba(255,255,255,0.85)', 
            fontSize: '0.85rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {dishName}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            border: '2px solid rgba(255,255,255,0.3)',
            color: '#fff',
            fontSize: 22,
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 16,
            flexShrink: 0,
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
        padding: '30px 20px',
        gap: 30,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}>
        {/* Icon */}
        <div style={{
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(225,29,72,0.3), rgba(190,18,60,0.3))',
          border: '3px solid rgba(225,29,72,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 50,
        }}>
          📱
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', maxWidth: 350 }}>
          <h2 style={{
            color: '#fff',
            fontSize: '1.4rem',
            fontWeight: 800,
            marginBottom: 12,
            lineHeight: 1.3,
          }}>
            View in Augmented Reality
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.75)',
            fontSize: '0.9rem',
            lineHeight: 1.6,
          }}>
            {IS_IOS 
              ? 'Tap the button to see this dish on your table using AR Quick Look'
              : 'Tap the button to open your camera and place this dish on your table'}
          </p>
        </div>

        {/* Steps */}
        <div style={{
          display: 'flex',
          gap: 12,
          width: '100%',
          maxWidth: 350,
          justifyContent: 'center',
        }}>
          {[
            { icon: '📷', text: 'Camera' },
            { icon: '🎯', text: 'Point' },
            { icon: '✨', text: 'View' },
          ].map((step, i) => (
            <div key={i} style={{
              flex: 1,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 12,
              padding: '14px 8px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{step.icon}</div>
              <div style={{
                color: 'rgba(255,255,255,0.85)',
                fontSize: '0.7rem',
                fontWeight: 700,
              }}>
                {step.text}
              </div>
            </div>
          ))}
        </div>

        {/* AR Button Container */}
        <div style={{ width: '100%', maxWidth: 350, marginTop: 10 }}>
          <model-viewer
            src={modelUrl}
            ar
            ar-modes="webxr scene-viewer quick-look"
            style={{
              width: 1,
              height: 1,
              position: 'absolute',
              opacity: 0,
              pointerEvents: 'none',
            }}
            loading="eager"
            onLoad={() => setLoaded(true)}
          >
            <button
              slot="ar-button"
              disabled={!loaded}
              style={{
                width: '100%',
                padding: '20px',
                borderRadius: 999,
                background: loaded
                  ? 'linear-gradient(135deg,#e11d48,#be123c)'
                  : 'rgba(100,100,100,0.6)',
                color: '#fff',
                border: 'none',
                fontSize: '1.05rem',
                fontWeight: 900,
                cursor: loaded ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                boxShadow: loaded
                  ? '0 8px 32px rgba(225,29,72,0.7)'
                  : 'none',
                fontFamily: 'inherit',
                opacity: loaded ? 1 : 0.7,
                transition: 'all 0.3s',
              }}
            >
              {loaded ? (
                <>
                  <span style={{ fontSize: 26 }}>📷</span>
                  <span>{IS_IOS ? 'View in Your Space' : 'Open AR Camera'}</span>
                </>
              ) : (
                <>
                  <div style={{
                    width: 18,
                    height: 18,
                    border: '3px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                  <span>Loading...</span>
                </>
              )}
            </button>
          </model-viewer>
        </div>
      </div>

      {/* Bottom Close */}
      <div style={{
        padding: '20px',
        background: 'rgba(0,0,0,0.6)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        flexShrink: 0,
      }}>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.25)',
            color: '#fff',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
}
