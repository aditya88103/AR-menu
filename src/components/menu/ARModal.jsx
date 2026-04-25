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

        {/* ── Header ─────────────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg,#be123c,#e11d48)',
          padding: '16px 16px',
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>🪄</span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.2 }}>
                Try on Table
              </div>
              <div style={{
                color: 'rgba(255,255,255,0.8)', 
                fontSize: '0.7rem',
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap',
              }}>
                {dishName}
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            style={{
              width: 36, 
              height: 36, 
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.3)', 
              border: '1.5px solid rgba(255,255,255,0.25)',
              color: '#fff', 
              fontSize: 18, 
              cursor: 'pointer',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0,
              marginLeft: 12,
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
            }}
          >✕</button>
        </div>

        {/* ════════════════════════════════════════════════════════
            MOBILE — CAMERA LAUNCH VIEW
        ════════════════════════════════════════════════════════ */}
        {IS_MOBILE && (
          <div style={{
            flex: 1,
            overflowY: 'auto', 
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
            padding: '24px 20px 100px',
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: 20,
          }}>

            {/* Viewfinder */}
            <div style={{
              width: '100%', maxWidth: 300, aspectRatio: '4/3',
              borderRadius: 18,
              background: '#0a0a18',
              border: '2px solid rgba(225,29,72,0.35)',
              position: 'relative', overflow: 'hidden',
              flexShrink: 0,
            }}>
              {/* Corner brackets */}
              {[
                { top: 10, left: 10,   borderTop: '3px solid #e11d48', borderLeft: '3px solid #e11d48' },
                { top: 10, right: 10,  borderTop: '3px solid #e11d48', borderRight: '3px solid #e11d48' },
                { bottom: 10, left: 10,  borderBottom: '3px solid #e11d48', borderLeft: '3px solid #e11d48' },
                { bottom: 10, right: 10, borderBottom: '3px solid #e11d48', borderRight: '3px solid #e11d48' },
              ].map((s, i) => (
                <div key={i} style={{ position: 'absolute', width: 22, height: 22, borderRadius: 2, ...s }} />
              ))}
              {/* Scan line */}
              <div style={{
                position: 'absolute', left: 0, right: 0, height: 2,
                background: 'linear-gradient(90deg,transparent,#e11d48,transparent)',
                boxShadow: '0 0 10px rgba(225,29,72,0.8)',
                animation: 'arScanLine 2.5s ease-in-out infinite',
              }} />
              {/* Center */}
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <div style={{ fontSize: 48, animation: 'arFloat 3s ease-in-out infinite', filter: 'drop-shadow(0 0 16px rgba(225,29,72,0.6))' }}>🍽️</div>
                <div style={{
                  background: 'rgba(225,29,72,0.15)', border: '1px solid rgba(225,29,72,0.3)',
                  color: 'rgba(255,255,255,0.8)', fontSize: '0.6rem', fontWeight: 800,
                  padding: '3px 10px', borderRadius: 99, letterSpacing: '0.07em',
                }}>DETECTING SURFACE</div>
              </div>
            </div>

            {/* Instruction */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: '1rem', marginBottom: 6 }}>
                Point camera at your table
              </div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', lineHeight: 1.65 }}>
                {IS_IOS
                  ? 'Your iPhone will place the dish on any flat surface using AR Quick Look'
                  : 'Google will open the camera and place the dish on your table in real size'}
              </div>
            </div>

            {/* Steps */}
            <div style={{
              display: 'flex', width: '100%',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)',
              overflow: 'hidden',
            }}>
              {[['📷', 'Camera\nOpens'], ['🔍', 'Point at\nTable'], ['✨', 'Dish\nAppears']].map(([icon, label], i) => (
                <div key={i} style={{
                  flex: 1, padding: '14px 6px', textAlign: 'center',
                  borderRight: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
                  <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.62rem', lineHeight: 1.4, whiteSpace: 'pre-line', fontWeight: 600 }}>{label}</div>
                </div>
              ))}
            </div>

            {/* ── THE launch button ── */}
            <model-viewer
              ref={mvRef}
              src={modelUrl}
              ar
              ar-modes="webxr scene-viewer quick-look"
              style={{ 
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                height: 1,
                opacity: 0,
                pointerEvents: 'none',
                zIndex: -1,
              }}
              loading="eager"
            >
              <button
                slot="ar-button"
                style={{
                  position: 'fixed',
                  bottom: 20,
                  left: 20,
                  right: 20,
                  zIndex: 10000,
                  padding: '18px 0',
                  borderRadius: 999,
                  background: loaded 
                    ? 'linear-gradient(135deg,#e11d48,#be123c)' 
                    : 'rgba(225,29,72,0.5)',
                  color: '#fff', 
                  border: 'none',
                  fontWeight: 900, 
                  fontSize: '1.05rem',
                  fontFamily: 'inherit', 
                  cursor: 'pointer',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: 10,
                  boxShadow: loaded 
                    ? '0 8px 32px rgba(225,29,72,0.6)' 
                    : '0 4px 16px rgba(0,0,0,0.3)',
                  animation: loaded ? 'arBtnPulse 2s ease-in-out infinite' : 'none',
                  whiteSpace: 'nowrap',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                  opacity: loaded ? 1 : 0.7,
                  pointerEvents: loaded ? 'auto' : 'none',
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
                    Loading AR...
                  </>
                )}
              </button>
            </model-viewer>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            DESKTOP — 3D PREVIEW
        ════════════════════════════════════════════════════════ */}
        {!IS_MOBILE && (
          <>
            {/* viewer area */}
            <div style={{
              flex: 1, position: 'relative', minHeight: 0,
              background: '#0a0a14', overflow: 'hidden',
            }}
              onTouchMove={e => e.stopPropagation()}
            >
              {/* Loading overlay */}
              {!loaded && (
                <div style={{
                  position: 'absolute', inset: 0, zIndex: 10,
                  background: '#0d0d1a',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 14,
                }}>
                  <div style={{ position: 'relative', width: 64, height: 64 }}>
                    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid rgba(225,29,72,0.15)', borderTopColor: '#e11d48', animation: 'spin 1s linear infinite' }} />
                    <div style={{ position: 'absolute', inset: 10, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.06)', borderTopColor: 'rgba(255,255,255,0.3)', animation: 'spin 0.7s linear infinite reverse' }} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🍽️</div>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem' }}>Loading 3D model…</div>
                </div>
              )}

              {/* model-viewer — 3D spin */}
              <model-viewer
                ref={mvRef}
                src={modelUrl}
                ar
                ar-modes="webxr scene-viewer quick-look"
                camera-controls
                auto-rotate
                auto-rotate-delay="500"
                rotation-per-second="18deg"
                shadow-intensity="1"
                shadow-softness="0.8"
                exposure="1.1"
                environment-image="neutral"
                style={{
                  width: '100%', height: '100%',
                  background: 'transparent',
                  '--poster-color': 'transparent',
                  touchAction: 'none',
                }}
                loading="eager"
                onLoad={() => setLoaded(true)}
              >
                <button
                  slot="ar-button"
                  style={{
                    position: 'absolute', bottom: IS_MOBILE ? 20 : 16, left: '50%', transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg,#e11d48,#9f1239)',
                    color: '#fff', border: 'none', borderRadius: 999,
                    padding: '13px 28px', fontWeight: 800, fontSize: '0.9rem',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                    boxShadow: '0 8px 28px rgba(225,29,72,0.5)',
                    whiteSpace: 'nowrap', fontFamily: 'inherit', zIndex: 5,
                    animation: 'arBtnPulse 2s ease-in-out infinite',
                  }}
                >
                  <span style={{ fontSize: 18 }}>📷</span>
                  {IS_IOS ? 'View in Your Space' : 'Open AR Camera'}
                </button>
              </model-viewer>

              {/* Desktop hint overlay */}
              {!IS_MOBILE && (
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: 'linear-gradient(to top,rgba(8,8,18,0.98) 50%,transparent)',
                  padding: '48px 20px 22px',
                  pointerEvents: 'none',
                }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
                    borderRadius: 16, padding: '16px 18px', textAlign: 'center',
                    pointerEvents: 'auto',
                  }}>
                    <div style={{ fontSize: 30, marginBottom: 6 }}>📱</div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem', marginBottom: 4 }}>Open on phone for full AR</div>
                    <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem', lineHeight: 1.6 }}>
                      Scan QR → tap <b style={{ color: '#e11d48' }}>Try on Table</b> → point camera at table →<br />
                      see <b style={{ color: '#fff' }}>{dishName}</b> appear in real size
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* status bar */}
            <div style={{
              background: 'rgba(0,0,0,0.5)', borderTop: '1px solid rgba(255,255,255,0.05)',
              padding: '8px 14px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: '0.64rem', color: 'rgba(255,255,255,0.3)' }}>
                {IS_MOBILE ? '👆 Drag to rotate · Pinch to zoom' : '🖱️ Drag to rotate · Scroll to zoom'}
              </span>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'rgba(225,29,72,0.1)', border: '1px solid rgba(225,29,72,0.2)',
                borderRadius: 99, padding: '2px 8px',
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: loaded ? '#22c55e' : '#f59e0b',
                  boxShadow: `0 0 6px ${loaded ? '#22c55e' : '#f59e0b'}`,
                }} />
                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>
                  {loaded ? '3D READY' : 'LOADING…'}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Inline keyframes ─────────────────────────────────── */}
      <style>{`
        @keyframes arScanLine {
          0%   { top:0%;   opacity:0; }
          10%  { opacity:1; }
          90%  { opacity:1; }
          100% { top:100%; opacity:0; }
        }
        @keyframes arFloat {
          0%,100% { transform:translateY(0); }
          50%     { transform:translateY(-8px); }
        }
        @keyframes arBtnPulse {
          0%,100% { box-shadow:0 8px 32px rgba(225,29,72,0.45); }
          50%     { box-shadow:0 8px 44px rgba(225,29,72,0.75); }
        }
        @keyframes spin {
          to { transform:rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
