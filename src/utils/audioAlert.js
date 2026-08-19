/**
 * Restaurant Audio & Background Notification Manager
 * Ensures zero-lag loud sound alerts even when admin tab is minimized or in background.
 */

let audioCtx = null;
let titleInterval = null;
const ORIGINAL_TITLE = 'Biggies Admin';

// Get or initialize singleton AudioContext
export function getAudioContext() {
  if (typeof window === 'undefined') return null;
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

// Auto-unlock audio permissions on any interaction or visibility return
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  };

  window.addEventListener('click', unlockAudio, { passive: true });
  window.addEventListener('touchstart', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });

  // Resume audio when switching back to tab
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      unlockAudio();
      stopTitleAlert();
    }
  });
}

/**
 * Loud, crisp 4-chord service bell chime (Ding-Dong-Ding)
 */
export function playRestaurantChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Service bell chords: C5 (523Hz), E5 (659Hz), G5 (784Hz), High C6 (1046Hz)
    const notes = [
      { freq: 523.25, time: 0, dur: 0.45, gain: 0.4 },
      { freq: 659.25, time: 0.14, dur: 0.55, gain: 0.45 },
      { freq: 783.99, time: 0.28, dur: 0.65, gain: 0.5 },
      { freq: 1046.5, time: 0.44, dur: 1.1, gain: 0.6 },
    ];

    notes.forEach(({ freq, time, dur, gain }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'triangle'; // Richer, louder bell tone
      osc.frequency.setValueAtTime(freq, now + time);

      gainNode.gain.setValueAtTime(gain, now + time);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + dur);
    });
  } catch (err) {
    console.warn('Audio chime notice:', err);
  }
}

/**
 * Request OS Desktop notification permission
 */
export function requestNotificationPermission() {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted') {
          console.log('✅ Desktop notifications granted');
        }
      });
    }
  }
}

/**
 * Flashes browser tab title if tab is inactive/minimized
 */
export function startTitleAlert(orderInfo) {
  if (typeof document === 'undefined') return;
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
  if (typeof document !== 'undefined') {
    document.title = ORIGINAL_TITLE;
  }
}

/**
 * Full notification suite when new order arrives
 */
export function notifyNewOrder(order) {
  // 1. Play loud restaurant chime
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
        body: `New order received! Total: ${total}. Tap to open kitchen view.`,
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
