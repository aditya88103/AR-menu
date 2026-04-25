import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { fetchDishes, fetchCategories, deleteDish, toggleDishAvailability, deleteFile, onDishesChange } from '../../utils/firestore';
import toast from 'react-hot-toast';

export default function DishesPage() {
  const [dishes, setDishes]         = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [toggling, setToggling]     = useState(null);
  const [collapsed, setCollapsed]   = useState({});

  const load = async () => {
    setLoading(true);
    const c = await fetchCategories();
    setCategories(c);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // Set up real-time listener for dishes
    const unsubscribe = onDishesChange((dishesList) => {
      setDishes(dishesList);
    });
    return () => unsubscribe();
  }, []);

  const handleToggle = async (dish) => {
    setToggling(dish.id);
    try {
      // Handle both column name cases
      const currentAvailability = dish.isAvailable !== undefined ? dish.isAvailable : dish.isavailable;
      const newAvailability = !currentAvailability;
      
      console.log('🔄 Toggling dish:', dish.name, 'from', currentAvailability, 'to', newAvailability);
      
      await toggleDishAvailability(dish.id, newAvailability);
      
      toast.success(newAvailability ? `"${dish.name}" now visible on menu` : `"${dish.name}" hidden from menu`);
    } catch (err) {
      console.error('Toggle error:', err);
      toast.error('Failed to update availability');
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (dish) => {
    if (!window.confirm(`Delete "${dish.name}"? This cannot be undone.`)) return;
    try {
      await deleteDish(dish.id);
      if (dish.imageURL) await deleteFile(dish.imageURL).catch(() => {});
      if (dish.modelURL) await deleteFile(dish.modelURL).catch(() => {});
      setDishes(prev => prev.filter(d => d.id !== dish.id));
      toast.success('Dish deleted');
    } catch {
      toast.error('Failed to delete dish');
    }
  };

  const toggleCollapse = (catName) =>
    setCollapsed(prev => ({ ...prev, [catName]: !prev[catName] }));

  // Filter by search
  const q = search.toLowerCase();
  const filtered = dishes.filter(d =>
    d.name?.toLowerCase().includes(q) ||
    d.description?.toLowerCase().includes(q) ||
    d.category?.toLowerCase().includes(q)
  );

  // Group by category (preserve category order)
  const catNames = categories.map(c => c.name);
  const grouped = catNames.map(cat => ({
    name: cat,
    dishes: filtered.filter(d => d.category === cat),
  })).filter(g => g.dishes.length > 0);

  // Dishes with unknown/uncategorized
  const knownCats = new Set(catNames);
  const uncategorized = filtered.filter(d => !knownCats.has(d.category));
  if (uncategorized.length) grouped.push({ name: 'Uncategorized', dishes: uncategorized });

  // Calculate stats (handle both column name cases)
  const totalDishes = dishes.length;
  const onMenuCount = dishes.filter(d => {
    const isAvail = d.isAvailable !== undefined ? d.isAvailable : d.isavailable;
    return isAvail !== false;
  }).length;
  const hiddenCount = dishes.filter(d => {
    const isAvail = d.isAvailable !== undefined ? d.isAvailable : d.isavailable;
    return isAvail === false;
  }).length;

  return (
    <AdminLayout title="Dishes">

      {/* ── Top bar ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 20 }}>
        <input
          className="admin-input"
          placeholder="🔍 Search dishes..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 180, maxWidth: 300 }}
        />
        <Link to="/admin/dishes/new" style={{ marginLeft: 'auto' }}>
          <button style={{
            background: 'linear-gradient(135deg,#e11d48,#9f1239)',
            color: '#fff', border: 'none', borderRadius: 10,
            padding: '10px 22px', fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem',
            boxShadow: '0 4px 14px rgba(225,29,72,0.35)',
          }}>
            + Add Dish
          </button>
        </Link>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Dishes',    val: totalDishes,     icon: '🍽️', bg: '#fff',     color: '#1c1917' },
          { label: 'On Menu',         val: onMenuCount,     icon: '✅', bg: '#f0fdf4', color: '#16a34a' },
          { label: 'Hidden',          val: hiddenCount,     icon: '🚫', bg: '#fff1f2', color: '#e11d48' },
          { label: 'Categories',      val: categories.length, icon: '📂', bg: '#eff6ff', color: '#3b82f6' },
        ].map(s => (
          <div key={s.label} style={{
            background: s.bg, borderRadius: 12, padding: '12px 20px',
            border: `1px solid ${s.color}22`,
            display: 'flex', alignItems: 'center', gap: 12, minWidth: 140,
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>
            <span style={{ fontSize: 24 }}>{s.icon}</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.4rem', color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#9ca3af' }}>Loading…</div>
      ) : grouped.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🍽️</div>
          <p style={{ color: '#9ca3af' }}>
            No dishes found.{' '}
            <Link to="/admin/dishes/new" style={{ color: '#e11d48', fontWeight: 600 }}>Add your first dish →</Link>
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {grouped.map(({ name: cat, dishes: catDishes }) => {
            const isOpen = !collapsed[cat];
            // Handle both column name cases
            const available = catDishes.filter(d => {
              const isAvail = d.isAvailable !== undefined ? d.isAvailable : d.isavailable;
              return isAvail !== false;
            }).length;
            const hidden = catDishes.filter(d => {
              const isAvail = d.isAvailable !== undefined ? d.isAvailable : d.isavailable;
              return isAvail === false;
            }).length;

            return (
              <div key={cat} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

                <div
                  onClick={() => toggleCollapse(cat)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
                    padding: '14px 20px', cursor: 'pointer',
                    background: isOpen ? 'linear-gradient(135deg,#fff1f2,#fff8f0)' : '#fff',
                    borderBottom: isOpen ? '2px solid #fecdd3' : 'none',
                    transition: 'background 0.2s',
                    userSelect: 'none',
                  }}
                >
                  <span style={{ fontSize: 22 }}>📂</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: '#7f1d1d' }}>{cat}</span>
                    <span style={{ marginLeft: 10, fontSize: '0.78rem', color: '#9ca3af' }}>
                      {catDishes.length} dish{catDishes.length !== 1 ? 'es' : ''}
                    </span>
                  </div>
                  {/* Mini status pills */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    {available > 0 && (
                      <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: '0.7rem', fontWeight: 700, padding: '2px 10px', borderRadius: 99 }}>
                        ✅ {available} on menu
                      </span>
                    )}
                    {hidden > 0 && (
                      <span style={{ background: '#fff1f2', color: '#e11d48', fontSize: '0.7rem', fontWeight: 700, padding: '2px 10px', borderRadius: 99 }}>
                        🚫 {hidden} hidden
                      </span>
                    )}
                  </div>
                  <span style={{ color: '#9ca3af', fontSize: 14, marginLeft: 4, transition: 'transform 0.2s', display: 'inline-block', transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}>▼</span>
                </div>

                {/* Dishes grid */}
                {isOpen && (
                  <div style={{ padding: '16px 14px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 12 }}>
                      {catDishes.map(dish => (
                        <DishCard key={dish.id} dish={dish} onToggle={handleToggle} onDelete={handleDelete} toggling={toggling} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}

function DishCard({ dish, onToggle, onDelete, toggling }) {
  // Handle both column name cases
  const isAvail = dish.isAvailable !== undefined ? dish.isAvailable : dish.isavailable;
  const isToggling = toggling === dish.id;
  
  // Handle both column name cases for image
  const imageURL = dish.imageURL || dish.imageurl || '';
  const modelURL = dish.modelURL || dish.modelurl || '';

  return (
    <div style={{
      borderRadius: 16,
      border: `2px solid ${isAvail !== false ? '#dcfce7' : '#fecdd3'}`,
      overflow: 'hidden', background: isAvail !== false ? '#fff' : '#fffbfb',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      opacity: isAvail !== false ? 1 : 0.85,
      display: 'flex', flexDirection: 'row',
      padding: 10, gap: 12, alignItems: 'stretch'
    }}>
      {/* Left side: Image */}
      <div style={{ width: 90, borderRadius: 10, overflow: 'hidden', position: 'relative', background: '#f9fafb', flexShrink: 0 }}>
        {imageURL
          ? <img src={imageURL} alt={dish.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 28, background: '#fecdd3' }}>🍽️</div>
        }
        <div style={{
          position: 'absolute', top: 4, left: 4, right: 4, textAlign: 'center',
          background: isAvail !== false ? 'rgba(22,163,74,0.9)' : 'rgba(225,29,72,0.9)', backdropFilter: 'blur(4px)',
          color: '#fff', fontSize: '0.55rem', fontWeight: 800,
          padding: '3px 0', borderRadius: 6,
        }}>
          {isAvail !== false ? '✅ ON' : '🚫 OFF'}
        </div>
      </div>

      {/* Right side: Info and Controls */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1c1917', lineHeight: 1.2, margin: 0, paddingRight: 6 }}>
            {dish.name}
          </h3>
          <span style={{ fontWeight: 800, color: '#e11d48', fontSize: '0.85rem', flexShrink: 0 }}>₹{dish.price}</span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 'auto' }}>
          
          <button
            onClick={() => onToggle(dish)}
            disabled={isToggling}
            style={{
              width: '100%', padding: '6px',
              background: isAvail !== false ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'linear-gradient(135deg,#16a34a,#15803d)',
              color: '#fff', border: 'none', borderRadius: 8,
              fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              opacity: isToggling ? 0.7 : 1, transition: 'all 0.2s',
            }}
          >
            {isToggling ? '⟳ Updating' : isAvail !== false ? '🚫 Hide' : '✅ Show'}
          </button>

          <div style={{ display: 'flex', gap: 6 }}>
            <Link to={`/admin/dishes/edit/${dish.id}`} style={{ flex: 1 }}>
              <button style={{
                width: '100%', padding: '6px',
                background: '#f3f4f6', border: '1px solid #e5e7eb',
                borderRadius: 8, fontWeight: 700, fontSize: '0.7rem',
                cursor: 'pointer', color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4
              }}>✏️ Edit</button>
            </Link>
            <button
              onClick={() => onDelete(dish)}
              style={{
                flex: 1, padding: '6px',
                background: '#fff1f2', border: '1px solid #fecdd3',
                borderRadius: 8, fontWeight: 700, fontSize: '0.7rem',
                cursor: 'pointer', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4
              }}
            >🗑️ Delete</button>
          </div>

        </div>
      </div>
    </div>
  );
}
