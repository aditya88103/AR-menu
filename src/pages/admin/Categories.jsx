import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { fetchCategories, addCategory, updateCategory, deleteCategory, fetchDishes } from '../../utils/firestore';
import toast from 'react-hot-toast';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [newCat, setNewCat] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingNew, setSavingNew] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    const [cats, d] = await Promise.all([
      fetchCategories(),
      fetchDishes()
    ]);
    setCategories(cats);
    setDishes(d);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const getDishCount = (catName) => dishes.filter((d) => d.category === catName).length;

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    setSavingNew(true);
    try {
      await addCategory({ name: newCat.trim(), order: categories.length });
      toast.success('Category added');
      setNewCat('');
      load();
    } catch {
      toast.error('Error adding category');
    } finally {
      setSavingNew(false);
    }
  };

  const handleEditSave = async (id) => {
    if (!editName.trim()) return;
    try {
      await updateCategory(id, { name: editName.trim() });
      toast.success('Category updated');
      setEditId(null);
      load();
    } catch {
      toast.error('Error updating');
    }
  };

  const handleDelete = async (cat) => {
    const count = getDishCount(cat.name);
    if (count > 0) {
      toast.error(`${count} dishes use this category. Reassign them first.`);
      setConfirmDelete(null);
      return;
    }
    try {
      await deleteCategory(cat.id);
      toast.success('Category deleted');
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    } catch {
      toast.error('Error deleting');
    }
    setConfirmDelete(null);
  };

  const move = async (index, direction) => {
    const newCats = [...categories];
    const target = index + direction;
    if (target < 0 || target >= newCats.length) return;
    [newCats[index], newCats[target]] = [newCats[target], newCats[index]];
    setCategories(newCats);
    await Promise.all(
      newCats.map((c, i) => updateCategory(c.id, { order: i }))
    );
    toast.success('Order updated');
  };

  return (
    <AdminLayout title="Categories">
      {/* Add form */}
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 12, marginBottom: 24, maxWidth: 480 }}>
        <input
          className="admin-input"
          placeholder="New category name..."
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          required
        />
        <button type="submit" className="admin-btn admin-btn-primary" disabled={savingNew} style={{ whiteSpace: 'nowrap' }}>
          {savingNew ? '...' : '+ Add'}
        </button>
      </form>

      <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', maxWidth: 600 }}>
        {loading ? (
          <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3].map((i) => <div key={i} className="skeleton" style={{ height: 56, borderRadius: 10 }} />)}
          </div>
        ) : categories.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ fontSize: 40 }}>📂</div>
            <p style={{ marginTop: 12, fontWeight: 600 }}>No categories yet</p>
            <p style={{ fontSize: '0.85rem' }}>Add a category to get started</p>
          </div>
        ) : (
          categories.map((cat, i) => (
            <div
              key={cat.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                padding: '16px 20px', borderBottom: i < categories.length - 1 ? '1px solid #f3f4f6' : 'none',
                transition: 'background 0.15s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#fef9f0'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {/* Reorder */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <button onClick={() => move(i, -1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#d1d5db', padding: '0 4px' }}>▲</button>
                <button onClick={() => move(i, 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#d1d5db', padding: '0 4px' }}>▼</button>
              </div>

              <span style={{ fontSize: 24, flexShrink: 0 }}>📁</span>

              {editId === cat.id ? (
                <div style={{ flex: 1, minWidth: 160, display: 'flex', gap: 8 }}>
                  <input
                    className="admin-input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleEditSave(cat.id); if (e.key === 'Escape') setEditId(null); }}
                    autoFocus
                    style={{ flex: 1 }}
                  />
                </div>
              ) : (
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ fontWeight: 700, color: '#1c1917', fontSize: '1.05rem', marginBottom: 2 }}>{cat.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#9ca3af', fontWeight: 600 }}>
                    {getDishCount(cat.name)} dish{getDishCount(cat.name) !== 1 ? 'es' : ''}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                {editId === cat.id ? (
                  <>
                    <button className="admin-btn admin-btn-primary" style={{ padding: '8px 14px', fontSize: '0.8rem' }} onClick={() => handleEditSave(cat.id)}>Save</button>
                    <button className="admin-btn admin-btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }} onClick={() => setEditId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button className="admin-btn admin-btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem', background: '#f8fafc' }} onClick={() => { setEditId(cat.id); setEditName(cat.name); }}>✏️ Edit</button>
                    <button className="admin-btn admin-btn-danger" style={{ padding: '8px 14px', fontSize: '0.85rem' }} onClick={() => setConfirmDelete(cat)}>🗑️</button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 32, maxWidth: 360, width: '90%', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Delete "{confirmDelete.name}"?</h3>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: 24 }}>
              Dishes assigned to this category will become uncategorized.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="admin-btn admin-btn-secondary" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="admin-btn admin-btn-danger" onClick={() => handleDelete(confirmDelete)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
