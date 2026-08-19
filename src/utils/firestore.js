import { supabase } from '../lib/firebase';
import { DEMO_CATEGORIES, DEMO_DISHES } from '../data/demoMenu';

// ── Cache Keys & In-Memory State ─────────────────────────────────────────────
const DISHES_KEY = 'biggies_cached_dishes_v2';
const CATEGORIES_KEY = 'biggies_cached_categories_v2';
const ORDERS_KEY = 'biggies_local_orders_v2';

const syncBroadcast = typeof window !== 'undefined' && window.BroadcastChannel
  ? new window.BroadcastChannel('biggies_global_sync_v2')
  : null;

// Network health state
let supabaseDisabled = false;

// Timeout wrapper to prevent ANY network call from hanging the UI
function withTimeout(promise, ms = 700) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Network timeout')), ms))
  ]);
}

// ── Synchronous Cache Helpers (0ms delay) ────────────────────────────────────
export function getStoredDishes() {
  try {
    const raw = localStorage.getItem(DISHES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  // Initialize with demo dishes
  saveStoredDishes(DEMO_DISHES);
  return DEMO_DISHES;
}

export function saveStoredDishes(dishes) {
  try {
    localStorage.setItem(DISHES_KEY, JSON.stringify(dishes));
    if (syncBroadcast) syncBroadcast.postMessage({ type: 'DISHES_SYNC', dishes });
  } catch (e) {
    console.warn('Failed to store dishes locally', e);
  }
}

export function getStoredCategories() {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  saveStoredCategories(DEMO_CATEGORIES);
  return DEMO_CATEGORIES;
}

export function saveStoredCategories(categories) {
  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    if (syncBroadcast) syncBroadcast.postMessage({ type: 'CATEGORIES_SYNC', categories });
  } catch (e) {
    console.warn('Failed to store categories locally', e);
  }
}

export function getStoredOrders() {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

export function saveStoredOrders(orders) {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    if (syncBroadcast) syncBroadcast.postMessage({ type: 'ORDERS_SYNC', orders });
  } catch (e) {
    console.warn('Failed to store orders locally', e);
  }
}

// ── Check Demo Data Initialization (Non-blocking background) ─────────────────
export async function initializeDemoData() {
  // Ensure local cache is populated immediately
  getStoredDishes();
  getStoredCategories();

  if (supabaseDisabled) return;

  try {
    const checkPromise = supabase.from('dishes').select('id').limit(1);
    const { data: dishes, error: dishesError } = await withTimeout(checkPromise, 600);
    if (dishesError) throw dishesError;

    if (!dishes || dishes.length === 0) {
      await supabase.from('dishes').insert(
        DEMO_DISHES.map(d => ({
          id: d.id,
          name: d.name,
          description: d.description,
          category: d.category,
          price: d.price,
          isveg: d.isVeg !== false,
          isavailable: d.isAvailable !== false,
          imageurl: d.imageURL,
          modelurl: d.modelURL,
        }))
      );
    }
  } catch (err) {
    // If Supabase fails, quietly disable for this session to keep UI 100% smooth
    supabaseDisabled = true;
  }
}

// ── Real-time listeners (INSTANT Synchronous Callback + Background Sync) ─────
export function onDishesChange(callback) {
  let isSubscribed = true;

  // 1. Deliver cached data IMMEDIATELY (0ms)
  const initial = getStoredDishes();
  callback(initial);

  // 2. Background fetch without blocking UI
  fetchDishes().then((dishes) => {
    if (isSubscribed && dishes) callback(dishes);
  });

  // 3. BroadcastChannel listener for instant cross-tab sync
  const handleBroadcast = (e) => {
    if (isSubscribed && e.data && e.data.type === 'DISHES_SYNC') {
      callback(e.data.dishes);
    }
  };
  if (syncBroadcast) syncBroadcast.addEventListener('message', handleBroadcast);

  const handleStorage = (e) => {
    if (isSubscribed && e.key === DISHES_KEY) {
      callback(getStoredDishes());
    }
  };
  window.addEventListener('storage', handleStorage);

  // 4. Supabase realtime channel if available
  let channel = null;
  if (!supabaseDisabled) {
    try {
      channel = supabase
        .channel(`dishes_${Math.random().toString(36).slice(2, 7)}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'dishes' }, async () => {
          if (!isSubscribed) return;
          const dishes = await fetchDishes();
          callback(dishes);
        })
        .subscribe();
    } catch (e) {}
  }

  return () => {
    isSubscribed = false;
    if (channel) {
      try { supabase.removeChannel(channel); } catch (e) {}
    }
    if (syncBroadcast) syncBroadcast.removeEventListener('message', handleBroadcast);
    window.removeEventListener('storage', handleStorage);
  };
}

export function onAvailableDishesChange(callback) {
  let isSubscribed = true;

  const filterAvail = (list) =>
    (list || []).filter((d) => {
      const isAvail = d.isAvailable !== undefined ? d.isAvailable : d.isavailable;
      return isAvail !== false;
    });

  // 1. Deliver immediately (0ms)
  callback(filterAvail(getStoredDishes()));

  // 2. Background fetch
  fetchAvailableDishes().then((avail) => {
    if (isSubscribed && avail) callback(avail);
  });

  // 3. BroadcastChannel sync
  const handleBroadcast = (e) => {
    if (isSubscribed && e.data && e.data.type === 'DISHES_SYNC') {
      callback(filterAvail(e.data.dishes));
    }
  };
  if (syncBroadcast) syncBroadcast.addEventListener('message', handleBroadcast);

  const handleStorage = (e) => {
    if (isSubscribed && e.key === DISHES_KEY) {
      callback(filterAvail(getStoredDishes()));
    }
  };
  window.addEventListener('storage', handleStorage);

  // 4. Supabase channel
  let channel = null;
  if (!supabaseDisabled) {
    try {
      channel = supabase
        .channel(`avail_dishes_${Math.random().toString(36).slice(2, 7)}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'dishes' }, async () => {
          if (!isSubscribed) return;
          const dishes = await fetchAvailableDishes();
          callback(dishes);
        })
        .subscribe();
    } catch (e) {}
  }

  return () => {
    isSubscribed = false;
    if (channel) {
      try { supabase.removeChannel(channel); } catch (e) {}
    }
    if (syncBroadcast) syncBroadcast.removeEventListener('message', handleBroadcast);
    window.removeEventListener('storage', handleStorage);
  };
}

