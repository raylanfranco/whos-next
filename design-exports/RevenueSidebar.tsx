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
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="p-2 self-end"
        style={{ color: 'var(--color-text-muted)' }}
        title={collapsed ? 'Expand stats' : 'Collapse stats'}
      >
        <ChevronRight className={`w-4 h-4 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
      </button>

      {collapsed ? (
        <div className="flex flex-col items-center gap-3 py-4">
          <DollarSign className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
          <CalendarCheck className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
          <TrendingUp className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
        </div>
      ) : loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }} />
        </div>
      ) : stats ? (
        <div className="px-4 pb-4 space-y-5">
          {/* Title */}
          <div className="text-[10px] font-mono-custom uppercase tracking-widest" style={{ color: 'var(--color-accent-dim)' }}>
            Weekly Uplink Stats
          </div>

          {/* Revenue Booked */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-mono-custom uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
              <DollarSign className="w-3 h-3" style={{ color: 'var(--color-accent)' }} />
              Revenue Booked
            </div>
            <div className="text-2xl font-display" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#ffffff' }}>
              {formatDollars(stats.revenueBookedCents)}
            </div>
          </div>

          {/* Revenue Completed */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-mono-custom uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
              <DollarSign className="w-3 h-3" style={{ color: 'var(--color-success)' }} />
              Revenue Completed
            </div>
            <div className="text-xl font-display" style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--color-success)' }}>
              {formatDollars(stats.revenueCompletedCents)}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--color-border-accent)' }} />

          {/* Bookings count */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-mono-custom uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
              <CalendarCheck className="w-3 h-3" style={{ color: 'var(--color-accent)' }} />
              Bookings
            </div>
            <div className="text-2xl" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#ffffff' }}>
              {stats.bookingsTotal}
            </div>
            <div className="flex gap-3 text-[10px] font-mono-custom">
              <span style={{ color: 'var(--color-success)' }}>{stats.bookingsCompleted} completed</span>
              {stats.bookingsCancelled > 0 && <span style={{ color: 'var(--color-danger)' }}>{stats.bookingsCancelled} cancelled</span>}
              {stats.bookingsNoShow > 0 && <span style={{ color: 'var(--color-text-muted)' }}>{stats.bookingsNoShow} no-show</span>}
            </div>
          </div>

          {/* Completion Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono-custom uppercase tracking-wider">
              <span className="flex items-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                <TrendingUp className="w-3 h-3" style={{ color: 'var(--color-accent)' }} />
                Completion Rate
              </span>
              <span className="text-2xl" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#ffffff' }}>
                {formatPercent(stats.completionRate)}
              </span>
            </div>
            <div className="w-full h-1" style={{ backgroundColor: 'var(--color-surface-2)' }}>
              <div
                className="h-1 transition-all"
                style={{ width: `${Math.round(stats.completionRate * 100)}%`, backgroundColor: 'var(--color-accent)', boxShadow: '0 0 8px rgba(255, 179, 71, 0.5)' }}
              />
            </div>
          </div>

          {/* Walk-in Ratio */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono-custom uppercase tracking-wider">
              <span className="flex items-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                <Users className="w-3 h-3" style={{ color: 'var(--color-accent)' }} />
                Walk-in Ratio
              </span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#ffffff' }}>
                {formatPercent(stats.walkInRatio)}
              </span>
            </div>
            <div className="text-[10px] font-mono-custom" style={{ color: 'var(--color-text-muted)' }}>
              {stats.walkInCount} walk-in{stats.walkInCount !== 1 ? 's' : ''} this week
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4 pb-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>No data</div>
      )}
    </div>
  );
}
