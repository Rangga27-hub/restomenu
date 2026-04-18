import { useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

const NAVY = '#1e3a5f';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    if (isRegister) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setSuccess('Registrasi berhasil! Cek email untuk verifikasi.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError('Email atau password salah.');
      else navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '2.5rem', width: '100%', maxWidth: '400px', border: '1px solid #e2e8f0' }}>
        
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🍽️</div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: NAVY }}>RestoMenu</h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
            {isRegister ? 'Daftarkan restoran kamu' : 'Masuk ke dashboard owner'}
          </p>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, color: '#475569', display: 'block', marginBottom: '6px' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="owner@restoran.com"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#1e293b' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, color: '#475569', display: 'block', marginBottom: '6px' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#1e293b' }}
            />
          </div>

          {error && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 12px', borderRadius: '8px', fontSize: '13px' }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ background: '#dcfce7', color: '#16a34a', padding: '10px 12px', borderRadius: '8px', fontSize: '13px' }}>
              {success}
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading}
            style={{ width: '100%', padding: '12px', background: NAVY, color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', marginTop: '4px', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Loading...' : isRegister ? 'Daftar' : 'Masuk'}
          </button>
        </div>

        {/* Toggle Register/Login */}
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '13px', color: '#64748b' }}>
          {isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'}
          <button onClick={() => { setIsRegister(!isRegister); setError(''); setSuccess(''); }}
            style={{ background: 'none', border: 'none', color: NAVY, fontWeight: 600, cursor: 'pointer', marginLeft: '4px', fontSize: '13px' }}>
            {isRegister ? 'Masuk' : 'Daftar'}
          </button>
        </p>
      </div>
    </div>
  );
}