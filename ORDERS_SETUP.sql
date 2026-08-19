-- ─────────────────────────────────────────────────────────────
--  BIGGIES RESTAURANT – ORDERS TABLE SETUP (SUPABASE SQL)
--  Run this script in the Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────

-- 1. Create orders table
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

-- 2. Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_table ON public.orders (table_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 4. Create open access policies for public customer ordering & admin management
DROP POLICY IF EXISTS "Allow public read on orders" ON public.orders;
CREATE POLICY "Allow public read on orders" 
ON public.orders FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow public insert on orders" ON public.orders;
CREATE POLICY "Allow public insert on orders" 
ON public.orders FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on orders" ON public.orders;
CREATE POLICY "Allow public update on orders" 
ON public.orders FOR UPDATE 
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete on orders" ON public.orders;
CREATE POLICY "Allow public delete on orders" 
ON public.orders FOR DELETE 
USING (true);

-- 5. Enable Realtime on orders table
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
