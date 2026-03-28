import { Package } from 'lucide-react';
import type { Booking, BookingStatus } from '../types';

const STATUS_BORDER: Record<BookingStatus, string> = {
  PENDING: '#FFB347',
  CONFIRMED: '#60A5FA',
  CHECKED_IN: '#22D3EE',
  WAITING_ON_PARTS: '#C084FC',
  IN_PROGRESS: '#FB923C',
  COMPLETED: '#34D399',
  CANCELLED: '#F87171',
  NO_SHOW: '#94A3B8',
};

interface BookingBlockProps {
  booking: Booking;
  heightPx: number;
  topPx: number;
  dayColumnWidth?: number;
  onClick: (booking: Booking) => void;
}

export default function BookingBlock({ booking, heightPx, topPx, onClick }: BookingBlockProps) {
  const isShort = heightPx < 44;
  const hasPendingParts = booking.parts?.some((p) => p.status !== 'RECEIVED');
  const isCancelled = booking.status === 'CANCELLED' || booking.status === 'NO_SHOW';
  const borderColor = STATUS_BORDER[booking.status];

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(booking); }}
      className={`absolute left-1 right-1 overflow-hidden cursor-pointer transition-all text-left group z-20 ${isCancelled ? 'opacity-80' : ''}`}
      style={{
        top: `${topPx}px`,
        height: `${Math.max(heightPx, 20)}px`,
        borderLeft: `3px solid ${borderColor}`,
        background: isCancelled ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 179, 71, 0.06)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${isCancelled ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 179, 71, 0.15)'}`,
        borderLeftWidth: '3px',
        borderLeftColor: borderColor,
      }}
    >
      <div className={`px-2.5 ${isShort ? 'py-0.5' : 'py-1.5'} flex flex-col h-full`}>
        <div className={`font-medium text-white truncate font-display ${isShort ? 'text-[10px]' : 'text-xs'} flex items-center gap-1`}>
          {hasPendingParts && <Package className="w-3 h-3 shrink-0" style={{ color: '#C084FC' }} />}
          <span className="truncate">{booking.service?.name || 'Service'}</span>
        </div>
        {!isShort && (
          <>
            <div className="text-[10px] tracking-wide" style={{ color: 'var(--color-text-secondary)', fontFamily: "'JetBrains Mono', monospace" }}>
              {booking.customer?.name || 'Walk-in'}
            </div>
            {heightPx > 70 && booking.notes && (
              <div className="text-[10px] mt-1 border-l-2 pl-2 opacity-70 truncate" style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--color-text-secondary)', borderLeftColor: 'rgba(255, 255, 255, 0.08)' }}>
                {booking.notes}
              </div>
            )}
          </>
        )}
      </div>
    </button>
  );
}
