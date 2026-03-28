import { Zap } from 'lucide-react';
import { api } from '../lib/api';
import { useState } from 'react';

interface UpgradePromptProps {
  feature: string;
}

export default function UpgradePrompt({ feature }: UpgradePromptProps) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const { url } = await api.post<{ url: string }>('/billing/create-checkout', {});
      window.location.href = url;
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="glass-panel-amber p-6 text-center">
      <div
        className="w-12 h-12 mx-auto mb-3 flex items-center justify-center"
        style={{ background: 'var(--color-accent-muted)', border: '1px solid var(--color-border-accent)' }}
      >
        <Zap className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />
      </div>
      <h3 className="text-lg font-semibold text-white font-display mb-1">
        Upgrade to Pro
      </h3>
      <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
        {feature} is available on the Pro plan. Unlock unlimited services, bookings, push notifications, Stripe payments, SMS, and more.
      </p>
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="text-2xl font-bold text-white font-display">$39</span>
        <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>/month</span>
      </div>
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="btn-primary px-6 py-2.5 text-sm disabled:opacity-50"
      >
        {loading ? 'Redirecting to checkout...' : 'Upgrade Now'}
      </button>
    </div>
  );
}
