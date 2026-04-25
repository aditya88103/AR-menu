import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { fetchCategories, addDish, updateDish, fetchDishes, uploadFile } from '../../utils/firestore';
import toast from 'react-hot-toast';

const EMPTY_FORM = { name: '', price: '', description: '', category: '', isVeg: null }; // isVeg null = not yet selected

/* ── Image upload with camera capture support ── */
function ImageUploadField({ label, file, setFile, existingUrl, onUrlChange }) {
  const [preview, setPreview] = useState(existingUrl || null);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Update preview when existingUrl changes
  useEffect(() => {
    if (existingUrl && !preview) {
      setPreview(existingUrl);
    }
  }, [existingUrl]);

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      const url = urlInput.trim();
      setPreview(url);
      setShowUrlInput(false);
      if (onUrlChange) onUrlChange(url); // Pass URL to parent
      toast.success('Image URL added! ✅');
    }
  };

  const handleClear = () => {
    setPreview(null);
    setUrlInput('');
    if (onUrlChange) onUrlChange('');
  };

  return (
    <div>
      {label && (
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 8 }}>
          {label}
        </label>
      )}

      {/* Preview */}
      {preview && (
        <div style={{ position: 'relative', marginBottom: 10 }}>
          <img 
            src={preview} 
            alt="preview" 
            onError={(e) => {
              console.error('Image load error:', preview);
              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23fecdd3" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="48"%3E🍽️%3C/text%3E%3C/svg%3E';
            }}
            style={{
              width: '100%', maxHeight: 200, objectFit: 'cover',
              borderRadius: 12, border: '2px solid #fecdd3',
            }} 
          />
          <button
            type="button"
            onClick={handleClear}
            style={{
              position: 'absolute', top: 8, right: 8,
              background: 'rgba(0,0,0,0.6)', color: '#fff',
              border: 'none', borderRadius: '50%', width: 28, height: 28,
              cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
        </div>
      )}

      {/* URL Input */}
      {showUrlInput ? (
        <div style={{ marginBottom: 10 }}>
          <input
            type="url"
            placeholder="https://images.unsplash.com/photo-xxx?w=500"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="admin-input"
            style={{ marginBottom: 8 }}
            onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
            autoFocus
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={handleUrlSubmit}
              style={{
                flex: 1, padding: '10px', borderRadius: 10,
                background: '#16a34a', color: '#fff',
                border: 'none', cursor: 'pointer', fontWeight: 600,
              }}
            >✓ Add Image</button>
            <button
              type="button"
              onClick={() => setShowUrlInput(false)}
              style={{
                padding: '10px 16px', borderRadius: 10,
                background: '#ef4444', color: '#fff',
                border: 'none', cursor: 'pointer', fontWeight: 600,
              }}
            >Cancel</button>
          </div>
          <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 8 }}>
            💡 Tip: Use Unsplash.com for free food images
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowUrlInput(true)}
          style={{
            width: '100%', padding: '12px', borderRadius: 10,
            background: 'linear-gradient(135deg,#e11d48,#9f1239)',
            color: '#fff', border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.9rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          🔗 Add Image URL
        </button>
      )}
    </div>
  );
}

