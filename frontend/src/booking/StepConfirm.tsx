import { type ReactNode } from 'react';
import type { Service, Merchant, VehicleType } from '../types';

interface VehicleSummary {
  type: VehicleType | '';
  year: string;
  make: string;
  model: string;
  trim: string;
}

interface CustomerSummary {
  name: string;
  email: string;
  phone: string;
}

interface DepositSummary {
  required: boolean;
  amountCents: number;
  paid: boolean;
}

interface BookingDetails {
  service: Service | null;
  date: string;
  time: string;
  vehicle: VehicleSummary;
  customer: CustomerSummary;
  notes: string;
  deposit: DepositSummary;
  merchant: Merchant | null;
}

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatVehicleType(type: VehicleType | ''): string {
  switch (type) {
    case 'MOTORCYCLE': return 'Motorcycle';
    case 'BOAT': return 'Boat';
    case 'ATV': return 'ATV';
    case 'UTV': return 'UTV';
    case 'SNOWMOBILE': return 'Snowmobile';
    case 'CAR': return 'Car';
    case 'OTHER': return 'Custom';
    default: return '';
  }
}

function formatSlotTime(time: string): string {
  if (!time) return '';
  const [hh, mm] = time.split(':').map(Number);
  const ampm = hh >= 12 ? 'PM' : 'AM';
  const hour = hh > 12 ? hh - 12 : hh === 0 ? 12 : hh;
  return `${hour}:${String(mm).padStart(2, '0')} ${ampm}`;
}

