// ─────────────────────────────────────────────────────────────────────────────
//  LOCAL STORAGE DATABASE  —  No Firebase, no backend needed
//  All data is persisted in the browser's localStorage.
// ─────────────────────────────────────────────────────────────────────────────
import { DEMO_CATEGORIES, DEMO_DISHES } from '../data/demoMenu';

const KEYS = {
  dishes:     'biggies_dishes',
  categories: 'biggies_categories',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function lsGet(key) {
  try { return JSON.parse(localStorage.getItem(key)); }
  catch { return null; }
}
function lsSet(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Bump this version whenever you change DEMO_DISHES / DEMO_CATEGORIES
// to force localStorage to re-seed with fresh data.
const MENU_VERSION = '3'; // v3 = real food GLB models

// Seed demo data — also re-seeds if dishes are missing the isVeg field (schema migration)
function seed() {
  const storedVersion = localStorage.getItem('biggies_menu_version');
  // Force re-seed if version mismatch (new models / schema change)
  if (storedVersion !== MENU_VERSION) {
    lsSet(KEYS.categories, DEMO_CATEGORIES);
    lsSet(KEYS.dishes, DEMO_DISHES);
    localStorage.setItem('biggies_menu_version', MENU_VERSION);
    return;
  }
  if (!lsGet(KEYS.categories)) lsSet(KEYS.categories, DEMO_CATEGORIES);
  const stored = lsGet(KEYS.dishes);
  // Re-seed if no dishes, or if first dish is missing isVeg (old schema)
  if (!stored || (stored.length > 0 && stored[0].isVeg === undefined)) {
    lsSet(KEYS.dishes, DEMO_DISHES);
  }
}


// ── Dishes ────────────────────────────────────────────────────────────────────
export async function fetchDishes() {
  seed();
  return lsGet(KEYS.dishes) ?? [];
}

export async function fetchAvailableDishes() {
  seed();
  return (lsGet(KEYS.dishes) ?? []).filter((d) => d.isAvailable !== false);
}

export async function addDish(data) {
  seed();
  const dishes = lsGet(KEYS.dishes) ?? [];
  const newDish = { ...data, id: uid(), isAvailable: true, createdAt: new Date().toISOString() };
  lsSet(KEYS.dishes, [...dishes, newDish]);
  return newDish;
}

export async function updateDish(id, data) {
  const dishes = lsGet(KEYS.dishes) ?? [];
  lsSet(KEYS.dishes, dishes.map((d) => d.id === id ? { ...d, ...data } : d));
}

export async function toggleDishAvailability(id, current) {
  return updateDish(id, { isAvailable: current }); // caller passes the desired new value
}

export async function deleteDish(id) {
  const dishes = lsGet(KEYS.dishes) ?? [];
  lsSet(KEYS.dishes, dishes.filter((d) => d.id !== id));
}

// ── Categories ────────────────────────────────────────────────────────────────
export async function fetchCategories() {
  seed();
  const cats = lsGet(KEYS.categories) ?? [];
  return [...cats].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function addCategory(data) {
  const cats = lsGet(KEYS.categories) ?? [];
  const newCat = { ...data, id: uid() };
  lsSet(KEYS.categories, [...cats, newCat]);
  return newCat;
}

export async function updateCategory(id, data) {
  const cats = lsGet(KEYS.categories) ?? [];
  lsSet(KEYS.categories, cats.map((c) => c.id === id ? { ...c, ...data } : c));
}

export async function deleteCategory(id) {
  const cats = lsGet(KEYS.categories) ?? [];
  lsSet(KEYS.categories, cats.filter((c) => c.id !== id));
}

// ── File "upload" — stores as base64 in localStorage ─────────────────────────
export async function uploadFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);   // base64 data URL
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function deleteFile() {
  // No-op — base64 strings are embedded directly in dish data
}

// ── Legacy stubs (kept for any cached imports) ────────────────────────────────
export async function getRestaurant() { return null; }
export async function setRestaurant() {}
