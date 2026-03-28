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
    <div className={`hidden lg:flex flex-col glass-panel-static shrink-0 transition-all ${collapsed ? 'w-10' : 'w-[280px]'}`}>
      <button onClick={() => setCollapsed(!collapsed)} className="p-2 self-end text-gray-500 hover:text-white" title={collapsed ? 'Expand stats' : 'Collapse stats'}>
        <ChevronRight className={`w-4 h-4 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
      </button>
      {collapsed ? (
        <div className="flex flex-col items-center gap-3 py-4">
          <DollarSign className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
          <CalendarCheck className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
          <TrendingUp className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
        </div>
      ) : loading ? (
        <div className="flex-1 flex items-center justify-center"><div className="w-5 h-5 border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }} /></div>
      ) : stats ? (
        <div className="px-4 pb-4 space-y-4">
          <h3 className="text-sm font-semibold text-white font-display">Weekly Stats</h3>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-mono-custom" style={{ color: 'var(--color-text-muted)' }}><DollarSign className="w-3.5 h-3.5" />Revenue Booked</div>
            <div className="text-2xl font-bold text-white font-display">{formatDollars(stats.revenueBookedCents)}</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-mono-custom" style={{ color: 'var(--color-text-muted)' }}><DollarSign className="w-3.5 h-3.5" style={{ color: 'var(--color-success)' }} />Revenue Completed</div>
            <div className="text-xl font-bold font-display" style={{ color: 'var(--color-success)' }}>{formatDollars(stats.revenueCompletedCents)}</div>
          </div>
          <hr style={{ borderColor: 'var(--color-border)' }} />
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-mono-custom" style={{ color: 'var(--color-text-muted)' }}><CalendarCheck className="w-3.5 h-3.5" />Bookings</div>
            <div className="text-lg font-semibold text-white font-display">{stats.bookingsTotal}</div>
            <div className="flex gap-3 text-xs">
              <span style={{ color: 'var(--color-success)' }}>{stats.bookingsCompleted} completed</span>
              {stats.bookingsCancelled > 0 && <span style={{ color: 'var(--color-danger)' }}>{stats.bookingsCancelled} cancelled</span>}
              {stats.bookingsNoShow > 0 && <span style={{ color: 'var(--color-text-muted)' }}>{stats.bookingsNoShow} no-show</span>}
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-mono-custom" style={{ color: 'var(--color-text-muted)' }}><TrendingUp className="w-3.5 h-3.5" />Completion Rate</span>
              <span className="font-semibold text-white">{formatPercent(stats.completionRate)}</span>
            </div>
            <div className="w-full h-1.5" style={{ background: 'var(--color-bg-surface)' }}>
              <div className="h-1.5 transition-all" style={{ width: `${Math.round(stats.completionRate * 100)}%`, backgroundColor: 'var(--color-success)' }} />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-mono-custom" style={{ color: 'var(--color-text-muted)' }}><Users className="w-3.5 h-3.5" />Walk-in Ratio</span>
              <span className="font-semibold text-white">{formatPercent(stats.walkInRatio)}</span>
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{stats.walkInCount} walk-in{stats.walkInCount !== 1 ? 's' : ''} this week</div>
          </div>
        </div>
      ) : (
        <div className="px-4 pb-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>No data</div>
      )}
    </div>
  );
}
