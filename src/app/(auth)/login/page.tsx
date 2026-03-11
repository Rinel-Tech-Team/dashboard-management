'use client';

import { Zap, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useState, FormEvent } from 'react';
import { login } from '@/actions/auth';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);

      const res = await login(formData);
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        // Set localStorage before redirect so the MainLayout auth check passes instantly
        try {
          window.localStorage.setItem('rinel-auth', JSON.stringify({ isLoggedIn: true, email }));
        } catch (e) {
          console.warn('localStorage access denied');
        }
      }
      // If successful, it redirects internally
    } catch (err: any) {
      if (err.message === 'NEXT_REDIRECT') {
        // Set localStorage for successful redirect case too
        try {
          window.localStorage.setItem('rinel-auth', JSON.stringify({ isLoggedIn: true, email }));
        } catch (e) {
          console.warn('localStorage access denied');
        }
        throw err;
      } else {
        setError('Terjadi kesalahan saat login.');
        setLoading(false);
      }
    }
  };

  return (
    <div className={styles.card}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.logoWrap} style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className={styles.logo} style={{ width: '80px', height: '80px', margin: '0 auto 1rem', position: 'relative' }}>
             <img 
               src="/logo.png" 
               alt="Rinel Tech Nusantara" 
               style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
             />
          </div>
          <h1 className={styles.title} style={{ fontSize: '1.5rem' }}>Rinel Tech Nusantara</h1>
          <p className={styles.subtitle}>Management System</p>
        </div>
        {error && (
          <div className={styles.error}>
            <AlertCircle size={14} />
            {error}
          </div>
        )}
        <div className={styles.field}>
          <label className="label">Email</label>
          <input
            type="email"
            className="input"
            placeholder="admin@rinel.id"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label className="label">Password</label>
          <div className={styles.passwordWrap}>
            <input
              type={showPassword ? 'text' : 'password'}
              className={`input ${styles.passwordInput}`}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className={styles.toggleBtn}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <button
          type="submit"
          className={`btn btn-primary ${styles.submitBtn}`}
          disabled={loading}
        >
          {loading ? 'Memproses...' : 'Masuk'}
        </button>
      </form>

      {/* <div className={styles.hint}>
        <span>Demo:</span> admin@rinel.id / rinel2026
      </div> */}

      <p className={styles.footer}>
        © 2026 Rinel Tech Nusantara
      </p>
    </div>
  );
}
