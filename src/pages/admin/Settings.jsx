import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { uploadFile } from '../../utils/firestore';
import toast from 'react-hot-toast';

const LS_KEY = 'biggies_settings';

function getSettings() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) ?? {}; }
  catch { return {}; }
}
function saveSettings(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getSettings();
    setName(s.name || 'Biggies Restaurant');
    setLogoPreview(s.logoURL || '');
    setLoading(false);
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let logoURL = logoPreview;
      if (logoFile) {
        logoURL = await uploadFile(logoFile);
      }
      saveSettings({ name, logoURL });
      setLogoPreview(logoURL);
      toast.success('Settings saved! ✅');
    } catch {
      toast.error('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminLayout title="Settings"><div style={{ padding: 40 }}>Loading…</div></AdminLayout>;

  return (
    <AdminLayout title="Settings">
      <div style={{ maxWidth: 500 }}>
        <form onSubmit={handleSave}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 20 }}>
            <h2 style={{ fontWeight: 700, marginBottom: 20 }}>Restaurant Settings</h2>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Restaurant Name</label>
              <input className="admin-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Biggies Restaurant" />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Logo</label>
              {logoPreview && <img src={logoPreview} alt="logo" style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 12, border: '1px solid #e5e7eb', marginBottom: 10 }} />}
              <input type="file" accept="image/*" className="admin-input" style={{ padding: '8px' }}
                onChange={(e) => {
                  const f = e.target.files[0];
                  if (f) { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); }
                }}
              />
            </div>
          </div>

          <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
            {saving ? 'Saving…' : '💾 Save Settings'}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
