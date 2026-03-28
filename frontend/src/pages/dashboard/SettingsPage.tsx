import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Save, Trash2, Plus, CreditCard, MessageSquare, Unplug, CheckCircle, ExternalLink } from 'lucide-react';
import { api } from '../../lib/api';
import { useMerchant } from '../../context/MerchantContext';
import PlanGate from '../../components/PlanGate';
import type { AvailabilityRule, BlockedDate } from '../../types';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function SettingsPage() {
  const { merchant, refetch } = useMerchant();

  const [name, setName] = useState('');
  const [timezone, setTimezone] = useState('');
  const [infoSaved, setInfoSaved] = useState(false);

  const [depositPercent, setDepositPercent] = useState(0);
  const [depositSaved, setDepositSaved] = useState(false);

  const [smsEnabled, setSmsEnabled] = useState(false);
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');
  const [smsSaved, setSmsSaved] = useState(false);

  const [searchParams] = useSearchParams();
  const [stripeStatus, setStripeStatus] = useState<{ connected: boolean; stripePublishableKey: string | null; connectedAt: string | null }>({ connected: false, stripePublishableKey: null, connectedAt: null });
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeToast, setStripeToast] = useState<string | null>(null);

  const [rules, setRules] = useState<{ dayOfWeek: number; startTime: string; endTime: string; isBlocked: boolean }[]>([]);
  const [rulesSaved, setRulesSaved] = useState(false);

  useEffect(() => {
    if (!merchant) return;
    api.get<{ connected: boolean; stripePublishableKey: string | null; connectedAt: string | null }>(`/stripe/connect/status?merchantId=${merchant.id}`)
      .then(setStripeStatus)
      .catch(() => {});
  }, [merchant]);

  useEffect(() => {
    const stripeParam = searchParams.get('stripe');
    if (stripeParam === 'connected') {
      setStripeToast('Stripe connected successfully!');
      setTimeout(() => setStripeToast(null), 5000);
    } else if (stripeParam === 'error') {
      const msg = searchParams.get('message') || 'Connection failed';
      setStripeToast(`Stripe error: ${msg}`);
      setTimeout(() => setStripeToast(null), 8000);
    }
  }, [searchParams]);

  async function connectStripe() {
    setStripeLoading(true);
    try {
      const { url } = await api.get<{ url: string }>('/stripe/connect');
      window.location.href = url;
    } catch {
      setStripeToast('Failed to start Stripe connection');
      setTimeout(() => setStripeToast(null), 5000);
    } finally {
      setStripeLoading(false);
    }
  }

  async function disconnectStripe() {
    if (!confirm('Disconnect your Stripe account? You will not be able to accept deposits until you reconnect.')) return;
    setStripeLoading(true);
    try {
      await api.delete('/stripe/disconnect');
      setStripeStatus({ connected: false, stripePublishableKey: null, connectedAt: null });
      setStripeToast('Stripe disconnected');
      setTimeout(() => setStripeToast(null), 5000);
    } catch {
      setStripeToast('Failed to disconnect Stripe');
      setTimeout(() => setStripeToast(null), 5000);
    } finally {
      setStripeLoading(false);
    }
  }

  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [newDate, setNewDate] = useState('');
  const [newReason, setNewReason] = useState('');

  useEffect(() => {
    if (!merchant) return;
    setName(merchant.name);
    setTimezone(merchant.timezone);

    const existingRules = merchant.availabilityRules || [];
    const allRules = DAYS.map((_, i) => {
      const existing = existingRules.find((r: AvailabilityRule) => r.dayOfWeek === i);
      return existing
        ? { dayOfWeek: i, startTime: existing.startTime, endTime: existing.endTime, isBlocked: existing.isBlocked }
        : { dayOfWeek: i, startTime: '09:00', endTime: '18:00', isBlocked: i === 0 };
    });
    setRules(allRules);
    setBlockedDates(merchant.blockedDates || []);

    const settings = merchant.settings as Record<string, unknown> | null;
    setDepositPercent((settings?.depositPercent as number) ?? 0);
    setSmsEnabled((settings?.smsEnabled as boolean) ?? false);
    setGoogleReviewUrl((settings?.googleReviewUrl as string) ?? '');
  }, [merchant]);

  async function saveInfo() {
    if (!merchant) return;
    await api.patch(`/merchants/${merchant.id}`, { name, timezone });
    setInfoSaved(true);
    setTimeout(() => setInfoSaved(false), 2000);
    refetch();
  }

  async function saveDeposit() {
    if (!merchant) return;
    await api.patch(`/merchants/${merchant.id}`, { settings: { depositPercent } });
    setDepositSaved(true);
    setTimeout(() => setDepositSaved(false), 2000);
    refetch();
  }

  async function saveSms() {
    if (!merchant) return;
    await api.patch(`/merchants/${merchant.id}`, { settings: { smsEnabled, googleReviewUrl: googleReviewUrl || undefined } });
    setSmsSaved(true);
    setTimeout(() => setSmsSaved(false), 2000);
    refetch();
  }

  async function saveRules() {
    if (!merchant) return;
    await api.patch(`/merchants/${merchant.id}/availability`, { rules });
    setRulesSaved(true);
    setTimeout(() => setRulesSaved(false), 2000);
    refetch();
  }

  async function addBlockedDate() {
    if (!merchant || !newDate) return;
    const bd = await api.post<BlockedDate>(`/merchants/${merchant.id}/blocked-dates`, {
      date: newDate,
      reason: newReason || undefined,
    });
    setBlockedDates([...blockedDates, bd]);
    setNewDate('');
    setNewReason('');
  }

  async function removeBlockedDate(id: string) {
    await api.delete(`/merchants/blocked-dates/${id}`);
    setBlockedDates(blockedDates.filter((d) => d.id !== id));
  }

  function updateRule(dayOfWeek: number, field: string, value: string | boolean) {
    setRules(rules.map((r) => r.dayOfWeek === dayOfWeek ? { ...r, [field]: value } : r));
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-white font-display tracking-tight">Settings</h1>

      {/* Business Info */}
      <section className="glass-panel-static p-6">
        <h2 className="text-lg font-semibold text-white mb-4 font-display">Business Info</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Business Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="premium-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="premium-input w-full"
            >
              {['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Phoenix'].map((tz) => (
                <option key={tz} value={tz}>{tz.replace('America/', '').replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <button
            onClick={saveInfo}
            className="flex items-center gap-2 btn-primary px-4 py-2 text-sm"
          >
            <Save className="w-4 h-4" />
            {infoSaved ? 'Saved!' : 'Save Info'}
          </button>
        </div>
      </section>

      {/* Deposit Settings */}
      <section className="glass-panel-static p-6 tech-bracket">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
          <h2 className="text-lg font-semibold text-white font-display">Deposit Settings</h2>
        </div>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          Require customers to pay a percentage of the service price upfront when booking online. Set to 0% to disable deposits.
        </p>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              Deposit Percentage: <span className="font-bold" style={{ color: 'var(--color-accent)' }}>{depositPercent}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={depositPercent}
              onChange={(e) => setDepositPercent(Number(e.target.value))}
              className="w-full accent-[#FFB347]"
            />
            <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
              <span>0% (no deposit)</span>
              <span>50%</span>
              <span>100% (full prepay)</span>
            </div>
          </div>
          {depositPercent > 0 && (
            <div className="p-3 text-sm" style={{ background: 'var(--color-accent-subtle)', border: '1px solid var(--color-border-accent)', color: 'var(--color-text-secondary)' }}>
              Customers will pay <strong style={{ color: 'var(--color-accent)' }}>{depositPercent}%</strong> of the service price when booking online.
              The remaining balance is collected at the appointment.
            </div>
          )}
          {depositPercent === 0 && (
            <div className="p-3 text-sm" style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
              Deposits are disabled. Customers can book without payment.
            </div>
          )}
          <button
            onClick={saveDeposit}
            className="flex items-center gap-2 btn-primary px-4 py-2 text-sm"
          >
            <Save className="w-4 h-4" />
            {depositSaved ? 'Saved!' : 'Save Deposit Settings'}
          </button>
        </div>
      </section>

      {/* SMS Notifications */}
      <PlanGate feature="SMS notifications">
      <section className="glass-panel-static p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
          <h2 className="text-lg font-semibold text-white font-display">SMS Notifications</h2>
        </div>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          Automatically send text messages for booking confirmations, reminders, and review requests. Requires Twilio credentials on the server.
        </p>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={smsEnabled}
              onChange={(e) => setSmsEnabled(e.target.checked)}
              className="w-4 h-4 accent-[#FFB347]"
            />
            <span className="text-sm font-medium text-white">Enable SMS notifications</span>
          </label>
          {smsEnabled && (
            <>
              <div className="p-3 text-sm" style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#34D399' }}>
                When enabled, customers will receive texts for:
                <ul className="mt-1 ml-4 list-disc text-xs space-y-0.5">
                  <li>Booking confirmation</li>
                  <li>24-hour appointment reminder</li>
                  <li>Vehicle ready for pickup</li>
                  <li>Review request (next day)</li>
                </ul>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Google Review URL (optional)</label>
                <input
                  value={googleReviewUrl}
                  onChange={(e) => setGoogleReviewUrl(e.target.value)}
                  placeholder="https://g.page/r/your-business/review"
                  className="premium-input w-full"
                />
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  If provided, review request texts will include a direct link to your Google review page.
                </p>
              </div>
            </>
          )}
          <button
            onClick={saveSms}
            className="flex items-center gap-2 btn-primary px-4 py-2 text-sm"
          >
            <Save className="w-4 h-4" />
            {smsSaved ? 'Saved!' : 'Save SMS Settings'}
          </button>
        </div>
      </section>
      </PlanGate>

      {/* Availability */}
      <section className="glass-panel-static p-6">
        <h2 className="text-lg font-semibold text-white mb-4 font-display">Weekly Availability</h2>
        <div className="space-y-3">
          {rules.map((r) => (
            <div key={r.dayOfWeek} className="flex items-center gap-3">
              <label className="w-24 text-sm font-medium text-white font-display">{DAYS[r.dayOfWeek]}</label>
              <label className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={!r.isBlocked}
                  onChange={(e) => updateRule(r.dayOfWeek, 'isBlocked', !e.target.checked)}
                  className="accent-[#FFB347]"
                />
                Open
              </label>
              {!r.isBlocked && (
                <>
                  <input
                    type="time"
                    value={r.startTime}
                    onChange={(e) => updateRule(r.dayOfWeek, 'startTime', e.target.value)}
                    className="premium-input px-2 py-1"
                  />
                  <span style={{ color: 'var(--color-text-muted)' }}>to</span>
                  <input
                    type="time"
                    value={r.endTime}
                    onChange={(e) => updateRule(r.dayOfWeek, 'endTime', e.target.value)}
                    className="premium-input px-2 py-1"
                  />
                </>
              )}
              {r.isBlocked && <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Closed</span>}
            </div>
          ))}
        </div>
        <button
          onClick={saveRules}
          className="mt-4 flex items-center gap-2 btn-primary px-4 py-2 text-sm"
        >
          <Save className="w-4 h-4" />
          {rulesSaved ? 'Saved!' : 'Save Availability'}
        </button>
      </section>

      {/* Blocked Dates */}
      <section className="glass-panel-static p-6">
        <h2 className="text-lg font-semibold text-white mb-4 font-display">Blocked Dates</h2>
        <div className="flex gap-3 mb-4">
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="premium-input"
          />
          <input
            value={newReason}
            onChange={(e) => setNewReason(e.target.value)}
            placeholder="Reason (optional)"
            className="flex-1 premium-input"
          />
          <button
            onClick={addBlockedDate}
            disabled={!newDate}
            className="flex items-center gap-1 btn-primary px-4 py-2 text-sm disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        {blockedDates.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No blocked dates</p>
        ) : (
          <div className="space-y-2">
            {blockedDates.map((bd) => (
              <div key={bd.id} className="flex items-center justify-between glass-panel-static px-3 py-2">
                <div className="text-sm">
                  <span className="font-medium text-white">
                    {new Date(bd.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  {bd.reason && <span className="ml-2" style={{ color: 'var(--color-text-secondary)' }}>— {bd.reason}</span>}
                </div>
                <button
                  onClick={() => removeBlockedDate(bd.id)}
                  className="text-gray-500 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Stripe Connect */}
      <PlanGate feature="Stripe payments">
      <section className="glass-panel-static p-6 tech-bracket">
        <h2 className="text-lg font-semibold text-white mb-4 font-display flex items-center gap-2">
          <CreditCard className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
          Payments
        </h2>
        {stripeStatus.connected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3" style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <CheckCircle className="w-5 h-5 shrink-0" style={{ color: 'var(--color-success)' }} />
              <div>
                <div className="text-sm font-medium" style={{ color: '#34D399' }}>Stripe Connected</div>
                {stripeStatus.connectedAt && (
                  <div className="text-xs" style={{ color: 'rgba(16, 185, 129, 0.7)' }}>
                    Connected {new Date(stripeStatus.connectedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={disconnectStripe}
              disabled={stripeLoading}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
              style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#F87171' }}
            >
              <Unplug className="w-4 h-4" />
              {stripeLoading ? 'Disconnecting...' : 'Disconnect Stripe'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Connect your Stripe account to accept deposits and payments from customers.</p>
            <button
              onClick={connectStripe}
              disabled={stripeLoading}
              className="flex items-center gap-2 btn-primary px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
            >
              <ExternalLink className="w-4 h-4" />
              {stripeLoading ? 'Redirecting...' : 'Connect Stripe'}
            </button>
          </div>
        )}
      </section>
      </PlanGate>

      {/* Stripe toast */}
      {stripeToast && (
        <div className="fixed bottom-4 right-4 z-50 px-4 py-3 text-sm font-medium animate-fade-in" style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-accent)', color: 'var(--color-text-primary)', boxShadow: 'var(--shadow-elevated)' }}>
          {stripeToast}
        </div>
      )}
    </div>
  );
}
