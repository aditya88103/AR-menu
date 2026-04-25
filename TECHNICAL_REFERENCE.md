# 🔧 Technical Reference - Supabase Migration

For developers who want to understand what changed and how.

## 📚 Architecture Overview

### Before (localStorage)
```
Browser 1 (Admin)  →  localStorage  ← (isolated)
Browser 2 (Menu)   →  localStorage  ← (isolated)
Problem: No sync between browsers ❌
```

### After (Supabase)
```
Browser 1 (Admin) ─┐
                  ├→ Supabase Database ←─ Real-time
Browser 2 (Menu) ─┤  (PostgreSQL)      Updates
Browser 3 (Mobile)┘
Solution: All browsers see changes instantly ✅
```

---

## 🔄 How Real-Time Works

### 1. Setup (Initialization)
```javascript
// When MenuPage loads:
useEffect(() => {
  // Create real-time listener
  const unsubscribe = onAvailableDishesChange((dishes) => {
    setDishes(dishes); // Update state
  });
  
  return () => unsubscribe(); // Cleanup on unmount
}, []);
```

### 2. Data Flow
```
1. Admin toggles dish on/off
   ↓
2. toggleDishAvailability() called
   ↓
3. Supabase query: UPDATE dishes SET isAvailable = false WHERE id = '123'
   ↓
4. PostgreSQL updates record
   ↓
5. Supabase real-time detects change
   ↓
6. Broadcast event to all listening clients
   ↓
7. onAvailableDishesChange() callback fires
   ↓
8. setDishes(updatedList) - re-render with new data
   ↓
9. Menu updates in Browser 2 instantly! ✨
```

### 3. Listener Implementation
```javascript
// In firestore.js
export function onAvailableDishesChange(callback) {
  // Create real-time channel
  const channel = supabase
    .channel('available-dishes-changes')
    .on(
      'postgres_changes',  // Listen for database changes
      { 
        event: '*',  // Listen to INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'dishes'
      },
      async () => {
        // Fetch fresh data from server
        const { data } = await supabase
          .from('dishes')
          .select('*')
          .neq('isAvailable', false);  // Only available dishes
        
        if (data) callback(data); // Send to component
      }
    )
    .subscribe(); // Start listening

  // Also fetch initial data
  supabase
    .from('dishes')
    .select('*')
    .neq('isAvailable', false)
    .then(({ data }) => {
      if (data) callback(data);
    });

  // Return cleanup function
  return () => supabase.removeChannel(channel);
}
```

---

## 📝 Code Changes Explained

### File: `src/lib/firebase.js`

**Before (Firebase):**
```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = { /* ... */ };
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

**After (Supabase):**
```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

**Why:** Supabase uses PostgreSQL with a simple HTTP client, not Firebase SDK.

---

### File: `src/utils/firestore.js`

#### Example: Fetching Dishes

**Before:**
```javascript
import { collection, getDocs } from 'firebase/firestore';

export async function fetchDishes() {
  const snap = await getDocs(collection(db, 'dishes'));
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
```

**After:**
```javascript
export async function fetchDishes() {
  const { data, error } = await supabase.from('dishes').select('*');
  if (error) console.error(error);
  return data || [];
}
```

**Why:** 
- Supabase uses `.from('table').select()` syntax (similar to SQL)
- Returns `{ data, error }` object (consistent error handling)
- Simpler and more intuitive

#### Example: Real-Time Listener

**Before (Firebase):**
```javascript
import { onSnapshot, query, where } from 'firebase/firestore';

export function onDishesChange(callback) {
  return onSnapshot(collection(db, 'dishes'), snap => {
    const dishes = snap.docs.map(doc => ({
      id: doc.id, 
      ...doc.data()
    }));
    callback(dishes);
  });
}
```

**After (Supabase):**
```javascript
export function onDishesChange(callback) {
  const channel = supabase
    .channel('dishes-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'dishes' },
      async () => {
        const { data } = await supabase.from('dishes').select('*');
        if (data) callback(data);
      }
    )
    .subscribe();

  supabase.from('dishes').select('*').then(({ data }) => {
    if (data) callback(data);
  });

  return () => supabase.removeChannel(channel);
}
```

