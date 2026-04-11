'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { login, me } from '../../lib/api';
import { getToken, setToken, clearToken } from '../../lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (token) router.replace('/');
  }, [router]);

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && password.trim().length > 0 && !loading;
  }, [email, password, loading]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await login(email.trim(), password);
      setToken(result.token);
      // Verify token works by calling /auth/me before redirecting
      try {
        await me();
        router.replace('/');
      } catch (err) {
        clearToken();
        setError('Không thể xác thực sau khi đăng nhập');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="tiemen-center">
      <section className="tiemen-card" aria-label="Login">
        <h1 className="tiemen-title">Đăng nhập</h1>
        <p className="tiemen-subtitle">tiemen</p>

        <form className="tiemen-form" onSubmit={onSubmit}>
          <label className="tiemen-field">
            <span className="tiemen-label">Email</span>
            <input
              className="tiemen-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              placeholder="admin@tiemen.local"
              required
            />
          </label>

          <label className="tiemen-field">
            <span className="tiemen-label">Mật khẩu</span>
            <input
              className="tiemen-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              required
            />
          </label>

          {error ? (
            <div className="tiemen-error" role="alert">
              {error}
            </div>
          ) : null}

          <button className="tiemen-button" type="submit" disabled={!canSubmit}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </section>
    </main>
  );
}
