import { Package } from 'lucide-react';
import type { Booking, BookingStatus } from '../types';

const STATUS_BORDER: Record<BookingStatus, string> = {
  PENDING: 'border-l-yellow-400',
  CONFIRMED: 'border-l-blue-500',
  CHECKED_IN: 'border-l-cyan-500',
  WAITING_ON_PARTS: 'border-l-purple-500',
  IN_PROGRESS: 'border-l-orange-500',
  COMPLETED: 'border-l-green-500',
  CANCELLED: 'border-l-red-400',
  NO_SHOW: 'border-l-slate-400',
};

const STATUS_BG: Record<BookingStatus, string> = {
  PENDING: 'bg-yellow-50 hover:bg-yellow-100/70',
  CONFIRMED: 'bg-blue-50 hover:bg-blue-100/70',
  CHECKED_IN: 'bg-cyan-50 hover:bg-cyan-100/70',
  WAITING_ON_PARTS: 'bg-purple-50 hover:bg-purple-100/70',
  IN_PROGRESS: 'bg-orange-50 hover:bg-orange-100/70',
  COMPLETED: 'bg-green-50 hover:bg-green-100/70',
  CANCELLED: 'bg-red-50/50 hover:bg-red-100/50',
  NO_SHOW: 'bg-slate-50 hover:bg-slate-100/70',
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

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(booking); }}
      className={`absolute left-0.5 right-0.5 border-l-3 rounded-r-lg overflow-hidden cursor-pointer shadow-sm transition-all hover:shadow-md hover:scale-[1.01] text-left ${STATUS_BORDER[booking.status]} ${STATUS_BG[booking.status]}`}
      style={{ top: `${topPx}px`, height: `${Math.max(heightPx, 20)}px` }}
    >
      <div className={`px-2 ${isShort ? 'py-0.5' : 'py-1'}`}>
        <div className={`font-medium text-slate-900 truncate font-display ${isShort ? 'text-[10px]' : 'text-xs'} flex items-center gap-1`}>
          {hasPendingParts && <Package className="w-3 h-3 text-purple-500 shrink-0" />}
          <span className="truncate">{booking.service?.name || 'Service'}</span>
        </div>
        {!isShort && (
          <div className="text-[10px] text-slate-500 truncate">
            {booking.customer?.name || 'Walk-in'}
          </div>
        )}
      </div>
    </button>
  );
}
