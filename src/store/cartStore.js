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
          customerInfo: { ...state.customerInfo, ...info },
        })),

      // Set active order
      setActiveOrder: (order) => {
        set((state) => {
          const history = state.orderHistory.filter((o) => o.id !== order?.id);
          return {
            activeOrder: order,
            orderHistory: order ? [order, ...history] : history,
          };
        });
      },

      // Add item to cart
      addItem: (dish) => {
        set((state) => {
          const isVeg = dish.isVeg !== undefined ? dish.isVeg : dish.isveg;
          const imageURL = dish.imageURL || dish.imageurl || '';
          const existing = state.items.find((i) => i.id === dish.id);

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === dish.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                id: dish.id,
                name: dish.name,
                price: Number(dish.price),
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
          const existing = state.items.find((i) => i.id === dishId);
          if (!existing) return state;

          if (existing.quantity > 1) {
            return {
              items: state.items.map((i) =>
                i.id === dishId ? { ...i, quantity: i.quantity - 1 } : i
              ),
            };
          }

          return {
            items: state.items.filter((i) => i.id !== dishId),
          };
        });
      },

      // Directly update quantity (e.g. Delete if 0)
      updateQuantity: (dishId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((i) => i.id !== dishId) };
          }
          return {
            items: state.items.map((i) =>
              i.id === dishId ? { ...i, quantity } : i
            ),
          };
        });
      },

      // Delete specific item completely
      deleteItem: (dishId) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== dishId),
        }));
      },

      // Clear cart
      clearCart: () => set({ items: [] }),

      // Computed helpers
      getItemCount: () => {
        const items = get().items;
        return items.reduce((sum, i) => sum + i.quantity, 0);
      },

      getSubtotal: () => {
        const items = get().items;
        return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      },

      getTax: () => {
        const subtotal = get().getSubtotal();
        return Math.round(subtotal * 0.05); // 5% GST
      },

      getTotal: () => {
        return get().getSubtotal() + get().getTax();
      },
    }),
    {
      name: 'biggies_cart_storage',
    }
  )
);
