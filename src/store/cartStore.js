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
      activeOrders: [],
      activeOrder: null,
      orderHistory: [],

      // Set table number with strict table-level order isolation
      setTableNumber: (newTable) => {
        const tableStr = String(newTable || '1');
        set((state) => {
          // ALWAYS filter activeOrders so orders from other tables and completed/paid orders never leak!
          const currentActive = Array.isArray(state.activeOrders) ? state.activeOrders : [];
          const tableOrders = currentActive.filter(
            (o) => String(o?.table_number) === tableStr && o?.status !== 'completed' && o?.status !== 'cancelled'
          );
          return {
            tableNumber: tableStr,
            activeOrders: tableOrders,
            activeOrder: tableOrders[0] || null,
          };
        });
      },

      // Set customer info
      setCustomerInfo: (info) =>
        set((state) => ({
          customerInfo: { ...(state.customerInfo || {}), ...info },
        })),

      // Add newly placed order to activeOrders
      addActiveOrder: (order) => {
        if (!order) return;
        set((state) => {
          const currentTable = String(state.tableNumber || '1');
          const orderTable = String(order.table_number || currentTable);
          
          // Only keep active orders that belong strictly to the current table
          const prevActive = (Array.isArray(state.activeOrders) ? state.activeOrders : [])
            .filter((o) => String(o?.table_number) === orderTable && o?.status !== 'completed' && o?.status !== 'cancelled');
          
          const filtered = prevActive.filter((o) => o?.id !== order.id);
          const updatedActive = [order, ...filtered];

          const prevHistory = Array.isArray(state.orderHistory) ? state.orderHistory : [];
          const history = [order, ...prevHistory.filter((o) => o?.id !== order.id)];

          return {
            activeOrder: order,
            activeOrders: updatedActive,
            orderHistory: history,
          };
        });
      },

      // Update specific active order
      updateActiveOrder: (updatedOrder) => {
        if (!updatedOrder?.id) return;
        set((state) => {
          const prevActive = Array.isArray(state.activeOrders) ? state.activeOrders : [];
          // If order is completed/paid or cancelled, remove it from activeOrders
          if (updatedOrder.status === 'completed' || updatedOrder.status === 'cancelled') {
            const filtered = prevActive.filter((o) => o.id !== updatedOrder.id);
            return {
              activeOrders: filtered,
              activeOrder: state.activeOrder?.id === updatedOrder.id ? (filtered[0] || null) : state.activeOrder,
            };
          }

          const updatedActive = prevActive.map((o) =>
            o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o
          );
          return {
            activeOrders: updatedActive,
            activeOrder: state.activeOrder?.id === updatedOrder.id ? { ...state.activeOrder, ...updatedOrder } : state.activeOrder,
          };
        });
      },

      // Sync active orders with latest database/storage orders (filtered strictly by table & active status)
      syncActiveOrders: (allOrders) => {
        if (!Array.isArray(allOrders)) return;
        set((state) => {
          const currentTable = String(state.tableNumber || '1');
          const prevActive = Array.isArray(state.activeOrders) ? state.activeOrders : [];
          if (prevActive.length === 0 && !state.activeOrder) return state;

          const prevIds = new Set(prevActive.map((o) => o.id));

          // Keep only orders that belong to THIS table AND are still active
          const updatedActive = allOrders.filter((serverOrder) => {
            if (!serverOrder?.id) return false;
            if (String(serverOrder.table_number) !== currentTable) return false;
            if (!prevIds.has(serverOrder.id)) return false;
            if (serverOrder.status === 'completed' || serverOrder.status === 'cancelled') return false;
            return true;
          });

          return {
            activeOrders: updatedActive,
            activeOrder: updatedActive[0] || null,
          };
        });
      },

      // Load active orders by customer phone number or name
      loadOrdersByCustomer: (query, allOrders) => {
        if (!query || !Array.isArray(allOrders)) return [];
        const q = String(query).trim().toLowerCase();
        const matches = allOrders.filter((o) => {
          const nameMatch = (o.customer_name || '').toLowerCase().includes(q);
          const phoneMatch = (o.customer_phone || '').includes(q);
          const isActive = o.status !== 'completed' && o.status !== 'cancelled';
          return (nameMatch || phoneMatch) && isActive;
        });

        if (matches.length > 0) {
          set((state) => ({
            activeOrders: matches,
            activeOrder: matches[0],
            tableNumber: String(matches[0].table_number || state.tableNumber),
          }));
        }
        return matches;
      },

      // Set/Select current active order
      setActiveOrder: (order) => {
        if (!order) {
          set({ activeOrder: null });
          return;
        }
        get().addActiveOrder(order);
      },

      // Dismiss / remove an active order (e.g. when completed and user clears)
      removeActiveOrder: (orderId) => {
        set((state) => {
          const prevActive = Array.isArray(state.activeOrders) ? state.activeOrders : [];
          const filtered = prevActive.filter((o) => o?.id !== orderId);
          return {
            activeOrders: filtered,
            activeOrder: state.activeOrder?.id === orderId ? (filtered[0] || null) : state.activeOrder,
          };
        });
      },

      // Clear all active orders
      clearActiveOrders: () => set({ activeOrders: [], activeOrder: null }),

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
        activeOrders: Array.isArray(state.activeOrders) ? state.activeOrders : (state.activeOrder ? [state.activeOrder] : []),
        activeOrder: state.activeOrder || null,
        orderHistory: Array.isArray(state.orderHistory) ? state.orderHistory : [],
      }),
    }
  )
);
