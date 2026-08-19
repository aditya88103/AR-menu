import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      tableNumber: '1',
      customerInfo: {
        name: '',
        phone: '',
        notes: '',
      },
      activeOrder: null,
      orderHistory: [],

      // Set table number
      setTableNumber: (tableNumber) => set({ tableNumber: String(tableNumber || '1') }),

      // Set customer info
      setCustomerInfo: (info) =>
        set((state) => ({
          customerInfo: { ...(state.customerInfo || {}), ...info },
        })),

      // Set active order
      setActiveOrder: (order) => {
        set((state) => {
          const prevHistory = Array.isArray(state.orderHistory) ? state.orderHistory : [];
          const history = prevHistory.filter((o) => o?.id !== order?.id);
          return {
            activeOrder: order,
            orderHistory: order ? [order, ...history] : history,
          };
        });
      },

      // Add item to cart
      addItem: (dish) => {
        if (!dish) return;
        set((state) => {
          const currentItems = Array.isArray(state.items) ? state.items : [];
          const isVeg = dish.isVeg !== undefined ? dish.isVeg : dish.isveg;
          const imageURL = dish.imageURL || dish.imageurl || '';
          const existing = currentItems.find((i) => i.id === dish.id);

          if (existing) {
            return {
              items: currentItems.map((i) =>
                i.id === dish.id ? { ...i, quantity: (Number(i.quantity) || 1) + 1 } : i
              ),
            };
          }

          return {
            items: [
              ...currentItems,
              {
                id: dish.id,
                name: dish.name || 'Dish',
                price: Number(dish.price) || 0,
                isVeg: isVeg === true,
                imageURL: imageURL,
                quantity: 1,
              },
            ],
          };
        });
      },

      // Decrement or remove item
      removeItem: (dishId) => {
        set((state) => {
          const currentItems = Array.isArray(state.items) ? state.items : [];
          const existing = currentItems.find((i) => i.id === dishId);
          if (!existing) return state;

          if ((Number(existing.quantity) || 1) > 1) {
            return {
              items: currentItems.map((i) =>
                i.id === dishId ? { ...i, quantity: Number(i.quantity) - 1 } : i
              ),
            };
          }

          return {
            items: currentItems.filter((i) => i.id !== dishId),
          };
        });
      },

      // Directly update quantity (e.g. Delete if 0)
      updateQuantity: (dishId, quantity) => {
        set((state) => {
          const currentItems = Array.isArray(state.items) ? state.items : [];
          const q = Number(quantity) || 0;
          if (q <= 0) {
            return { items: currentItems.filter((i) => i.id !== dishId) };
          }
          return {
            items: currentItems.map((i) =>
              i.id === dishId ? { ...i, quantity: q } : i
            ),
          };
        });
      },

      // Delete specific item completely
      deleteItem: (dishId) => {
        set((state) => {
          const currentItems = Array.isArray(state.items) ? state.items : [];
          return {
            items: currentItems.filter((i) => i.id !== dishId),
          };
        });
      },

      // Clear cart
      clearCart: () => set({ items: [] }),

      // Computed helpers with 100% null-safety
      getItemCount: () => {
        const items = Array.isArray(get()?.items) ? get().items : [];
        return items.reduce((sum, i) => sum + (Number(i?.quantity) || 0), 0);
      },

      getSubtotal: () => {
        const items = Array.isArray(get()?.items) ? get().items : [];
        return items.reduce((sum, i) => sum + (Number(i?.price) || 0) * (Number(i?.quantity) || 0), 0);
      },

      getTax: () => {
        const subtotal = get()?.getSubtotal ? get().getSubtotal() : 0;
        return Math.round(subtotal * 0.05); // 5% GST
      },

      getTotal: () => {
        const subtotal = get()?.getSubtotal ? get().getSubtotal() : 0;
        const tax = get()?.getTax ? get().getTax() : 0;
        return subtotal + tax;
      },
    }),
    {
      name: 'biggies_cart_storage_v2',
      partialize: (state) => ({
        items: Array.isArray(state.items) ? state.items : [],
        tableNumber: state.tableNumber || '1',
        customerInfo: state.customerInfo || { name: '', phone: '', notes: '' },
        activeOrder: state.activeOrder || null,
        orderHistory: Array.isArray(state.orderHistory) ? state.orderHistory : [],
      }),
    }
  )
);
