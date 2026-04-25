// ─────────────────────────────────────────────────────────────
//  BIGGIES RESTAURANT – FOOD STOP
//  Demo/Seed menu data  (38 dishes, 8 categories)
//  isVeg: true = Veg 🟢 | false = Non-Veg 🔴
//
//  All modelURLs point to locally generated food-shaped GLBs
//  in public/models/ — no external CDN required.
// ─────────────────────────────────────────────────────────────

// ── Local Model URL helpers ────────────────────────────────────
const base = import.meta.env.BASE_URL ?? '/';    // e.g. '/Restaurant-/'
const m = (name) => `${base}models/${name}.glb`;

// Model map by food type
const MDL = {
  burger:      m('burger'),
  curry:       m('curry-bowl'),
  noodle:      m('noodle-bowl'),
  biryani:     m('biryani'),
  icecream:    m('ice-cream'),
  milkshake:   m('milkshake'),
  tandoori:    m('tandoori'),
  wrap:        m('wrap'),
  naan:        m('naan'),
  gulab:       m('gulab-jamun'),
  brownie:     m('brownie'),
  chai:        m('chai'),
  rice:        m('rice'),
  springroll:  m('spring-roll'),
};

export const DEMO_CATEGORIES = [
  { id: 'burgers',   name: 'Burgers & Wraps',  order: 0 },
  { id: 'starters',  name: 'Starters',          order: 1 },
  { id: 'mains',     name: 'Main Course',        order: 2 },
  { id: 'biryani',   name: 'Biryani & Rice',     order: 3 },
  { id: 'chinese',   name: 'Chinese Corner',     order: 4 },
  { id: 'breads',    name: 'Breads',             order: 5 },
  { id: 'desserts',  name: 'Desserts',           order: 6 },
  { id: 'drinks',    name: 'Drinks & Shakes',    order: 7 },
  { id: 'combos',    name: 'Special Combos',     order: 8 },
  { id: 'healthy',   name: 'Healthy Options',    order: 9 },
  { id: 'street',    name: 'Indian Street Food', order: 10 },
  { id: 'south',     name: 'South Indian',       order: 11 },
];

