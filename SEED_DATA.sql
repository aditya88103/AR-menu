-- Direct Supabase Seed Script
-- Copy-paste this entire script into Supabase SQL Editor and run it
-- This will seed all 8 categories and 40 dishes instantly

-- Clear existing data (optional, comment out if you want to keep existing data)
-- DELETE FROM dishes;
-- DELETE FROM categories;

-- Insert Categories
INSERT INTO categories (id, name, "order") VALUES
('burgers', 'Burgers & Wraps', 0),
('starters', 'Starters', 1),
('mains', 'Main Course', 2),
('biryani', 'Biryani & Rice', 3),
('chinese', 'Chinese Corner', 4),
('breads', 'Breads', 5),
('desserts', 'Desserts', 6),
('drinks', 'Drinks & Shakes', 7)
ON CONFLICT (id) DO NOTHING;

-- Insert Dishes (40 total)
INSERT INTO dishes (id, name, description, category, price, isVeg, isAvailable, imageURL, modelURL) VALUES

-- Burgers & Wraps (6)
('b1', 'Biggies Classic Burger', 'Double-patty smash burger with lettuce, tomato, pickles, cheddar cheese and secret Biggies sauce.', 'Burgers & Wraps', 129, false, true, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80&fit=crop', '/models/burger.glb'),
('b2', 'Spicy Chicken Burger', 'Crispy fried chicken thigh with peri-peri sauce, coleslaw and jalapeños in a toasted brioche bun.', 'Burgers & Wraps', 149, false, true, 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=500&q=80&fit=crop', '/models/burger.glb'),
('b3', 'Paneer Tikka Burger', 'Grilled tandoori paneer tikka patty with mint chutney, sliced onions and tomatoes.', 'Burgers & Wraps', 119, true, true, 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&q=80&fit=crop', '/models/burger.glb'),
('b4', 'Veg Aloo Tikki Burger', 'Crispy spiced potato tikki with tamarind chutney, green chutney and fresh salad.', 'Burgers & Wraps', 89, true, true, 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=500&q=80&fit=crop', '/models/burger.glb'),
('b5', 'Chicken Kathi Roll', 'Flaky paratha stuffed with spiced chicken tikka strips, onions and mint chutney.', 'Burgers & Wraps', 99, false, true, 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=500&q=80&fit=crop', '/models/wrap.glb'),
('b6', 'Paneer Frankie', 'Soft roomali roti wrapped with spiced paneer bhurji, capsicum and schezwan sauce.', 'Burgers & Wraps', 89, true, true, 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=500&q=80&fit=crop', '/models/wrap.glb'),

-- Starters (5)
('s1', 'Chicken Tikka (Half)', 'Tender chicken pieces marinated in yogurt, ginger, garlic and spices, char-grilled in tandoor.', 'Starters', 199, false, true, 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&q=80&fit=crop', '/models/tandoori.glb'),
('s2', 'Paneer Tikka (Half)', 'Cottage cheese cubes marinated in spiced yogurt and grilled to perfection in the tandoor.', 'Starters', 179, true, true, 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&q=80&fit=crop', '/models/tandoori.glb'),
('s3', 'Peri Peri Chicken Wings', '6 crispy chicken wings tossed in fiery house-made peri peri sauce. Served with dip.', 'Starters', 229, false, true, 'https://images.unsplash.com/photo-1567234669003-dce7a7a88821?w=500&q=80&fit=crop', '/models/tandoori.glb'),
('s4', 'Crispy Veg Spring Rolls', 'Crunchy golden rolls filled with cabbage, carrots and noodles, served with sweet chilli sauce.', 'Starters', 129, true, true, 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=500&q=80&fit=crop', '/models/spring-roll.glb'),
('s5', 'Chilli Potato', 'Crispy potato strips tossed with green chillies, bell peppers and soy sauce. Street-style classic.', 'Starters', 119, true, true, 'https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=500&q=80&fit=crop', '/models/noodle-bowl.glb'),

-- Main Course (7)
('m1', 'Butter Chicken', 'Succulent tandoori chicken in a rich, velvety tomato-butter-cream sauce with fenugreek.', 'Main Course', 279, false, true, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&q=80&fit=crop', '/models/curry-bowl.glb'),
('m2', 'Dal Makhani', 'Slow-cooked overnight black lentils with butter, cream and spices. A Biggies signature.', 'Main Course', 219, true, true, 'https://images.unsplash.com/photo-1546554137-f86b9593a222?w=500&q=80&fit=crop', '/models/curry-bowl.glb'),
('m3', 'Paneer Butter Masala', 'Soft cottage cheese cubes in a smooth, aromatic tomato-cashew-cream gravy.', 'Main Course', 239, true, true, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&q=80&fit=crop', '/models/curry-bowl.glb'),
('m4', 'Chicken Kadai', 'Bone-in chicken cooked with freshly ground spices, bell peppers and tomatoes in a kadai.', 'Main Course', 269, false, true, 'https://images.unsplash.com/photo-1578020190125-f4f7c18bc9cb?w=500&q=80&fit=crop', '/models/curry-bowl.glb'),
('m5', 'Mutton Roghan Josh', 'Slow-braised tender mutton in a Kashmiri spice gravy with whole spices and chilli.', 'Main Course', 349, false, true, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&q=80&fit=crop', '/models/curry-bowl.glb'),
('m6', 'Palak Paneer', 'Fresh cottage cheese in a smooth, spiced spinach gravy with garlic and cream.', 'Main Course', 219, true, true, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80&fit=crop', '/models/curry-bowl.glb'),
('m7', 'Mix Veg Curry', 'Seasonal vegetables slow-cooked in an onion-tomato masala with house spice blend.', 'Main Course', 189, true, true, 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=500&q=80&fit=crop', '/models/curry-bowl.glb'),

-- Biryani & Rice (5)
('r1', 'Chicken Dum Biryani', 'Marinated chicken slow-cooked dum style with saffron basmati, fried onions and mint.', 'Biryani & Rice', 299, false, true, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80&fit=crop', '/models/biryani.glb'),
('r2', 'Veg Biryani', 'Fragrant basmati rice layered with spiced seasonal vegetables, whole spices and rose water.', 'Biryani & Rice', 219, true, true, 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500&q=80&fit=crop', '/models/biryani.glb'),
('r3', 'Mutton Biryani', 'Dum-cooked mutton biryani with kewra water, saffron, caramelised onions — full meal.', 'Biryani & Rice', 369, false, true, 'https://images.unsplash.com/photo-1571805529673-0f56b922b359?w=500&q=80&fit=crop', '/models/biryani.glb'),
('r4', 'Egg Biryani', 'Fluffy masala eggs layered with saffron rice, fried onions and fresh mint leaves.', 'Biryani & Rice', 199, false, true, 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500&q=80&fit=crop', '/models/biryani.glb'),
('r5', 'Jeera Rice', 'Long-grain basmati rice tempered with cumin seeds, ghee and a hint of green chilli.', 'Biryani & Rice', 99, true, true, 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=500&q=80&fit=crop', '/models/rice.glb'),

-- Chinese Corner (4)
('c1', 'Veg Hakka Noodles', 'Stir-fried noodles with crunchy vegetables in Indo-Chinese sauces — our best-seller.', 'Chinese Corner', 169, true, true, 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=500&q=80&fit=crop', '/models/noodle-bowl.glb'),
('c2', 'Chicken Schezwan Fried Rice', 'Wok-tossed rice with egg, chicken and fiery Schezwan sauce. Extra spicy on request.', 'Chinese Corner', 219, false, true, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&q=80&fit=crop', '/models/rice.glb'),
('c3', 'Chilli Chicken (Dry)', 'Batter-fried chicken tossed with green chillies, capsicum and soy vinegar sauce.', 'Chinese Corner', 249, false, true, 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500&q=80&fit=crop', '/models/tandoori.glb'),
('c4', 'Veg Manchurian Gravy', 'Fried veggie balls simmered in a tangy, garlicky Manchurian sauce. Best with rice.', 'Chinese Corner', 189, true, true, 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=500&q=80&fit=crop', '/models/curry-bowl.glb'),

-- Breads (4)
('br1', 'Butter Naan', 'Soft leavened bread baked in tandoor and slathered with salted butter.', 'Breads', 45, true, true, 'https://images.unsplash.com/photo-1565183997392-2f6f122e5912?w=500&q=80&fit=crop', '/models/naan.glb'),
('br2', 'Garlic Naan', 'Naan topped with freshly minced garlic, coriander and a generous brush of butter.', 'Breads', 55, true, true, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80&fit=crop', '/models/naan.glb'),
('br3', 'Tandoori Roti', 'Whole wheat flatbread baked fresh in a tandoor. Light, healthy and delicious.', 'Breads', 30, true, true, 'https://images.unsplash.com/photo-1574197867468-7ec4619f0b64?w=500&q=80&fit=crop', '/models/naan.glb'),
('br4', 'Aloo Paratha', 'Thick whole wheat flatbread stuffed with spiced mashed potato, served with butter and curd.', 'Breads', 79, true, true, 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=500&q=80&fit=crop', '/models/naan.glb'),

-- Desserts (5)
('de1', 'Gulab Jamun (2 pcs)', 'Warm khoya dumplings soaked in rose-cardamom sugar syrup. Served with ice cream.', 'Desserts', 79, true, true, 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=500&q=80&fit=crop', '/models/gulab-jamun.glb'),
('de2', 'Brownie Blast', 'Warm dark chocolate brownie with a scoop of vanilla ice cream and hot chocolate sauce.', 'Desserts', 149, true, true, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80&fit=crop', '/models/brownie.glb'),
('de3', 'Phirni', 'Chilled ground rice pudding with saffron, cardamom and crushed pistachios. Served in matka.', 'Desserts', 89, true, true, 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500&q=80&fit=crop', '/models/gulab-jamun.glb'),
('de4', 'Ice Cream (2 scoops)', 'Choose from Vanilla, Chocolate or Strawberry. Topped with chocolate sauce and sprinkles.', 'Desserts', 99, true, true, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&q=80&fit=crop', '/models/ice-cream.glb'),
('de5', 'Rasmalai', 'Soft paneer dumplings in chilled sweetened milk with saffron and cardamom.', 'Desserts', 99, true, true, 'https://images.unsplash.com/photo-1585338107529-167f7dcb77d0?w=500&q=80&fit=crop', '/models/gulab-jamun.glb'),

-- Drinks & Shakes (4)
('dr1', 'Mango Mastani Shake', 'Thick mango shake topped with a scoop of ice cream, dry fruits and fresh mango chunks.', 'Drinks & Shakes', 129, true, true, 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&q=80&fit=crop', '/models/milkshake.glb'),
('dr2', 'Oreo Chocolate Shake', 'Thick blended milkshake with Oreo cookies, dark chocolate and whipped cream on top.', 'Drinks & Shakes', 149, true, true, 'https://images.unsplash.com/photo-1572490122747-3e9bbd0f1939?w=500&q=80&fit=crop', '/models/milkshake.glb'),
('dr3', 'Fresh Lime Soda', 'Freshly squeezed lime juice with chilled soda, black salt and mint. Sweet or salted.', 'Drinks & Shakes', 59, true, true, 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=500&q=80&fit=crop', '/models/milkshake.glb'),
('dr4', 'Masala Chai', 'Strong Indian tea brewed with ginger, cardamom and whole spices. Comfort in a cup.', 'Drinks & Shakes', 39, true, true, 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=500&q=80&fit=crop', '/models/chai.glb')

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  isVeg = EXCLUDED.isVeg,
  isAvailable = EXCLUDED.isAvailable,
  imageURL = EXCLUDED.imageURL,
  modelURL = EXCLUDED.modelURL;

-- Verify data was seeded
SELECT COUNT(*) as total_dishes FROM dishes;
SELECT COUNT(*) as total_categories FROM categories;
