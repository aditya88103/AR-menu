import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function ARModal({ modelUrl, dishName, onClose }) {
  const modelViewerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Prevent body scroll
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

  useEffect(() => {
    const modelViewer = modelViewerRef.current;
    if (!modelViewer) return;

    const handleLoad = () => {
      setIsLoading(false);
      setError(null);
    };

    const handleError = (e) => {
      console.error('Model loading error:', e);
      setIsLoading(false);
      setError('Failed to load 3D model');
    };

    modelViewer.addEventListener('load', handleLoad);
    modelViewer.addEventListener('error', handleError);

    return () => {
      modelViewer.removeEventListener('load', handleLoad);
      modelViewer.removeEventListener('error', handleError);
    };
  }, []);

  const handleCloseClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const handleARClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const modelViewer = modelViewerRef.current;
    if (!modelViewer) return;

    try {
      // Check if AR is supported
      if (modelViewer.canActivateAR) {
        await modelViewer.activateAR();
      } else {
        alert('AR is not supported on this device. Please use a compatible mobile device with ARCore (Android) or ARKit (iOS).');
      }
    } catch (err) {
      console.error('AR activation error:', err);
      alert('Could not launch AR. Please make sure you have the latest browser version.');
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
      {/* Header */}
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

      {/* Content */}
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
        {/* 3D Model Preview */}
        <div style={{
          width: '100%',
          maxWidth: 340,
          height: 280,
          borderRadius: 16,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(225,29,72,0.1), rgba(190,18,60,0.1))',
          border: '2px solid rgba(225,29,72,0.3)',
          position: 'relative',
        }}>
          <model-viewer
            ref={modelViewerRef}
            src={modelUrl}
            alt={dishName}
            ar
            ar-modes="webxr scene-viewer quick-look"
            camera-controls
            auto-rotate
            shadow-intensity="1"
            style={{
              width: '100%',
              height: '100%',
              background: 'transparent',
            }}
          />
          
          {isLoading && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.5)',
            }}>
              <div style={{
                width: 40,
                height: 40,
                border: '4px solid rgba(255,255,255,0.3)',
                borderTopColor: '#e11d48',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
            </div>
          )}

          {error && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.7)',
              color: '#fca5a5',
              fontSize: '0.9rem',
              padding: 20,
              textAlign: 'center',
            }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Title */}
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
            Tap the button below to place this dish on your table using your phone's camera
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
            { icon: '📷', text: 'Open Camera' },
            { icon: '🎯', text: 'Point at Table' },
            { icon: '✨', text: 'Place Dish' },
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

        {/* AR Launch Button */}
        <div style={{ width: '100%', maxWidth: 340, marginTop: 8 }}>
          <button
            onClick={handleARClick}
            disabled={isLoading || error}
            type="button"
            style={{
              width: '100%',
              padding: '18px',
              borderRadius: 999,
              background: (!isLoading && !error)
                ? 'linear-gradient(135deg,#e11d48,#be123c)'
                : 'rgba(100,100,100,0.6)',
              color: '#fff',
              border: 'none',
              fontSize: '1rem',
              fontWeight: 900,
              cursor: (!isLoading && !error) ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              boxShadow: (!isLoading && !error)
                ? '0 8px 32px rgba(225,29,72,0.7)'
                : 'none',
              fontFamily: 'inherit',
              opacity: (!isLoading && !error) ? 1 : 0.7,
              transition: 'all 0.3s',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {isLoading ? (
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
            ) : error ? (
              <>
                <span>⚠️</span>
                <span>Model Unavailable</span>
              </>
            ) : (
              <>
                <span style={{ fontSize: 24 }}>📷</span>
                <span>Launch AR Camera</span>
              </>
            )}
          </button>
        </div>

        {/* Info text */}
        <p style={{
          color: 'rgba(255,255,255,0.5)',
          fontSize: '0.75rem',
          textAlign: 'center',
          maxWidth: 340,
          margin: 0,
        }}>
          AR requires a compatible device with ARCore (Android) or ARKit (iOS)
        </p>
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
