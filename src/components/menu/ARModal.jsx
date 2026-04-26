import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const IS_IOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
const IS_ANDROID = /Android/i.test(navigator.userAgent);

export default function ARModal({ modelUrl, dishName, onClose }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Prevent body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    // Handle escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    
    // Preload model
    if (modelUrl) {
      fetch(modelUrl, { method: 'HEAD' })
        .then(() => setLoaded(true))
        .catch(() => {
          setError(true);
          setLoaded(true);
        });
    }
    
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose, modelUrl]);

  const handleCloseClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const handleARClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!loaded || error) return;
    
    // For iOS - use AR Quick Look
    if (IS_IOS) {
      const link = document.createElement('a');
      link.rel = 'ar';
      link.href = modelUrl;
      link.appendChild(document.createElement('img'));
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    // For Android - use Scene Viewer
    else if (IS_ANDROID) {
      const intent = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(modelUrl)}&mode=ar_preferred#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(window.location.href)};end;`;
      window.location.href = intent;
    }
    // Fallback - try model-viewer AR
    else {
      const modelViewer = document.querySelector('model-viewer');
      if (modelViewer && modelViewer.canActivateAR) {
        modelViewer.activateAR();
      }
    }
  };

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
      }}
    >
      {/* Header with close button */}
      <div style={{
        background: 'linear-gradient(135deg,#be123c,#e11d48)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        borderBottom: '1px solid rgba(255,255,255,0.1)',
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
          onClick={handleCloseClick}
          onTouchEnd={handleCloseClick}
          type="button"
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
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          ✕
        </button>
      </div>

      {/* Content area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 20px',
        gap: 24,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}>
        {/* Icon */}
        <div style={{
          width: 90,
          height: 90,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(225,29,72,0.3), rgba(190,18,60,0.3))',
          border: '3px solid rgba(225,29,72,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 45,
        }}>
          📱
        </div>

        {/* Title and description */}
        <div style={{ textAlign: 'center', maxWidth: 340 }}>
          <h2 style={{
            color: '#fff',
            fontSize: '1.3rem',
            fontWeight: 800,
            marginBottom: 10,
            lineHeight: 1.3,
          }}>
            View in Augmented Reality
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.75)',
            fontSize: '0.9rem',
            lineHeight: 1.6,
            margin: 0,
          }}>
            {IS_IOS 
              ? 'Tap the button below to see this dish on your table using AR Quick Look'
              : IS_ANDROID
              ? 'Tap the button below to open Google Scene Viewer and place this dish on your table'
              : 'Tap the button below to open your camera and place this dish on your table'}
          </p>
        </div>

        {/* Steps */}
        <div style={{
          display: 'flex',
          gap: 10,
          width: '100%',
          maxWidth: 340,
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
              padding: '12px 8px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 26, marginBottom: 6 }}>{step.icon}</div>
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

        {/* AR Button */}
        <div style={{ width: '100%', maxWidth: 340, marginTop: 8 }}>
          {error ? (
            <div style={{
              padding: '18px',
              borderRadius: 12,
              background: 'rgba(239,68,68,0.2)',
              border: '1px solid rgba(239,68,68,0.4)',
              color: '#fca5a5',
              fontSize: '0.9rem',
              textAlign: 'center',
            }}>
              ⚠️ Model not available
            </div>
          ) : (
            <button
              onClick={handleARClick}
              onTouchEnd={handleARClick}
              disabled={!loaded}
              type="button"
              style={{
                width: '100%',
                padding: '18px',
                borderRadius: 999,
                background: loaded
                  ? 'linear-gradient(135deg,#e11d48,#be123c)'
                  : 'rgba(100,100,100,0.6)',
                color: '#fff',
                border: 'none',
                fontSize: '1rem',
                fontWeight: 900,
                cursor: loaded ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                boxShadow: loaded
                  ? '0 8px 32px rgba(225,29,72,0.7)'
                  : 'none',
                fontFamily: 'inherit',
                opacity: loaded ? 1 : 0.7,
                transition: 'all 0.3s',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {loaded ? (
                <>
                  <span style={{ fontSize: 24 }}>📷</span>
                  <span>
                    {IS_IOS ? 'View in Your Space' : IS_ANDROID ? 'Open AR Camera' : 'Launch AR'}
                  </span>
                </>
              ) : (
                <>
                  <div style={{
                    width: 16,
                    height: 16,
                    border: '3px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                  <span>Loading 3D Model...</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Hidden model-viewer for fallback */}
        <model-viewer
          src={modelUrl}
          ar
          ar-modes="webxr scene-viewer quick-look"
          style={{
            width: '1px',
            height: '1px',
            position: 'absolute',
            opacity: 0,
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Bottom close button */}
      <div style={{
        padding: '16px 20px',
        background: 'rgba(0,0,0,0.6)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        flexShrink: 0,
      }}>
        <button
          onClick={handleCloseClick}
          onTouchEnd={handleCloseClick}
          type="button"
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.25)',
            color: '#fff',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
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
