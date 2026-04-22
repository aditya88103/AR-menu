import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ADMIN_USER, ADMIN_PASS } from '../../config/restaurant';
import { login } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      if (username === ADMIN_USER && password === ADMIN_PASS) {
        login();
        toast.success('Welcome back, Boss! 👋');
        navigate('/admin');
      } else {
        toast.error('Wrong username or password');
      }
      setLoading(false);
    }, 500); // small delay for feel
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 35%, #e11d48 70%, #f59e0b 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, position: 'relative', overflow: 'hidden',
    }}>
      {/* Blobs */}
      <div style={{ position:'fixed', top:-120, right:-80, width:400, height:400, borderRadius:'50%', background:'rgba(255,255,255,0.06)', pointerEvents:'none' }} />
      <div style={{ position:'fixed', bottom:-100, left:-60, width:320, height:320, borderRadius:'50%', background:'rgba(245,158,11,0.12)', pointerEvents:'none' }} />

      <div style={{
        background: '#fff', borderRadius: 24,
        padding: '44px 40px', maxWidth: 400, width: '100%',
        boxShadow: '0 30px 80px rgba(0,0,0,0.3)',
        animation: 'fadeInUp 0.4s ease',
      }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom: 32 }}>
          <div style={{
            width: 70, height: 70, borderRadius: 20, margin: '0 auto 16px',
            background: 'linear-gradient(135deg,#e11d48,#b91c1c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36,
            boxShadow: '0 8px 24px rgba(225,29,72,0.35)',
          }}>🍔</div>
          <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:'1.8rem', fontWeight:700, color:'#1c1917', marginBottom:4 }}>
            Biggies Admin
          </h1>
          <p style={{ color:'#9ca3af', fontSize:'0.85rem' }}>Restaurant management panel</p>
        </div>

        <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* Username */}
          <div>
            <label style={{ display:'block', fontSize:'0.85rem', fontWeight:600, color:'#374151', marginBottom:6 }}>
              Username
            </label>
            <input
              className="admin-input"
              type="text"
              placeholder="admin"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required autoFocus autoComplete="username"
            />
          </div>

          {/* Password */}
          <div>
            <label style={{ display:'block', fontSize:'0.85rem', fontWeight:600, color:'#374151', marginBottom:6 }}>
              Password
            </label>
            <div style={{ position:'relative' }}>
              <input
                className="admin-input"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required autoComplete="current-password"
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', cursor:'pointer', fontSize:18, color:'#9ca3af',
                }}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width:'100%', padding:'13px',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg,#e11d48,#b91c1c)',
              color:'#fff', border:'none', borderRadius:12,
              fontWeight:700, fontSize:'1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              marginTop:4,
              boxShadow: loading ? 'none' : '0 4px 16px rgba(225,29,72,0.4)',
              transition:'all 0.2s',
            }}
          >
            {loading
              ? <><div style={{ width:18, height:18, border:'2px solid transparent', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} /> Signing in…</>
              : '🔐 Sign In'
            }
          </button>
        </form>

        {/* Hint */}
        <div style={{
          marginTop:20, background:'#fff8f0', border:'1px solid #fde68a',
          borderRadius:10, padding:'10px 14px', fontSize:'0.75rem', color:'#92400e',
        }}>
          💡 Default: <strong>admin</strong> / <strong>biggies2024</strong>
          <br/>Change these in <code style={{ background:'#fef3c7', padding:'1px 4px', borderRadius:4 }}>.env</code> file anytime
        </div>

        <div style={{ textAlign:'center', marginTop:16 }}>
          <a href="/menu" style={{ color:'#e11d48', fontSize:'0.8rem', fontWeight:600, textDecoration:'none' }}>
            👁️ View Customer Menu →
          </a>
        </div>
      </div>
    </div>
  );
}
