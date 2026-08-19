import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';

export default function QRPage() {
  const [selectedTable, setSelectedTable] = useState('1');
  const [customTable, setCustomTable] = useState('');

  const activeTable = customTable.trim() !== '' ? customTable.trim() : selectedTable;
  
  // Format URL pointing directly to the customer menu with table parameter
  // Works for both HashRouter (#/menu?table=X) and regular paths
  const baseOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const menuUrl = `${baseOrigin}/#/menu?table=${encodeURIComponent(activeTable)}`;

  const handleDownload = () => {
    const canvas = document.getElementById('qr-canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `biggies-table-${activeTable}-qr.png`;
    a.click();
    toast.success(`QR Code for Table ${activeTable} downloaded!`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(menuUrl).then(() => toast.success(`Link for Table ${activeTable} copied!`));
  };

  return (
    <AdminLayout title="Table QR Codes">
      <div style={{ maxWidth: 800, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1c1917', margin: 0 }}>
            Generate & Download Table QR Codes
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: 4 }}>
            Place table-specific QR codes on dining tables. When customers scan, their Table Number is automatically detected.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {/* QR Code Preview Card */}
          <div
            style={{
              background: '#fff',
              borderRadius: 20,
              padding: 32,
              boxShadow: '0 2px 14px rgba(0,0,0,0.06)',
              textAlign: 'center',
              border: '1px solid #e5e7eb',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 6 }}>🍔</div>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 800, fontSize: '1.35rem', marginBottom: 2 }}>
              Biggies Restaurant
            </h3>
            <div
              style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #e11d48, #be123c)',
                color: '#fff',
                fontWeight: 900,
                fontSize: '0.85rem',
                padding: '4px 16px',
                borderRadius: 99,
                marginBottom: 20,
                boxShadow: '0 4px 12px rgba(225,29,72,0.3)',
              }}
            >
              TABLE #{activeTable}
            </div>

            <div
              style={{
                display: 'inline-block',
                padding: 16,
                background: '#fff',
                borderRadius: 18,
                boxShadow: '0 8px 30px rgba(225,29,72,0.15)',
                marginBottom: 20,
                border: '2.5px solid #fecdd3',
              }}
            >
              <QRCodeCanvas
                id="qr-canvas"
                value={menuUrl}
                size={210}
                level="H"
                fgColor="#7f1d1d"
                bgColor="#ffffff"
                imageSettings={{
                  src: '/favicon.svg',
                  x: undefined,
                  y: undefined,
                  height: 42,
                  width: 42,
                  excavate: true,
                }}
              />
            </div>

            {/* URL Display */}
            <div
              style={{
                background: '#fff1f2',
                border: '1px solid #fecdd3',
                borderRadius: 10,
                padding: '8px 14px',
                marginBottom: 18,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                justifyContent: 'space-between',
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                  textAlign: 'left',
                }}
              >
                {menuUrl}
              </span>
              <button
                onClick={handleCopy}
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#e11d48',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                Copy
              </button>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="admin-btn admin-btn-secondary"
                style={{ flex: 1 }}
                onClick={handleCopy}
                type="button"
              >
                🔗 Copy Link
              </button>
              <button
                className="admin-btn"
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg,#e11d48,#b91c1c)',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(225,29,72,0.3)',
                }}
                onClick={handleDownload}
                type="button"
              >
                ⬇️ Download PNG
              </button>
            </div>
          </div>

          {/* Table Selector & Instructions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Table Selection Controls */}
            <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#1c1917', marginBottom: 12 }}>
                Select Table for QR Code
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 16 }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setSelectedTable(String(num));
                      setCustomTable('');
                    }}
                    style={{
                      padding: '10px 4px',
                      borderRadius: 10,
                      border: activeTable === String(num) ? '2px solid #e11d48' : '1px solid #e5e7eb',
                      background: activeTable === String(num) ? '#fff1f2' : '#f9fafb',
                      color: activeTable === String(num) ? '#be123c' : '#374151',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    T-{num}
                  </button>
                ))}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: 4 }}>
                  Or Enter Custom Table Name/Number:
                </label>
                <input
                  type="text"
                  placeholder="e.g. VIP-1, Terrace-2, Bar-3..."
                  value={customTable}
                  onChange={(e) => setCustomTable(e.target.value)}
                  className="admin-input"
                  style={{ fontSize: '0.9rem' }}
                />
              </div>
            </div>

            {/* Printing Guide */}
            <div style={{ background: '#fff1f2', border: '1.5px solid #fecdd3', borderRadius: 20, padding: 22 }}>
              <h4 style={{ fontWeight: 800, marginBottom: 10, color: '#9f1239', fontSize: '0.95rem' }}>
                📋 How Table QR Works
              </h4>
              <ol style={{ paddingLeft: 18, color: '#7f1d1d', fontSize: '0.85rem', lineHeight: 1.8 }}>
                <li>Select a table number (e.g. <strong>Table 4</strong>) and click <strong>Download PNG</strong>.</li>
                <li>Print and place the standee or sticker on that dining table.</li>
                <li>When customer scans the QR, their browser opens with <strong>Table #4</strong> locked in.</li>
                <li>Customer adds food, places order, and the kitchen instantly sees <strong>Table #4</strong> on the order!</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
