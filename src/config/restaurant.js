// ─────────────────────────────────────────────────────────────
//  BIGGIES RESTAURANT – FOOD STOP
//  Single restaurant config
// ─────────────────────────────────────────────────────────────

export const RESTAURANT_CONFIG = {
  id: 'biggies-food-stop',
  name: 'Biggies Restaurant',
  tagline: 'Food Stop · Serving Love Since 2015',
};

// ── Simple admin credentials (no Firebase Auth needed) ──────
// Change these to your preferred username & password
export const ADMIN_USER = import.meta.env.VITE_ADMIN_USER || 'admin';
export const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS || 'biggies2024';