export function onCategoriesChange(callback) {
  let isSubscribed = true;

  // 1. Deliver cached categories immediately
  callback(getStoredCategories());

  // 2. Background fetch
  fetchCategories().then((cats) => {
    if (isSubscribed && cats) callback(cats);
  });

  const handleBroadcast = (e) => {
    if (isSubscribed && e.data && e.data.type === 'CATEGORIES_SYNC') {
      callback(e.data.categories);
    }
  };
  if (syncBroadcast) syncBroadcast.addEventListener('message', handleBroadcast);

  const handleStorage = (e) => {
    if (isSubscribed && e.key === CATEGORIES_KEY) {
      callback(getStoredCategories());
    }
  };
  window.addEventListener('storage', handleStorage);

  let channel = null;
  if (!supabaseDisabled) {
    try {
      channel = supabase
        .channel(`cats_${Math.random().toString(36).slice(2, 7)}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, async () => {
          if (!isSubscribed) return;
          const cats = await fetchCategories();
          callback(cats);
        })
        .subscribe();
    } catch (e) {}
  }

  return () => {
    isSubscribed = false;
    if (channel) {
      try { supabase.removeChannel(channel); } catch (e) {}
    }
    if (syncBroadcast) syncBroadcast.removeEventListener('message', handleBroadcast);
    window.removeEventListener('storage', handleStorage);
  };
}

// ── Dishes CRUD (Optimistic & Fast) ──────────────────────────────────────────
export async function fetchDishes() {
  const cached = getStoredDishes();
  if (supabaseDisabled) return cached;

  try {
    const fetchPromise = supabase.from('dishes').select('*');
    const { data, error } = await withTimeout(fetchPromise, 700);
    if (!error && data && data.length > 0) {
      saveStoredDishes(data);
      return data;
    }
  } catch (err) {
    supabaseDisabled = true;
  }
  return cached;
}

export async function fetchAvailableDishes() {
  const all = await fetchDishes();
  return (all || []).filter((d) => {
    const isAvail = d.isAvailable !== undefined ? d.isAvailable : d.isavailable;
    return isAvail !== false;
  });
}

export async function addDish(data) {
  const id = data.id || `dish_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const newDish = {
    id: id,
    name: data.name,
    description: data.description || '',
    category: data.category || 'Other',
    price: Number(data.price || 0),
    isVeg: data.isVeg !== false,
    isveg: data.isVeg !== false,
    isAvailable: true,
    isavailable: true,
    imageURL: data.imageURL || '',
    imageurl: data.imageURL || '',
    modelURL: data.modelURL || '',
    modelurl: data.modelURL || '',
  };

  // Optimistic update locally
  const current = getStoredDishes();
  const updated = [newDish, ...current];
  saveStoredDishes(updated);

  // Background Supabase insert
  if (!supabaseDisabled) {
    withTimeout(
      supabase.from('dishes').insert([{
        id: newDish.id,
        name: newDish.name,
        description: newDish.description,
        category: newDish.category,
        price: newDish.price,
        isveg: newDish.isVeg,
        isavailable: true,
        imageurl: newDish.imageURL,
        modelurl: newDish.modelURL,
      }]),
      1200
    ).catch(() => {});
  }

  return newDish;
}

export async function updateDish(id, data) {
  // Optimistic local update
  const current = getStoredDishes();
  const updated = current.map((d) => {
    if (d.id !== id) return d;
    const isVeg = data.isVeg !== undefined ? data.isVeg : data.isveg !== undefined ? data.isveg : d.isVeg;
    const isAvail = data.isAvailable !== undefined ? data.isAvailable : data.isavailable !== undefined ? data.isavailable : d.isAvailable;
    const image = data.imageURL !== undefined ? data.imageURL : data.imageurl !== undefined ? data.imageurl : d.imageURL;
    const model = data.modelURL !== undefined ? data.modelURL : data.modelurl !== undefined ? data.modelurl : d.modelURL;

    return {
      ...d,
      ...data,
      isVeg: isVeg,
      isveg: isVeg,
      isAvailable: isAvail,
      isavailable: isAvail,
      imageURL: image,
      imageurl: image,
      modelURL: model,
      modelurl: model,
    };
  });
  saveStoredDishes(updated);

  // Background Supabase update
  if (!supabaseDisabled) {
    const dbData = {};
    if (data.name !== undefined) dbData.name = data.name;
    if (data.description !== undefined) dbData.description = data.description;
    if (data.category !== undefined) dbData.category = data.category;
    if (data.price !== undefined) dbData.price = data.price;
    if (data.isVeg !== undefined) dbData.isveg = data.isVeg;
    if (data.isAvailable !== undefined) dbData.isavailable = data.isAvailable;
    if (data.isavailable !== undefined) dbData.isavailable = data.isavailable;
    if (data.imageURL !== undefined) dbData.imageurl = data.imageURL;
    if (data.modelURL !== undefined) dbData.modelurl = data.modelURL;

    withTimeout(supabase.from('dishes').update(dbData).eq('id', id), 1200).catch(() => {});
  }
}

export async function toggleDishAvailability(id, isAvailable) {
  await updateDish(id, { isAvailable, isavailable: isAvailable });
}

export async function deleteDish(id) {
  const current = getStoredDishes();
  const updated = current.filter((d) => d.id !== id);
  saveStoredDishes(updated);

  if (!supabaseDisabled) {
    withTimeout(supabase.from('dishes').delete().eq('id', id), 1200).catch(() => {});
  }
}

// ── Categories CRUD (Optimistic & Fast) ───────────────────────────────────────
export async function fetchCategories() {
  const cached = getStoredCategories();
  if (supabaseDisabled) return cached;

  try {
    const fetchPromise = supabase.from('categories').select('*').order('order', { ascending: true });
    const { data, error } = await withTimeout(fetchPromise, 700);
    if (!error && data && data.length > 0) {
      saveStoredCategories(data);
      return data;
    }
  } catch (err) {
    supabaseDisabled = true;
  }
  return cached;
}

export async function addCategory(data) {
  const id = `cat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const newCat = {
    id: id,
    name: data.name,
    order: data.order || 0,
  };

  const current = getStoredCategories();
  const updated = [...current, newCat];
  saveStoredCategories(updated);

  if (!supabaseDisabled) {
    withTimeout(supabase.from('categories').insert([newCat]), 1200).catch(() => {});
  }
  return newCat;
}

export async function updateCategory(id, data) {
  const current = getStoredCategories();
  const updated = current.map((c) => (c.id === id ? { ...c, ...data } : c));
  saveStoredCategories(updated);

  if (!supabaseDisabled) {
    withTimeout(supabase.from('categories').update(data).eq('id', id), 1200).catch(() => {});
  }
}

export async function deleteCategory(id) {
  const current = getStoredCategories();
  const updated = current.filter((c) => c.id !== id);
  saveStoredCategories(updated);

  if (!supabaseDisabled) {
    withTimeout(supabase.from('categories').delete().eq('id', id), 1200).catch(() => {});
  }
}

// ── File Uploads ─────────────────────────────────────────────────────────────
export async function uploadFile(file, path) {
  try {
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `${path}/${fileName}`;

    const uploadPromise = supabase.storage.from('menu-files').upload(filePath, file);
    const { error } = await withTimeout(uploadPromise, 4000);
    if (error) throw error;

    const { data } = supabase.storage.from('menu-files').getPublicUrl(filePath);
    return data?.publicUrl || '';
  } catch (err) {
    console.warn('Upload fallback to local object URL:', err);
    try {
      return URL.createObjectURL(file);
    } catch (e) {
      return '';
    }
  }
}

export async function deleteFile(fileURL) {
  try {
    const url = new URL(fileURL);
    const filePath = url.pathname.split('/menu-files/')[1];
    if (filePath && !supabaseDisabled) {
      supabase.storage.from('menu-files').remove([filePath]);
    }
  } catch (err) {}
}

// Helper: Standard RFC4122 v4 UUID generator for 100% database compatibility
function generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch (e) {}
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ── Orders Management (0ms Instant Placement & Realtime Updates) ─────────────
export async function createOrder(orderData) {
  const orderNumber = `BIG-${Math.floor(1000 + Math.random() * 9000)}`;
  const newOrder = {
    id: generateUUID(),
    order_number: orderNumber,
    table_number: String(orderData.table_number || orderData.tableNumber || '1'),
    customer_name: orderData.customer_name || orderData.customerName || 'Guest',
    customer_phone: orderData.customer_phone || orderData.customerPhone || '',
    notes: orderData.notes || '',
    items: orderData.items || [],
    subtotal: Number(orderData.subtotal || 0),
    tax: Number(orderData.tax || 0),
    total: Number(orderData.total || 0),
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // 1. Instant local persistence & broadcast for 0ms lag
  const local = getStoredOrders();
  const updated = [newOrder, ...local];
  saveStoredOrders(updated);

  // 2. Cloud Database Sync (Supabase)
  try {
    const insertPromise = supabase.from('orders').insert([newOrder]);
    withTimeout(insertPromise, 3000).then(({ error }) => {
      if (error) {
        console.warn('Supabase order insert notice:', error.message || error);
      } else {
        console.log('✅ Order synced to cloud database:', newOrder.order_number);
      }
    }).catch((err) => {
      console.warn('Cloud sync background error:', err);
    });
  } catch (err) {
    console.warn('Order sync exception:', err);
  }

  return newOrder;
}

export async function fetchOrders() {
  const local = getStoredOrders();

  try {
    const fetchPromise = supabase.from('orders').select('*').order('created_at', { ascending: false });
    const { data, error } = await withTimeout(fetchPromise, 2500);
    if (!error && Array.isArray(data) && data.length > 0) {
      const map = new Map();
      data.forEach((o) => map.set(o.id, o));
      local.forEach((o) => {
        if (!map.has(o.id)) map.set(o.id, o);
      });
      const merged = Array.from(map.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      saveStoredOrders(merged);
      return merged;
    }
  } catch (err) {
    // Return local if network is temporarily slow
  }
  return local;
}

export async function fetchOrdersByPhone(phoneQuery) {
  if (!phoneQuery) return [];
  const clean = String(phoneQuery).replace(/\D/g, '');
  const all = await fetchOrders();
  if (!Array.isArray(all)) return [];

  return all.filter((o) => {
    const oPhone = String(o.customer_phone || '').replace(/\D/g, '');
    if (!oPhone) return false;
    return (clean.length >= 4 && oPhone.includes(clean)) || (oPhone.length >= 4 && clean.includes(oPhone));
  });
}

export function onOrdersChange(callback) {
  let isSubscribed = true;

  // 1. Instant cached callback (0ms)
  const initial = getStoredOrders();
  callback(initial);

  // 2. Initial fetch from cloud
  fetchOrders().then((orders) => {
    if (isSubscribed && orders) callback(orders);
  });

  // 3. Regular polling every 3.5 seconds to guarantee cross-device sync even if websockets are blocked
  const pollInterval = setInterval(() => {
    if (!isSubscribed) return;
    fetchOrders().then((orders) => {
      if (isSubscribed && orders) callback(orders);
    });
  }, 3500);

  // 4. Broadcast listener for same-device cross-tab updates
  const handleBroadcast = (e) => {
    if (isSubscribed && e.data && e.data.type === 'ORDERS_SYNC') {
      callback(e.data.orders);
    }
  };
  if (syncBroadcast) syncBroadcast.addEventListener('message', handleBroadcast);

  const handleStorage = (e) => {
    if (isSubscribed && e.key === ORDERS_KEY) {
      callback(getStoredOrders());
    }
  };
  window.addEventListener('storage', handleStorage);

  // 5. Supabase Realtime channel
  let channel = null;
  try {
    channel = supabase
      .channel(`orders_realtime_${Date.now()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, async () => {
        if (!isSubscribed) return;
        const orders = await fetchOrders();
        callback(orders);
      })
      .subscribe();
  } catch (e) {}

  return () => {
    isSubscribed = false;
    clearInterval(pollInterval);
    if (channel) {
      try { supabase.removeChannel(channel); } catch (e) {}
    }
    if (syncBroadcast) syncBroadcast.removeEventListener('message', handleBroadcast);
    window.removeEventListener('storage', handleStorage);
  };
}

export function onSingleOrderChange(orderId, callback) {
  if (!orderId) return () => {};
  let isSubscribed = true;

  // Immediate check
  const local = getStoredOrders();
  const found = local.find((o) => o.id === orderId);
  if (found) callback(found);

  const handleBroadcast = (e) => {
    if (!isSubscribed) return;
    if (e.data && e.data.type === 'ORDERS_SYNC') {
      const match = (e.data.orders || []).find((o) => o.id === orderId);
      if (match) callback(match);
    }
  };
  if (syncBroadcast) syncBroadcast.addEventListener('message', handleBroadcast);

  // Poll for single order updates (e.g. status changes by admin)
  const singlePoll = setInterval(() => {
    if (!isSubscribed) return;
    fetchOrders().then((all) => {
      if (!isSubscribed) return;
      const match = (all || []).find((o) => o.id === orderId);
      if (match) callback(match);
    });
  }, 3500);

  return () => {
    isSubscribed = false;
    clearInterval(singlePoll);
    if (syncBroadcast) syncBroadcast.removeEventListener('message', handleBroadcast);
  };
}

export async function updateOrderStatus(orderId, status) {
  const updatedAt = new Date().toISOString();
  const local = getStoredOrders();
  const updated = local.map((o) => (o.id === orderId ? { ...o, status, updated_at: updatedAt } : o));
  saveStoredOrders(updated);

  try {
    withTimeout(supabase.from('orders').update({ status, updated_at: updatedAt }).eq('id', orderId), 2500).catch(() => {});
  } catch (e) {}
}

export async function deleteOrder(orderId) {
  const local = getStoredOrders();
  const updated = local.filter((o) => o.id !== orderId);
  saveStoredOrders(updated);

  try {
    withTimeout(supabase.from('orders').delete().eq('id', orderId), 2500).catch(() => {});
  } catch (e) {}
}

// ── Legacy stubs ─────────────────────────────────────────────────────────────
export async function getRestaurant() {
  return null;
}

export async function setRestaurant() {}
