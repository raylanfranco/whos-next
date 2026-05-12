import { useMemo, useState } from 'react';
import type { Merchant, Service } from '../types';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

interface StepDateTimeProps {
  merchant: Merchant | null;
  service: Service | null;
  selectedDate: string;
  selectedTime: string;
  slots: string[];
  slotsLoading: boolean;
  onSelectDate: (date: string) => void;
  onSelectTime: (time: string) => void;
}

function todayString(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function dateKey(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

function formatLongDate(year: number, month: number, day: number): string {
  const date = new Date(year, month, day);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return `${dayNames[date.getDay()]}, ${MONTH_NAMES[month]} ${day}`;
}

function formatSlotTime(time: string): string {
  const [hh, mm] = time.split(':').map(Number);
  const ampm = hh >= 12 ? 'PM' : 'AM';
  const hour = hh > 12 ? hh - 12 : hh === 0 ? 12 : hh;
  return `${hour}:${String(mm).padStart(2, '0')} ${ampm}`;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function StepDateTime({
  merchant,
  service,
  selectedDate,
  selectedTime,
  slots,
  slotsLoading,
  onSelectDate,
  onSelectTime,
}: StepDateTimeProps) {
  const today = todayString();

  const initial = selectedDate ? new Date(`${selectedDate}T00:00:00`) : new Date();
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const shopHours = (merchant?.shopHours as Record<string, unknown> | null) ?? null;
  const blockedSet = useMemo(() => {
    const set = new Set<string>();
    (merchant?.blockedDates ?? []).forEach((b) => {
      const d = typeof b.date === 'string' ? b.date.slice(0, 10) : '';
      if (d) set.add(d);
    });
    return set;
  }, [merchant]);

  function isDayOpen(year: number, month: number, day: number): boolean {
    const key = dateKey(year, month, day);
    if (key < today) return false;
    if (blockedSet.has(key)) return false;
    if (!shopHours) return true; // No hours configured = open by default
    const dow = new Date(year, month, day).getDay();
    return !!shopHours[DAY_KEYS[dow]];
  }

  function isToday(year: number, month: number, day: number): boolean {
    return dateKey(year, month, day) === today;
  }

  function gotoPrev() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }
  function gotoNext() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  const total = daysInMonth(viewYear, viewMonth);
  const offset = firstDayOfMonth(viewYear, viewMonth);
  const cells: { day: number; key: string; state: 'available' | 'disabled' | 'today' }[] = [];
  for (let d = 1; d <= total; d++) {
    const key = dateKey(viewYear, viewMonth, d);
    const open = isDayOpen(viewYear, viewMonth, d);
    const isT = isToday(viewYear, viewMonth, d);
    cells.push({
      day: d,
      key,
      state: isT ? 'today' : open ? 'available' : 'disabled',
    });
  }

  const selectedYearMonth = selectedDate
    ? { year: parseInt(selectedDate.slice(0, 4), 10), month: parseInt(selectedDate.slice(5, 7), 10) - 1, day: parseInt(selectedDate.slice(8, 10), 10) }
    : null;

  return (
    <main
      className="bk-step-enter"
      style={{
        flex: 1,
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '3rem 1.5rem 5rem',
      }}
    >
      <header className="bk-heading" style={{ marginBottom: '2.5rem' }}>
        <h1
          className="bk-display"
          style={{
            fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
            margin: 0,
            textTransform: 'uppercase',
            lineHeight: 1,
            color: 'var(--bk-text-main)',
          }}
        >
          Date &amp; Time
        </h1>
        <p style={{ color: 'var(--bk-text-muted)', marginTop: '1rem', maxWidth: '40rem' }}>
          {service ? (
            <>
              Select an available slot for <span style={{ color: 'var(--bk-text-main)' }}>{service.name}</span>
              {service.durationMins ? <> · {service.durationMins} min</> : null}.
            </>
          ) : (
            'Select an available slot for your appointment.'
          )}
        </p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr)',
          gap: '1.5rem',
        }}
      >
        <div className="bk-datetime-grid">
          <section
            className="bk-card"
            style={{ padding: 'clamp(1rem, 2vw, 2.5rem)', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <CalendarNavButton onClick={gotoPrev} direction="prev" />
              <h2
                className="bk-display"
                style={{
                  fontSize: 'clamp(1.5rem, 2.75vw, 2.25rem)',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--bk-text-main)',
                }}
              >
                {MONTH_NAMES[viewMonth]} {viewYear}
              </h2>
              <CalendarNavButton onClick={gotoNext} direction="next" />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                gap: '1px',
                backgroundColor: 'var(--bk-border-subtle)',
                border: '1px solid var(--bk-border-subtle)',
              }}
            >
              {DAY_LABELS.map((label, i) => (
                <div
                  key={i}
                  className="bk-mono"
                  style={{
                    backgroundColor: 'var(--bk-bg-surface)',
                    padding: '1rem 0',
                    textAlign: 'center',
                    color: 'var(--bk-text-muted)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                  }}
                >
                  {label}
                </div>
              ))}

              {Array.from({ length: offset }).map((_, i) => (
                <div
                  key={`empty-start-${i}`}
                  style={{ backgroundColor: '#0f0f0f', aspectRatio: '1 / 1' }}
                  aria-hidden="true"
                />
              ))}

              {cells.map((c) => {
                const isSelected = selectedDate === c.key;
                return (
                  <CalendarDay
                    key={c.key}
                    day={c.day}
                    state={c.state}
                    isSelected={isSelected}
                    onClick={() => c.state === 'available' && onSelectDate(c.key)}
                  />
                );
              })}

              {Array.from({ length: (7 - ((offset + total) % 7)) % 7 }).map((_, i) => (
                <div
                  key={`empty-end-${i}`}
                  style={{ backgroundColor: '#0f0f0f', aspectRatio: '1 / 1' }}
                  aria-hidden="true"
                />
              ))}
            </div>
          </section>

          <section
            className="bk-card"
            style={{
              padding: 'clamp(1rem, 2vw, 2.5rem)',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '24rem',
            }}
          >
            <div
              style={{
                borderBottom: '1px solid var(--bk-border-subtle)',
                paddingBottom: '1.25rem',
                marginBottom: '1.25rem',
              }}
            >
              <h3
                className="bk-display"
                style={{
                  fontSize: '1.5rem',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--bk-text-main)',
                }}
              >
                {selectedYearMonth
                  ? formatLongDate(selectedYearMonth.year, selectedYearMonth.month, selectedYearMonth.day)
                  : 'Select a Date'}
              </h3>
              <p
                className="bk-mono"
                style={{
                  fontSize: '0.7rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--bk-text-muted)',
                  marginTop: '0.5rem',
                }}
              >
                Available Times
              </p>
            </div>

            <div
              className="bk-time-scroll"
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                overflowY: 'auto',
                paddingRight: '0.25rem',
              }}
            >
              {!selectedDate ? (
                <EmptyState message="Select a date to view times" />
              ) : slotsLoading ? (
                <EmptyState message="Loading times…" />
              ) : slots.length === 0 ? (
                <EmptyState message="No slots available" />
              ) : (
                slots.map((t) => (
                  <TimeSlotItem
                    key={t}
                    time={formatSlotTime(t)}
                    duration={service?.durationMins ?? 0}
                    isSelected={selectedTime === t}
                    onClick={() => onSelectTime(t)}
                  />
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      <style>{`
        .bk-datetime-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 1.5rem;
        }
        @media (min-width: 960px) {
          .bk-datetime-grid {
            grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
            gap: 2rem;
          }
        }
        .bk-time-scroll::-webkit-scrollbar { width: 4px; }
        .bk-time-scroll::-webkit-scrollbar-track { background: var(--bk-bg-surface); border-left: 1px solid var(--bk-border-subtle); }
        .bk-time-scroll::-webkit-scrollbar-thumb { background: var(--bk-border-focus); }
        .bk-time-scroll::-webkit-scrollbar-thumb:hover { background: var(--bk-accent); }
      `}</style>
    </main>
  );
}

function CalendarNavButton({
  onClick,
  direction,
}: {
  onClick: () => void;
  direction: 'prev' | 'next';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bk-btn-ghost"
      style={{
        padding: '0.625rem',
        background: 'transparent',
        border: '1px solid transparent',
        color: 'var(--bk-text-muted)',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'color 0.15s ease, border-color 0.15s ease, background-color 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--bk-accent)';
        e.currentTarget.style.borderColor = 'var(--bk-accent)';
        e.currentTarget.style.backgroundColor = 'var(--bk-bg-base)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--bk-text-muted)';
        e.currentTarget.style.borderColor = 'transparent';
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
      aria-label={direction === 'prev' ? 'Previous month' : 'Next month'}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
        aria-hidden="true"
      >
        {direction === 'prev' ? (
          <>
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </>
        ) : (
          <>
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </>
        )}
      </svg>
    </button>
  );
}

function CalendarDay({
  day,
  state,
  isSelected,
  onClick,
}: {
  day: number;
  state: 'available' | 'disabled' | 'today';
  isSelected: boolean;
  onClick?: () => void;
}) {
  if (state === 'disabled' || state === 'today') {
    return (
      <div
        className="bk-mono"
        style={{
          backgroundColor: 'var(--bk-bg-surface)',
          aspectRatio: '1 / 1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.2)',
          fontSize: '1rem',
          position: 'relative',
          pointerEvents: 'none',
        }}
      >
        <span style={{ zIndex: 1 }}>{day}</span>
        {state === 'today' && (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              bottom: '0.5rem',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '6px',
              height: '6px',
              backgroundColor: 'var(--bk-accent)',
            }}
          />
        )}
      </div>
    );
  }

  if (isSelected) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="bk-mono"
        style={{
          backgroundColor: 'var(--bk-accent)',
          color: '#0a0a0a',
          aspectRatio: '1 / 1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.125rem',
          fontWeight: 700,
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {day}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="bk-mono bk-calendar-day"
      style={{
        backgroundColor: 'var(--bk-bg-surface)',
        color: 'var(--bk-text-main)',
        aspectRatio: '1 / 1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1rem',
        border: '1px solid transparent',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background-color 0.15s ease, border-color 0.15s ease, z-index 0s 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bk-bg-surface-elevated)';
        e.currentTarget.style.borderColor = 'var(--bk-accent)';
        e.currentTarget.style.zIndex = '10';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bk-bg-surface)';
        e.currentTarget.style.borderColor = 'transparent';
        e.currentTarget.style.zIndex = '0';
      }}
    >
      {day}
    </button>
  );
}

function TimeSlotItem({
  time,
  duration,
  isSelected,
  onClick,
}: {
  time: string;
  duration: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  if (isSelected) {
    return (
      <button
        type="button"
        onClick={onClick}
        style={{
          width: '100%',
          padding: '1.25rem',
          border: '1px solid var(--bk-accent)',
          backgroundColor: 'var(--bk-accent)',
          color: '#0a0a0a',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '4px 4px 0 0 rgba(var(--bk-accent-rgb), 0.2)',
          transform: 'translateY(-4px)',
          transition: 'transform 0.15s ease',
        }}
      >
        <span className="bk-mono" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{time}</span>
        {duration > 0 && (
          <span
            className="bk-mono"
            style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              letterSpacing: '0.2em',
              color: 'rgba(10, 10, 10, 0.6)',
              textTransform: 'uppercase',
            }}
          >
            {duration} MIN
          </span>
        )}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        padding: '1.25rem',
        border: '1px solid var(--bk-border-subtle)',
        backgroundColor: 'var(--bk-bg-base)',
        color: 'var(--bk-text-main)',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bk-bg-surface-elevated)';
        e.currentTarget.style.borderColor = 'var(--bk-accent)';
        const timeEl = e.currentTarget.querySelector('[data-time]') as HTMLElement | null;
        if (timeEl) timeEl.style.color = 'var(--bk-accent)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bk-bg-base)';
        e.currentTarget.style.borderColor = 'var(--bk-border-subtle)';
        const timeEl = e.currentTarget.querySelector('[data-time]') as HTMLElement | null;
        if (timeEl) timeEl.style.color = 'var(--bk-text-main)';
      }}
    >
      <span
        data-time
        className="bk-mono"
        style={{ fontSize: '1.25rem', fontWeight: 500, transition: 'color 0.15s ease' }}
      >
        {time}
      </span>
      {duration > 0 && (
        <span
          className="bk-mono"
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.2em',
            color: 'var(--bk-text-muted)',
            textTransform: 'uppercase',
          }}
        >
          {duration} MIN
        </span>
      )}
    </button>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <p
        className="bk-mono"
        style={{
          color: 'var(--bk-text-muted)',
          fontSize: '0.875rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          textAlign: 'center',
        }}
      >
        {message}
      </p>
    </div>
  );
}
