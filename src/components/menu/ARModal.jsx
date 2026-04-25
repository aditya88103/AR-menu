import React, { useEffect, useState, useRef } from 'react';

/* ─────────────────────────────────────────────────────────────────
   AR Modal – "Try on Table"
   Clean, mobile-first, no overflow issues.
   • Mobile  → Bottom sheet, full-width, camera-launch card first
   • Desktop → Centred card, 3-D spin preview
───────────────────────────────────────────────────────────────── */

/* Simple device check */
const IS_MOBILE  = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const IS_IOS     = /iPhone|iPad|iPod/i.test(navigator.userAgent);
const IS_ANDROID = /Android/i.test(navigator.userAgent);

function lockScroll() {
  const y = window.scrollY;
  document.body.dataset.scrollY = y;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${y}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.width = '100%';
  document.body.style.overflow = 'hidden';
}
function unlockScroll() {
  const y = parseInt(document.body.dataset.scrollY || '0', 10);
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.width = '';
  document.body.style.overflow = '';
  window.scrollTo(0, y);
}

export default function ARModal({ modelUrl, dishName, onClose }) {
  const [loaded,  setLoaded]  = useState(false);
  const [view,    setView]    = useState('camera'); // 'camera' | '3d'
  const mvRef = useRef(null);

  /* --- scroll lock + Escape key --- */
  useEffect(() => {
    lockScroll();
    const esc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', esc);
    return () => {
      unlockScroll();
      window.removeEventListener('keydown', esc);
    };
  }, [onClose]);

  /* --- model-viewer load event --- */
  useEffect(() => {
    const mv = mvRef.current;
    if (!mv) return;
    
    // Catch cases where model is already loaded
    if (mv.modelIsVisible) {
      setLoaded(true);
    }
    
    const onLoad = () => setLoaded(true);
    const onProgress = (e) => {
      if (e.detail && e.detail.totalProgress === 1) setLoaded(true);
    };

    mv.addEventListener('load', onLoad);
    mv.addEventListener('progress', onProgress);
    
    return () => {
      mv.removeEventListener('load', onLoad);
      mv.removeEventListener('progress', onProgress);
    };
  }, [view, modelUrl]);

  /* ─── Styles ─────────────────────────────────────────────── */
  const overlay = {
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(0,0,0,0.75)',
    display: 'flex',
    alignItems:     IS_MOBILE ? 'flex-end' : 'center',
    justifyContent: 'center',
  };

  const sheet = IS_MOBILE
    ? {
        width: '100%',
        height: '92dvh',
        maxHeight: '92dvh',
        borderRadius: '24px 24px 0 0',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        background: '#0f0f1a',
      }
    : {
        width: 460,
        height: 650,
        maxHeight: '85vh',
        borderRadius: 20,
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        background: '#0f0f1a',
        boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
      };

  /* ─── Render ──────────────────────────────────────────────── */
  return (
    <div style={overlay} onClick={onClose}>  {/* ← backdrop click closes */}
      <div style={sheet} onClick={e => e.stopPropagation()}>

        {/* ── Header ─────────────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg,#be123c,#e11d48)',
          padding: '14px 16px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>🪄</span>
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: '0.9rem' }}>Try on Table</div>
              <div style={{
                color: 'rgba(255,255,255,0.75)', fontSize: '0.68rem',
                maxWidth: IS_MOBILE ? 180 : 280,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{dishName}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Toggle tabs */}
            {IS_MOBILE && (
              <div style={{
                display: 'flex', borderRadius: 99, overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)',
              }}>
                {['camera', '3d'].map((tab) => (
                  <button key={tab}
                    onClick={() => setView(tab)}
                    style={{
                      padding: '5px 12px', border: 'none', cursor: 'pointer',
                      fontSize: '0.68rem', fontWeight: 700,
                      background: view === tab ? 'rgba(255,255,255,0.25)' : 'transparent',
                      color: '#fff',
                      transition: 'background 0.2s',
                    }}
                  >{tab === 'camera' ? '📷 AR' : '🔄 3D'}</button>
                ))}
              </div>
            )}
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', fontSize: 16, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>✕</button>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════
            MOBILE — CAMERA LAUNCH VIEW
        ════════════════════════════════════════════════════════ */}
        {IS_MOBILE && view === 'camera' && (
          <div style={{
            overflowY: 'auto', overflowX: 'hidden',
            padding: '24px 20px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
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

            {/* ── THE launch button ──
                model-viewer is rendered hidden so its `ar-button` slot
                works — that slot IS the camera launcher (user-gesture safe). */}
            <div style={{ width: '100%', position: 'relative', marginTop: 20 }}>
              {/* Hidden model-viewer */}
              <model-viewer
                ref={mvRef}
                src={modelUrl}
                ar
                ar-modes="webxr scene-viewer quick-look"
                style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
                loading="eager"
                onLoad={() => setLoaded(true)}
              >
                {/* Slot button = actual AR trigger via model-viewer internals */}
                <button
                  slot="ar-button"
                  id="ar-launch-button"
                  style={{
                    width: '100%',
                    padding: '17px 0',
                    borderRadius: 999,
                    background: 'linear-gradient(135deg,#e11d48,#be123c)',
                    color: '#fff', border: 'none',
                    fontWeight: 900, fontSize: '1rem',
                    fontFamily: 'inherit', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    boxShadow: '0 8px 32px rgba(225,29,72,0.55)',
                    animation: 'arBtnPulse 2s ease-in-out infinite',
                    whiteSpace: 'nowrap',
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <span style={{ fontSize: 22 }}>📷</span>
                  {IS_IOS ? 'View in Your Space' : 'Open AR Camera'}
                </button>
              </model-viewer>

              {/* Loading placeholder (shown until model ready) */}
              {!loaded && (
                <button disabled style={{
                  width: '100%', padding: '17px 0', borderRadius: 999,
                  background: 'rgba(225,29,72,0.35)',
                  color: 'rgba(255,255,255,0.6)', border: 'none',
                  fontWeight: 900, fontSize: '1rem', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  cursor: 'not-allowed',
                }}>
                  <div style={{
                    width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                  Loading…
                </button>
              )}
            </div>

            {/* Bottom padding */}
            <div style={{ height: 40, flexShrink: 0 }} />
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            3-D PREVIEW (desktop always + mobile '3d' tab)
        ════════════════════════════════════════════════════════ */}
        {(!IS_MOBILE || view === '3d') && (
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
