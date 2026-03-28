import { Package } from 'lucide-react';
import type { Booking, BookingStatus } from '../types';

const STATUS_BORDER: Record<BookingStatus, string> = {
  PENDING: 'rgba(255, 179, 71, 0.6)',
  CONFIRMED: 'rgba(59, 130, 246, 0.6)',
  CHECKED_IN: 'rgba(6, 182, 212, 0.6)',
  WAITING_ON_PARTS: 'rgba(168, 85, 247, 0.6)',
  IN_PROGRESS: 'rgba(249, 115, 22, 0.6)',
  COMPLETED: 'rgba(16, 185, 129, 0.6)',
  CANCELLED: 'rgba(239, 68, 68, 0.4)',
  NO_SHOW: 'rgba(100, 116, 139, 0.4)',
};

const STATUS_BG: Record<BookingStatus, string> = {
  PENDING: 'rgba(255, 179, 71, 0.08)',
  CONFIRMED: 'rgba(59, 130, 246, 0.08)',
  CHECKED_IN: 'rgba(6, 182, 212, 0.08)',
  WAITING_ON_PARTS: 'rgba(168, 85, 247, 0.08)',
  IN_PROGRESS: 'rgba(249, 115, 22, 0.08)',
  COMPLETED: 'rgba(16, 185, 129, 0.08)',
  CANCELLED: 'rgba(239, 68, 68, 0.06)',
  NO_SHOW: 'rgba(100, 116, 139, 0.06)',
};

const STATUS_BG_HOVER: Record<BookingStatus, string> = {
  PENDING: 'rgba(255, 179, 71, 0.14)',
  CONFIRMED: 'rgba(59, 130, 246, 0.14)',
  CHECKED_IN: 'rgba(6, 182, 212, 0.14)',
  WAITING_ON_PARTS: 'rgba(168, 85, 247, 0.14)',
  IN_PROGRESS: 'rgba(249, 115, 22, 0.14)',
  COMPLETED: 'rgba(16, 185, 129, 0.14)',
  CANCELLED: 'rgba(239, 68, 68, 0.1)',
  NO_SHOW: 'rgba(100, 116, 139, 0.1)',
};

const STATUS_TEXT: Record<BookingStatus, string> = {
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

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(booking); }}
      className="absolute left-0.5 right-0.5 overflow-hidden cursor-pointer transition-all text-left"
      style={{
        top: `${topPx}px`,
        height: `${Math.max(heightPx, 20)}px`,
        background: STATUS_BG[booking.status],
        borderLeft: `3px solid ${STATUS_BORDER[booking.status]}`,
        opacity: isCancelled ? 0.5 : 1,
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = STATUS_BG_HOVER[booking.status]; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = STATUS_BG[booking.status]; }}
    >
      <div className={`px-2 ${isShort ? 'py-0.5' : 'py-1'}`}>
        <div
          className={`font-medium truncate font-display ${isShort ? 'text-[10px]' : 'text-xs'} flex items-center gap-1`}
          style={{ color: STATUS_TEXT[booking.status] }}
        >
          {hasPendingParts && <Package className="w-3 h-3 shrink-0" style={{ color: '#C084FC' }} />}
          <span className="truncate">{booking.service?.name || 'Service'}</span>
        </div>
        {!isShort && (
          <div className="text-[10px] truncate" style={{ color: 'var(--color-text-muted)' }}>
            {booking.customer?.name || 'Walk-in'}
          </div>
        )}
      </div>
    </button>
  );
}
