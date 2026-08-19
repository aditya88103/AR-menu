-- ─────────────────────────────────────────────────────────────
--  BIGGIES RESTAURANT – COMPLETE DATABASE SETUP SCRIPT
--  Run this script in the Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────

-- 1. Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    "order" INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create dishes table (with lowercase & camelCase column safety)
CREATE TABLE IF NOT EXISTS public.dishes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    description TEXT,
    category TEXT NOT NULL,
    "isVeg" BOOLEAN DEFAULT true,
    isveg BOOLEAN DEFAULT true,
    "isAvailable" BOOLEAN DEFAULT true,
    isavailable BOOLEAN DEFAULT true,
    "imageURL" TEXT,
    imageurl TEXT,
    "modelURL" TEXT,
    modelurl TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL,
    table_number TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    notes TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    tax NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'preparing', 'served', 'completed', 'cancelled'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 5. Open Access Policies for Public Ordering & Admin CRUD
-- Categories Policies
DROP POLICY IF EXISTS "Allow public read categories" ON public.categories;
CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public all categories" ON public.categories;
CREATE POLICY "Allow public all categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

-- Dishes Policies
DROP POLICY IF EXISTS "Allow public read dishes" ON public.dishes;
CREATE POLICY "Allow public read dishes" ON public.dishes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public all dishes" ON public.dishes;
CREATE POLICY "Allow public all dishes" ON public.dishes FOR ALL USING (true) WITH CHECK (true);

-- Orders Policies
DROP POLICY IF EXISTS "Allow public read orders" ON public.orders;
CREATE POLICY "Allow public read orders" ON public.orders FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public all orders" ON public.orders;
CREATE POLICY "Allow public all orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

-- 6. Enable Realtime live sync
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dishes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
