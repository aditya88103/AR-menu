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
          <h1 style={{ fontSize: '2rem', color: '#e11d48', marginBottom: '10px' }}>⚠️ Oops!</h1>
          <p style={{ color: '#666', marginBottom: '20px' }}>Something went wrong</p>
          <details style={{ maxWidth: '400px', textAlign: 'left', whiteSpace: 'pre-wrap', fontSize: '0.85rem', color: '#999' }}>
            <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>Error Details</summary>
            {this.state.error?.message}
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#e11d48',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.warn('Service Worker registration failed:', err);
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
