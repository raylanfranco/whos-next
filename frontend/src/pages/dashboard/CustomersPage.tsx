import { useState, useEffect, useCallback } from 'react';
import { Plus, X, ChevronLeft } from 'lucide-react';
import { api } from '../../lib/api';
import { useMerchant } from '../../context/MerchantContext';
import type { Customer } from '../../types';

export default function CustomersPage() {
  const { merchant } = useMerchant();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [detail, setDetail] = useState<Customer | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  const fetchCustomers = useCallback(async () => {
    if (!merchant) return;
    setLoading(true);
    const data = await api.get<Customer[]>(`/customers?merchantId=${merchant.id}`);
    setCustomers(data);
    setLoading(false);
  }, [merchant]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  async function viewDetail(id: string) {
    const data = await api.get<Customer>(`/customers/${id}`);
    setDetail(data);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await api.post('/customers', { merchantId: merchant!.id, ...form });
    setShowForm(false);
    setForm({ name: '', email: '', phone: '' });
    fetchCustomers();
  }

  if (loading) return (
    <div className="glass-panel-static p-6 text-center">
      <div className="w-5 h-5 border-2 border-t-transparent animate-spin mx-auto mb-2" style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }} />
      <div className="text-sm font-display" style={{ color: 'var(--color-text-secondary)' }}>Loading customers...</div>
    </div>
  );

  if (detail) {
    return (
      <div className="overflow-y-auto flex-1 min-h-0">
        <button
          onClick={() => setDetail(null)}
          className="flex items-center gap-1 text-sm mb-4 transition-colors"
          style={{ color: 'var(--color-accent)' }}
        >
          <ChevronLeft className="w-4 h-4" /> Back to list
        </button>
        <div className="glass-panel-static p-6">
          <h2 className="text-xl font-bold text-white font-display tracking-tight mb-1">{detail.name}</h2>
          <div className="text-sm space-x-4 mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            {detail.email && <span>{detail.email}</span>}
            {detail.phone && <span>{detail.phone}</span>}
          </div>

          <h3 className="text-sm font-semibold text-white mb-2 font-display">Vehicles</h3>
          {detail.vehicles && detail.vehicles.length > 0 ? (
            <div className="space-y-2 mb-6">
              {detail.vehicles.map((v) => (
                <div key={v.id} className="text-sm glass-panel-static px-3 py-2" style={{ color: 'var(--color-text-secondary)' }}>
                  {[v.year, v.make, v.model, v.trim].filter(Boolean).join(' ')}
                  {v.notes && <span className="ml-2" style={{ color: 'var(--color-text-muted)' }}>— {v.notes}</span>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>No vehicles on file</p>
          )}

          <h3 className="text-sm font-semibold text-white mb-2 font-display">Booking History</h3>
          {detail.bookings && detail.bookings.length > 0 ? (
            <div className="space-y-2">
              {detail.bookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between text-sm glass-panel-static px-3 py-2">
                  <div>
                    <span className="font-medium text-white">{b.service?.name}</span>
                    <span className="ml-2" style={{ color: 'var(--color-text-muted)' }}>{new Date(b.startsAt).toLocaleDateString()}</span>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 ${
                    b.status === 'COMPLETED' ? 'status-completed' : b.status === 'CANCELLED' ? 'status-cancelled' : 'status-no-show'
                  }`}>
                    {b.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No bookings yet</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto flex-1 min-h-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white font-display tracking-tight">Customers</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 btn-primary px-4 py-2 text-sm">
          <Plus className="w-4 h-4" />Add Customer
        </button>
      </div>

      {customers.length === 0 ? (
        <div className="glass-panel-static p-12 text-center">
          <div className="font-display" style={{ color: 'var(--color-text-secondary)' }}>No customers yet. They'll appear here after their first booking.</div>
        </div>
      ) : (
        <div className="glass-panel-static overflow-hidden">
          <table className="w-full">
            <thead style={{ background: 'var(--color-bg-surface)', borderBottom: '1px solid var(--color-border)' }}>
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Name</th>
                <th className="text-left px-4 py-3 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Email</th>
                <th className="text-left px-4 py-3 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Phone</th>
                <th className="text-left px-4 py-3 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Vehicles</th>
                <th className="text-left px-4 py-3 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Bookings</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr
                  key={c.id}
                  className="cursor-pointer transition-colors"
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                  onClick={() => viewDetail(c.id)}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255, 179, 71, 0.04)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = ''; }}
                >
                  <td className="px-4 py-3 text-sm font-medium text-white">{c.name}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{c.email || '—'}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{c.phone || '—'}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{c._count?.vehicles ?? 0}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{c._count?.bookings ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-panel-static w-full max-w-md animate-slide-up" style={{ boxShadow: 'var(--shadow-elevated)' }}>
            <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h3 className="text-lg font-semibold font-display text-white">New Customer</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="premium-input w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="premium-input w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Phone</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="premium-input w-full" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost px-4 py-2 text-sm">Cancel</button>
                <button type="submit" className="btn-primary px-4 py-2 text-sm">Add Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
