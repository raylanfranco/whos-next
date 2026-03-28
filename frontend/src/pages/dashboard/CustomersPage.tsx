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

  const fetchCustomers = useCallback(async () => { if (!merchant) return; setLoading(true); const data = await api.get<Customer[]>(`/customers?merchantId=${merchant.id}`); setCustomers(data); setLoading(false); }, [merchant]);
  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  async function viewDetail(id: string) { const data = await api.get<Customer>(`/customers/${id}`); setDetail(data); }
  async function handleCreate(e: React.FormEvent) { e.preventDefault(); await api.post('/customers', { merchantId: merchant!.id, ...form }); setShowForm(false); setForm({ name: '', email: '', phone: '' }); fetchCustomers(); }

  if (loading) return (<div className="premium-card-static p-6 text-center"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" /><div className="text-slate-500 text-sm font-display">Loading customers...</div></div>);

  if (detail) {
    return (<div>
      <button onClick={() => setDetail(null)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-primary mb-4"><ChevronLeft className="w-4 h-4" /> Back to list</button>
      <div className="premium-card-static p-6">
        <h2 className="text-xl font-bold text-slate-900 font-display tracking-tight mb-1">{detail.name}</h2>
        <div className="text-sm text-slate-500 space-x-4 mb-6">{detail.email && <span>{detail.email}</span>}{detail.phone && <span>{detail.phone}</span>}</div>
        <h3 className="text-sm font-semibold text-slate-700 mb-2 font-display">Vehicles</h3>
        {detail.vehicles && detail.vehicles.length > 0 ? (<div className="space-y-2 mb-6">{detail.vehicles.map((v) => (<div key={v.id} className="text-sm text-slate-600 premium-card-static px-3 py-2">{[v.year, v.make, v.model, v.trim].filter(Boolean).join(' ')}{v.notes && <span className="text-slate-400 ml-2">— {v.notes}</span>}</div>))}</div>) : (<p className="text-sm text-slate-400 mb-6">No vehicles on file</p>)}
        <h3 className="text-sm font-semibold text-slate-700 mb-2 font-display">Booking History</h3>
        {detail.bookings && detail.bookings.length > 0 ? (<div className="space-y-2">{detail.bookings.map((b) => (<div key={b.id} className="flex items-center justify-between text-sm premium-card-static px-3 py-2"><div><span className="font-medium text-slate-900">{b.service?.name}</span><span className="text-slate-400 ml-2">{new Date(b.startsAt).toLocaleDateString()}</span></div><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${b.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : b.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>{b.status.replace('_', ' ')}</span></div>))}</div>) : (<p className="text-sm text-slate-400">No bookings yet</p>)}
      </div>
    </div>);
  }

  return (<div>
    <div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-bold text-slate-900 font-display tracking-tight">Customers</h1><button onClick={() => setShowForm(true)} className="flex items-center gap-2 btn-primary px-4 py-2 text-sm"><Plus className="w-4 h-4" />Add Customer</button></div>
    {customers.length === 0 ? (<div className="premium-card-static p-12 text-center"><div className="text-slate-500 font-display">No customers yet. They'll appear here after their first booking.</div></div>) : (
      <div className="premium-card-static overflow-hidden"><table className="w-full"><thead className="bg-warm-50 border-b border-slate-100"><tr><th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Name</th><th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Email</th><th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Phone</th><th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Vehicles</th><th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Bookings</th></tr></thead><tbody className="divide-y divide-slate-100">{customers.map((c) => (<tr key={c.id} className="hover:bg-warm-50 cursor-pointer" onClick={() => viewDetail(c.id)}><td className="px-4 py-3 text-sm font-medium text-slate-900">{c.name}</td><td className="px-4 py-3 text-sm text-slate-600">{c.email || '—'}</td><td className="px-4 py-3 text-sm text-slate-600">{c.phone || '—'}</td><td className="px-4 py-3 text-sm text-slate-600">{c._count?.vehicles ?? 0}</td><td className="px-4 py-3 text-sm text-slate-600">{c._count?.bookings ?? 0}</td></tr>))}</tbody></table></div>
    )}
    {showForm && (<div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 animate-fade-in"><div className="premium-card-static shadow-[var(--shadow-elevated)] w-full max-w-md animate-slide-up"><div className="flex items-center justify-between p-4 border-b border-slate-100"><h3 className="text-lg font-semibold font-display">New Customer</h3><button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button></div><form onSubmit={handleCreate} className="p-4 space-y-4"><div><label className="block text-sm font-medium text-slate-700 mb-1">Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="premium-input w-full" /></div><div><label className="block text-sm font-medium text-slate-700 mb-1">Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="premium-input w-full" /></div><div><label className="block text-sm font-medium text-slate-700 mb-1">Phone</label><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="premium-input w-full" /></div><div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button><button type="submit" className="btn-primary px-4 py-2 text-sm">Add Customer</button></div></form></div></div>)}
  </div>);
}
