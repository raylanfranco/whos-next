import { type ReactNode } from 'react';

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

interface StepInfoProps {
  customerInfo: CustomerInfo;
  onCustomerInfoChange: (info: CustomerInfo) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  intakeSlot?: ReactNode;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length < 4) return digits;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

export function StepInfo({
  customerInfo,
  onCustomerInfoChange,
  notes,
  onNotesChange,
  intakeSlot,
}: StepInfoProps) {
  function patch<K extends keyof CustomerInfo>(field: K, val: string) {
    onCustomerInfoChange({ ...customerInfo, [field]: val });
  }

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
          Your Information
        </h1>
        <p style={{ color: 'var(--bk-text-muted)', marginTop: '1rem', maxWidth: '40rem' }}>
          We use this to confirm your appointment and send reminders.
        </p>
      </header>

      <section className="bk-card" style={{ padding: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            gap: '1.5rem 2rem',
          }}
        >
          <Field label="Full Name" required wide>
            <input
              className="bk-input"
              value={customerInfo.name}
              onChange={(e) => patch('name', e.target.value)}
              placeholder="John Doe"
              autoComplete="name"
              required
            />
          </Field>

          <Field label="Email">
            <input
              className="bk-input"
              type="email"
              value={customerInfo.email}
              onChange={(e) => patch('email', e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </Field>

          <Field label="Phone">
            <input
              className="bk-input"
              type="tel"
              value={customerInfo.phone}
              onChange={(e) => patch('phone', formatPhone(e.target.value))}
              placeholder="(555) 000-0000"
              autoComplete="tel"
            />
          </Field>

          <Field label="Additional Notes" optional wide>
            <textarea
              className="bk-input"
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              rows={3}
              placeholder="Anything we should know before your appointment?"
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
            />
          </Field>
        </div>
      </section>

      {intakeSlot && (
        <section
          className="bk-card"
          style={{
            marginTop: '1.5rem',
            padding: 'clamp(1.5rem, 3vw, 2.5rem)',
          }}
        >
          <header style={{ marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--bk-border-subtle)' }}>
            <h2
              className="bk-mono"
              style={{
                fontSize: '0.75rem',
                margin: 0,
                color: 'var(--bk-accent)',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                fontWeight: 700,
              }}
            >
              Service Details
            </h2>
            <p style={{ color: 'var(--bk-text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Answer a few questions to help us prepare.
            </p>
          </header>

          <div className="bk-intake-host">
            {intakeSlot}
          </div>
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
        <p style={{ margin: 0, maxWidth: '40rem' }}>
          Your information is used only to manage your appointment. We do not share or sell customer data.
        </p>
      </div>
    </main>
  );
}

function Field({
  label,
  required,
  optional,
  wide,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.625rem',
        gridColumn: wide ? '1 / -1' : 'auto',
      }}
    >
      <label
        className="bk-mono"
        style={{
          fontSize: '0.65rem',
          color: 'var(--bk-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          fontWeight: 600,
        }}
      >
        {label}
        {required && <span style={{ color: 'var(--bk-accent)', marginLeft: '0.25rem' }}>*</span>}
        {optional && (
          <span
            style={{
              marginLeft: '0.5rem',
              color: 'var(--bk-border-focus)',
              fontSize: '0.55rem',
              letterSpacing: '0.1em',
              fontWeight: 400,
            }}
          >
            OPTIONAL
          </span>
        )}
      </label>
      {children}
    </div>
  );
}
