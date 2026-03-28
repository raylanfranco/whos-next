import { useState, useEffect } from 'react';
import { ChevronRight, DollarSign, CalendarCheck, Users, TrendingUp } from 'lucide-react';
import { api } from '../lib/api';
import type { BookingStats } from '../types';

interface RevenueSidebarProps {
  merchantId: string;
  from: string;
  to: string;
}

function formatDollars(cents: number) {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatPercent(ratio: number) {
  return `${Math.round(ratio * 100)}%`;
}

export default function RevenueSidebar({ merchantId, from, to }: RevenueSidebarProps) {
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get<BookingStats>(`/bookings/stats?merchantId=${merchantId}&from=${from}T00:00:00&to=${to}T23:59:59`).then(setStats).catch(() => setStats(null)).finally(() => setLoading(false));
  }, [merchantId, from, to]);

  return (
    <div className={`hidden lg:flex flex-col premium-card-static shrink-0 transition-all ${collapsed ? 'w-10' : 'w-[280px]'}`}>
      <button onClick={() => setCollapsed(!collapsed)} className="p-2 text-slate-400 hover:text-slate-600 self-end" title={collapsed ? 'Expand stats' : 'Collapse stats'}>
        <ChevronRight className={`w-4 h-4 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
      </button>
      {collapsed ? (
        <div className="flex flex-col items-center gap-3 py-4">
          <DollarSign className="w-4 h-4 text-slate-400" />
          <CalendarCheck className="w-4 h-4 text-slate-400" />
          <TrendingUp className="w-4 h-4 text-slate-400" />
        </div>
      ) : loading ? (
        <div className="flex-1 flex items-center justify-center"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : stats ? (
        <div className="px-4 pb-4 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 font-display">Weekly Stats</h3>
          <div className="space-y-1"><div className="flex items-center gap-1.5 text-xs text-slate-500"><DollarSign className="w-3.5 h-3.5" />Revenue Booked</div><div className="text-2xl font-bold text-slate-900 font-display">{formatDollars(stats.revenueBookedCents)}</div></div>
          <div className="space-y-1"><div className="flex items-center gap-1.5 text-xs text-slate-500"><DollarSign className="w-3.5 h-3.5 text-green-500" />Revenue Completed</div><div className="text-xl font-bold text-green-600 font-display">{formatDollars(stats.revenueCompletedCents)}</div></div>
          <hr className="border-slate-50" />
          <div className="space-y-1"><div className="flex items-center gap-1.5 text-xs text-slate-500"><CalendarCheck className="w-3.5 h-3.5" />Bookings</div><div className="text-lg font-semibold text-slate-900 font-display">{stats.bookingsTotal}</div><div className="flex gap-3 text-xs text-slate-500"><span className="text-green-600">{stats.bookingsCompleted} completed</span>{stats.bookingsCancelled > 0 && <span className="text-red-500">{stats.bookingsCancelled} cancelled</span>}{stats.bookingsNoShow > 0 && <span className="text-slate-400">{stats.bookingsNoShow} no-show</span>}</div></div>
          <div className="space-y-1.5"><div className="flex items-center justify-between text-xs"><span className="text-slate-500 flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" />Completion Rate</span><span className="font-semibold text-slate-900">{formatPercent(stats.completionRate)}</span></div><div className="w-full bg-warm-50 rounded-full h-1.5"><div className="bg-green-500 rounded-full h-1.5 transition-all" style={{ width: `${Math.round(stats.completionRate * 100)}%` }} /></div></div>
          <div className="space-y-1.5"><div className="flex items-center justify-between text-xs"><span className="text-slate-500 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />Walk-in Ratio</span><span className="font-semibold text-slate-900">{formatPercent(stats.walkInRatio)}</span></div><div className="text-xs text-slate-400">{stats.walkInCount} walk-in{stats.walkInCount !== 1 ? 's' : ''} this week</div></div>
        </div>
      ) : (
        <div className="px-4 pb-4 text-sm text-slate-400">No data</div>
      )}
    </div>
  );
}
