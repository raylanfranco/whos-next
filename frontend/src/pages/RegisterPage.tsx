import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await api.post<{ token: string; merchant: { id: string; name: string } }>(
        '/auth/register',
        { email, password, businessName },
      );

      localStorage.setItem('whosnext_token', result.token);
      navigate(`/dashboard?merchant=${result.merchant.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center p-6">
      <div className="premium-card-static p-8 sm:p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2.5 mb-4">
            <img src="/logo.svg" alt="Who's Next?" className="w-10 h-10" />
            <h1 className="text-2xl font-bold text-slate-900 font-display tracking-tight">
              Who's <span className="text-primary">Next?</span>
            </h1>
          </div>
          <p className="text-sm text-slate-500">Create your account and start booking</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Business Name</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              className="premium-input w-full"
              placeholder="Your shop name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="premium-input w-full"
              placeholder="At least 8 characters"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-sm font-semibold rounded-lg disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
