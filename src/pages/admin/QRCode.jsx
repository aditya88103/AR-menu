import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';

export default function QRPage() {
  // Single restaurant — menu URL is always fixed
  const menuUrl = `${window.location.origin}/menu`;

  const handleDownload = () => {
    const canvas = document.getElementById('qr-canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'biggies-menu-qr.png';
    a.click();
    toast.success('QR Code downloaded!');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(menuUrl).then(() => toast.success('Link copied!'));
  };

  return (
    <AdminLayout title="QR Code">
      <div style={{ maxWidth: 500 }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: 36, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🍔</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '1.4rem', marginBottom: 6 }}>
            Biggies Menu QR Code
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: 28 }}>
            Place this on every table — customers scan to open the full AR menu
          </p>

          <div style={{ display: 'inline-block', padding: 20, background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(225,29,72,0.12)', marginBottom: 24, border: '2px solid #fecdd3' }}>
            <QRCodeCanvas
              id="qr-canvas"
              value={menuUrl}
              size={220}
              level="H"
              fgColor="#7f1d1d"
              bgColor="#ffffff"
              imageSettings={{
                src: '/favicon.svg',
                x: undefined, y: undefined,
                height: 44, width: 44,
                excavate: true,
              }}
            />
          </div>

          {/* URL */}
          <div style={{
            background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10,
            padding: '10px 16px', marginBottom: 20,
            display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
              {menuUrl}
            </span>
            <button onClick={handleCopy} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e11d48', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>
              Copy
            </button>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="admin-btn admin-btn-secondary" style={{ flex: 1 }} onClick={handleCopy}>
              🔗 Copy Link
            </button>
            <button
              className="admin-btn"
              style={{ flex: 1, background: 'linear-gradient(135deg,#e11d48,#b91c1c)', color: '#fff' }}
              onClick={handleDownload}
            >
              ⬇️ Download PNG
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 16, padding: 20, marginTop: 20 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 12, color: '#9f1239', fontSize: '0.9rem' }}>📋 How to use at Biggies</h3>
          <ol style={{ paddingLeft: 16, color: '#7f1d1d', fontSize: '0.85rem', lineHeight: 1.8 }}>
            <li>Download and print the QR code</li>
            <li>Place on each dining table (laminate for durability)</li>
            <li>Customers scan with their phone camera</li>
            <li>Menu opens with full AR "Try on Table" feature</li>
            <li>No app download needed — works directly in browser!</li>
          </ol>
        </div>
      </div>
    </AdminLayout>
  );
}
