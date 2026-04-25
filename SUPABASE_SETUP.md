# Supabase Setup Guide (Complete)

Supabase = Firebase but **100% free**, PostgreSQL, and easy!

## Step 1: Create Supabase Project (5 minutes)

1. Go to **https://supabase.com**
2. Click **Sign Up** → Use GitHub or email
3. Click **New Project**
4. Fill in:
   - **Name**: "yra" or anything
   - **Database Password**: Create strong password (save it!)
   - **Region**: Closest to your location
   - **Pricing Plan**: Leave as "Free"
5. Click **Create new project** and wait (takes 2-3 min)

## Step 2: Get Connection Info

1. After project loads, go **Settings > API** (left sidebar)
2. Copy these values:
   - **Project URL** → `REACT_APP_SUPABASE_URL`
   - **anon public** key → `REACT_APP_SUPABASE_ANON_KEY`
3. Keep them safe!

## Step 3: Create Database Tables

1. Go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Paste this SQL and run it:

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

4. Run it (green play button)
5. Check **Table Editor** - both tables should appear

## Step 4: Seed Demo Data (Optional)

1. Go back to **SQL Editor > New Query**
2. Paste this:

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

3. Run it

## Step 5: Setup Project Code

### Create `.env` file

In your project root, create `.env`:

```env
REACT_APP_SUPABASE_URL=your_project_url_here
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace with values from Step 2.

### Install Supabase

```bash
npm install @supabase/supabase-js
```

## Step 6: Update Project Files

The code has been updated already! Here's what changed:

### Updated Files:
- ✅ `src/lib/firebase.js` → Now uses Supabase
- ✅ `src/utils/firestore.js` → Now uses Supabase client
- ✅ `src/pages/menu/MenuPage.jsx` → Real-time listeners work with Supabase
- ✅ `src/pages/admin/Dishes.jsx` → Real-time listeners work with Supabase

All function names stay the same! The code works exactly like before.

## Step 7: Test It!

1. **Restart dev server:**
   ```bash
   npm run dev
   ```

2. **Open two browsers:**
   - Browser 1: Menu page → `http://localhost:5173`
   - Browser 2: Admin → `http://localhost:5173/admin/login`

3. **Toggle a dish** in Browser 2 (admin)
4. **Watch it update instantly** in Browser 1 (menu)

✅ **That's it!** Cross-browser real-time sync is working!

---

## Important: Enable RLS (Row Level Security)

For production, you need RLS. But for now it's optional.

**To enable RLS:**
1. Go to **Authentication > Policies** (left sidebar)
2. Click **Enable RLS** on both tables
3. Create policies:

```sql
-- Anyone can read available dishes
CREATE POLICY "public_read_available_dishes" ON dishes
  FOR SELECT USING (isAvailable = true);

-- Anyone can read categories
CREATE POLICY "public_read_categories" ON categories
  FOR SELECT USING (true);

-- Only authenticated users can write
CREATE POLICY "authenticated_write_dishes" ON dishes
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_write_categories" ON categories
  FOR ALL USING (auth.role() = 'authenticated');
```

---

## Troubleshooting

### "Cannot find module '@supabase/supabase-js'"
```bash
npm install @supabase/supabase-js
npm run dev
```

### "Connection refused" or "Failed to fetch"
- Check `.env` file exists and has correct URL/key
- Restart dev server after creating `.env`
- Verify Supabase project is running

### Changes not syncing in real-time
- Check tables have `ALTER PUBLICATION supabase_realtime ADD TABLE`
- Try hard refresh (Ctrl+Shift+R)
- Check browser console for errors

### Table permissions issue
- Go to **Authentication > Policies** → Turn OFF RLS temporarily (for testing)
- Or create the policies shown above

---

## What's Included (Free Tier)

✅ 2 projects  
✅ 500MB storage (plenty for menus!)  
✅ Unlimited real-time connections  
✅ PostgreSQL database  
✅ Built-in auth  
✅ File storage  

---

## Next Steps

1. ✅ Create Supabase project
2. ✅ Get API keys
3. ✅ Create tables
4. ✅ Add `.env` file
5. ✅ `npm install @supabase/supabase-js`
6. ✅ Restart dev server
7. ✅ Test real-time sync

**That's all!** Your app is now using Supabase with instant cross-browser sync! 🚀
