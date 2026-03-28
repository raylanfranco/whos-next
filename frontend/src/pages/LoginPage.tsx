import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await api.post<{ token: string; merchant: { id: string; name: string } }>(
        '/auth/login',
        { email, password },
      );

      localStorage.setItem('whosnext_token', result.token);
      navigate(`/dashboard?merchant=${result.merchant.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-grid" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      <div className="ambient-arc-top absolute inset-0 pointer-events-none" />
      <div className="premium-card-static p-8 sm:p-10 w-full max-w-md relative animate-slide-up">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2.5 mb-4">
            <img src="/logo.svg" alt="Who's Next?" className="w-10 h-10" />
            <h1 className="text-2xl font-bold text-white font-display tracking-tight">
              Who's <span style={{ color: 'var(--color-accent)' }}>Next?</span>
            </h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Sign in to your dashboard</p>
        </div>

        {error && (
          <div className="p-3 text-sm mb-6" style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#F87171',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="premium-input w-full"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="premium-input w-full"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--color-text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" className="font-medium hover:underline" style={{ color: 'var(--color-accent)' }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
