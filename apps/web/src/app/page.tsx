'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { me } from '../lib/api';
import { clearToken, getToken } from '../lib/auth';

type User = { id: string; email: string; name: string };

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function logout() {
    clearToken();
    router.replace('/login');
  }

  useEffect(() => {
    async function run() {
      const token = getToken();
      if (!token) {
        router.replace('/login');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await me();
        setUser(result.user);
      } catch (err) {
        clearToken();
        setUser(null);
        setError(err instanceof Error ? err.message : 'Unauthorized');
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    }

    run();
  }, [router]);

  return (
    <main className="tiemen-container">
      <div className="tiemen-row" style={{ marginBottom: 16 }}>
        <h1 className="tiemen-title">tiemen</h1>
        <button className="tiemen-buttonSecondary" onClick={logout}>
          Đăng xuất
        </button>
      </div>

      <section className="tiemen-card" style={{ maxWidth: 720 }}>
        {loading ? (
          <p>Đang tải...</p>
        ) : user ? (
          <p>
            Xin chào, <b>{user.name}</b> ({user.email})
          </p>
        ) : (
          <div className="tiemen-error" role="alert">
            {error ?? 'Unknown error'}
          </div>
        )}
      </section>
    </main>
  );
}