/* ── GLB model upload field with URL support ── */
function ModelUploadField({ file, setFile, existingUrl, onUrlChange }) {
  const [previewUrl, setPreviewUrl] = useState(existingUrl || null);
  const [showPreview, setShowPreview] = useState(Boolean(existingUrl));
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Update preview when existingUrl changes
  useEffect(() => {
    if (existingUrl && !previewUrl) {
      setPreviewUrl(existingUrl);
      setShowPreview(true);
    }
  }, [existingUrl]);

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      const url = urlInput.trim();
      setPreviewUrl(url);
      setShowPreview(true);
      setShowUrlInput(false);
      if (onUrlChange) onUrlChange(url);
      toast.success('AR Model URL added! ✅');
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreviewUrl(null);
    setShowPreview(false);
    setUrlInput('');
    if (onUrlChange) onUrlChange('');
  };

  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 8 }}>
        3D AR Model (.glb) — for "Try on Table"
      </label>

      {/* ── Live 3D Preview ── */}
      {showPreview && previewUrl && (
        <div style={{
          marginBottom: 14, borderRadius: 16, overflow: 'hidden',
          border: '2px solid #fecdd3',
          background: 'linear-gradient(135deg, #0d0d1a, #1a1a2e)',
          position: 'relative',
          boxShadow: '0 8px 32px rgba(225,29,72,0.15)',
        }}>
          {/* Preview header */}
          <div style={{
            background: 'linear-gradient(135deg, #be123c, #e11d48)',
            padding: '10px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>🪄</span>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.82rem' }}>3D Preview</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem' }}>Drag to rotate · This is what customers will see</div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              style={{
                width: 28, height: 28, borderRadius: '50%', fontSize: 13,
                background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >✕</button>
          </div>

          {/* model-viewer preview */}
          <model-viewer
            src={previewUrl}
            camera-controls
            auto-rotate
            auto-rotate-delay="500"
            rotation-per-second="20deg"
            shadow-intensity="1"
            exposure="1.1"
            style={{ width: '100%', height: 260, background: 'transparent' }}
            loading="eager"
          />

          {/* AR-ready indicator */}
          <div style={{
            position: 'absolute', top: 64, right: 12,
            background: 'rgba(34,197,94,0.15)',
            border: '1px solid rgba(34,197,94,0.4)',
            color: '#22c55e', fontSize: '0.65rem', fontWeight: 800,
            padding: '4px 10px', borderRadius: 99,
            display: 'flex', alignItems: 'center', gap: 5,
            backdropFilter: 'blur(8px)',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: '#22c55e',
              boxShadow: '0 0 8px #22c55e', display: 'inline-block',
            }} />
            AR READY
          </div>
        </div>
      )}

      {/* ── URL Input ── */}
      {!showPreview && (
        <>
          {showUrlInput ? (
            <div style={{ marginBottom: 10 }}>
              <input
                type="url"
                placeholder="https://example.com/model.glb"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="admin-input"
                style={{ marginBottom: 8 }}
                onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
                autoFocus
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={handleUrlSubmit}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 10,
                    background: '#16a34a', color: '#fff',
                    border: 'none', cursor: 'pointer', fontWeight: 600,
                  }}
                >✓ Add Model</button>
                <button
                  type="button"
                  onClick={() => setShowUrlInput(false)}
                  style={{
                    padding: '10px 16px', borderRadius: 10,
                    background: '#ef4444', color: '#fff',
                    border: 'none', cursor: 'pointer', fontWeight: 600,
                  }}
                >Cancel</button>
              </div>
              <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 8 }}>
                💡 Tip: Use .glb format for AR models
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowUrlInput(true)}
              style={{
                width: '100%', padding: '12px', borderRadius: 10,
                background: 'linear-gradient(135deg,#e11d48,#9f1239)',
                color: '#fff', border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.9rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              🔗 Add AR Model URL
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default function DishForm() {
  const { id }   = useParams();
  const isEdit   = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm]             = useState(EMPTY_FORM);
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile]   = useState(null);
  const [imageUrl, setImageUrl]     = useState('');
  const [modelFile, setModelFile]   = useState(null);
  const [modelUrl, setModelUrl]     = useState('');
  const [existingData, setExisting] = useState({});
  const [saving, setSaving]         = useState(false);

  useEffect(() => {
    fetchCategories().then(setCategories);
    if (isEdit) {
      fetchDishes().then(dishes => {
        const dish = dishes.find(d => d.id === id);
        if (dish) {
          // Handle both column name cases
          const isVeg = dish.isVeg !== undefined ? dish.isVeg : dish.isveg;
          const imageURL = dish.imageURL || dish.imageurl || '';
          const modelURL = dish.modelURL || dish.modelurl || '';
          
          setForm({ 
            name: dish.name, 
            price: dish.price, 
            description: dish.description, 
            category: dish.category, 
            isVeg: isVeg === true ? true : isVeg === false ? false : null 
          });
          setExisting({ 
            ...dish, 
            imageURL, 
            modelURL 
          });
          setImageUrl(imageURL); // Set initial image URL
          setModelUrl(modelURL); // Set initial model URL
          
          console.log('📝 Loaded dish for editing:', { name: dish.name, imageURL, modelURL });
        }
      });
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) {
      toast.error('Name, price and category are required');
      return;
    }
    if (form.isVeg === null || form.isVeg === undefined) {
      toast.error('Please select Veg or Non-Veg for this dish');
      return;
    }
    setSaving(true);
    try {
      let imageURL = imageUrl || existingData.imageURL || '';
      let modelURL = modelUrl || existingData.modelURL || '';

      console.log('💾 Saving dish...', { imageFile: !!imageFile, imageUrl, modelFile: !!modelFile, modelUrl });

      // Upload files if provided (optional)
      if (imageFile) {
        console.log('📤 Uploading image...');
        const uploaded = await uploadFile(imageFile, 'dishes/images');
        if (uploaded) {
          imageURL = uploaded;
          console.log('✅ Image uploaded:', imageURL);
        } else {
          console.warn('⚠️ Image upload failed, keeping existing URL');
        }
      }
      if (modelFile) {
        console.log('📤 Uploading model...');
        const uploaded = await uploadFile(modelFile, 'dishes/models');
        if (uploaded) {
          modelURL = uploaded;
          console.log('✅ Model uploaded:', modelURL);
        }
      }

      const data = { 
        ...form, 
        price: parseFloat(form.price), 
        imageURL, 
        modelURL 
      };

      console.log('💾 Final data to save:', data);

      if (isEdit) {
        await updateDish(id, data);
        toast.success('Dish updated! ✅');
      } else {
        const newDish = await addDish(data);
        console.log('✅ Dish added:', newDish);
        toast.success('Dish added! 🍽️');
      }
      navigate('/admin/dishes');
    } catch (err) {
      console.error('❌ Save error:', err);
      toast.error(err.message || 'Failed to save dish');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title={isEdit ? 'Edit Dish' : 'Add New Dish'}>
      <div style={{ maxWidth: 680 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Basic Info */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontWeight: 700, marginBottom: 20, fontSize: '0.95rem', color: '#374151', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: '#fff1f2', color: '#e11d48', borderRadius: 8, padding: '4px 8px', fontSize: '0.8rem' }}>1</span>
              Basic Info
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Dish Name *</label>
                <input className="admin-input" placeholder="e.g. Spicy Chicken Burger" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Price (₹) *</label>
                <input className="admin-input" type="number" step="1" min="0" placeholder="149" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Category *</label>
                <select className="admin-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                  <option value="">Select...</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Description</label>
                <textarea
                  className="admin-input" rows={3} placeholder="Describe the dish..."
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Veg / Non-Veg */}
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Food Type *</label>
                  {form.isVeg === null && (
                    <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>
                      ⚠️ Required — please select one
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  {[
                    { label: 'Veg',     val: true,  icon: '🟢', color: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
                    { label: 'Non-Veg', val: false, icon: '🔴', color: '#dc2626', bg: '#fff1f2', border: '#fca5a5' },
                  ].map(opt => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setForm({ ...form, isVeg: opt.val })}
                      style={{
                        flex: 1, padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                        border: `2px solid ${
                          form.isVeg === opt.val ? opt.border
                          : form.isVeg === null   ? '#f59e0b'
                          : '#e5e7eb'
                        }`,
                        background: form.isVeg === opt.val ? opt.bg : form.isVeg === null ? '#fffbeb' : '#f9fafb',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        fontWeight: 700, fontSize: '0.95rem',
                        color: form.isVeg === opt.val ? opt.color : '#6b7280',
                        transition: 'all 0.2s',
                        boxShadow: form.isVeg === opt.val ? `0 0 0 3px ${opt.border}55` : 'none',
                      }}
                    >
                      <span style={{ fontSize: 20 }}>{opt.icon}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Dish Photo — with camera capture */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontWeight: 700, marginBottom: 6, fontSize: '0.95rem', color: '#374151', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: '#fff1f2', color: '#e11d48', borderRadius: 8, padding: '4px 8px', fontSize: '0.8rem' }}>2</span>
              Dish Photo
            </h2>
            <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: 14 }}>
              🔗 Add image URL from Unsplash or any image hosting service
            </p>
            <ImageUploadField
              label=""
              file={imageFile}
              setFile={setImageFile}
              existingUrl={existingData.imageURL}
              onUrlChange={setImageUrl}
            />
          </div>

          {/* AR Model */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontWeight: 700, marginBottom: 6, fontSize: '0.95rem', color: '#374151', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: '#fff1f2', color: '#e11d48', borderRadius: 8, padding: '4px 8px', fontSize: '0.8rem' }}>3</span>
              AR Model
              <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 99 }}>Optional</span>
            </h2>
            <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: 14 }}>
              Upload a .GLB 3D model to enable "Try on Table" AR feature for this dish
            </p>
            <ModelUploadField
              file={modelFile}
              setFile={setModelFile}
              existingUrl={existingData.modelURL}
              onUrlChange={setModelUrl}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, paddingBottom: 40 }}>
            <button type="button" className="admin-btn admin-btn-secondary" onClick={() => navigate('/admin/dishes')}>
              ← Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 1, padding: '12px 24px',
                background: saving ? '#9ca3af' : 'linear-gradient(135deg,#e11d48,#9f1239)',
                color: '#fff', border: 'none', borderRadius: 12,
                fontWeight: 700, fontSize: '0.95rem', cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {saving
                ? <><div style={{ width: 16, height: 16, border: '2px solid transparent', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Saving…</>
                : isEdit ? '💾 Update Dish' : '🍽️ Add Dish'
              }
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
