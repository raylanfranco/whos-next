import { type ReactNode } from 'react';
import StripeCardForm, { type StripeCardFormRef } from '../components/StripeCardForm';
import type { Merchant, Service, VehicleType } from '../types';

interface VehicleSummary {
  type: VehicleType | '';
  year: string;
  make: string;
  model: string;
  trim: string;
}

interface StepPaymentProps {
  merchant: Merchant | null;
  service: Service | null;
  vehicle: VehicleSummary;
  date: string;
  time: string;
  depositAmountCents: number;
  depositPercent: number;
  chargeId: string | null;
  paymentProcessing: boolean;
  paymentError: string | null;
  stripePublishableKey: string | null;
  cardFormRef: React.RefObject<StripeCardFormRef | null>;
  onError: (msg: string) => void;
  onPay: () => void;
}

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
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
  });
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

function vehicleDisplay(v: VehicleSummary): string {
  const parts = [v.type ? formatVehicleType(v.type) : '', v.year, v.make, v.model, v.trim].filter(Boolean);
  return parts.join(' ');
}

export function StepPayment({
  merchant,
  service,
  vehicle,
  date,
  time,
  depositAmountCents,
  depositPercent,
  chargeId,
  paymentProcessing,
  paymentError,
  stripePublishableKey,
  cardFormRef,
  onError,
  onPay,
}: StepPaymentProps) {
  const isPowersports = merchant?.vertical === 'POWERSPORTS';
  const vehicleLabel = isPowersports ? 'Build' : 'Vehicle';
  const vehicleStr = vehicleDisplay(vehicle);
  const serviceTotalCents = service?.priceCents ?? 0;
  const balanceCents = serviceTotalCents - depositAmountCents;

  return (
    <main
      className="bk-step-enter"
      style={{
        flex: 1,
        width: '100%',
        maxWidth: '900px',
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
          Deposit Required
        </h1>
        <p style={{ color: 'var(--bk-text-muted)', marginTop: '1rem', maxWidth: '40rem' }}>
          A deposit secures your appointment. Balance due at service.
        </p>
      </header>

      <section className="bk-card" style={{ padding: 'clamp(1.5rem, 3vw, 2.5rem)', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <SummaryRow label="Service" value={service?.name ?? '—'} />
          {vehicleStr && <SummaryRow label={vehicleLabel} value={vehicleStr} />}
          <SummaryRow label="Date & Time" value={`${formatLongDate(date)} · ${formatSlotTime(time)}`} />
          <SummaryRow label="Duration" value={`${service?.durationMins ?? 0} MIN`} />
        </div>

        <div style={{ height: '1px', background: 'var(--bk-border-subtle)', margin: '2rem 0' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Line label="Service Total" value={formatPrice(serviceTotalCents)} />
          <Line
            label={`Deposit (${depositPercent}%)`}
            value={formatPrice(depositAmountCents)}
            accent
            big
          />
          <Line label="Remaining (due at appointment)" value={formatPrice(balanceCents)} muted />
        </div>
      </section>

      {chargeId ? (
        <section
          className="bk-card"
          style={{
            padding: '1.5rem',
            borderColor: 'var(--bk-accent)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '2.5rem',
              height: '2.5rem',
              border: '1px solid var(--bk-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--bk-accent)" strokeWidth="3" strokeLinecap="square" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <div
              className="bk-mono"
              style={{
                fontSize: '0.7rem',
                color: 'var(--bk-accent)',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                fontWeight: 700,
                marginBottom: '0.25rem',
              }}
            >
              Deposit Paid
            </div>
            <div style={{ color: 'var(--bk-text-main)', fontSize: '0.9rem' }}>
              {formatPrice(depositAmountCents)} received. You may continue to confirm your booking.
            </div>
          </div>
        </section>
      ) : (
        <section className="bk-card" style={{ padding: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
          <StripeCardForm
            ref={cardFormRef}
            publishableKey={stripePublishableKey || undefined}
            onError={onError}
            theme="dark"
          />

          {paymentError && (
            <p
              className="bk-mono"
              style={{
                marginTop: '1rem',
                fontSize: '0.8125rem',
                color: 'var(--bk-accent)',
                background: 'rgba(var(--bk-accent-rgb), 0.08)',
                border: '1px solid rgba(var(--bk-accent-rgb), 0.25)',
                padding: '0.75rem 1rem',
              }}
            >
              {paymentError}
            </p>
          )}

          <button
            type="button"
            onClick={onPay}
            disabled={paymentProcessing}
            className="bk-btn bk-btn-primary"
            style={{
              marginTop: '1.5rem',
              width: '100%',
            }}
          >
            {paymentProcessing ? (
              <span>Processing…</span>
            ) : (
              <>
                <ShieldIcon />
                <span>Pay {formatPrice(depositAmountCents)} Deposit</span>
              </>
            )}
          </button>
        </section>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          marginTop: '1.5rem',
          color: 'var(--bk-text-muted)',
          fontSize: '0.8125rem',
          lineHeight: 1.6,
        }}
      >
        <ShieldIcon />
        <p style={{ margin: 0, maxWidth: '40rem' }}>
          Card details are handled securely by Stripe. We never see your full card number.
        </p>
      </div>
    </main>
  );
}

function SummaryRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 160px) minmax(0, 1fr)',
        alignItems: 'baseline',
        gap: '1rem',
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
      <span
        className="bk-mono"
        style={{
          fontSize: '0.9rem',
          color: 'var(--bk-text-main)',
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
        }}
      >
        {value}
      </span>
    </div>
  );
}

function Line({
  label,
  value,
  accent,
  muted,
  big,
}: {
  label: string;
  value: string;
  accent?: boolean;
  muted?: boolean;
  big?: boolean;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem' }}>
      <span
        className="bk-mono"
        style={{
          fontSize: accent ? '0.75rem' : '0.7rem',
          color: accent ? 'var(--bk-accent)' : 'var(--bk-text-muted)',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          fontWeight: 700,
        }}
      >
        {label}
      </span>
      <span
        className="bk-mono"
        style={{
          fontSize: big ? '1.5rem' : '0.95rem',
          color: accent ? 'var(--bk-accent)' : muted ? 'var(--bk-text-muted)' : 'var(--bk-text-main)',
          letterSpacing: big ? '-0.02em' : '0',
          fontWeight: big ? 700 : 500,
          lineHeight: 1,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      aria-hidden="true"
      style={{ flexShrink: 0, marginTop: '2px' }}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
