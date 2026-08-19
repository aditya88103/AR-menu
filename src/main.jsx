import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Debug logging for deployment
console.log('🚀 Initializing React app...');
console.log('ENV:', {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? '✓' : '✗',
  SUPABASE_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓' : '✗',
});

// Simple error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#fff8f0',
          fontFamily: 'Inter, sans-serif',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🍽️</div>
          <h1 style={{ fontSize: '1.6rem', color: '#e11d48', fontWeight: 800, marginBottom: '8px' }}>TableAR Menu</h1>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '20px', maxWidth: 360 }}>
            An unexpected error occurred while rendering the page.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                background: '#e11d48',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '0.9rem',
                boxShadow: '0 4px 12px rgba(225,29,72,0.3)',
              }}
            >
              🔄 Reload Menu
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }}
              style={{
                padding: '12px 24px',
                background: '#4b5563',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '0.9rem',
              }}
            >
              🧹 Clear Cache & Reload
            </button>
          </div>
          <details style={{ maxWidth: '440px', textAlign: 'left', background: '#fff', padding: 12, borderRadius: 8, border: '1px solid #fed7aa', fontSize: '0.75rem', color: '#9a3412', overflowX: 'auto' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 700, marginBottom: '6px' }}>Error Details (for developers)</summary>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{this.state.error?.toString()}</div>
            <pre style={{ margin: 0, fontSize: '0.7rem', color: '#666', whiteSpace: 'pre-wrap' }}>{this.state.error?.stack}</pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

// Register Service Worker safely
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    const rawBase = import.meta.env.BASE_URL || './';
    const swUrl = `${rawBase.endsWith('/') ? rawBase : rawBase + '/'}sw.js`;
    navigator.serviceWorker.register(swUrl).catch(err => {
      console.warn('Service Worker note:', err);
    });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Root element not found!');
  document.body.innerHTML = '<h1 style="text-align: center; margin-top: 50px; color: #e11d48;">Failed to load app - root element missing</h1>';
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
  console.log('✓ App rendered successfully');
}
