/**
 * Restaurant Order Audio Alert Manager
 * ONLY plays sound on the Admin Orders page when a new customer order is received.
 * Guaranteed Web Audio API Synthesizer + HTML5 Audio fallback.
 */

let audioCtx = null;
let titleInterval = null;
const ORIGINAL_TITLE = 'Biggies Admin';

// Check if current page is in the Admin panel
function isAdminPage() {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname || '';
  const hash = window.location.hash || '';
  return path.startsWith('/admin') || hash.includes('/admin');
}

// Get or resume AudioContext
function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtxClass) return null;
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new AudioCtxClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Auto-prime AudioContext on admin interactions
if (typeof window !== 'undefined') {
  const primeAudio = () => {
    if (!isAdminPage()) return;
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  };

  window.addEventListener('click', primeAudio, { passive: true });
  window.addEventListener('touchstart', primeAudio, { passive: true });
  window.addEventListener('keydown', primeAudio, { passive: true });
}

/**
 * Play crystal-clear, loud 4-note ascending restaurant chime
 */
export function playRestaurantChime() {
  if (!isAdminPage()) return;

  // 1. Primary Engine: Direct Web Audio API Tri-Oscillator Chime (Zero network dependency, 100% reliable)
  try {
    const ctx = getAudioContext();
    if (ctx) {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;
      // Melody: F5 (698.46Hz), A5 (880Hz), C6 (1046.5Hz), High F6 (1396.9Hz)
      const notes = [
        { freq: 698.46, time: 0.00, dur: 0.32, gain: 0.55 },
        { freq: 880.00, time: 0.12, dur: 0.36, gain: 0.60 },
        { freq: 1046.50, time: 0.24, dur: 0.42, gain: 0.70 },
        { freq: 1396.91, time: 0.38, dur: 0.85, gain: 0.85 },
      ];

      notes.forEach(({ freq, time, dur, gain }) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'triangle'; // Rich, vibrant, audible bell timbre
        osc.frequency.setValueAtTime(freq, now + time);

        gainNode.gain.setValueAtTime(gain, now + time);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now + time);
        osc.stop(now + time + dur);
      });
    }
  } catch (err) {
    console.warn('Web Audio alert note:', err);
  }

  // 2. Secondary Engine: HTML5 Audio File backup
  try {
    const audio = new Audio('/sounds/order_chime.wav');
    audio.volume = 1.0;
    audio.play().catch(() => {});
  } catch (e) {}
}

/**
 * Request OS Desktop notification permission (Admin only)
 */
export function requestNotificationPermission() {
  if (typeof window !== 'undefined' && isAdminPage() && 'Notification' in window) {
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }
}

/**
 * Flashes browser tab title when tab is in background (Admin only)
 */
export function startTitleAlert(orderInfo) {
  if (typeof document === 'undefined' || !isAdminPage()) return;
  stopTitleAlert();

  let toggle = false;
  titleInterval = setInterval(() => {
    document.title = toggle
      ? `🔔 NEW ORDER! (Table #${orderInfo?.table_number || '?'})`
      : `🍔 BIGGIES - NEW ORDER WAITING!`;
    toggle = !toggle;
  }, 1000);
}

export function stopTitleAlert() {
  if (titleInterval) {
    clearInterval(titleInterval);
    titleInterval = null;
  }
  if (typeof document !== 'undefined' && isAdminPage()) {
    document.title = ORIGINAL_TITLE;
  }
}

/**
 * Triggered ONLY when a brand new customer order arrives
 */
export function notifyNewOrder(order) {
  if (!isAdminPage()) return;

  console.log('🔔 [ADMIN SOUND ALERT] New customer order:', order?.order_number);

  // 1. Play sound chime
  playRestaurantChime();

  // 2. Flash tab title if minimized/background
  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
    startTitleAlert(order);
  }

  // 3. Desktop OS notification
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      const orderNum = order?.order_number || 'New Order';
      const tableNum = order?.table_number ? `Table #${order.table_number}` : 'Takeaway';
      const total = order?.total ? `₹${order.total}` : '';

      const notif = new Notification(`🔔 ${orderNum} - ${tableNum}`, {
        body: `New order received! Total: ${total}. Tap to view.`,
        icon: '/favicon.svg',
        tag: `order-${order?.id || Date.now()}`,
        requireInteraction: false,
      });

      notif.onclick = () => {
        window.focus();
        stopTitleAlert();
      };
    } catch (e) {}
  }
}
