-- Check if images are being saved
SELECT id, name, imageurl, modelurl FROM dishes WHERE imageurl IS NOT NULL AND imageurl != '' LIMIT 10;

-- Check uncategorized dishes
SELECT id, name, category FROM dishes WHERE category NOT IN (SELECT name FROM categories);

-- Show all dishes with their categories
SELECT d.id, d.name, d.category, d.imageurl, c.name as category_exists
FROM dishes d
LEFT JOIN categories c ON d.category = c.name
ORDER BY d.category, d.name;
