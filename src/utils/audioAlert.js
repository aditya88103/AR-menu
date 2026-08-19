/**
 * Restaurant Audio & Background Notification Manager
 * Dual-Engine sound playback (HTML5 Audio + Web Audio API) with Desktop Notifications
 */

let audioCtx = null;
let titleInterval = null;
let cachedAudioElement = null;
const ORIGINAL_TITLE = 'Biggies Admin';

// Pre-synthesized loud restaurant bell ding-dong WAV sound (Data URI)
function createChimeWavUrl() {
  try {
    const sampleRate = 22050;
    const duration = 1.0;
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    // RIFF Header
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);

    // Bell chime synthesis (Ding-Dong harmonics)
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      // High Ding (1046.5 Hz)
      const env1 = Math.exp(-t * 6);
      const s1 = Math.sin(2 * Math.PI * 1046.5 * t) + 0.4 * Math.sin(2 * Math.PI * 2093 * t);
      
      // Lower Dong (784 Hz) starting at 0.15s
      let s2 = 0;
      if (t > 0.15) {
        const t2 = t - 0.15;
        const env2 = Math.exp(-t2 * 4);
        s2 = Math.sin(2 * Math.PI * 784 * t2) + 0.5 * Math.sin(2 * Math.PI * 1568 * t2);
        s2 *= env2;
      }

      const sample = Math.max(-1, Math.min(1, s1 * env1 * 0.7 + s2 * 0.65));
      view.setInt16(44 + i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    }

    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  } catch (e) {
    return null;
  }
}

let chimeUrl = null;
if (typeof window !== 'undefined') {
  try {
    chimeUrl = createChimeWavUrl();
    if (chimeUrl) {
      cachedAudioElement = new Audio(chimeUrl);
      cachedAudioElement.volume = 1.0;
    }
  } catch (e) {}
}

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

// Global user interaction listener to unlock audio permanently
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    if (cachedAudioElement) {
      // Warm up HTML5 audio
      cachedAudioElement.play().then(() => {
        cachedAudioElement.pause();
        cachedAudioElement.currentTime = 0;
      }).catch(() => {});
    }
  };

  window.addEventListener('click', unlockAudio, { passive: true });
  window.addEventListener('touchstart', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      unlockAudio();
      stopTitleAlert();
    }
  });
}

/**
 * Loud, crisp service bell chime
 */
export function playRestaurantChime() {
  let played = false;

  // 1. Try HTML5 Audio (Bypasses background oscillator timer throttling)
  try {
    if (chimeUrl) {
      const snd = new Audio(chimeUrl);
      snd.volume = 1.0;
      snd.play().then(() => {
        played = true;
      }).catch((err) => {
        console.warn('HTML5 Audio note:', err);
      });
    }
  } catch (e) {}

  // 2. Web Audio API Oscillator synthesis fallback (multi-chord bell)
  try {
    const ctx = getAudioContext();
    if (ctx) {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;
      const notes = [
        { freq: 587.33, time: 0, dur: 0.4, gain: 0.5 },     // D5
        { freq: 880, time: 0.12, dur: 0.5, gain: 0.55 },     // A5
        { freq: 1174.66, time: 0.25, dur: 0.9, gain: 0.65 }, // D6
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
  console.log('🔊 FIRING ORDER SOUND & NOTIFICATION for order:', order);

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
