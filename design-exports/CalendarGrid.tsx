import { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import BookingBlock from './BookingBlock';
import type { Booking } from '../types';

interface CalendarGridProps {
  bookings: Booking[];
  startDate: Date;
  view: 'week' | 'day';
  startHour?: number;
  endHour?: number;
  onSlotClick: (date: Date) => void;
  onBookingClick: (booking: Booking) => void;
}

const MIN_HOUR_HEIGHT = 48;

function getWeekDates(start: Date): Date[] {
  const dates: Date[] = [];
  const d = new Date(start);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  for (let i = 0; i < 7; i++) {
    dates.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function isToday(d: Date): boolean {
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function formatHour(h: number): string {
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}

function formatDayHeader(d: Date): { weekday: string; day: string } {
  return {
    weekday: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
    day: d.toLocaleDateString('en-US', { day: 'numeric' }),
  };
}

export default function CalendarGrid({ bookings, startDate, view, startHour = 8, endHour = 19, onSlotClick, onBookingClick }: CalendarGridProps) {
  const hours = useMemo(() => { const h: number[] = []; for (let i = startHour; i < endHour; i++) h.push(i); return h; }, [startHour, endHour]);
  const columns = useMemo(() => { if (view === 'day') return [new Date(startDate)]; return getWeekDates(startDate); }, [startDate, view]);
  const gridRef = useRef<HTMLDivElement>(null);
  const [hourHeight, setHourHeight] = useState(64);

  useEffect(() => { const el = gridRef.current; if (!el) return; const update = () => { const h = el.clientHeight; if (h > 0) setHourHeight(Math.max(MIN_HOUR_HEIGHT, h / hours.length)); }; update(); const ro = new ResizeObserver(update); ro.observe(el); return () => ro.disconnect(); }, [hours.length]);

  const totalHeight = hours.length * hourHeight;

  const columnBookings = useMemo(() => {
    const map = new Map<number, Booking[]>();
    columns.forEach((_, i) => map.set(i, []));
    bookings.forEach((b) => {
      const bDateStr = b.startsAt.slice(0, 10);
      const colIndex = columns.findIndex((c) => {
        const y = c.getFullYear();
        const m = String(c.getMonth() + 1).padStart(2, '0');
        const d = String(c.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}` === bDateStr;
      });
      if (colIndex !== -1) map.get(colIndex)!.push(b);
    });
    return map;
  }, [bookings, columns]);

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const showNowLine = nowMinutes >= startHour * 60 && nowMinutes < endHour * 60;
  const nowTop = ((nowMinutes - startHour * 60) / 60) * hourHeight;

  const getBookingPosition = useCallback((b: Booking): { topPx: number; heightPx: number } => {
    const start = new Date(b.startsAt);
    const end = new Date(b.endsAt);
    const startMins = start.getUTCHours() * 60 + start.getUTCMinutes();
    const endMins = end.getUTCHours() * 60 + end.getUTCMinutes();
    const topPx = ((startMins - startHour * 60) / 60) * hourHeight;
    const heightPx = ((endMins - startMins) / 60) * hourHeight;
    return { topPx, heightPx };
  }, [startHour, hourHeight]);

  function handleColumnClick(colIndex: number, e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const minutesFromStart = (y / hourHeight) * 60;
    const totalMinutes = startHour * 60 + minutesFromStart;
    const snapped = Math.round(totalMinutes / 30) * 30;
    const h = Math.floor(snapped / 60);
    const m = snapped % 60;
    const date = new Date(columns[colIndex]);
    date.setHours(h, m, 0, 0);
    onSlotClick(date);
  }

  return (
    <div className="glass-panel-static overflow-hidden flex flex-col flex-1 min-h-0">
      {/* Day headers */}
      <div className="flex shrink-0" style={{ borderBottom: '1px solid var(--color-border-accent)' }}>
        <div className="w-16 shrink-0" />
        {columns.map((d, i) => {
          const { weekday, day } = formatDayHeader(d);
          const today = isToday(d);
          const weekend = d.getDay() === 0 || d.getDay() === 6;
          return (
            <div
              key={i}
              className="flex-1 text-center py-3"
              style={{ borderLeft: '1px solid var(--color-border)', background: today ? 'var(--color-accent-subtle)' : undefined }}
            >
              <div
                className="text-[10px] font-mono-custom uppercase tracking-widest mb-1"
                style={{ color: today ? 'var(--color-accent)' : weekend ? 'var(--color-text-muted)' : 'var(--color-text-secondary)' }}
              >
                {weekday}
              </div>
              <div
                className="text-lg font-semibold font-display"
                style={{ color: today ? 'var(--color-accent)' : 'var(--color-text-primary)' }}
              >
                {day}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div ref={gridRef} className="flex-1 min-h-0 overflow-y-auto relative">
        <div className="flex relative" style={{ height: `${totalHeight}px` }}>
          {/* Hour labels */}
          <div className="w-16 shrink-0 relative">
            {hours.map((h) => (
              <div
                key={h}
                className="absolute right-2 text-[10px] font-mono-custom -translate-y-1/2"
                style={{ top: `${(h - startHour) * hourHeight}px`, color: 'var(--color-text-muted)' }}
              >
                {formatHour(h)}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {columns.map((colDate, colIdx) => (
            <div
              key={colIdx}
              className="flex-1 relative cursor-pointer"
              style={{ borderLeft: '1px solid var(--color-border)' }}
              onClick={(e) => handleColumnClick(colIdx, e)}
            >
              {/* Hour lines */}
              {hours.map((h) => (
                <div
                  key={h}
                  className="absolute left-0 right-0"
                  style={{ top: `${(h - startHour) * hourHeight}px`, borderTop: '1px solid var(--color-border)' }}
                />
              ))}
              {/* Half-hour lines */}
              {hours.map((h) => (
                <div
                  key={`half-${h}`}
                  className="absolute left-0 right-0"
                  style={{ top: `${(h - startHour) * hourHeight + hourHeight / 2}px`, borderTop: '1px dashed rgba(255, 255, 255, 0.03)' }}
                />
              ))}

              {/* Booking blocks */}
              {(columnBookings.get(colIdx) || []).map((b) => {
                const { topPx, heightPx } = getBookingPosition(b);
                return <BookingBlock key={b.id} booking={b} topPx={topPx} heightPx={heightPx} onClick={onBookingClick} />;
              })}

              {/* Now line */}
              {showNowLine && isToday(colDate) && (
                <div className="absolute left-0 right-0 z-30 pointer-events-none" style={{ top: `${nowTop}px` }}>
                  <div className="flex items-center">
                    <div className="w-2 h-2 -ml-1" style={{ backgroundColor: 'var(--color-accent)', boxShadow: '0 0 8px var(--color-accent)' }} />
                    <div className="flex-1 h-0.5" style={{ backgroundColor: 'var(--color-accent)', boxShadow: '0 0 8px var(--color-accent)' }} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
