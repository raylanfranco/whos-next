import { type ReactNode } from 'react';
import type { Merchant } from '../types';
import { accentCssVars, resolveAccent } from './accent';
import type { BookingStep, BookingStepKey } from './steps';
import './booking.css';

interface BookingShellProps {
  merchant: Merchant | null;
  children: ReactNode;
}

export function BookingShell({ merchant, children }: BookingShellProps) {
  const accent = resolveAccent(merchant);
  return (
    <div className="bk-shell" style={accentCssVars(accent) as React.CSSProperties}>
      {children}
    </div>
  );
}

interface BookingBreadcrumbProps {
  steps: BookingStep[];
  currentStep: BookingStepKey;
  onStepClick?: (step: BookingStepKey) => void;
  allComplete?: boolean;
}

export function BookingBreadcrumb({ steps, currentStep, onStepClick, allComplete }: BookingBreadcrumbProps) {
  const currentIdx = steps.findIndex((s) => s.key === currentStep);
  return (
    <nav className="bk-breadcrumb">
      <div className="bk-breadcrumb-inner">
        {steps.map((s, i) => {
          const num = String(i + 1).padStart(2, '0');
          const status = allComplete ? 'complete' : i === currentIdx ? 'active' : i < currentIdx ? 'complete' : 'future';
          const cls = `bk-breadcrumb-step${status === 'active' ? ' is-active' : ''}${status === 'complete' ? ' is-complete' : ''}`;
          const interactive = status === 'complete' && onStepClick;
          return (
            <div key={s.key} style={{ display: 'contents' }}>
              {interactive ? (
                <button
                  type="button"
                  className={cls}
                  style={{ background: 'transparent', border: 'none', padding: 0 }}
                  onClick={() => onStepClick(s.key)}
                >
                  <CheckMark />
                  <span>{num} {s.label.toUpperCase()}</span>
                </button>
              ) : (
                <span className={cls}>
                  {status === 'active' && <span className="bk-step-dot" aria-hidden="true" />}
                  <span>{num} {s.label.toUpperCase()}</span>
                </span>
              )}
              {i < steps.length - 1 && <span className="bk-breadcrumb-sep" aria-hidden="true">/</span>}
            </div>
          );
        })}
      </div>
    </nav>
  );
}

interface BookingFooterProps {
  stepIndex: number;
  totalSteps: number;
  side?: ReactNode;
  action: ReactNode;
}

export function BookingFooter({ stepIndex, totalSteps, side, action }: BookingFooterProps) {
  const pct = Math.min(100, Math.round(((stepIndex + 1) / totalSteps) * 100));
  return (
    <footer className="bk-footer">
      <div className="bk-footer-inner">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span
            className="bk-mono"
            style={{ fontSize: '0.7rem', color: 'var(--bk-text-muted)', letterSpacing: '0.2em', textTransform: 'uppercase' }}
          >
            Step {stepIndex + 1} of {totalSteps}
          </span>
          <div className="bk-progress-track">
            <div className="bk-progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            justifyContent: 'flex-end',
            flexWrap: 'wrap',
          }}
        >
          {side}
          {action}
        </div>
      </div>
    </footer>
  );
}

function CheckMark() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