**Why:**
- Uses `postgres_changes` to listen to database events
- Need to manually fetch data (vs Firebase's automatic snapshots)
- More explicit about subscriptions

---

### File: `src/pages/menu/MenuPage.jsx`

**Before:**
```javascript
import { fetchCategories, fetchAvailableDishes } from '../../utils/firestore';

const loadData = () => {
  Promise.all([
    fetchCategories(),
    fetchAvailableDishes(),
  ]).then(([cats, dishesList]) => {
    setCategories(cats);
    setDishes(dishesList);
  });
};

useEffect(() => {
  loadData();
  window.addEventListener('storage', loadData);  // Storage events
  window.addEventListener('focus', loadData);    // Tab focus events
  return () => {
    window.removeEventListener('storage', loadData);
    window.removeEventListener('focus', loadData);
  };
}, []);
```

**After:**
```javascript
import { onAvailableDishesChange, onCategoriesChange, initializeDemoData } from '../../utils/firestore';

useEffect(() => {
  initializeDemoData().catch(() => {});
  
  // Real-time listener - fires whenever dishes change
  const unsubDishes = onAvailableDishesChange(dishes => {
    setDishes(dishes);
    setLoading(false);
  });
  
  // Real-time listener - fires whenever categories change
  const unsubCats = onCategoriesChange(cats => {
    setCategories(cats);
    if (cats.length) setActive(prev => prev || cats[0].name);
    setLoading(false);
  });

  return () => {
    unsubDishes();
    unsubCats();
  };
}, []);
```

**Why:**
- No need for `storage` or `focus` events
- Supabase real-time is automatic
- Simpler and more efficient

---

## 🔐 Security & Rules

### Firestore Rules (Old)
```javascript
// firestore.rules
match /dishes/{dishId} {
  allow read: if resource.data.isAvailable == true;
  allow write: if request.auth != null;
}
```

### Supabase RLS Policies (New)
```sql
-- Anyone can read available dishes
CREATE POLICY "public_read" ON dishes
  FOR SELECT USING (isAvailable = true);

-- Only authenticated users can write
CREATE POLICY "authenticated_write" ON dishes
  FOR ALL USING (auth.role() = 'authenticated');
```

**Why:** 
- Supabase uses Row Level Security (RLS)
- More granular control per row
- PostgreSQL standard security model

---

## 🚀 Performance Implications

### Before (localStorage)
- ❌ No network calls = fast locally
- ❌ No sync between browsers
- ❌ Must manually refresh
- ❌ Data size limited by browser storage

### After (Supabase)
- ✅ Network latency (~50-200ms per request)
- ✅ Automatic sync across all devices
- ✅ Real-time updates push to clients
- ✅ Unlimited data capacity
- ✅ Better scalability

**Result:** Slightly slower per operation, but much better user experience overall!

---

## 📊 Data Structure

### Dishes Table
```sql
id: TEXT (UUID)
name: TEXT
description: TEXT
category: TEXT
price: FLOAT
isVeg: BOOLEAN
isAvailable: BOOLEAN  ← Admin toggles this
imageURL: TEXT
modelURL: TEXT
createdAt: TIMESTAMP
updatedAt: TIMESTAMP
```

### Categories Table
```sql
id: TEXT (UUID)
name: TEXT
order: INT  ← Sort order (1, 2, 3...)
createdAt: TIMESTAMP
updatedAt: TIMESTAMP
```

---

## 🔧 Environment Variables

```env
# In .env file (never commit this!)
REACT_APP_SUPABASE_URL=https://xxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJxxxx...
```

**How it works:**
- Vite reads `.env` file at build time
- Variables prefixed with `REACT_APP_` are available in browser
- `process.env.REACT_APP_SUPABASE_URL` → accessed in code

---

## 🐛 Debugging

### Check if Real-Time is Working
```javascript
// In browser console
const { supabase } = await import('./src/lib/firebase.js');
const channel = supabase.channel('test-channel');

channel.subscribe(status => {
  console.log('Connection status:', status);
  // Should show 'SUBSCRIBED'
});
```

### View Supabase Logs
1. Go to Supabase Dashboard
2. **Logs > Realtime Logs**
3. See all real-time events

### Monitor Network Calls
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. You'll see WebSocket connection to Supabase
4. This is the real-time channel

---

## 📚 API Reference

| Function | Old | New |
|----------|-----|-----|
| `fetchDishes()` | Firestore | Supabase REST |
| `fetchAvailableDishes()` | Firestore | Supabase REST |
| `onDishesChange()` | Firestore onSnapshot | Supabase postgres_changes |
| `addDish()` | Firestore addDoc | Supabase insert |
| `updateDish()` | Firestore updateDoc | Supabase update |
| `deleteDish()` | Firestore deleteDoc | Supabase delete |

---

## 🎓 Learning Resources

- **Supabase Docs:** https://supabase.com/docs
- **Real-time Guide:** https://supabase.com/docs/guides/realtime
- **PostgreSQL Basics:** https://www.postgresql.org/docs/

---

That's the technical breakdown! All components work the same way, just with Supabase backend instead of Firebase. 🎉
