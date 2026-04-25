# 🚀 Supabase Setup - QUICK START (5 minutes)

Your project is **100% ready to use Supabase**! Here's what to do:

## ✅ What's Already Done

- ✅ Code migrated to Supabase (all files updated)
- ✅ Real-time listeners configured
- ✅ `.env.example` created (template provided)
- ✅ Package.json updated with `@supabase/supabase-js`

## 📋 Your Checklist (Do This Now)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Create Supabase Account

1. Go to **https://supabase.com**
2. Click **Sign Up** (use GitHub or email)
3. Click **New Project**
4. Fill in:
   - Name: "yra" (or anything)
   - Password: Create strong password
   - Region: Closest to you
   - Plan: **Free**
5. Wait 2-3 minutes for it to create

### Step 3: Get Your API Keys

1. After project loads, go to **Settings > API** (left sidebar)
2. Copy:
   - **Project URL** (in "Project URL" section)
   - **anon public** key (in "Project API keys" section)

### Step 4: Create `.env` File

In your project root, create a file named `.env`:

```env
REACT_APP_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxx
```

**Replace with YOUR values from Step 3!**

### Step 5: Create Database Tables

1. In Supabase, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. **Copy all of this** and paste into the editor:

```sql
-- Create dishes table
CREATE TABLE dishes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price FLOAT,
  isVeg BOOLEAN DEFAULT false,
  isAvailable BOOLEAN DEFAULT true,
  imageURL TEXT,
  modelURL TEXT,
  createdAt TIMESTAMP DEFAULT now(),
  updatedAt TIMESTAMP DEFAULT now()
);

-- Create categories table
CREATE TABLE categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL UNIQUE,
  "order" INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT now(),
  updatedAt TIMESTAMP DEFAULT now()
);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE dishes;
ALTER PUBLICATION supabase_realtime ADD TABLE categories;
```

4. Click the **green play button** to run
5. Wait for "Success" message

### Step 6: Add Demo Data (Optional)

1. **New Query** again
2. Copy and paste:

```sql
INSERT INTO categories (name, "order") VALUES
  ('Appetizers', 1),
  ('Main Course', 2),
  ('Desserts', 3),
  ('Beverages', 4);

INSERT INTO dishes (name, description, category, price, isVeg, isAvailable) VALUES
  ('Samosa', 'Crispy fried pastry with spiced potato filling', 'Appetizers', 50, true, true),
  ('Butter Chicken', 'Creamy tomato-based chicken curry', 'Main Course', 250, false, true),
  ('Gulab Jamun', 'Soft milk solids in sugar syrup', 'Desserts', 30, true, true),
  ('Mango Lassi', 'Yogurt-based mango smoothie', 'Beverages', 60, true, true);
```

3. Run it (green play button)

### Step 7: Restart Dev Server

```bash
npm run dev
```

### Step 8: Test Real-Time Sync

1. Open **two browser windows:**
   - Window 1: Menu → `http://localhost:5173`
   - Window 2: Admin → `http://localhost:5173/admin/login`

2. Toggle a dish on/off in Window 2 (admin)
3. Watch it update **instantly** in Window 1 (menu)

✅ **You're done!** Real-time sync is working! 🎉

---

## 🆘 Troubleshooting

### "Cannot find module @supabase/supabase-js"
```bash
npm install @supabase/supabase-js
npm run dev
```

### Changes not syncing / blank page
1. Check `.env` file exists and has correct URL/key
2. Restart dev server (`npm run dev`)
3. Hard refresh browser (Ctrl+Shift+R)
4. Check browser console for red errors

### Need help?
See `SUPABASE_SETUP.md` for detailed guide with more info

---

## 📝 File Changes Made

| File | Change |
|------|--------|
| `src/lib/firebase.js` | Now uses Supabase client |
| `src/utils/firestore.js` | All functions use Supabase |
| `src/pages/menu/MenuPage.jsx` | Real-time listeners work with Supabase |
| `src/pages/admin/Dishes.jsx` | Real-time listeners work with Supabase |
| `package.json` | Added `@supabase/supabase-js` |
| `.env.example` | Template for environment variables |

All function names and signatures stay the same! No component changes needed. ✨

---

## 💡 Pro Tips

- **Your data is live now** → Changes sync across browsers instantly
- **Free tier is generous** → 500MB storage, unlimited real-time for 2 projects
- **PostgreSQL power** → Way more powerful than Firebase at no cost
- **Easy to scale** → When you need more, paid plans start at $25/month

**That's it! You're set up with free, real-time backend! 🚀**
