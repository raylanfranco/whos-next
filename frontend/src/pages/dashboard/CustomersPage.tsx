import { useState, useEffect, useCallback } from 'react';
import { Plus, X, ChevronLeft, ChevronRight, Search, Download, Filter, MoreVertical } from 'lucide-react';
import { api } from '../../lib/api';
import { useMerchant } from '../../context/MerchantContext';
import type { Customer } from '../../types';

const PAGE_SIZE = 10;

export default function CustomersPage() {
  const { merchant } = useMerchant();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [detail, setDetail] = useState<Customer | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [contextMenu, setContextMenu] = useState<{ customer: Customer; x: number; y: number } | null>(null);

  const fetchCustomers = useCallback(async () => {
    if (!merchant) return;
    setLoading(true);
    const data = await api.get<Customer[]>(`/customers?merchantId=${merchant.id}`);
    setCustomers(data);
    setLoading(false);
  }, [merchant]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  // Close context menu on click outside
  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [contextMenu]);

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

  function handleExport() {
    const csv = [
      ['Name', 'Email', 'Phone', 'Vehicles', 'Bookings'],
      ...customers.map(c => [c.name, c.email || '', c.phone || '', c._count?.vehicles ?? 0, c._count?.bookings ?? 0])
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'customers.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  // Filter + paginate
  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone || '').includes(searchTerm)
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  if (loading) return (
    <div className="glass-panel-static p-6 text-center">
      <div className="w-5 h-5 border-2 border-t-transparent animate-spin mx-auto mb-2" style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }} />
      <div className="text-sm font-display" style={{ color: 'var(--color-text-secondary)' }}>Loading customers...</div>
    </div>
  );

  // ── DETAIL VIEW ──
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

  // ── LIST VIEW ──
  return (
    <div className="overflow-y-auto flex-1 min-h-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white font-display tracking-tight">Customer Database</h1>
          <div className="flex items-center gap-3 mt-1 font-mono-custom text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <span>TOTAL_RECORDS: {customers.length}</span>
            <span style={{ color: 'var(--color-border-accent)' }}>|</span>
            <span style={{ color: 'var(--color-accent-dim)' }}>SHOWING: {filtered.length}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="btn-ghost px-3 py-1.5 text-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> EXPORT
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary px-4 py-2 text-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Customer
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          placeholder="Search by name, email, or phone..."
          className="premium-input w-full pl-10 pr-12"
          style={searchTerm ? { borderColor: 'var(--color-accent)' } : {}}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono-custom text-[10px] pointer-events-none" style={{ color: 'var(--color-text-muted)' }}>⌘K</span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="glass-panel-static p-12 text-center">
          {searchTerm ? (
            <div className="font-mono-custom text-sm" style={{ color: 'var(--color-text-muted)' }}>
              NO_RECORDS_FOUND // QUERY: "{searchTerm}"
            </div>
          ) : (
            <div className="font-display" style={{ color: 'var(--color-text-secondary)' }}>
              No customers yet. They'll appear here after their first booking.
            </div>
          )}
        </div>
      ) : (
        <div className="glass-panel-static overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(5, 4, 4, 0.5)', borderBottom: '1px solid var(--color-border-accent)' }}>
                <th className="text-left py-3.5 px-5 font-mono-custom uppercase" style={{ fontSize: '11px', letterSpacing: '0.15em', color: 'var(--color-text-muted)' }}>Name</th>
                <th className="text-left py-3.5 px-5 font-mono-custom uppercase hidden sm:table-cell" style={{ fontSize: '11px', letterSpacing: '0.15em', color: 'var(--color-text-muted)' }}>Email</th>
                <th className="text-left py-3.5 px-5 font-mono-custom uppercase hidden md:table-cell" style={{ fontSize: '11px', letterSpacing: '0.15em', color: 'var(--color-text-muted)' }}>Phone</th>
                <th className="text-right py-3.5 px-5 font-mono-custom uppercase hidden lg:table-cell" style={{ fontSize: '11px', letterSpacing: '0.15em', color: 'var(--color-text-muted)' }}>Vehicles</th>
                <th className="text-right py-3.5 px-5 font-mono-custom uppercase" style={{ fontSize: '11px', letterSpacing: '0.15em', color: 'var(--color-text-muted)' }}>Bookings</th>
                <th className="w-10 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((c, i) => (
                <tr
                  key={c.id}
                  className="cursor-pointer transition-all group relative"
                  style={{ borderBottom: i < paginated.length - 1 ? '1px solid rgba(255, 179, 71, 0.08)' : 'none' }}
                  onClick={() => viewDetail(c.id)}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255, 179, 71, 0.06)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'inset 0 0 0 1px var(--color-accent)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '';
                    (e.currentTarget as HTMLElement).style.boxShadow = '';
                  }}
                >
                  <td className="py-3.5 px-5">
                    <div className="font-semibold text-white font-display">{c.name}</div>
                    <div className="font-mono-custom mt-0.5 sm:hidden" style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{c.email || ''}</div>
                  </td>
                  <td className="py-3.5 px-5 font-mono-custom text-[13px] hidden sm:table-cell" style={{ color: 'var(--color-text-muted)' }}>{c.email || '—'}</td>
                  <td className="py-3.5 px-5 font-mono-custom text-[13px] hidden md:table-cell" style={{ color: 'var(--color-text-secondary)' }}>{c.phone || '—'}</td>
                  <td className="py-3.5 px-5 text-right font-mono-custom text-[13px] hidden lg:table-cell" style={{ color: (c._count?.vehicles ?? 0) === 0 ? 'var(--color-text-muted)' : 'var(--color-accent)' }}>{c._count?.vehicles ?? 0}</td>
                  <td className="py-3.5 px-5 text-right font-mono-custom text-[13px] text-white">{c._count?.bookings ?? 0}</td>
                  <td className="py-3.5 px-2 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="text-gray-500 hover:text-[var(--color-accent)] transition-colors p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = (e.target as HTMLElement).getBoundingClientRect();
                        setContextMenu({ customer: c, x: rect.left - 120, y: rect.bottom + 4 });
                      }}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: '1px solid var(--color-border-accent)', background: 'rgba(5, 4, 4, 0.5)' }}>
              <div className="font-mono-custom text-xs" style={{ color: 'var(--color-text-muted)' }}>
                SHOWING {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} OF {filtered.length}
              </div>
              <div className="flex gap-1">
                <button
                  disabled={safePage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="w-8 h-8 flex items-center justify-center transition-colors disabled:opacity-30"
                  style={{ border: '1px solid var(--color-border-accent)', background: 'var(--color-accent-subtle)', color: 'var(--color-text-secondary)' }}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className="w-8 h-8 flex items-center justify-center font-mono-custom text-xs transition-colors"
                    style={{
                      border: safePage === p ? '1px solid var(--color-accent)' : '1px solid var(--color-border-accent)',
                      background: safePage === p ? 'var(--color-accent-muted)' : 'var(--color-accent-subtle)',
                      color: safePage === p ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                    }}
                  >
                    {p}
                  </button>
                ))}
                <button
                  disabled={safePage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="w-8 h-8 flex items-center justify-center transition-colors disabled:opacity-30"
                  style={{ border: '1px solid var(--color-border-accent)', background: 'var(--color-accent-subtle)', color: 'var(--color-text-secondary)' }}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 animate-fade-in"
          style={{ top: contextMenu.y, left: contextMenu.x, background: 'var(--color-bg-base)', border: '1px solid var(--color-border-accent-strong)', minWidth: '160px', boxShadow: 'var(--shadow-elevated)' }}
        >
          {[
            { label: 'View Profile', action: () => { viewDetail(contextMenu.customer.id); setContextMenu(null); } },
            { label: 'New Booking', action: () => { setContextMenu(null); } },
            { label: 'Delete', action: () => { setContextMenu(null); }, danger: true },
          ].map((item, i) => (
            <button
              key={i}
              onClick={item.action}
              className={`block w-full text-left px-4 py-2.5 text-sm font-display transition-colors ${item.danger ? 'text-red-400 hover:bg-red-400/10' : 'text-gray-300 hover:text-white hover:bg-[var(--color-accent-subtle)]'}`}
              style={{ borderBottom: i < 2 ? '1px solid var(--color-border)' : 'none' }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Add Customer Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md animate-slide-up" style={{ background: 'var(--color-bg-base)', border: '1px solid var(--color-border-accent-strong)', boxShadow: '0 0 40px rgba(255, 179, 71, 0.1)' }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--color-border-accent)' }}>
              <div>
                <h3 className="text-lg font-semibold font-display text-white">Add Customer</h3>
                <div className="font-mono-custom mt-0.5" style={{ fontSize: '10px', color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}>NEW_RECORD // CUSTOMER_DB</div>
              </div>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {[
                { key: 'name' as const, label: 'FULL NAME', placeholder: 'e.g. John Doe', required: true },
                { key: 'email' as const, label: 'EMAIL', placeholder: 'e.g. john@example.com', required: false },
                { key: 'phone' as const, label: 'PHONE', placeholder: 'e.g. +1 (415) 555-0100', required: false },
              ].map(field => (
                <div key={field.key}>
                  <label className="block font-mono-custom mb-1.5" style={{ fontSize: '10px', color: 'var(--color-text-muted)', letterSpacing: '0.15em' }}>{field.label}</label>
                  <input
                    type={field.key === 'email' ? 'email' : field.key === 'phone' ? 'tel' : 'text'}
                    value={form[field.key]}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    required={field.required}
                    placeholder={field.placeholder}
                    className="premium-input w-full"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 btn-ghost py-2.5 text-sm">
                  CANCEL
                </button>
                <button type="submit" className="flex-1 btn-primary py-2.5 text-sm">
                  ADD CUSTOMER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