export const DEMO_DISHES = [

  // ══ Burgers & Wraps ══════════════════════════════════════
  {
    id: 'b1', name: 'Biggies Classic Burger', category: 'Burgers & Wraps', price: 129, isVeg: false,
    description: 'Double-patty smash burger with lettuce, tomato, pickles, cheddar cheese and secret Biggies sauce.',
    imageURL: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80&fit=crop',
    modelURL: MDL.burger, isAvailable: true,
  },
  {
    id: 'b2', name: 'Spicy Chicken Burger', category: 'Burgers & Wraps', price: 149, isVeg: false,
    description: 'Crispy fried chicken thigh with peri-peri sauce, coleslaw and jalapeños in a toasted brioche bun.',
    imageURL: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=500&q=80&fit=crop',
    modelURL: MDL.burger, isAvailable: true,
  },
  {
    id: 'b3', name: 'Paneer Tikka Burger', category: 'Burgers & Wraps', price: 119, isVeg: true,
    description: 'Grilled tandoori paneer tikka patty with mint chutney, sliced onions and tomatoes.',
    imageURL: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&q=80&fit=crop',
    modelURL: MDL.burger, isAvailable: true,
  },
  {
    id: 'b4', name: 'Veg Aloo Tikki Burger', category: 'Burgers & Wraps', price: 89, isVeg: true,
    description: 'Crispy spiced potato tikki with tamarind chutney, green chutney and fresh salad.',
    imageURL: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=500&q=80&fit=crop',
    modelURL: MDL.burger, isAvailable: true,
  },
  {
    id: 'b5', name: 'Chicken Kathi Roll', category: 'Burgers & Wraps', price: 99, isVeg: false,
    description: 'Flaky paratha stuffed with spiced chicken tikka strips, onions and mint chutney.',
    imageURL: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=500&q=80&fit=crop',
    modelURL: MDL.wrap, isAvailable: true,
  },
  {
    id: 'b6', name: 'Paneer Frankie', category: 'Burgers & Wraps', price: 89, isVeg: true,
    description: 'Soft roomali roti wrapped with spiced paneer bhurji, capsicum and schezwan sauce.',
    imageURL: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=500&q=80&fit=crop',
    modelURL: MDL.wrap, isAvailable: true,
  },

  // ══ Starters ═════════════════════════════════════════════
  {
    id: 's1', name: 'Chicken Tikka (Half)', category: 'Starters', price: 199, isVeg: false,
    description: 'Tender chicken pieces marinated in yogurt, ginger, garlic and spices, char-grilled in tandoor.',
    imageURL: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&q=80&fit=crop',
    modelURL: MDL.tandoori, isAvailable: true,
  },
  {
    id: 's2', name: 'Paneer Tikka (Half)', category: 'Starters', price: 179, isVeg: true,
    description: 'Cottage cheese cubes marinated in spiced yogurt and grilled to perfection in the tandoor.',
    imageURL: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&q=80&fit=crop',
    modelURL: MDL.tandoori, isAvailable: true,
  },
  {
    id: 's3', name: 'Peri Peri Chicken Wings', category: 'Starters', price: 229, isVeg: false,
    description: '6 crispy chicken wings tossed in fiery house-made peri peri sauce. Served with dip.',
    imageURL: 'https://images.unsplash.com/photo-1567234669003-dce7a7a88821?w=500&q=80&fit=crop',
    modelURL: MDL.tandoori, isAvailable: true,
  },
  {
    id: 's4', name: 'Crispy Veg Spring Rolls', category: 'Starters', price: 129, isVeg: true,
    description: 'Crunchy golden rolls filled with cabbage, carrots and noodles, served with sweet chilli sauce.',
    imageURL: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=500&q=80&fit=crop',
    modelURL: MDL.springroll, isAvailable: true,
  },
  {
    id: 's5', name: 'Chilli Potato', category: 'Starters', price: 119, isVeg: true,
    description: 'Crispy potato strips tossed with green chillies, bell peppers and soy sauce. Street-style classic.',
    imageURL: 'https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=500&q=80&fit=crop',
    modelURL: MDL.noodle, isAvailable: true,
  },

  // ══ Main Course ══════════════════════════════════════════
  {
    id: 'm1', name: 'Butter Chicken', category: 'Main Course', price: 279, isVeg: false,
    description: 'Succulent tandoori chicken in a rich, velvety tomato-butter-cream sauce with fenugreek.',
    imageURL: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&q=80&fit=crop',
    modelURL: MDL.curry, isAvailable: true,
  },
  {
    id: 'm2', name: 'Dal Makhani', category: 'Main Course', price: 219, isVeg: true,
    description: 'Slow-cooked overnight black lentils with butter, cream and spices. A Biggies signature.',
    imageURL: 'https://images.unsplash.com/photo-1546554137-f86b9593a222?w=500&q=80&fit=crop',
    modelURL: MDL.curry, isAvailable: true,
  },
  {
    id: 'm3', name: 'Paneer Butter Masala', category: 'Main Course', price: 239, isVeg: true,
    description: 'Soft cottage cheese cubes in a smooth, aromatic tomato-cashew-cream gravy.',
    imageURL: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&q=80&fit=crop',
    modelURL: MDL.curry, isAvailable: true,
  },
  {
    id: 'm4', name: 'Chicken Kadai', category: 'Main Course', price: 269, isVeg: false,
    description: 'Bone-in chicken cooked with freshly ground spices, bell peppers and tomatoes in a kadai.',
    imageURL: 'https://images.unsplash.com/photo-1578020190125-f4f7c18bc9cb?w=500&q=80&fit=crop',
    modelURL: MDL.curry, isAvailable: true,
  },
  {
    id: 'm5', name: 'Mutton Roghan Josh', category: 'Main Course', price: 349, isVeg: false,
    description: 'Slow-braised tender mutton in a Kashmiri spice gravy with whole spices and chilli.',
    imageURL: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&q=80&fit=crop',
    modelURL: MDL.curry, isAvailable: true,
  },
  {
    id: 'm6', name: 'Palak Paneer', category: 'Main Course', price: 219, isVeg: true,
    description: 'Fresh cottage cheese in a smooth, spiced spinach gravy with garlic and cream.',
    imageURL: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80&fit=crop',
    modelURL: MDL.curry, isAvailable: true,
  },
  {
    id: 'm7', name: 'Mix Veg Curry', category: 'Main Course', price: 189, isVeg: true,
    description: 'Seasonal vegetables slow-cooked in an onion-tomato masala with house spice blend.',
    imageURL: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=500&q=80&fit=crop',
    modelURL: MDL.curry, isAvailable: true,
  },

  // ══ Biryani & Rice ═══════════════════════════════════════
  {
    id: 'r1', name: 'Chicken Dum Biryani', category: 'Biryani & Rice', price: 299, isVeg: false,
    description: 'Marinated chicken slow-cooked dum style with saffron basmati, fried onions and mint.',
    imageURL: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80&fit=crop',
    modelURL: MDL.biryani, isAvailable: true,
  },
  {
    id: 'r2', name: 'Veg Biryani', category: 'Biryani & Rice', price: 219, isVeg: true,
    description: 'Fragrant basmati rice layered with spiced seasonal vegetables, whole spices and rose water.',
    imageURL: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500&q=80&fit=crop',
    modelURL: MDL.biryani, isAvailable: true,
  },
  {
    id: 'r3', name: 'Mutton Biryani', category: 'Biryani & Rice', price: 369, isVeg: false,
    description: 'Dum-cooked mutton biryani with kewra water, saffron, caramelised onions — full meal.',
    imageURL: 'https://images.unsplash.com/photo-1571805529673-0f56b922b359?w=500&q=80&fit=crop',
    modelURL: MDL.biryani, isAvailable: true,
  },
  {
    id: 'r4', name: 'Egg Biryani', category: 'Biryani & Rice', price: 199, isVeg: false,
    description: 'Fluffy masala eggs layered with saffron rice, fried onions and fresh mint leaves.',
    imageURL: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500&q=80&fit=crop',
    modelURL: MDL.biryani, isAvailable: true,
  },
  {
    id: 'r5', name: 'Jeera Rice', category: 'Biryani & Rice', price: 99, isVeg: true,
    description: 'Long-grain basmati rice tempered with cumin seeds, ghee and a hint of green chilli.',
    imageURL: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=500&q=80&fit=crop',
    modelURL: MDL.rice, isAvailable: true,
  },

  // ══ Chinese Corner ════════════════════════════════════════
  {
    id: 'c1', name: 'Veg Hakka Noodles', category: 'Chinese Corner', price: 169, isVeg: true,
    description: 'Stir-fried noodles with crunchy vegetables in Indo-Chinese sauces — our best-seller.',
    imageURL: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=500&q=80&fit=crop',
    modelURL: MDL.noodle, isAvailable: true,
  },
  {
    id: 'c2', name: 'Chicken Schezwan Fried Rice', category: 'Chinese Corner', price: 219, isVeg: false,
    description: 'Wok-tossed rice with egg, chicken and fiery Schezwan sauce. Extra spicy on request.',
    imageURL: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&q=80&fit=crop',
    modelURL: MDL.rice, isAvailable: true,
  },
  {
    id: 'c3', name: 'Chilli Chicken (Dry)', category: 'Chinese Corner', price: 249, isVeg: false,
    description: 'Batter-fried chicken tossed with green chillies, capsicum and soy vinegar sauce.',
    imageURL: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500&q=80&fit=crop',
    modelURL: MDL.tandoori, isAvailable: true,
  },
  {
    id: 'c4', name: 'Veg Manchurian Gravy', category: 'Chinese Corner', price: 189, isVeg: true,
    description: 'Fried veggie balls simmered in a tangy, garlicky Manchurian sauce. Best with rice.',
    imageURL: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=500&q=80&fit=crop',
    modelURL: MDL.curry, isAvailable: true,
  },

  // ══ Breads ════════════════════════════════════════════════
  {
    id: 'br1', name: 'Butter Naan', category: 'Breads', price: 45, isVeg: true,
    description: 'Soft leavened bread baked in tandoor and slathered with salted butter.',
    imageURL: 'https://images.unsplash.com/photo-1565183997392-2f6f122e5912?w=500&q=80&fit=crop',
    modelURL: MDL.naan, isAvailable: true,
  },
  {
    id: 'br2', name: 'Garlic Naan', category: 'Breads', price: 55, isVeg: true,
    description: 'Naan topped with freshly minced garlic, coriander and a generous brush of butter.',
    imageURL: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80&fit=crop',
    modelURL: MDL.naan, isAvailable: true,
  },
  {
    id: 'br3', name: 'Tandoori Roti', category: 'Breads', price: 30, isVeg: true,
    description: 'Whole wheat flatbread baked fresh in a tandoor. Light, healthy and delicious.',
    imageURL: 'https://images.unsplash.com/photo-1574197867468-7ec4619f0b64?w=500&q=80&fit=crop',
    modelURL: MDL.naan, isAvailable: true,
  },
  {
    id: 'br4', name: 'Aloo Paratha', category: 'Breads', price: 79, isVeg: true,
    description: 'Thick whole wheat flatbread stuffed with spiced mashed potato, served with butter and curd.',
    imageURL: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=500&q=80&fit=crop',
    modelURL: MDL.naan, isAvailable: true,
  },

  // ══ Desserts ══════════════════════════════════════════════
  {
    id: 'de1', name: 'Gulab Jamun (2 pcs)', category: 'Desserts', price: 79, isVeg: true,
    description: 'Warm khoya dumplings soaked in rose-cardamom sugar syrup. Served with ice cream.',
    imageURL: 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=500&q=80&fit=crop',
    modelURL: MDL.gulab, isAvailable: true,
  },
  {
    id: 'de2', name: 'Brownie Blast', category: 'Desserts', price: 149, isVeg: true,
    description: 'Warm dark chocolate brownie with a scoop of vanilla ice cream and hot chocolate sauce.',
    imageURL: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80&fit=crop',
    modelURL: MDL.brownie, isAvailable: true,
  },
  {
    id: 'de3', name: 'Phirni', category: 'Desserts', price: 89, isVeg: true,
    description: 'Chilled ground rice pudding with saffron, cardamom and crushed pistachios. Served in matka.',
    imageURL: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500&q=80&fit=crop',
    modelURL: MDL.gulab, isAvailable: true,
  },
  {
    id: 'de4', name: 'Ice Cream (2 scoops)', category: 'Desserts', price: 99, isVeg: true,
    description: 'Choose from Vanilla, Chocolate or Strawberry. Topped with chocolate sauce and sprinkles.',
    imageURL: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&q=80&fit=crop',
    modelURL: MDL.icecream, isAvailable: true,
  },

  // ══ Drinks & Shakes ═══════════════════════════════════════
  {
    id: 'dr1', name: 'Mango Mastani Shake', category: 'Drinks & Shakes', price: 129, isVeg: true,
    description: 'Thick mango shake topped with a scoop of ice cream, dry fruits and fresh mango chunks.',
    imageURL: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&q=80&fit=crop',
    modelURL: MDL.milkshake, isAvailable: true,
  },
  {
    id: 'dr2', name: 'Oreo Chocolate Shake', category: 'Drinks & Shakes', price: 149, isVeg: true,
    description: 'Thick blended milkshake with Oreo cookies, dark chocolate and whipped cream on top.',
    imageURL: 'https://images.unsplash.com/photo-1572490122747-3e9bbd0f1939?w=500&q=80&fit=crop',
    modelURL: MDL.milkshake, isAvailable: true,
  },
  {
    id: 'dr3', name: 'Fresh Lime Soda', category: 'Drinks & Shakes', price: 59, isVeg: true,
    description: 'Freshly squeezed lime juice with chilled soda, black salt and mint. Sweet or salted.',
    imageURL: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=500&q=80&fit=crop',
    modelURL: MDL.milkshake, isAvailable: true,
  },
  {
    id: 'dr4', name: 'Masala Chai', category: 'Drinks & Shakes', price: 39, isVeg: true,
    description: 'Strong Indian tea brewed with ginger, cardamom and whole spices. Comfort in a cup.',
    imageURL: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=500&q=80&fit=crop',
    modelURL: MDL.chai, isAvailable: true,
  },

  // ══ EXPANDED MENU - ADDITIONAL 40+ DISHES ════════════════
  
  // Additional Burgers & Wraps
  {
    id: 'b7', name: 'Double Cheese Chicken Burger', category: 'Burgers & Wraps', price: 169, isVeg: false,
    description: 'Crispy fried chicken with cheddar, mozzarella, bacon strips and garlic mayo.',
    imageURL: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80&fit=crop',
    modelURL: MDL.burger, isAvailable: true,
  },
  {
    id: 'b8', name: 'Tandoori Paneer Wrap', category: 'Burgers & Wraps', price: 99, isVeg: true,
    description: 'Grilled tandoori paneer, crispy lettuce, tomato and fresh mint in a whole wheat wrap.',
    imageURL: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=500&q=80&fit=crop',
    modelURL: MDL.wrap, isAvailable: true,
  },
  {
    id: 'b9', name: 'Mushroom Swiss Burger', category: 'Burgers & Wraps', price: 139, isVeg: true,
    description: 'Sautéed mushrooms, Swiss cheese, caramelized onions and truffle mayo on crispy toast.',
    imageURL: 'https://images.unsplash.com/photo-1550547660-d9450f859470?w=500&q=80&fit=crop',
    modelURL: MDL.burger, isAvailable: true,
  },

  // Additional Starters
  {
    id: 's6', name: 'Fish Amritsari', category: 'Starters', price: 269, isVeg: false,
    description: 'Crispy batter-fried fish pieces served with sweet and spicy tamarind chutney.',
    imageURL: 'https://images.unsplash.com/photo-1580959375944-abd7e991f971?w=500&q=80&fit=crop',
    modelURL: MDL.tandoori, isAvailable: true,
  },
  {
    id: 's7', name: 'Hara Bhara Kebab', category: 'Starters', price: 149, isVeg: true,
    description: 'Green herb and spinach kebabs with paneer, shallow-fried and served with mint mayo.',
    imageURL: 'https://images.unsplash.com/photo-1585238341710-4b00f1b63a90?w=500&q=80&fit=crop',
    modelURL: MDL.tandoori, isAvailable: true,
  },
  {
    id: 's8', name: 'Corn & Cheese Balls', category: 'Starters', price: 129, isVeg: true,
    description: 'Golden crispy corn balls loaded with melted cheese and spices. Perfect with mayo.',
    imageURL: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&q=80&fit=crop',
    modelURL: MDL.tandoori, isAvailable: true,
  },
  {
    id: 's9', name: 'Tandoori Pomfret (Half)', category: 'Starters', price: 349, isVeg: false,
    description: 'Fresh pomfret fish marinated in tandoori spices and grilled to juicy perfection.',
    imageURL: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80&fit=crop',
    modelURL: MDL.tandoori, isAvailable: true,
  },

  // Additional Main Course
  {
    id: 'm8', name: 'Rogan Josh Prawns', category: 'Main Course', price: 399, isVeg: false,
    description: 'Tender prawns cooked in aromatic Kashmiri spice gravy with yogurt and cream.',
    imageURL: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80&fit=crop',
    modelURL: MDL.curry, isAvailable: true,
  },
  {
    id: 'm9', name: 'Chettinad Chicken', category: 'Main Course', price: 289, isVeg: false,
    description: 'Spicy South Indian chicken cooked with freshly roasted spices and coconut.',
    imageURL: 'https://images.unsplash.com/photo-1610192244261-8e5a65e00d47?w=500&q=80&fit=crop',
    modelURL: MDL.curry, isAvailable: true,
  },
  {
    id: 'm10', name: 'Shahi Tukda', category: 'Main Course', price: 259, isVeg: true,
    description: 'Soft bread soaked in saffron-infused cream, topped with dry fruits and rabri.',
    imageURL: 'https://images.unsplash.com/photo-1578020190125-f4f7c18bc9cb?w=500&q=80&fit=crop',
    modelURL: MDL.curry, isAvailable: true,
  },
  {
    id: 'm11', name: 'Biryani Chicken Gravy', category: 'Main Course', price: 249, isVeg: false,
    description: 'Tender biryani chicken served with rich saffron-tomato-cream gravy.',
    imageURL: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b8?w=500&q=80&fit=crop',
    modelURL: MDL.curry, isAvailable: true,
  },
  {
    id: 'm12', name: 'Awadhi Aloo Dum', category: 'Main Course', price: 189, isVeg: true,
    description: 'Royal potatoes slow-cooked in spiced yogurt and cream with whole spices.',
    imageURL: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80&fit=crop',
    modelURL: MDL.curry, isAvailable: true,
  },

  // Additional Biryani & Rice
  {
    id: 'r6', name: 'Hyderabadi Dum Biryani', category: 'Biryani & Rice', price: 349, isVeg: false,
    description: 'Authentic Hyderabadi style with marinated meat, saffron rice and kewra essence.',
    imageURL: 'https://images.unsplash.com/photo-1543654695-192e0efc7d99?w=500&q=80&fit=crop',
    modelURL: MDL.biryani, isAvailable: true,
  },
  {
    id: 'r7', name: 'Prawn Biryani', category: 'Biryani & Rice', price: 399, isVeg: false,
    description: 'Succulent prawns layered with fragrant basmati, saffron and fried onions.',
    imageURL: 'https://images.unsplash.com/photo-1585521537348-09cd348f5ee3?w=500&q=80&fit=crop',
    modelURL: MDL.biryani, isAvailable: true,
  },
  {
    id: 'r8', name: 'Paneer Dum Biryani', category: 'Biryani & Rice', price: 259, isVeg: true,
    description: 'Soft paneer cubes layered with basmati rice in dum-cooked style with spices.',
    imageURL: 'https://images.unsplash.com/photo-1585043666747-69f6646db940?w=500&q=80&fit=crop',
    modelURL: MDL.biryani, isAvailable: true,
  },
  {
    id: 'r9', name: 'Lucknowi Biryani', category: 'Biryani & Rice', price: 329, isVeg: false,
    description: 'Premium Lucknowi style biryani with meat, fried onions, mint and saffron.',
    imageURL: 'https://images.unsplash.com/photo-1579954614171-52a2010459e2?w=500&q=80&fit=crop',
    modelURL: MDL.biryani, isAvailable: true,
  },

  // Additional Chinese Corner
  {
    id: 'c5', name: 'Chicken Hakka Noodles', category: 'Chinese Corner', price: 199, isVeg: false,
    description: 'Stir-fried noodles with diced chicken and crispy vegetables in Indo-Chinese sauce.',
    imageURL: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80&fit=crop',
    modelURL: MDL.noodle, isAvailable: true,
  },
  {
    id: 'c6', name: 'Dragon Chicken Fried Rice', category: 'Chinese Corner', price: 229, isVeg: false,
    description: 'Wok-tossed rice with chicken, cashews and dragon sauce. Premium Indo-Chinese.',
    imageURL: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&q=80&fit=crop',
    modelURL: MDL.rice, isAvailable: true,
  },
  {
    id: 'c7', name: 'Paneer Chilli Garlic Noodles', category: 'Chinese Corner', price: 179, isVeg: true,
    description: 'Stir-fried noodles with soft paneer, chilli and loads of garlic in a wok.',
    imageURL: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80&fit=crop',
    modelURL: MDL.noodle, isAvailable: true,
  },
  {
    id: 'c8', name: 'Honey Soy Chicken Fried Rice', category: 'Chinese Corner', price: 219, isVeg: false,
    description: 'Rice tossed with chicken, honey and soy sauce. A sweet-savory Indo-Chinese fusion.',
    imageURL: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b8?w=500&q=80&fit=crop',
    modelURL: MDL.rice, isAvailable: true,
  },

  // Additional Breads
  {
    id: 'br5', name: 'Cheese Naan', category: 'Breads', price: 65, isVeg: true,
    description: 'Soft tandoori naan stuffed with melted mozzarella cheese and dry herbs.',
    imageURL: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80&fit=crop',
    modelURL: MDL.naan, isAvailable: true,
  },
  {
    id: 'br6', name: 'Pani Puri Bread', category: 'Breads', price: 50, isVeg: true,
    description: 'Crispy hollow puffed bread for paani puri. Sold per piece.',
    imageURL: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=500&q=80&fit=crop',
    modelURL: MDL.naan, isAvailable: true,
  },
  {
    id: 'br7', name: 'Amritsari Kulcha', category: 'Breads', price: 75, isVeg: true,
    description: 'Soft leavened bread stuffed with spicy potato, paneer and amchur powder.',
    imageURL: 'https://images.unsplash.com/photo-1574197867468-7ec4619f0b64?w=500&q=80&fit=crop',
    modelURL: MDL.naan, isAvailable: true,
  },
  {
    id: 'br8', name: 'Laccha Paratha', category: 'Breads', price: 59, isVeg: true,
    description: 'Flaky multi-layered paratha with ghee, served with curd and pickle.',
    imageURL: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=500&q=80&fit=crop',
    modelURL: MDL.naan, isAvailable: true,
  },

  // Additional Desserts
  {
    id: 'de5', name: 'Ras Malai', category: 'Desserts', price: 99, isVeg: true,
    description: 'Soft paneer dumplings in chilled sweetened milk with saffron and cardamom.',
    imageURL: 'https://images.unsplash.com/photo-1578191519226-d66742f1dcf1?w=500&q=80&fit=crop',
    modelURL: MDL.gulab, isAvailable: true,
  },
  {
    id: 'de6', name: 'Jalebi with Rabri', category: 'Desserts', price: 89, isVeg: true,
    description: 'Crispy orange spirals soaked in sugar syrup, served with thick creamy rabri.',
    imageURL: 'https://images.unsplash.com/photo-1585521537348-09cd348f5ee3?w=500&q=80&fit=crop',
    modelURL: MDL.gulab, isAvailable: true,
  },
  {
    id: 'de7', name: 'Kheer', category: 'Desserts', price: 79, isVeg: true,
    description: 'Traditional rice pudding cooked in milk with cardamom and topped with dry fruits.',
    imageURL: 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=500&q=80&fit=crop',
    modelURL: MDL.gulab, isAvailable: true,
  },
  {
    id: 'de8', name: 'Choco Lava Cake', category: 'Desserts', price: 159, isVeg: true,
    description: 'Warm chocolate cake with molten chocolate center, served with ice cream.',
    imageURL: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80&fit=crop',
    modelURL: MDL.brownie, isAvailable: true,
  },

  // Additional Drinks & Shakes
  {
    id: 'dr5', name: 'Strawberry Banana Shake', category: 'Drinks & Shakes', price: 119, isVeg: true,
    description: 'Blended strawberry and banana with milk, topped with whipped cream.',
    imageURL: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&q=80&fit=crop',
    modelURL: MDL.milkshake, isAvailable: true,
  },
  {
    id: 'dr6', name: 'Kulfi Shake', category: 'Drinks & Shakes', price: 129, isVeg: true,
    description: 'Traditional kulfi blended into a thick shake with cardamom and pistachios.',
    imageURL: 'https://images.unsplash.com/photo-1572490122747-3e9bbd0f1939?w=500&q=80&fit=crop',
    modelURL: MDL.milkshake, isAvailable: true,
  },
  {
    id: 'dr7', name: 'Virgin Mojito', category: 'Drinks & Shakes', price: 89, isVeg: true,
    description: 'Refreshing mint and lime mocktail with soda and a hint of sugar. Perfect for hot days.',
    imageURL: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=500&q=80&fit=crop',
    modelURL: MDL.milkshake, isAvailable: true,
  },
  {
    id: 'dr8', name: 'Cold Coffee Blast', category: 'Drinks & Shakes', price: 109, isVeg: true,
    description: 'Iced coffee blended with milk, whipped cream and chocolate syrup.',
    imageURL: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=500&q=80&fit=crop',
    modelURL: MDL.chai, isAvailable: true,
  },

  // New Category - Special Combos (Value Meals)
  {
    id: 'co1', name: 'Combo Meal 1', category: 'Special Combos', price: 349, isVeg: true,
    description: 'Paneer Tikka + Garlic Naan + Dal Makhani + Gulab Jamun + Chai.',
    imageURL: 'https://images.unsplash.com/photo-1567689002236-b8286a9d3ac0?w=500&q=80&fit=crop',
    modelURL: MDL.curry, isAvailable: true,
  },
  {
    id: 'co2', name: 'Combo Meal 2', category: 'Special Combos', price: 399, isVeg: false,
    description: 'Butter Chicken + Biryani + Raita + Dessert + Lassi.',
    imageURL: 'https://images.unsplash.com/photo-1567689002236-b8286a9d3ac0?w=500&q=80&fit=crop',
    modelURL: MDL.biryani, isAvailable: true,
  },
  {
    id: 'co3', name: 'Biggies Feast', category: 'Special Combos', price: 599, isVeg: false,
    description: 'Mixed tandoori platter for 2 with naan, rice, butter chicken and gulab jamun.',
    imageURL: 'https://images.unsplash.com/photo-1567689002236-b8286a9d3ac0?w=500&q=80&fit=crop',
    modelURL: MDL.tandoori, isAvailable: true,
  },

  // New Category - Healthy Options
  {
    id: 'h1', name: 'Grilled Chicken Salad', category: 'Healthy Options', price: 199, isVeg: false,
    description: 'Grilled tandoori chicken over mixed greens with lemon vinaigrette.',
    imageURL: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&q=80&fit=crop',
    modelURL: MDL.curry, isAvailable: true,
  },
  {
    id: 'h2', name: 'Quinoa Buddha Bowl', category: 'Healthy Options', price: 189, isVeg: true,
    description: 'Quinoa, roasted vegetables, paneer, sprouts and tahini dressing.',
    imageURL: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80&fit=crop',
    modelURL: MDL.noodle, isAvailable: true,
  },
  {
    id: 'h3', name: 'Steamed Momos', category: 'Healthy Options', price: 129, isVeg: true,
    description: 'Soft steamed dumplings filled with vegetables and cottage cheese. Served with dip.',
    imageURL: 'https://images.unsplash.com/photo-1558522291-3689b7d4ba47?w=500&q=80&fit=crop',
    modelURL: MDL.wrap, isAvailable: true,
  },
  {
    id: 'h4', name: 'Protein Paneer Bowl', category: 'Healthy Options', price: 219, isVeg: true,
    description: 'Marinated paneer, steamed broccoli, brown rice and sesame seeds with soy dressing.',
    imageURL: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80&fit=crop',
    modelURL: MDL.curry, isAvailable: true,
  },

  // New Category - Indian Street Food
  {
    id: 'sf1', name: 'Samosa (2 pcs)', category: 'Indian Street Food', price: 49, isVeg: true,
    description: 'Crispy triangular pastry filled with spiced potato. Served with chutneys.',
    imageURL: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&q=80&fit=crop',
    modelURL: MDL.wrap, isAvailable: true,
  },
  {
    id: 'sf2', name: 'Pani Puri', category: 'Indian Street Food', price: 69, isVeg: true,
    description: 'Crispy hollow puri filled with spiced potatoes, chickpeas and tangy water.',
    imageURL: 'https://images.unsplash.com/photo-1585238341710-4b00f1b63a90?w=500&q=80&fit=crop',
    modelURL: MDL.wrap, isAvailable: true,
  },
  {
    id: 'sf3', name: 'Chaat Papdi', category: 'Indian Street Food', price: 59, isVeg: true,
    description: 'Crispy papdi layered with yogurt, potatoes, chickpeas and tamarind chutney.',
    imageURL: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&q=80&fit=crop',
    modelURL: MDL.wrap, isAvailable: true,
  },
  {
    id: 'sf4', name: 'Aloo Tikki', category: 'Indian Street Food', price: 79, isVeg: true,
    description: 'Crispy potato patties served with mint chutney and tamarind sauce. 2 pieces.',
    imageURL: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=500&q=80&fit=crop',
    modelURL: MDL.noodle, isAvailable: true,
  },

  // Additional variety
  {
    id: 'x1', name: 'Masala Dosa', category: 'South Indian', price: 149, isVeg: true,
    description: 'Crispy rice crepe filled with spiced potatoes, served with sambar and chutney.',
    imageURL: 'https://images.unsplash.com/photo-1585238341710-4b00f1b63a90?w=500&q=80&fit=crop',
    modelURL: MDL.naan, isAvailable: true,
  },
  {
    id: 'x2', name: 'Paneer Idli', category: 'South Indian', price: 139, isVeg: true,
    description: 'Soft steamed cakes made with paneer and rice flour, served with sambar.',
    imageURL: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&q=80&fit=crop',
    modelURL: MDL.naan, isAvailable: true,
  },
];
