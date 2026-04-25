-- Test script to verify data in Supabase
-- Run this in Supabase SQL Editor to check if data exists

-- Check categories
SELECT 'CATEGORIES:' as info;
SELECT id, name, "order" FROM categories ORDER BY "order";

-- Check dishes count
SELECT 'TOTAL DISHES:' as info, COUNT(*) as count FROM dishes;

-- Check available dishes
SELECT 'AVAILABLE DISHES:' as info, COUNT(*) as count FROM dishes WHERE isavailable = true;

-- Show sample dishes
SELECT 'SAMPLE DISHES:' as info;
SELECT id, name, category, price, isveg, isavailable FROM dishes LIMIT 10;

-- Check if realtime is enabled
SELECT 'REALTIME STATUS:' as info;
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename IN ('dishes', 'categories');
