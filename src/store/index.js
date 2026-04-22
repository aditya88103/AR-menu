import { create } from 'zustand';
import { RESTAURANT_CONFIG } from '../config/restaurant';

// Single restaurant ID — always fixed
export const RESTAURANT_ID = RESTAURANT_CONFIG.id;

// Menu state (used by MenuPage for real-time dishes)
export const useMenuStore = create((set) => ({
  dishes: [],
  categories: [],
  loading: true,
  setDishes: (dishes) => set({ dishes }),
  setCategories: (categories) => set({ categories }),
  setLoading: (loading) => set({ loading }),
}));
