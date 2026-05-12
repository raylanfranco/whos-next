import { type ReactNode } from 'react';

interface StepTattooProps {
  designIntakeSlot: ReactNode;
  artistSlot?: ReactNode;
}

export function StepTattoo({ designIntakeSlot, artistSlot }: StepTattooProps) {
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
          Design Details
        </h1>
        <p style={{ color: 'var(--bk-text-muted)', marginTop: '1rem', maxWidth: '40rem' }}>
          Tell us about the tattoo you want — reference photos, sizing, placement, and anything else that helps us prepare.
        </p>
      </header>

      <section className="bk-card" style={{ padding: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
        <div className="bk-intake-host">
          {designIntakeSlot}
        </div>
      </section>

      {artistSlot && (
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
                fontSize: '0.7rem',
                margin: 0,
                color: 'var(--bk-accent)',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                fontWeight: 700,
              }}
            >
              Artist
            </h2>
            <p style={{ color: 'var(--bk-text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Pick the artist you'd like for this piece.
            </p>
          </header>
          <div className="bk-intake-host">
            {artistSlot}
          </div>
        </section>
      )}
    </main>
  );
}
