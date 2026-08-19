/**
 * Restaurant Audio & Background Notification Manager
 * Strictly isolated to Admin Panel (/admin/*) only.
 * NEVER plays on customer menu pages!
 */

let audioCtx = null;
let titleInterval = null;
let singletonAudio = null;
const ORIGINAL_TITLE = 'Biggies Admin';
const CHIME_SRC = '/sounds/order_chime.wav';

// Check if current browser view is in the Admin Panel
export function isAdminRoute() {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname || '';
  const hash = window.location.hash || '';
  return path.startsWith('/admin') || hash.includes('/admin');
}

// Get or initialize singleton Audio element
function getChimeAudio() {
  if (typeof window === 'undefined' || !isAdminRoute()) return null;
  if (!singletonAudio) {
    singletonAudio = new Audio(CHIME_SRC);
    singletonAudio.volume = 1.0;
    singletonAudio.preload = 'auto';
  }
  return singletonAudio;
}

export function getAudioContext() {
  if (typeof window === 'undefined' || !isAdminRoute()) return null;
  const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtxClass) return null;
  if (!audioCtx) {
    audioCtx = new AudioCtxClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Auto-unlock audio permissions on user interaction ONLY on Admin routes
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    if (!isAdminRoute()) return;

    // 1. Prime HTML5 Audio buffer without playing audible sound
    const snd = getChimeAudio();
    if (snd && snd.readyState === 0) {
      snd.load();
    }

    // 2. Unlock Web Audio Context
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  };

  window.addEventListener('click', unlockAudio, { passive: true });
  window.addEventListener('touchstart', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && isAdminRoute()) {
      unlockAudio();
      stopTitleAlert();
    }
  });
}

/**
 * Play crystal-clear 4-note ascending restaurant chime
 * STRICTLY restricted to Admin pages.
 */
export function playRestaurantChime() {
  // Never play on customer menu / tracking pages
  if (!isAdminRoute()) return;

  // 1. Primary Engine: Direct HTML5 Audio Element
  try {
    const snd = getChimeAudio();
    if (snd) {
      snd.currentTime = 0;
      snd.volume = 1.0;
      snd.play().catch((err) => {
        console.warn('HTML5 Audio play warning:', err);
      });
    }
  } catch (e) {}

  // 2. Secondary Engine: Web Audio API Oscillator synthesis fallback
  try {
    const ctx = getAudioContext();
    if (ctx) {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;
      // Notes: F5 (698Hz), A5 (880Hz), C6 (1046Hz), F6 (1397Hz)
      const notes = [
        { freq: 698.46, time: 0, dur: 0.32, gain: 0.5 },
        { freq: 880.00, time: 0.12, dur: 0.36, gain: 0.55 },
        { freq: 1046.50, time: 0.24, dur: 0.42, gain: 0.65 },
        { freq: 1396.91, time: 0.38, dur: 0.85, gain: 0.75 },
      ];

      notes.forEach(({ freq, time, dur, gain }) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'triangle';
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
    console.warn('Web Audio synthesis note:', err);
  }
}

/**
 * Request OS Desktop notification permission (Admin only)
 */
export function requestNotificationPermission() {
  if (typeof window !== 'undefined' && isAdminRoute() && 'Notification' in window) {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }
}

/**
 * Flashes browser tab title if tab is inactive/minimized (Admin only)
 */
export function startTitleAlert(orderInfo) {
  if (typeof document === 'undefined' || !isAdminRoute()) return;
  stopTitleAlert();

  let toggle = false;
  titleInterval = setInterval(() => {
    document.title = toggle
      ? `🔔 NEW ORDER! (Table #${orderInfo?.table_number || '?'})`
      : `🍔 BIGGIES - NEW ORDER WAITING!`;
    toggle = !toggle;
  }, 900);
}

export function stopTitleAlert() {
  if (titleInterval) {
    clearInterval(titleInterval);
    titleInterval = null;
  }
  if (typeof document !== 'undefined' && isAdminRoute()) {
    document.title = ORIGINAL_TITLE;
  }
}

/**
 * Full notification suite when new order arrives (Admin only)
 */
export function notifyNewOrder(order) {
  if (!isAdminRoute()) return;

  console.log('🔔 [ADMIN SOUND ALERT] New Order:', order?.order_number);

  // 1. Play loud chime
  playRestaurantChime();

  // 2. Flash page title if in background
  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
    startTitleAlert(order);
  }

  // 3. Desktop OS notification (works even when browser is minimized)
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
