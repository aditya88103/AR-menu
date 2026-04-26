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
        background: 'linear-gradient(180deg, rgba(0,0,0,0.98) 0%, rgba(20,0,10,0.98) 100%)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      {/* Animated background particles */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 50%, rgba(225,29,72,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(190,18,60,0.15) 0%, transparent 50%)',
        animation: 'pulse 4s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg,#be123c,#e11d48,#f43f5e)',
        padding: '18px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        borderBottom: '2px solid rgba(255,255,255,0.1)',
        boxShadow: '0 4px 20px rgba(225,29,72,0.3)',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ 
            color: '#fff', 
            fontWeight: 900, 
            fontSize: '1.2rem',
            marginBottom: 4,
            textShadow: '0 2px 8px rgba(0,0,0,0.3)',
            letterSpacing: '-0.02em',
          }}>
            ✨ AR Experience
          </div>
          <div style={{ 
            color: 'rgba(255,255,255,0.9)', 
            fontSize: '0.85rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontWeight: 600,
          }}>
            {dishName}
          </div>
        </div>
        <button
          onClick={handleCloseClick}
          type="button"
          style={{
            width: 46,
            height: 46,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.25)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255,255,255,0.4)',
            color: '#fff',
            fontSize: 24,
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 16,
            flexShrink: 0,
            WebkitTapHighlightColor: 'transparent',
            transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.35)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
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
        gap: 28,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* 3D Model Preview with glow effect */}
        <div style={{
          width: '100%',
          maxWidth: 360,
          height: 300,
          borderRadius: 20,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(225,29,72,0.15), rgba(190,18,60,0.15))',
          border: '3px solid rgba(225,29,72,0.4)',
          position: 'relative',
          boxShadow: '0 20px 60px rgba(225,29,72,0.4), inset 0 0 40px rgba(225,29,72,0.1)',
          animation: 'glow 3s ease-in-out infinite',
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
            environment-image="neutral"
            exposure="1"
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
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(10px)',
              gap: 12,
            }}>
              <div style={{
                width: 50,
                height: 50,
                border: '5px solid rgba(255,255,255,0.2)',
                borderTopColor: '#e11d48',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
              <div style={{
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: 700,
                textShadow: '0 2px 8px rgba(0,0,0,0.5)',
              }}>
                Loading 3D Model...
              </div>
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
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.8)',
              color: '#fca5a5',
              fontSize: '0.95rem',
              padding: 20,
              textAlign: 'center',
              gap: 8,
            }}>
              <div style={{ fontSize: 40 }}>⚠️</div>
              <div>{error}</div>
            </div>
          )}

          {/* Floating AR badge */}
          {!isLoading && !error && (
            <div style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'linear-gradient(135deg, rgba(225,29,72,0.95), rgba(190,18,60,0.95))',
              backdropFilter: 'blur(10px)',
              color: '#fff',
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '6px 12px',
              borderRadius: 999,
              border: '2px solid rgba(255,255,255,0.3)',
              boxShadow: '0 4px 16px rgba(225,29,72,0.6)',
              animation: 'float 3s ease-in-out infinite',
              letterSpacing: '0.05em',
            }}>
              ✨ 3D READY
            </div>
          )}
        </div>

        {/* Title with gradient */}
        <div style={{ textAlign: 'center', maxWidth: 360 }}>
          <h2 style={{
            background: 'linear-gradient(135deg, #fff, #fecdd3)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: '1.5rem',
            fontWeight: 900,
            marginBottom: 12,
            lineHeight: 1.2,
            textShadow: '0 0 30px rgba(225,29,72,0.5)',
          }}>
            View in Augmented Reality
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: '0.95rem',
            lineHeight: 1.6,
            margin: 0,
            fontWeight: 500,
          }}>
            Place this delicious dish on your table and see it come to life! 🍽️
          </p>
        </div>

        {/* Steps with hover effect */}
        <div style={{
          display: 'flex',
          gap: 12,
          width: '100%',
          maxWidth: 360,
          justifyContent: 'center',
        }}>
          {[
            { icon: '📷', text: 'Open Camera', color: '#e11d48' },
            { icon: '🎯', text: 'Point Table', color: '#f43f5e' },
            { icon: '✨', text: 'Place Dish', color: '#fb7185' },
          ].map((step, i) => (
            <div 
              key={i} 
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255,255,255,0.2)',
                borderRadius: 16,
                padding: '16px 10px',
                textAlign: 'center',
                transition: 'all 0.3s',
                cursor: 'default',
                animation: `slideUp 0.5s ease-out ${i * 0.1}s backwards`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
                e.currentTarget.style.background = `linear-gradient(135deg, ${step.color}33, ${step.color}22)`;
                e.currentTarget.style.borderColor = step.color;
                e.currentTarget.style.boxShadow = `0 8px 24px ${step.color}44`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>{step.icon}</div>
              <div style={{
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.02em',
              }}>
                {step.text}
              </div>
            </div>
          ))}
        </div>

        {/* AR Launch Button with shimmer */}
        <div style={{ width: '100%', maxWidth: 360, marginTop: 12 }}>
          <button
            onClick={handleARClick}
            disabled={isLoading || error}
            type="button"
            style={{
              width: '100%',
              padding: '20px',
              borderRadius: 999,
              background: (!isLoading && !error)
                ? 'linear-gradient(135deg,#e11d48,#be123c,#9f1239)'
                : 'rgba(100,100,100,0.6)',
              color: '#fff',
              border: 'none',
              fontSize: '1.1rem',
              fontWeight: 900,
              cursor: (!isLoading && !error) ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              boxShadow: (!isLoading && !error)
                ? '0 12px 40px rgba(225,29,72,0.8), inset 0 1px 0 rgba(255,255,255,0.2)'
                : 'none',
              fontFamily: 'inherit',
              opacity: (!isLoading && !error) ? 1 : 0.7,
              transition: 'all 0.3s',
              WebkitTapHighlightColor: 'transparent',
              position: 'relative',
              overflow: 'hidden',
              letterSpacing: '0.02em',
              textShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
            onMouseEnter={(e) => {
              if (!isLoading && !error) {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 16px 50px rgba(225,29,72,1)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading && !error) {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(225,29,72,0.8)';
              }
            }}
          >
            {/* Shimmer effect */}
            {(!isLoading && !error) && (
              <span style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                animation: 'shimmer 2s infinite',
              }} />
            )}
            
            {isLoading ? (
              <>
                <div style={{
                  width: 20,
                  height: 20,
                  border: '3px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
                <span>Loading Model...</span>
              </>
            ) : error ? (
              <>
                <span style={{ fontSize: 24 }}>⚠️</span>
                <span>Model Unavailable</span>
              </>
            ) : (
              <>
                <span style={{ fontSize: 28 }}>📷</span>
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
          maxWidth: 360,
          margin: 0,
          fontWeight: 500,
        }}>
          💡 Requires ARCore (Android) or ARKit (iOS) compatible device
        </p>
      </div>

      {/* Bottom close button */}
      <div style={{
        padding: '18px 20px',
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(20px)',
        borderTop: '2px solid rgba(255,255,255,0.1)',
        flexShrink: 0,
        position: 'relative',
        zIndex: 1,
      }}>
        <button
          onClick={handleCloseClick}
          type="button"
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: 16,
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255,255,255,0.25)',
            color: '#fff',
            fontSize: '1.05rem',
            fontWeight: 800,
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
            transition: 'all 0.2s',
            letterSpacing: '0.02em',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Close
        </button>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 20px 60px rgba(225,29,72,0.4), inset 0 0 40px rgba(225,29,72,0.1); }
          50% { box-shadow: 0 20px 80px rgba(225,29,72,0.6), inset 0 0 60px rgba(225,29,72,0.2); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
}
