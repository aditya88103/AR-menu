-- Run this in Supabase SQL Editor to check exact column names

-- Check dishes table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'dishes' 
ORDER BY ordinal_position;

-- Check sample dish data
SELECT * FROM dishes LIMIT 3;

-- Check categories
SELECT * FROM categories ORDER BY "order";
