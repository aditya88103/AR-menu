# ✅ Supabase Setup Checklist

Complete this checklist to get your real-time menu working!

## 🟢 PART 1: Project Setup (Already Done)
- [x] Code migrated to Supabase
- [x] `.env.example` created
- [x] `package.json` updated
- [x] Real-time listeners configured

## 🟡 PART 2: Your Tasks (Do These Now)

### Task 1: Install Dependencies ⏱️ 1 min
```bash
npm install
```
- [ ] Run command
- [ ] Wait for installation

### Task 2: Create Supabase Project ⏱️ 5 min
- [ ] Go to https://supabase.com
- [ ] Click "Sign Up"
- [ ] Sign in with GitHub or email
- [ ] Click "New Project"
- [ ] Fill in project name (e.g., "yra")
- [ ] Create a strong password
- [ ] Choose region closest to you
- [ ] Select **Free** plan
- [ ] Click "Create new project"
- [ ] Wait 2-3 minutes for creation

### Task 3: Get API Keys ⏱️ 2 min
- [ ] Go to **Settings > API** in Supabase
- [ ] Copy **Project URL** (looks like: `https://xxxx.supabase.co`)
- [ ] Copy **anon public** key (long string starting with `eyJ...`)
- [ ] Keep them safe (don't share publicly)

### Task 4: Create `.env` File ⏱️ 1 min
- [ ] Create file named `.env` in project root
- [ ] Add these two lines (replace with YOUR values):
```env
REACT_APP_SUPABASE_URL=https://your-url-here.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-key-here
```
- [ ] Save the file
- [ ] Verify `.env` is in root directory (same level as `package.json`)

### Task 5: Create Database Tables ⏱️ 2 min
- [ ] In Supabase, go to **SQL Editor** (left sidebar)
- [ ] Click **New Query**
- [ ] Copy the SQL below and paste into editor:

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

-- Enable real-time for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE dishes;
ALTER PUBLICATION supabase_realtime ADD TABLE categories;
```

- [ ] Click **green play button** (Execute button)
- [ ] Wait for "Success" message
- [ ] In **Table Editor**, verify you see `dishes` and `categories` tables

### Task 6: Add Demo Data (Optional but recommended) ⏱️ 1 min
- [ ] Go to **SQL Editor > New Query**
- [ ] Copy and paste:

```sql
INSERT INTO categories (name, "order") VALUES
  ('Appetizers', 1),
  ('Main Course', 2),
  ('Desserts', 3),
  ('Beverages', 4);

INSERT INTO dishes (name, description, category, price, isVeg, isAvailable) VALUES
  ('Samosa', 'Crispy fried pastry', 'Appetizers', 50, true, true),
  ('Butter Chicken', 'Chicken in creamy sauce', 'Main Course', 250, false, true),
  ('Gulab Jamun', 'Sweet milk solids', 'Desserts', 30, true, true),
  ('Mango Lassi', 'Yogurt smoothie', 'Beverages', 60, true, true);
```

- [ ] Run it (green button)
- [ ] Wait for "Success"

### Task 7: Start Dev Server ⏱️ 1 min
```bash
npm run dev
```
- [ ] Run command
- [ ] Wait until you see "VITE ... ready in X ms"
- [ ] Local URL appears (usually http://localhost:5173)

### Task 8: Test Real-Time Sync ⏱️ 3 min

**Window 1: Menu Page**
- [ ] Open `http://localhost:5173` in a browser
- [ ] You should see menu items (Samosa, Butter Chicken, etc.)
- [ ] Keep this window open

**Window 2: Admin Dashboard**
- [ ] Open `http://localhost:5173/admin/login` in another browser window
- [ ] You should see the admin panel
- [ ] Find a dish and toggle it off/on

**Check Sync:**
- [ ] Look at Window 1 (menu)
- [ ] The dish should disappear/appear **instantly**
- [ ] ✅ If it works, you're done!

## 🔴 PART 3: Troubleshooting

### Problem: "Cannot find module @supabase/supabase-js"
**Solution:**
```bash
npm install @supabase/supabase-js
npm run dev
```

### Problem: "Module not found: firebase" or similar
**Solution:**
- Open terminal
- Run: `npm install`
- Restart dev server: `npm run dev`

### Problem: Blank page or "No data appears"
**Solution:**
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for red errors
4. Check `.env` file:
   - Does it exist in root?
   - Are values correct?
   - No spaces around `=`?
5. Restart dev server: `npm run dev`
6. Hard refresh browser: `Ctrl+Shift+R`

### Problem: Changes not syncing between browsers
**Solution:**
1. Check both tables have real-time enabled:
   - In Supabase, go to **SQL Editor > New Query**
   - Run this:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE dishes;
   ALTER PUBLICATION supabase_realtime ADD TABLE categories;
   ```
2. Verify `.env` has correct URL/key
3. Restart both browser tabs
4. Try toggling a dish again

## ✨ All Done!

Once you complete the checklist:
- ✅ Your menu syncs across all browsers instantly
- ✅ Changes on admin appear in customer menu in real-time
- ✅ Works on multiple devices
- ✅ Database is secure and free tier is generous

## 📚 Documentation

- **Quick questions?** → See `QUICK_START.md`
- **Detailed setup?** → See `SUPABASE_SETUP.md`
- **Want to learn more?** → Visit https://supabase.com/docs

---

**Estimated total time: 15-20 minutes** ⏰

**Questions?** Check the guides or browser console for error messages!