function formatLongDate(d: string): string {
  if (!d) return '';
  return new Date(`${d}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function vehicleDisplay(v: VehicleSummary): string {
  const parts = [v.type ? formatVehicleType(v.type) : '', v.year, v.make, v.model, v.trim].filter(Boolean);
  return parts.join(' ');
}

interface StepConfirmProps {
  details: BookingDetails;
  intakeSummary?: ReactNode;
}

export function StepConfirm({ details, intakeSummary }: StepConfirmProps) {
  const isPowersports = details.merchant?.vertical === 'POWERSPORTS';
  const vehicleLabel = isPowersports ? 'Build' : 'Vehicle';

  return (
    <main
      className="bk-step-enter"
      style={{
        flex: 1,
        width: '100%',
        maxWidth: '1000px',
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
          Confirm Your Booking
        </h1>
        <p style={{ color: 'var(--bk-text-muted)', marginTop: '1rem', maxWidth: '40rem' }}>
          Review the details below and tap Book Now to lock in your appointment.
        </p>
      </header>

      <BookingDetailsCard details={details} vehicleLabel={vehicleLabel} />

      {intakeSummary && (
        <section
          className="bk-card"
          style={{
            marginTop: '1.5rem',
            padding: 'clamp(1.5rem, 2.5vw, 2.5rem)',
          }}
        >
          <header style={{ marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--bk-border-subtle)' }}>
            <h2
              className="bk-mono"
              style={{
                fontSize: '0.7rem',
                margin: 0,
                color: 'var(--bk-accent)',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                fontWeight: 700,
              }}
            >
              Service Details
            </h2>
          </header>
          {intakeSummary}
        </section>
      )}

      {details.notes && (
        <section
          className="bk-card"
          style={{
            marginTop: '1.5rem',
            padding: 'clamp(1.25rem, 2vw, 2rem)',
          }}
        >
          <h2
            className="bk-mono"
            style={{
              fontSize: '0.7rem',
              margin: 0,
              color: 'var(--bk-text-muted)',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              fontWeight: 700,
              marginBottom: '0.75rem',
            }}
          >
            Notes
          </h2>
          <p style={{ color: 'var(--bk-text-main)', fontSize: '0.875rem', margin: 0, lineHeight: 1.6 }}>
            {details.notes}
          </p>
        </section>
      )}
    </main>
  );
}

export function BookingConfirmed({
  details,
  bookingId,
  onBookAnother,
}: {
  details: BookingDetails;
  bookingId: string | null;
  onBookAnother: () => void;
}) {
  const reference = bookingId ? `WN-${bookingId.slice(-8).toUpperCase()}` : 'WN-PENDING';
  const isPowersports = details.merchant?.vertical === 'POWERSPORTS';
  const vehicleLabel = isPowersports ? 'Build' : 'Vehicle';

  function handlePrint() {
    if (typeof window !== 'undefined') window.print();
  }

  function handleAddToCalendar() {
    if (!details.service || !details.date || !details.time) return;
    const start = new Date(`${details.date}T${details.time}:00`);
    const end = new Date(start.getTime() + details.service.durationMins * 60 * 1000);
    const fmt = (d: Date) =>
      d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `${details.service.name}${details.merchant ? ` — ${details.merchant.name}` : ''}`,
      dates: `${fmt(start)}/${fmt(end)}`,
      details: `Reference: ${reference}`,
    });
    window.open(`https://www.google.com/calendar/render?${params.toString()}`, '_blank', 'noopener');
  }

  return (
    <main
      className="bk-step-enter"
      style={{
        flex: 1,
        width: '100%',
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '4rem 1.5rem 6rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <ConfirmationIcon />

      <h1
        className="bk-display"
        style={{
          fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
          margin: '2rem 0 1rem',
          textTransform: 'uppercase',
          lineHeight: 0.95,
          color: 'var(--bk-text-main)',
          textAlign: 'center',
        }}
      >
        Booking Confirmed
      </h1>
      <p
        style={{
          color: 'var(--bk-text-muted)',
          fontSize: '1rem',
          textAlign: 'center',
          maxWidth: '32rem',
          margin: 0,
        }}
      >
        Your appointment is scheduled. {details.customer.email ? <>A confirmation has been sent to <span style={{ color: 'var(--bk-text-main)' }}>{details.customer.email}</span>.</> : 'A confirmation will be sent to your contact info shortly.'}
      </p>

      <section
        className="bk-card"
        style={{
          width: '100%',
          marginTop: '3rem',
          padding: 'clamp(1.5rem, 3vw, 2.5rem)',
        }}
      >
        <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <span
            className="bk-mono"
            style={{
              fontSize: '0.65rem',
              color: 'var(--bk-text-muted)',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            Booking Reference
          </span>
          <span
            className="bk-mono"
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              color: 'var(--bk-accent)',
              letterSpacing: '-0.01em',
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            {reference}
          </span>
        </div>

        <div style={{ height: '1px', background: 'var(--bk-border-subtle)', marginBottom: '2rem' }} />

        <BookingDetailsCard
          details={details}
          vehicleLabel={vehicleLabel}
          embedded
        />
      </section>

      <section
        style={{
          width: '100%',
          marginTop: '1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 14rem), 1fr))',
          gap: '0.75rem',
        }}
      >
        <ActionButton icon={<CalendarIcon />} label="Add to Calendar" onClick={handleAddToCalendar} />
        <ActionButton icon={<PrintIcon />} label="Print Details" onClick={handlePrint} />
        <ActionButton icon={<PlusIcon />} label="Book Another" onClick={onBookAnother} />
      </section>

      <footer
        style={{
          marginTop: '3rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          textAlign: 'center',
        }}
      >
        <h2
          className="bk-mono"
          style={{
            fontSize: '0.65rem',
            color: 'var(--bk-text-muted)',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            fontWeight: 700,
            margin: 0,
          }}
        >
          Next Steps
        </h2>
        <p style={{ color: 'var(--bk-text-main)', fontSize: '1rem', margin: 0, maxWidth: '32rem' }}>
          Arrive 10 minutes early. Bring your vehicle registration if applicable.
        </p>
      </footer>
    </main>
  );
}

function BookingDetailsCard({
  details,
  vehicleLabel,
  embedded,
}: {
  details: BookingDetails;
  vehicleLabel: string;
  embedded?: boolean;
}) {
  const vehicle = vehicleDisplay(details.vehicle);
  const body = (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 18rem), 1fr))',
          gap: '2rem 2.5rem',
        }}
      >
        <DetailRow label="Service" value={details.service?.name || '—'} primary />
        {vehicle && <DetailRow label={vehicleLabel} value={vehicle} />}
        <DetailRow label="Date & Time" value={`${formatLongDate(details.date)} · ${formatSlotTime(details.time)}`} />
        <DetailRow label="Duration" value={`${details.service?.durationMins ?? 0} MIN`} />
        {(details.customer.name || details.customer.email || details.customer.phone) && (
          <DetailRow
            label="Contact"
            value={
              <>
                {details.customer.name && <div>{details.customer.name}</div>}
                {details.customer.email && <div style={{ color: 'var(--bk-text-muted)', fontSize: '0.875rem' }}>{details.customer.email}</div>}
                {details.customer.phone && <div style={{ color: 'var(--bk-text-muted)', fontSize: '0.875rem' }}>{details.customer.phone}</div>}
              </>
            }
          />
        )}
      </div>

      {details.deposit.required && (
        <>
          <div style={{ height: '1px', background: 'var(--bk-border-subtle)', margin: '2rem 0' }} />
          <div
            className="bk-tile"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'stretch',
              gap: '1.5rem',
              padding: '1.5rem',
              backgroundColor: 'var(--bk-bg-base)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <span
                className="bk-mono"
                style={{
                  fontSize: '0.65rem',
                  color: 'var(--bk-text-muted)',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              >
                {details.deposit.paid ? 'Deposit Paid' : 'Deposit Due'}
              </span>
              <span
                className="bk-mono"
                style={{
                  fontSize: '1.5rem',
                  color: 'var(--bk-accent)',
                  letterSpacing: '-0.01em',
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {formatPrice(details.deposit.amountCents)}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', alignItems: 'flex-end', textAlign: 'right' }}>
              <span
                className="bk-mono"
                style={{
                  fontSize: '0.65rem',
                  color: 'var(--bk-text-muted)',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              >
                Balance at Service
              </span>
              <span
                className="bk-mono"
                style={{
                  fontSize: '1.5rem',
                  color: 'var(--bk-text-main)',
                  letterSpacing: '-0.01em',
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {formatPrice((details.service?.priceCents ?? 0) - details.deposit.amountCents)}
              </span>
            </div>
          </div>
        </>
      )}
    </>
  );

  if (embedded) return body;
  return (
    <section className="bk-card" style={{ padding: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
      {body}
    </section>
  );
}

function DetailRow({
  label,
  value,
  primary,
}: {
  label: string;
  value: ReactNode;
  primary?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        paddingLeft: '1rem',
        borderLeft: `2px solid ${primary ? 'var(--bk-accent)' : 'var(--bk-border-subtle)'}`,
      }}
    >
      <span
        className="bk-mono"
        style={{
          fontSize: '0.65rem',
          color: 'var(--bk-text-muted)',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          fontWeight: 700,
        }}
      >
        {label}
      </span>
      <div
        className="bk-mono"
        style={{
          color: 'var(--bk-text-main)',
          fontSize: '1rem',
          textTransform: 'uppercase',
          lineHeight: 1.5,
          letterSpacing: '0.01em',
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bk-card"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        padding: '1.25rem',
        background: 'var(--bk-bg-surface)',
        color: 'var(--bk-text-main)',
        cursor: 'pointer',
        transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bk-bg-surface-elevated)';
        e.currentTarget.style.borderColor = 'var(--bk-accent)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bk-bg-surface)';
        e.currentTarget.style.borderColor = 'var(--bk-border-subtle)';
      }}
    >
      <span style={{ color: 'var(--bk-text-muted)', display: 'inline-flex' }}>{icon}</span>
      <span
        className="bk-mono"
        style={{
          fontSize: '0.75rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          fontWeight: 700,
        }}
      >
        {label}
      </span>
    </button>
  );
}

function ConfirmationIcon() {
  return (
    <div
      style={{
        position: 'relative',
        width: '6rem',
        height: '6rem',
        background: 'var(--bk-bg-surface)',
        border: '1px solid var(--bk-border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 40px rgba(var(--bk-accent-rgb), 0.15)',
      }}
      aria-hidden="true"
    >
      <span
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '0.5rem',
          height: '0.5rem',
          borderTop: '1px solid var(--bk-accent)',
          borderLeft: '1px solid var(--bk-accent)',
        }}
      />
      <span
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '0.5rem',
          height: '0.5rem',
          borderBottom: '1px solid var(--bk-accent)',
          borderRight: '1px solid var(--bk-accent)',
        }}
      />
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        stroke="var(--bk-accent)"
        strokeWidth="4"
        strokeLinejoin="miter"
        strokeLinecap="square"
      >
        <polyline points="10 24 20 34 38 14" />
      </svg>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function PrintIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" aria-hidden="true">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H2V9h20v9h-4" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
