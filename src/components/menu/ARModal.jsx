import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function ARModal({ modelUrl, dishName, dishPrice, dishImage, isVeg, onClose }) {
  const modelViewerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('3d'); // '3d' | 'guide'

  // Resolve model URL to fully qualified absolute URL (Required for Android SceneViewer & iOS Quick Look)
  const absoluteModelUrl = React.useMemo(() => {
    if (!modelUrl) return '';
    try {
      return new URL(modelUrl, window.location.href).href;
    } catch (e) {
      return modelUrl;
    }
  }, [modelUrl]);

  useEffect(() => {
    // Prevent background scrolling
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

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

    console.log('🔍 Loading 3D Model from:', absoluteModelUrl);

    const handleLoad = () => {
      console.log('✅ 3D Model loaded successfully');
      setIsLoading(false);
      setError(null);
    };

    const handleError = (e) => {
      console.error('❌ Model loading error:', e);
      setIsLoading(false);
      setError('Unable to render 3D preview. Model format or network issue.');
    };

    modelViewer.addEventListener('load', handleLoad);
    modelViewer.addEventListener('error', handleError);

    if (modelViewer.loaded) {
      handleLoad();
    }

    return () => {
      modelViewer.removeEventListener('load', handleLoad);
      modelViewer.removeEventListener('error', handleError);
    };
  }, [absoluteModelUrl]);

  const handleLaunchAR = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const modelViewer = modelViewerRef.current;
    if (!modelViewer) return;

    try {
      if (modelViewer.canActivateAR) {
        await modelViewer.activateAR();
      } else {
        // Trigger slot button if available or show guidance
        const arBtn = modelViewer.shadowRoot?.querySelector('#default-ar-button');
        if (arBtn) {
          arBtn.click();
        } else {
          alert('AR requires a mobile phone with Google ARCore (Android) or Apple ARKit (iOS Safari / Chrome). On PC/Laptop, you can rotate and zoom in 360° directly on screen!');
        }
      }
    } catch (err) {
      console.warn('AR trigger warning:', err);
      // Fallback intent for Android if model-viewer native call is blocked
      if (/android/i.test(navigator.userAgent)) {
        const sceneViewerUrl = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(
          absoluteModelUrl
        )}&mode=ar_preferred&title=${encodeURIComponent(
          dishName || 'Food Item'
        )}#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;end;`;
        window.location.href = sceneViewerUrl;
      } else {
        alert('To view in AR, scan the QR code on your mobile phone camera!');
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
        background: 'linear-gradient(180deg, rgba(15, 7, 10, 0.98) 0%, rgba(26, 10, 16, 0.98) 100%)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeIn 0.25s ease-out',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        color: '#fff',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #881337 0%, #be123c 60%, #e11d48 100%)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          borderBottom: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 4px 24px rgba(225,29,72,0.35)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            ✨
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fecdd3', fontWeight: 800 }}>
              Augmented Reality Experience
            </div>
            <div
              style={{
                fontSize: '1.1rem',
                fontWeight: 900,
                color: '#fff',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: 1.2,
              }}
            >
              {dishName}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          type="button"
          aria-label="Close"
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(8px)',
            border: '1.5px solid rgba(255,255,255,0.3)',
            color: '#fff',
            fontSize: 20,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 12,
            flexShrink: 0,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.08) rotate(90deg)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
          }}
        >
          ✕
        </button>
      </div>

      {/* Mode Switcher Tabs */}
      <div
        style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.06)',
          padding: '4px',
          margin: '12px 16px 0',
          borderRadius: 14,
          border: '1px solid rgba(255,255,255,0.08)',
          maxWidth: 380,
          alignSelf: 'center',
          width: 'calc(100% - 32px)',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('3d')}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: 10,
            border: 'none',
            background: activeTab === '3d' ? 'linear-gradient(135deg, #e11d48, #be123c)' : 'transparent',
            color: activeTab === '3d' ? '#fff' : 'rgba(255,255,255,0.7)',
            fontWeight: 700,
            fontSize: '0.8rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: activeTab === '3d' ? '0 2px 10px rgba(225,29,72,0.4)' : 'none',
          }}
        >
          🔮 3D Table Simulator
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('guide')}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: 10,
            border: 'none',
            background: activeTab === 'guide' ? 'linear-gradient(135deg, #e11d48, #be123c)' : 'transparent',
            color: activeTab === 'guide' ? '#fff' : 'rgba(255,255,255,0.7)',
            fontWeight: 700,
            fontSize: '0.8rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: activeTab === 'guide' ? '0 2px 10px rgba(225,29,72,0.4)' : 'none',
          }}
        >
          📖 AR Guide & Steps
        </button>
      </div>

      {/* Main Container */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px 16px 24px',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          gap: 18,
        }}
      >
        {activeTab === '3d' ? (
          <>
            {/* 3D Model Stage Canvas */}
            <div
              style={{
                width: '100%',
                maxWidth: 400,
                height: 320,
                borderRadius: 24,
                overflow: 'hidden',
                background: 'radial-gradient(circle at 50% 40%, rgba(225, 29, 72, 0.25) 0%, rgba(20, 5, 12, 0.95) 75%)',
                border: '2px solid rgba(225, 29, 72, 0.35)',
                position: 'relative',
                boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 0 50px rgba(225, 29, 72, 0.15)',
              }}
            >
              {/* Table Platter Graphic Under Model */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 30,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 200,
                  height: 36,
                  borderRadius: '50%',
                  background: 'radial-gradient(ellipse at center, rgba(225,29,72,0.4) 0%, rgba(0,0,0,0.8) 70%, transparent 100%)',
                  filter: 'blur(4px)',
                  pointerEvents: 'none',
                }}
              />

              <model-viewer
                ref={modelViewerRef}
                src={absoluteModelUrl}
                alt={dishName}
                ar
                ar-modes="webxr scene-viewer quick-look"
                ar-scale="auto"
                ar-placement="floor"
                camera-controls
                auto-rotate
                rotation-per-second="25deg"
                shadow-intensity="1.5"
                shadow-softness="0.9"
                environment-image="neutral"
                exposure="1.15"
                loading="eager"
                reveal="auto"
                touch-action="pan-y"
                quick-look-browsers="safari chrome"
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'transparent',
                }}
              >
                {/* Native Model-Viewer AR Slot Button */}
                <button
                  slot="ar-button"
                  id="default-ar-button"
                  style={{
                    display: 'none',
                  }}
                >
                  Launch AR
                </button>
              </model-viewer>

              {/* 3D Interaction Badge */}
              <div
                style={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  background: 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  padding: '4px 10px',
                  borderRadius: 99,
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  pointerEvents: 'none',
                }}
              >
                <span>🔄</span> Drag to rotate · Pinch to zoom
              </div>

              {/* Live Loading Overlay */}
              {isLoading && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(15, 7, 10, 0.85)',
                    backdropFilter: 'blur(10px)',
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      border: '4px solid rgba(225,29,72,0.2)',
                      borderTopColor: '#e11d48',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 700 }}>
                    Preparing 3D Dish View...
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(15, 7, 10, 0.92)',
                    padding: 24,
                    textAlign: 'center',
                    gap: 10,
                  }}
                >
                  <div style={{ fontSize: 36 }}>🍽️</div>
                  <div style={{ color: '#fca5a5', fontSize: '0.85rem', fontWeight: 600 }}>{error}</div>
                  <button
                    onClick={() => {
                      setIsLoading(true);
                      setError(null);
                      if (modelViewerRef.current) modelViewerRef.current.src = absoluteModelUrl;
                    }}
                    style={{
                      padding: '6px 16px',
                      borderRadius: 8,
                      background: 'rgba(225,29,72,0.3)',
                      border: '1px solid #e11d48',
                      color: '#fff',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Retry Loading
                  </button>
                </div>
              )}
            </div>

            {/* Launch Real AR Button */}
            <div style={{ width: '100%', maxWidth: 400 }}>
              <button
                onClick={handleLaunchAR}
                disabled={isLoading || error}
                type="button"
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  borderRadius: 16,
                  background: !isLoading && !error
                    ? 'linear-gradient(135deg, #e11d48 0%, #be123c 50%, #9f1239 100%)'
                    : 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '1.05rem',
                  fontWeight: 900,
                  cursor: !isLoading && !error ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  boxShadow: !isLoading && !error ? '0 10px 30px rgba(225,29,72,0.6)' : 'none',
                  transition: 'all 0.25s ease',
                  letterSpacing: '0.01em',
                }}
              >
                <span style={{ fontSize: 24 }}>📷</span>
                <span>Place On My Real Table (AR Camera)</span>
              </button>
            </div>

            {/* Helper Prompt */}
            <div
              style={{
                textAlign: 'center',
                maxWidth: 380,
                color: 'rgba(255,255,255,0.65)',
                fontSize: '0.76rem',
                lineHeight: 1.5,
              }}
            >
              💡 <strong>Mobile Tip:</strong> Tap the camera button above to open your phone camera and point at your dining table surface.
            </div>
          </>
        ) : (
          /* Guide Tab */
          <div
            style={{
              width: '100%',
              maxWidth: 400,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            {[
              {
                step: '1',
                title: 'Tap "Place On Table"',
                desc: 'Click the camera button to request camera access on your mobile device.',
                icon: '📱',
              },
              {
                step: '2',
                title: 'Scan Your Table Surface',
                desc: 'Slowly move your camera across the flat dining table or desk surface until a target ring appears.',
                icon: '🎯',
              },
              {
                step: '3',
                title: 'Inspect & Resize',
                desc: 'The realistic 3D dish will appear directly on your table! Use two fingers to scale or rotate.',
                icon: '🍔',
              },
            ].map((item) => (
              <div
                key={item.step}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 16,
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #e11d48, #9f1239)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(225,29,72,0.3)',
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#fff', marginBottom: 3 }}>
                    {item.step}. {item.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => setActiveTab('3d')}
              style={{
                marginTop: 8,
                padding: '14px',
                borderRadius: 14,
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              ← Back to 3D Viewer
            </button>
          </div>
        )}
      </div>

      {/* Footer Close */}
      <div
        style={{
          padding: '14px 20px',
          background: 'rgba(10, 4, 7, 0.95)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <button
          onClick={onClose}
          type="button"
          style={{
            padding: '10px 32px',
            borderRadius: 99,
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff',
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          Close Preview
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
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
}
