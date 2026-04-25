-- Step 1: Check current state
SELECT 'Current broken URLs:' as status;
SELECT id, name, imageurl FROM dishes 
WHERE imageurl IS NOT NULL 
AND imageurl != '' 
AND imageurl NOT LIKE 'http%'
LIMIT 10;

-- Step 2: Fix incomplete URLs (run this)
UPDATE dishes 
SET imageurl = 'https://images.unsplash.com/' || imageurl || '?w=500&q=80&fit=crop'
WHERE imageurl IS NOT NULL 
AND imageurl != '' 
AND imageurl NOT LIKE 'http%'
AND imageurl LIKE 'photo-%';

-- Step 3: Verify fix
SELECT 'After fix:' as status;
SELECT id, name, imageurl FROM dishes 
WHERE imageurl IS NOT NULL 
AND imageurl != ''
LIMIT 10;

-- Step 4: Count fixed
SELECT 
  COUNT(*) FILTER (WHERE imageurl LIKE 'http%') as fixed_urls,
  COUNT(*) FILTER (WHERE imageurl NOT LIKE 'http%' AND imageurl != '') as broken_urls,
  COUNT(*) FILTER (WHERE imageurl IS NULL OR imageurl = '') as no_image
FROM dishes;
