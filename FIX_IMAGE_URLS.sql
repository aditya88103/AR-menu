-- Fix incomplete image URLs in database
-- This will update all partial URLs to complete Unsplash URLs

UPDATE dishes 
SET imageurl = 'https://images.unsplash.com/' || imageurl || '?w=500&q=80&fit=crop'
WHERE imageurl IS NOT NULL 
AND imageurl != '' 
AND imageurl NOT LIKE 'http%'
AND imageurl LIKE 'photo-%';

-- Verify the fix
SELECT id, name, imageurl FROM dishes WHERE imageurl IS NOT NULL AND imageurl != '' LIMIT 10;
