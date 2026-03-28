import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Save, Trash2, Plus, CreditCard, MessageSquare, Unplug, CheckCircle, ExternalLink } from 'lucide-react';
import { api } from '../../lib/api';
import { useMerchant } from '../../context/MerchantContext';
import type { AvailabilityRule, BlockedDate } from '../../types';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function SettingsPage() {
  const { merchant, refetch } = useMerchant();

  // Business info
  const [name, setName] = useState('');
  const [timezone, setTimezone] = useState('');
  const [infoSaved, setInfoSaved] = useState(false);

  // Deposit settings
  const [depositPercent, setDepositPercent] = useState(0);
  const [depositSaved, setDepositSaved] = useState(false);

  // SMS settings
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');
  const [smsSaved, setSmsSaved] = useState(false);

  // Stripe Connect
  const [searchParams] = useSearchParams();
  const [stripeStatus, setStripeStatus] = useState<{ connected: boolean; stripePublishableKey: string | null; connectedAt: string | null }>({ connected: false, stripePublishableKey: null, connectedAt: null });
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeToast, setStripeToast] = useState<string | null>(null);

  // Availability
  const [rules, setRules] = useState<{ dayOfWeek: number; startTime: string; endTime: string; isBlocked: boolean }[]>([]);
  const [rulesSaved, setRulesSaved] = useState(false);

  // Stripe Connect status
  useEffect(() => {
    if (!merchant) return;
    api.get<{ connected: boolean; stripePublishableKey: string | null; connectedAt: string | null }>(`/stripe/connect/status?merchantId=${merchant.id}`)
      .then(setStripeStatus)
      .catch(() => {});
  }, [merchant]);

  // Stripe OAuth return toast
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

  // Blocked dates
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [newDate, setNewDate] = useState('');
  const [newReason, setNewReason] = useState('');

  useEffect(() => {
    if (!merchant) return;
    setName(merchant.name);
    setTimezone(merchant.timezone);

    // Initialize rules for all 7 days
    const existingRules = merchant.availabilityRules || [];
    const allRules = DAYS.map((_, i) => {
      const existing = existingRules.find((r: AvailabilityRule) => r.dayOfWeek === i);
      return existing
        ? { dayOfWeek: i, startTime: existing.startTime, endTime: existing.endTime, isBlocked: existing.isBlocked }
        : { dayOfWeek: i, startTime: '09:00', endTime: '18:00', isBlocked: i === 0 }; // Sunday blocked by default
    });
    setRules(allRules);
    setBlockedDates(merchant.blockedDates || []);

    // Load settings
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
      <h1 className="text-2xl font-bold text-slate-900 font-display tracking-tight">Settings</h1>

      {/* Business Info */}
      <section className="premium-card-static p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 font-display">Business Info</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Business Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="premium-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Timezone</label>
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
      <section className="premium-card-static p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-slate-900 font-display">Deposit Settings</h2>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Require customers to pay a percentage of the service price upfront when booking online. Set to 0% to disable deposits.
        </p>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Deposit Percentage: <span className="text-primary font-bold">{depositPercent}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={depositPercent}
              onChange={(e) => setDepositPercent(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>0% (no deposit)</span>
              <span>50%</span>
              <span>100% (full prepay)</span>
            </div>
          </div>
          {depositPercent > 0 && (
            <div className="bg-cyan-50 border border-cyan-100 rounded-xl p-3 text-sm text-cyan-700">
              Customers will pay <strong>{depositPercent}%</strong> of the service price when booking online.
              The remaining balance is collected at the appointment.
            </div>
          )}
          {depositPercent === 0 && (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm text-slate-500">
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
      <section className="premium-card-static p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-slate-900 font-display">SMS Notifications</h2>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Automatically send text messages for booking confirmations, reminders, and review requests. Requires Twilio credentials on the server.
        </p>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={smsEnabled}
              onChange={(e) => setSmsEnabled(e.target.checked)}
              className="rounded accent-primary w-4 h-4"
            />
            <span className="text-sm font-medium text-slate-700">Enable SMS notifications</span>
          </label>
          {smsEnabled && (
            <>
              <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-sm text-green-700">
                When enabled, customers will receive texts for:
                <ul className="mt-1 ml-4 list-disc text-xs space-y-0.5">
                  <li>Booking confirmation</li>
                  <li>24-hour appointment reminder</li>
                  <li>Vehicle ready for pickup</li>
                  <li>Review request (next day)</li>
                </ul>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Google Review URL (optional)</label>
                <input
                  value={googleReviewUrl}
                  onChange={(e) => setGoogleReviewUrl(e.target.value)}
                  placeholder="https://g.page/r/your-business/review"
                  className="premium-input w-full"
                />
                <p className="text-xs text-slate-400 mt-1">
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

      {/* Availability */}
      <section className="premium-card-static p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 font-display">Weekly Availability</h2>
        <div className="space-y-3">
          {rules.map((r) => (
            <div key={r.dayOfWeek} className="flex items-center gap-3">
              <label className="w-24 text-sm font-medium text-slate-700 font-display">{DAYS[r.dayOfWeek]}</label>
              <label className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={!r.isBlocked}
                  onChange={(e) => updateRule(r.dayOfWeek, 'isBlocked', !e.target.checked)}
                  className="rounded"
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
                  <span className="text-slate-400">to</span>
                  <input
                    type="time"
                    value={r.endTime}
                    onChange={(e) => updateRule(r.dayOfWeek, 'endTime', e.target.value)}
                    className="premium-input px-2 py-1"
                  />
                </>
              )}
              {r.isBlocked && <span className="text-sm text-slate-400">Closed</span>}
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
      <section className="premium-card-static p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 font-display">Blocked Dates</h2>
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
          <p className="text-sm text-slate-400">No blocked dates</p>
        ) : (
          <div className="space-y-2">
            {blockedDates.map((bd) => (
              <div key={bd.id} className="flex items-center justify-between premium-card-static px-3 py-2">
                <div className="text-sm">
                  <span className="font-medium text-slate-900">
                    {new Date(bd.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  {bd.reason && <span className="text-slate-500 ml-2">— {bd.reason}</span>}
                </div>
                <button
                  onClick={() => removeBlockedDate(bd.id)}
                  className="text-slate-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Stripe Connect */}
      <section className="premium-card-static p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 font-display flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          Payments
        </h2>
        {stripeStatus.connected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
              <div>
                <div className="text-sm font-medium text-green-800">Stripe Connected</div>
                {stripeStatus.connectedAt && (
                  <div className="text-xs text-green-600">
                    Connected {new Date(stripeStatus.connectedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={disconnectStripe}
              disabled={stripeLoading}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              <Unplug className="w-4 h-4" />
              {stripeLoading ? 'Disconnecting...' : 'Disconnect Stripe'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-500">Connect your Stripe account to accept deposits and payments from customers.</p>
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

      {/* Stripe toast */}
      {stripeToast && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-fade-in">
          {stripeToast}
        </div>
      )}
    </div>
  );
}
