-- Fix uncategorized dishes by assigning them to proper categories
-- Run this in Supabase SQL Editor

-- First, check which dishes are uncategorized
SELECT id, name, category FROM dishes 
WHERE category NOT IN (SELECT name FROM categories)
OR category IS NULL OR category = '';

-- Update uncategorized dishes based on their names
-- You can modify the category assignments as needed

-- Example: If you have specific dishes, update them like this:
-- UPDATE dishes SET category = 'Main Course' WHERE id = 'some-id';

-- Or update all uncategorized to a default category:
UPDATE dishes 
SET category = 'Main Course' 
WHERE (category NOT IN (SELECT name FROM categories) OR category IS NULL OR category = '')
AND category != 'Uncategorized';

-- Verify the fix
SELECT 'After Fix:' as status;
SELECT d.id, d.name, d.category, c.name as category_exists
FROM dishes d
LEFT JOIN categories c ON d.category = c.name
WHERE c.name IS NULL;
