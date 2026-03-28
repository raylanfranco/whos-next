import { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api';
import { useMerchant } from '../../context/MerchantContext';
import { X, ChevronLeft, ChevronRight, Calendar, List, Plus, Package } from 'lucide-react';
import CalendarGrid from '../../components/CalendarGrid';
import RevenueSidebar from '../../components/RevenueSidebar';
import PushPrompt from '../../components/PushPrompt';
import type { Booking, BookingStatus, BookingPart, PartStatus, Service, Customer } from '../../types';

const STATUS_COLORS: Record<BookingStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  CHECKED_IN: 'bg-cyan-100 text-cyan-800',
  WAITING_ON_PARTS: 'bg-purple-100 text-purple-800',
  IN_PROGRESS: 'bg-orange-100 text-orange-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  NO_SHOW: 'bg-slate-100 text-slate-600',
};

const STATUS_TRANSITIONS: Record<BookingStatus, { label: string; next: BookingStatus; color: string }[]> = {
  PENDING: [
    { label: 'Confirm', next: 'CONFIRMED', color: 'bg-blue-600 text-white' },
    { label: 'Cancel', next: 'CANCELLED', color: 'bg-red-100 text-red-700' },
  ],
  CONFIRMED: [
    { label: 'Check In', next: 'CHECKED_IN', color: 'bg-cyan-600 text-white' },
    { label: 'Cancel', next: 'CANCELLED', color: 'bg-red-100 text-red-700' },
    { label: 'No-Show', next: 'NO_SHOW', color: 'bg-slate-200 text-slate-700' },
  ],
  CHECKED_IN: [
    { label: 'Start', next: 'IN_PROGRESS', color: 'bg-orange-600 text-white' },
    { label: 'Waiting on Parts', next: 'WAITING_ON_PARTS', color: 'bg-purple-600 text-white' },
    { label: 'Cancel', next: 'CANCELLED', color: 'bg-red-100 text-red-700' },
    { label: 'No-Show', next: 'NO_SHOW', color: 'bg-slate-200 text-slate-700' },
  ],
  WAITING_ON_PARTS: [
    { label: 'Parts Ready', next: 'CHECKED_IN', color: 'bg-cyan-600 text-white' },
  ],
  IN_PROGRESS: [
    { label: 'Complete', next: 'COMPLETED', color: 'bg-green-600 text-white' },
  ],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

const PART_STATUS_COLORS: Record<PartStatus, string> = {
  NEEDED: 'bg-yellow-100 text-yellow-800',
  ORDERED: 'bg-blue-100 text-blue-800',
  RECEIVED: 'bg-green-100 text-green-800',
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) +
    ' at ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' });
}

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function toLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getWeekRange(date: Date): { from: string; to: string; label: string } {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  const monday = new Date(d);
  const sunday = new Date(d);
  sunday.setDate(sunday.getDate() + 6);
  return {
    from: toLocalDateString(monday),
    to: toLocalDateString(sunday),
    label: `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
  };
}

function getDayRange(date: Date): { from: string; to: string; label: string } {
  const iso = toLocalDateString(date);
  return {
    from: iso,
    to: iso,
    label: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
  };
}

type ViewMode = 'calendar' | 'list';
type CalendarView = 'week' | 'day';

export default function BookingsPage() {
  const { merchant } = useMerchant();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<BookingStatus | ''>('');
  const [selected, setSelected] = useState<Booking | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [calView, setCalView] = useState<CalendarView>('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Walk-in modal state
  const [showWalkin, setShowWalkin] = useState(false);
  const [walkinDate, setWalkinDate] = useState<Date | null>(null);
  const [walkinServiceId, setWalkinServiceId] = useState('');
  const [walkinCustomerName, setWalkinCustomerName] = useState('');
  const [walkinCustomerEmail, setWalkinCustomerEmail] = useState('');
  const [walkinCustomerPhone, setWalkinCustomerPhone] = useState('');
  const [walkinNotes, setWalkinNotes] = useState('');
  const [walkinSubmitting, setWalkinSubmitting] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [walkinExistingCustomer, setWalkinExistingCustomer] = useState('');

  // Parts inline form
  const [addingPart, setAddingPart] = useState(false);
  const [newPartName, setNewPartName] = useState('');
  const [newPartNumber, setNewPartNumber] = useState('');

  const fetchBookings = useCallback(async () => {
    if (!merchant) return;
    setLoading(true);
    const params = new URLSearchParams({ merchantId: merchant.id });
    if (filter) params.set('status', filter);
    // For calendar, scope to visible range
    if (viewMode === 'calendar') {
      const range = calView === 'week' ? getWeekRange(currentDate) : getDayRange(currentDate);
      params.set('from', range.from + 'T00:00:00');
      params.set('to', range.to + 'T23:59:59');
    }
    const data = await api.get<Booking[]>(`/bookings?${params}`);
    setBookings(data);
    setLoading(false);
  }, [merchant, filter, viewMode, calView, currentDate]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  // Load services + customers for walk-in modal
  useEffect(() => {
    if (!merchant) return;
    api.get<Service[]>(`/services?merchantId=${merchant.id}&activeOnly=true`).then(setServices);
    api.get<Customer[]>(`/customers?merchantId=${merchant.id}`).then(setCustomers);
  }, [merchant]);

  async function updateStatus(bookingId: string, status: BookingStatus) {
    const updated = await api.patch<Booking>(`/bookings/${bookingId}/status`, { status });
    fetchBookings();
    if (selected?.id === bookingId) {
      setSelected(updated);
    }
  }

  function navigate(dir: -1 | 0 | 1) {
    if (dir === 0) {
      setCurrentDate(new Date());
      return;
    }
    const d = new Date(currentDate);
    if (calView === 'week') {
      d.setDate(d.getDate() + dir * 7);
    } else {
      d.setDate(d.getDate() + dir);
    }
    setCurrentDate(d);
  }

  function handleSlotClick(date: Date) {
    setWalkinDate(date);
    setWalkinServiceId(services[0]?.id || '');
    setWalkinCustomerName('');
    setWalkinCustomerEmail('');
    setWalkinCustomerPhone('');
    setWalkinNotes('');
    setWalkinExistingCustomer('');
    setShowWalkin(true);
  }

  async function handleWalkinSubmit() {
    if (!merchant || !walkinDate || !walkinServiceId) return;
    setWalkinSubmitting(true);
    try {
      const dateStr = walkinDate.toISOString().split('T')[0];
      const h = String(walkinDate.getHours()).padStart(2, '0');
      const m = String(walkinDate.getMinutes()).padStart(2, '0');

      let customerPayload: { name: string; email?: string; phone?: string };
      if (walkinExistingCustomer) {
        const c = customers.find((c) => c.id === walkinExistingCustomer);
        customerPayload = { name: c?.name || 'Walk-in', email: c?.email || undefined, phone: c?.phone || undefined };
      } else {
        customerPayload = {
          name: walkinCustomerName || 'Walk-in',
          email: walkinCustomerEmail || undefined,
          phone: walkinCustomerPhone || undefined,
        };
      }

      await api.post('/bookings', {
        merchantId: merchant.id,
        serviceId: walkinServiceId,
        date: dateStr,
        time: `${h}:${m}`,
        customer: customerPayload,
        notes: walkinNotes || undefined,
        isWalkIn: true,
      });
      setShowWalkin(false);
      fetchBookings();
    } finally {
      setWalkinSubmitting(false);
    }
  }

  // Parts management
  async function addPart() {
    if (!selected || !newPartName.trim()) return;
    const part = await api.post<BookingPart>('/booking-parts', {
      bookingId: selected.id,
      partName: newPartName.trim(),
      partNumber: newPartNumber.trim() || undefined,
    });
    setSelected({
      ...selected,
      parts: [...(selected.parts || []), part],
    });
    setNewPartName('');
    setNewPartNumber('');
    setAddingPart(false);
    fetchBookings();
  }

  async function updatePartStatus(partId: string, status: PartStatus) {
    if (!selected) return;
    const updated = await api.patch<BookingPart>(`/booking-parts/${partId}/status`, { status });
    setSelected({
      ...selected,
      parts: selected.parts?.map((p) => (p.id === partId ? updated : p)),
    });
    fetchBookings();
  }

  async function removePart(partId: string) {
    if (!selected) return;
    await api.delete(`/booking-parts/${partId}`);
    setSelected({
      ...selected,
      parts: selected.parts?.filter((p) => p.id !== partId),
    });
    fetchBookings();
  }

  const dateRange = calView === 'week' ? getWeekRange(currentDate) : getDayRange(currentDate);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Push notification prompt — button-triggered, never automatic */}
      <div className="mb-4">
        <PushPrompt />
      </div>

      {/* Header with view toggle + nav */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3 shrink-0">
        <h1 className="text-2xl font-bold text-slate-900 font-display tracking-tight">Bookings</h1>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View mode toggle */}
          <div className="flex bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'calendar' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Calendar className="w-4 h-4" /> Calendar
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <List className="w-4 h-4" /> List
            </button>
          </div>

          {/* Calendar sub-view */}
          {viewMode === 'calendar' && (
            <div className="flex bg-slate-100 rounded-lg p-0.5">
              <button
                onClick={() => setCalView('day')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  calView === 'day' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setCalView('week')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  calView === 'week' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Week
              </button>
            </div>
          )}

          {/* Status filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as BookingStatus | '')}
            className="premium-input py-1.5"
          >
            <option value="">All statuses</option>
            {Object.keys(STATUS_COLORS).map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>

          {/* New booking button */}
          <button
            onClick={() => handleSlotClick(new Date())}
            className="flex items-center gap-1.5 btn-primary px-3 py-1.5 text-sm"
          >
            <Plus className="w-4 h-4" /> Walk-in
          </button>
        </div>
      </div>

      {/* Calendar navigation */}
      {viewMode === 'calendar' && (
        <div className="flex items-center gap-3 mb-4 shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg hover:bg-warm-50 text-slate-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate(0)}
            className="px-3 py-1 rounded-lg hover:bg-warm-50 text-sm font-medium text-slate-600"
          >
            Today
          </button>
          <button
            onClick={() => navigate(1)}
            className="p-1.5 rounded-lg hover:bg-warm-50 text-slate-600"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-slate-700 font-display">{dateRange.label}</span>
        </div>
      )}

      {/* Content + Revenue Sidebar */}
      {loading ? (
        <div className="premium-card-static p-6 text-center">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <div className="text-slate-500 text-sm font-display">Loading bookings...</div>
        </div>
      ) : viewMode === 'calendar' ? (
        <div className="flex flex-1 min-h-0 gap-4">
          <div className="flex flex-col flex-1 min-h-0">
            <CalendarGrid
              bookings={bookings}
              startDate={currentDate}
              view={calView}
              onSlotClick={handleSlotClick}
              onBookingClick={setSelected}
            />
          </div>
          {merchant && (
            <RevenueSidebar
              merchantId={merchant.id}
              from={dateRange.from}
              to={dateRange.to}
            />
          )}
        </div>
      ) : (
        /* List view */
        bookings.length === 0 ? (
          <div className="premium-card-static p-12 text-center">
            <div className="text-slate-500 font-display">No bookings {filter ? `with status "${filter.replace(/_/g, ' ')}"` : 'yet'}.</div>
          </div>
        ) : (
          <div className="premium-card-static overflow-hidden">
            <table className="w-full">
              <thead className="bg-warm-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Date / Time</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Customer</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Service</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Vehicle</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-warm-50 cursor-pointer"
                    onClick={() => setSelected(b)}
                  >
                    <td className="px-4 py-3 text-sm text-slate-900">{formatDateTime(b.startsAt)}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {b.customer?.name || '—'}
                      {b.isWalkIn && <span className="ml-1 text-[10px] text-orange-600 font-medium">(walk-in)</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{b.service?.name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {b.vehicle ? `${b.vehicle.year || ''} ${b.vehicle.make || ''} ${b.vehicle.model || ''}`.trim() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[b.status]}`}>
                        {b.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Detail panel (slide-out) */}
      {selected && (
        <div className="fixed inset-0 bg-black/30 z-50 flex justify-end animate-fade-in">
          <div className="bg-white w-full max-w-md shadow-[var(--shadow-elevated)] overflow-y-auto animate-slide-in-right rounded-l-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold font-display">Booking Details</h3>
              <button onClick={() => { setSelected(null); setAddingPart(false); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-5">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400 font-medium mb-1">Status</div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${STATUS_COLORS[selected.status]}`}>
                    {selected.status.replace(/_/g, ' ')}
                  </span>
                  {selected.isWalkIn && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">Walk-in</span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400 font-medium mb-1">Date & Time</div>
                <div className="text-sm font-medium font-display">{formatDateTime(selected.startsAt)}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400 font-medium mb-1">Service</div>
                <div className="text-sm font-medium font-display">
                  {selected.service?.name} — {formatPrice(selected.service?.priceCents || 0)}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400 font-medium mb-1">Customer</div>
                <div className="text-sm font-medium font-display">{selected.customer?.name}</div>
                {selected.customer?.email && <div className="text-sm text-slate-500">{selected.customer.email}</div>}
                {selected.customer?.phone && <div className="text-sm text-slate-500">{selected.customer.phone}</div>}
              </div>
              {selected.vehicle && (
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-400 font-medium mb-1">Vehicle</div>
                  <div className="text-sm font-medium">
                    {[selected.vehicle.year, selected.vehicle.make, selected.vehicle.model, selected.vehicle.trim]
                      .filter(Boolean)
                      .join(' ')}
                  </div>
                </div>
              )}
              {selected.intakeData && Object.keys(selected.intakeData).length > 0 && (
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-400 font-medium mb-1">Vehicle Intake</div>
                  <div className="premium-card-static p-3 text-sm space-y-1">
                    {Object.entries(selected.intakeData).map(([key, val]) => (
                      <div key={key}>
                        <span className="font-medium text-slate-700">{key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}:</span>{' '}
                        <span className="text-slate-600">{Array.isArray(val) ? (val as string[]).join(', ') : String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Deposit info */}
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400 font-medium mb-1">Deposit</div>
                {selected.depositAmountCents && selected.depositPaidAt ? (
                  <div className="text-sm font-medium text-green-600">
                    {formatPrice(selected.depositAmountCents)} paid on{' '}
                    {new Date(selected.depositPaidAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                ) : (
                  <div className="text-sm text-slate-400">None</div>
                )}
              </div>

              {selected.notes && (
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-400 font-medium mb-1">Notes</div>
                  <div className="text-sm">{selected.notes}</div>
                </div>
              )}

              {/* Parts section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs uppercase tracking-wide text-slate-400 font-medium flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" />
                    Parts
                  </div>
                  {!addingPart && (
                    <button
                      onClick={() => setAddingPart(true)}
                      className="text-xs text-primary hover:text-primary-dark font-medium"
                    >
                      + Add Part
                    </button>
                  )}
                </div>

                {(selected.parts && selected.parts.length > 0) ? (
                  <div className="space-y-2">
                    {selected.parts.map((part) => (
                      <div key={part.id} className="flex items-center gap-2 premium-card-static px-3 py-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-900 truncate">{part.partName}</div>
                          {part.partNumber && (
                            <div className="text-[10px] text-slate-400 truncate">#{part.partNumber}</div>
                          )}
                        </div>
                        <select
                          value={part.status}
                          onChange={(e) => updatePartStatus(part.id, e.target.value as PartStatus)}
                          className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${PART_STATUS_COLORS[part.status]}`}
                        >
                          <option value="NEEDED">Needed</option>
                          <option value="ORDERED">Ordered</option>
                          <option value="RECEIVED">Received</option>
                        </select>
                        <button
                          onClick={() => removePart(part.id)}
                          className="text-slate-300 hover:text-red-500 text-xs"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : !addingPart ? (
                  <div className="text-sm text-slate-400">No parts tracked</div>
                ) : null}

                {/* Add part form */}
                {addingPart && (
                  <div className="mt-2 space-y-2 premium-card-static p-3">
                    <input
                      value={newPartName}
                      onChange={(e) => setNewPartName(e.target.value)}
                      placeholder="Part name *"
                      className="premium-input w-full py-1.5"
                      autoFocus
                    />
                    <input
                      value={newPartNumber}
                      onChange={(e) => setNewPartNumber(e.target.value)}
                      placeholder="Part number (optional)"
                      className="premium-input w-full py-1.5"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={addPart}
                        disabled={!newPartName.trim()}
                        className="btn-primary px-3 py-1.5 text-xs disabled:opacity-50"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => { setAddingPart(false); setNewPartName(''); setNewPartNumber(''); }}
                        className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Status transitions */}
              {STATUS_TRANSITIONS[selected.status].length > 0 && (
                <div className="pt-2 flex gap-2 flex-wrap">
                  {STATUS_TRANSITIONS[selected.status].map((t) => (
                    <button
                      key={t.next}
                      onClick={() => updateStatus(selected.id, t.next)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg shadow-sm transition-colors ${t.color}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Walk-in Modal */}
      {showWalkin && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="premium-card-static shadow-[var(--shadow-elevated)] w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold font-display">New Walk-in Booking</h3>
              <button onClick={() => setShowWalkin(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Service */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Service *</label>
                <select
                  value={walkinServiceId}
                  onChange={(e) => setWalkinServiceId(e.target.value)}
                  className="premium-input w-full"
                >
                  <option value="">Select a service</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.durationMins}min — {formatPrice(s.priceCents)})</option>
                  ))}
                </select>
              </div>

              {/* Date/Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={walkinDate?.toISOString().split('T')[0] || ''}
                    onChange={(e) => {
                      const d = walkinDate ? new Date(walkinDate) : new Date();
                      const [y, mo, day] = e.target.value.split('-').map(Number);
                      d.setFullYear(y, mo - 1, day);
                      setWalkinDate(d);
                    }}
                    className="premium-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={walkinDate ? `${String(walkinDate.getHours()).padStart(2, '0')}:${String(walkinDate.getMinutes()).padStart(2, '0')}` : ''}
                    onChange={(e) => {
                      const d = walkinDate ? new Date(walkinDate) : new Date();
                      const [h, m] = e.target.value.split(':').map(Number);
                      d.setHours(h, m, 0, 0);
                      setWalkinDate(d);
                    }}
                    className="premium-input w-full"
                  />
                </div>
              </div>

              {/* Customer */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Customer</label>
                <select
                  value={walkinExistingCustomer}
                  onChange={(e) => setWalkinExistingCustomer(e.target.value)}
                  className="premium-input w-full mb-2"
                >
                  <option value="">New customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>
                  ))}
                </select>
                {!walkinExistingCustomer && (
                  <div className="space-y-2">
                    <input
                      value={walkinCustomerName}
                      onChange={(e) => setWalkinCustomerName(e.target.value)}
                      placeholder="Name"
                      className="premium-input w-full"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="email"
                        value={walkinCustomerEmail}
                        onChange={(e) => setWalkinCustomerEmail(e.target.value)}
                        placeholder="Email"
                        className="premium-input w-full"
                      />
                      <input
                        type="tel"
                        value={walkinCustomerPhone}
                        onChange={(e) => setWalkinCustomerPhone(e.target.value)}
                        placeholder="Phone"
                        className="premium-input w-full"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea
                  value={walkinNotes}
                  onChange={(e) => setWalkinNotes(e.target.value)}
                  rows={2}
                  placeholder="Any notes for this booking?"
                  className="premium-input w-full"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowWalkin(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWalkinSubmit}
                  disabled={!walkinServiceId || walkinSubmitting}
                  className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
                >
                  {walkinSubmitting ? 'Creating...' : 'Create Booking'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
