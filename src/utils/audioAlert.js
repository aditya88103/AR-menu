/**
 * Restaurant Audio & Background Notification Manager
 * Melodic 4-Tone Crystal Marimba Chime + Background Push Notifications
 */

let audioCtx = null;
let titleInterval = null;
let cachedAudioElement = null;
const ORIGINAL_TITLE = 'Biggies Admin';

// Pre-synthesized melodic 4-tone restaurant chime (Ding-Ding-Ding-Dong! 🎶)
function createMelodicChimeWavUrl() {
  try {
    const sampleRate = 44100;
    const duration = 1.35;
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

    // Melody: C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz)
    const notes = [
      { freq: 523.25, start: 0.0, dur: 0.35, vol: 0.75 },
      { freq: 659.25, start: 0.12, dur: 0.40, vol: 0.85 },
      { freq: 783.99, start: 0.24, dur: 0.45, vol: 0.95 },
      { freq: 1046.5, start: 0.38, dur: 0.95, vol: 1.0 },
    ];

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      let sample = 0;

      for (const n of notes) {
        if (t >= n.start && t < n.start + n.dur) {
          const elapsed = t - n.start;
          const env = Math.exp(-elapsed * 5.5);
          const w = 2 * Math.PI * n.freq;
          // Rich marimba & glass bell harmonics
          const wave = Math.sin(w * elapsed)
                     + 0.35 * Math.sin(2 * w * elapsed)
                     + 0.15 * Math.sin(3 * w * elapsed)
                     + 0.08 * Math.sin(4 * w * elapsed);
          sample += wave * env * n.vol;
        }
      }

      sample = Math.max(-1, Math.min(1, sample * 0.48));
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
    chimeUrl = createMelodicChimeWavUrl();
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

// Auto-unlock audio on user interaction
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    if (cachedAudioElement) {
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
 * Play premium 4-note melodic restaurant chime
 */
export function playRestaurantChime() {
  // 1. Primary Engine: High-fidelity WAV Audio
  try {
    if (chimeUrl) {
      const snd = new Audio(chimeUrl);
      snd.volume = 1.0;
      snd.play().catch((err) => {
        console.warn('HTML5 Audio note:', err);
      });
    }
  } catch (e) {}

  // 2. Secondary Engine: Web Audio synthesis fallback
  try {
    const ctx = getAudioContext();
    if (ctx) {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;
      const notes = [
        { freq: 523.25, time: 0, dur: 0.35, gain: 0.45 },
        { freq: 659.25, time: 0.12, dur: 0.40, gain: 0.5 },
        { freq: 783.99, time: 0.24, dur: 0.45, gain: 0.55 },
        { freq: 1046.5, time: 0.38, dur: 0.95, gain: 0.65 },
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
      Notification.requestPermission();
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
  playRestaurantChime();

  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
    startTitleAlert(order);
  }

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
