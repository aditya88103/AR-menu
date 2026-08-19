/**
 * Restaurant Order Audio Alert Manager
 * ONLY plays sound on the Admin Orders page when a new customer order is received.
 * NEVER plays on customer menu pages or on user clicks/interactions.
 */

let singletonAudio = null;
let titleInterval = null;
const ORIGINAL_TITLE = 'Biggies Admin';
const CHIME_SRC = '/sounds/order_chime.wav';

// Check if current page is in the Admin panel
function isAdminPage() {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname || '';
  const hash = window.location.hash || '';
  return path.startsWith('/admin') || hash.includes('/admin');
}

/**
 * Play order chime audio (Admin only, when order is placed)
 */
export function playRestaurantChime() {
  if (!isAdminPage()) return;

  try {
    if (!singletonAudio) {
      singletonAudio = new Audio(CHIME_SRC);
      singletonAudio.volume = 1.0;
    }
    singletonAudio.currentTime = 0;
    singletonAudio.play().catch((err) => {
      console.warn('Audio play note:', err);
    });
  } catch (e) {
    console.warn('Audio play error:', e);
  }
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

  console.log('🔔 New customer order arrived:', order?.order_number);

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
