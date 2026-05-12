import { useState } from 'react';

interface TintZonePickerProps {
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
  shadeOptions: string[];
}

interface ZoneDef {
  id: string;
  label: string;
  shortLabel: string;
  shortId: string;
  match: string | null; // symmetry partner id
  legalMin: number;     // US-typical VLT% legal minimum; 0 = no restriction
}

// IDs match the legacy data shape so historical bookings still render correctly.
const ZONES: ZoneDef[] = [
  { id: 'front_windshield', label: 'Windshield',       shortLabel: 'Windshield',  shortId: 'WS', match: null,               legalMin: 70 },
  { id: 'sunroof',          label: 'Sunroof',          shortLabel: 'Sunroof',     shortId: 'SR', match: null,               legalMin: 0 },
  { id: 'front_driver',     label: 'Front Driver',     shortLabel: 'Front L',     shortId: 'FL', match: 'front_passenger',  legalMin: 35 },
  { id: 'front_passenger',  label: 'Front Passenger',  shortLabel: 'Front R',     shortId: 'FR', match: 'front_driver',     legalMin: 35 },
  { id: 'rear_driver',      label: 'Rear Driver',      shortLabel: 'Rear L',      shortId: 'RL', match: 'rear_passenger',   legalMin: 0 },
  { id: 'rear_passenger',   label: 'Rear Passenger',   shortLabel: 'Rear R',      shortId: 'RR', match: 'rear_driver',      legalMin: 0 },
  { id: 'rear_windshield',  label: 'Rear Hatch',       shortLabel: 'Rear Hatch',  shortId: 'RE', match: null,               legalMin: 0 },
];

const DEFAULT_SHADES = ['5%', '20%', '35%', '50%', '70%'];

const CAR_BODY = `
  M 160,12
  C 120,12 90,28 82,58
  L 72,120
  C 68,132 66,148 66,160
  L 62,340
  C 62,360 66,378 72,390
  L 86,435
  C 96,455 125,468 160,468
  C 195,468 224,455 234,435
  L 248,390
  C 254,378 258,360 258,340
  L 262,160
  C 262,148 260,132 256,120
  L 238,58
  C 230,28 200,12 160,12
  Z
`;

const ZONE_PATHS: Record<string, string> = {
  front_windshield: 'M 108,88 Q 160,72 212,88 L 218,120 Q 160,110 102,120 Z',
  front_driver:     'M 70,138 L 98,134 L 98,242 L 70,242 Q 68,200 70,138 Z',
  front_passenger:  'M 250,138 L 222,134 L 222,242 L 250,242 Q 252,200 250,138 Z',
  rear_driver:      'M 70,256 L 98,256 L 98,352 L 76,352 Q 68,320 70,256 Z',
  rear_passenger:   'M 250,256 L 222,256 L 222,352 L 244,352 Q 252,320 250,256 Z',
  rear_windshield:  'M 102,368 Q 160,378 218,368 L 212,400 Q 160,415 108,400 Z',
  sunroof:          'M 128,180 L 192,180 L 192,280 L 128,280 Z',
};

const ZONE_LABEL_POS: Record<string, { x: number; y: number }> = {
  front_windshield: { x: 160, y: 100 },
  front_driver:     { x: 84,  y: 190 },
  front_passenger:  { x: 236, y: 190 },
  rear_driver:      { x: 84,  y: 305 },
  rear_passenger:   { x: 236, y: 305 },
  rear_windshield:  { x: 160, y: 388 },
  sunroof:          { x: 160, y: 230 },
};

function shadeToVLT(shade: string): number {
  const m = shade.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 35;
}

function shadeToDarkness(shade: string): number {
  const vlt = shadeToVLT(shade);
  return Math.max(0.15, Math.min(0.92, 1 - vlt / 100));
}

function shadeLabel(shade: string): string {
  const vlt = shadeToVLT(shade);
  if (vlt >= 70) return 'Clear';
  if (vlt >= 50) return 'Light';
  if (vlt >= 35) return 'Medium';
  if (vlt >= 20) return 'Dark';
  return 'Limo';
}

export default function TintZonePicker({ value, onChange, shadeOptions }: TintZonePickerProps) {
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [hoverZone, setHoverZone] = useState<string | null>(null);
  const [syncSymmetry, setSyncSymmetry] = useState(true);

  const shades = shadeOptions.length > 0 ? shadeOptions : DEFAULT_SHADES;
  const activeDef = activeZone ? ZONES.find((z) => z.id === activeZone) ?? null : null;
  const activeShade = activeZone ? value[activeZone] : null;
  const filledCount = ZONES.filter((z) => !!value[z.id]).length;

  function selectZone(id: string) {
    setActiveZone(id);
  }

  function applyShade(shade: string) {
    if (!activeZone || !activeDef) return;
    const next = { ...value, [activeZone]: shade };
    if (syncSymmetry && activeDef.match) {
      next[activeDef.match] = shade;
    }
    onChange(next);
  }

  function clearZone(id: string) {
    const next = { ...value };
    delete next[id];
    onChange(next);
    if (activeZone === id) setActiveZone(null);
  }

  return (
    <div className="bk-tint-root">
      {/* LEFT — Build status / zone list */}
      <aside className="bk-tint-panel">
        <div className="bk-tint-panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
            <span
              aria-hidden="true"
              style={{
                width: '0.5rem',
                height: '0.5rem',
                background: 'var(--bk-accent)',
                animation: 'bk-pulse-dot 2s infinite',
              }}
            />
            <span
              className="bk-mono"
              style={{
                fontSize: '0.65rem',
                color: 'var(--bk-accent)',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                fontWeight: 700,
              }}
            >
              System Active
            </span>
          </div>
          <h3
            className="bk-mono"
            style={{
              fontSize: '1.125rem',
              margin: 0,
              fontWeight: 700,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              color: 'var(--bk-text-main)',
            }}
          >
            Build Status
          </h3>
        </div>

        <div className="bk-tint-zone-list">
          {ZONES.map((z) => {
            const shade = value[z.id];
            const isActive = z.id === activeZone;
            return (
              <button
                key={z.id}
                type="button"
                onClick={() => selectZone(z.id)}
                onMouseEnter={() => setHoverZone(z.id)}
                onMouseLeave={() => setHoverZone(null)}
                className="bk-tint-zone-row"
                style={{
                  borderColor: isActive ? 'var(--bk-accent)' : 'var(--bk-border-subtle)',
                  background: isActive ? 'var(--bk-bg-surface)' : 'var(--bk-bg-base)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0 }}>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      color: isActive ? 'var(--bk-accent)' : 'var(--bk-text-main)',
                      transition: 'color 0.15s ease',
                    }}
                  >
                    {z.label}
                  </span>
                  <span
                    className="bk-mono"
                    style={{
                      fontSize: '0.65rem',
                      color: 'var(--bk-text-muted)',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      marginTop: '0.125rem',
                    }}
                  >
                    {z.shortId}
                  </span>
                </div>
                {shade ? (
                  <div
                    className="bk-mono"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'baseline',
                      gap: '0.125rem',
                      padding: '0.375rem 0.625rem',
                      background: 'var(--bk-bg-surface-elevated)',
                      border: `1px solid ${isActive ? 'var(--bk-accent)' : 'var(--bk-border-focus)'}`,
                      fontWeight: 700,
                      color: 'var(--bk-text-main)',
                    }}
                  >
                    <span style={{ fontSize: '0.9rem' }}>{shadeToVLT(shade)}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--bk-text-muted)' }}>%</span>
                  </div>
                ) : (
                  <span
                    className="bk-mono"
                    style={{
                      fontSize: '0.65rem',
                      color: 'var(--bk-text-muted)',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Unset
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="bk-tint-panel-footer">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
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
              Zones Configured
            </span>
            <span
              className="bk-mono"
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: filledCount > 0 ? 'var(--bk-accent)' : 'var(--bk-text-main)',
                lineHeight: 1,
              }}
            >
              {filledCount} / {ZONES.length}
            </span>
          </div>
        </div>
      </aside>

      {/* CENTER — Car diagram */}
      <div className="bk-tint-panel bk-tint-diagram-panel">
        <div className="bk-tint-diagram-label">
          <span
            className="bk-mono"
            style={{
              fontSize: '0.65rem',
              color: 'var(--bk-text-muted)',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
            }}
          >
            Top-Down Sensor View
          </span>
          <div style={{ display: 'flex', gap: '0.25rem' }} aria-hidden="true">
            <span style={{ width: '0.25rem', height: '1rem', background: 'var(--bk-border-focus)' }} />
            <span style={{ width: '0.25rem', height: '1rem', background: 'var(--bk-border-focus)' }} />
            <span style={{ width: '0.25rem', height: '1rem', background: 'var(--bk-accent)' }} />
          </div>
        </div>

        <div className="bk-tint-diagram-inner bk-dot-grid">
          <span aria-hidden="true" className="bk-tint-scanline" />
          <span aria-hidden="true" className="bk-tint-axis-h" />
          <span aria-hidden="true" className="bk-tint-axis-v" />

          <svg
            viewBox="0 0 320 480"
            className="bk-tint-svg"
            role="img"
            aria-label="Top-down view of a vehicle with selectable window tint zones"
          >
            <path d={CAR_BODY} fill="var(--bk-bg-surface)" stroke="var(--bk-border-focus)" strokeWidth={1.5} />
            <path d="M 66,155 L 46,148 L 42,158 L 62,165 Z" fill="var(--bk-bg-surface)" stroke="var(--bk-border-focus)" strokeWidth={1} />
            <path d="M 254,155 L 274,148 L 278,158 L 258,165 Z" fill="var(--bk-bg-surface)" stroke="var(--bk-border-focus)" strokeWidth={1} />
            <path d="M 68,248 L 100,248" stroke="var(--bk-border-subtle)" strokeWidth={1} strokeDasharray="4,4" />
            <path d="M 220,248 L 252,248" stroke="var(--bk-border-subtle)" strokeWidth={1} strokeDasharray="4,4" />

            {ZONES.map((z) => {
              const shade = value[z.id];
              const isActive = z.id === activeZone;
              const isHover = z.id === hoverZone;
              const darkness = shade ? shadeToDarkness(shade) : 0;
              const fill = shade
                ? `rgba(var(--bk-accent-rgb), ${Math.max(0.2, darkness * 0.65)})`
                : isHover
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.4)';
              const stroke = isActive
                ? 'var(--bk-accent)'
                : isHover
                  ? 'var(--bk-text-muted)'
                  : 'var(--bk-border-focus)';
              return (
                <g key={z.id} style={{ cursor: 'pointer' }}>
                  <path
                    d={ZONE_PATHS[z.id]}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={isActive ? 2.5 : 1}
                    filter={isActive ? 'drop-shadow(0 0 8px rgba(var(--bk-accent-rgb), 0.4))' : undefined}
                    onClick={() => selectZone(z.id)}
                    onMouseEnter={() => setHoverZone(z.id)}
                    onMouseLeave={() => setHoverZone(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        selectZone(z.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`${z.label}${shade ? ` — ${shade} tint` : ' — tap to configure'}`}
                    style={{ transition: 'fill 0.15s ease, stroke 0.15s ease' }}
                  />
                  {shade && (
                    <text
                      x={ZONE_LABEL_POS[z.id].x}
                      y={ZONE_LABEL_POS[z.id].y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#fff"
                      fontFamily='"JetBrains Mono", monospace'
                      fontWeight={800}
                      fontSize={z.id.includes('windshield') || z.id === 'sunroof' ? 14 : 12}
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {shadeToVLT(shade)}%
                    </text>
                  )}
                </g>
              );
            })}

            <text x={160} y={26} textAnchor="middle" fontSize={10} fill="var(--bk-text-muted)" className="bk-mono" style={{ pointerEvents: 'none', letterSpacing: '0.2em' }}>FRONT</text>
            <text x={160} y={476} textAnchor="middle" fontSize={10} fill="var(--bk-text-muted)" className="bk-mono" style={{ pointerEvents: 'none', letterSpacing: '0.2em' }}>REAR</text>
          </svg>
        </div>

        <div className="bk-tint-diagram-footer">
          <span className="bk-mono" style={{ fontSize: '0.65rem', color: 'var(--bk-border-focus)' }}>
            COORD: X.{160} Y.{240}
          </span>
          <span className="bk-mono" style={{ fontSize: '0.65rem', color: 'var(--bk-border-focus)' }}>
            SCALE: 1:20
          </span>
        </div>
      </div>

      {/* RIGHT — Shade picker */}
      <aside className="bk-tint-panel bk-tint-shade-panel">
        {!activeDef ? (
          <div className="bk-tint-idle">
            <div className="bk-tint-idle-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
              </svg>
            </div>
            <h4 className="bk-mono" style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.5rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--bk-text-main)' }}>
              Awaiting Selection
            </h4>
            <p style={{ color: 'var(--bk-text-muted)', fontSize: '0.875rem', margin: 0, maxWidth: '20rem' }}>
              Pick a window from the diagram or the build list to configure its tint shade.
            </p>
          </div>
        ) : (
          <>
            <div className="bk-tint-panel-header bk-tint-active-header">
              <span aria-hidden="true" className="bk-tint-shortid">{activeDef.shortId}</span>
              <span className="bk-mono" style={{ fontSize: '0.65rem', color: 'var(--bk-accent)', letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                Target Acquired
              </span>
              <h3 className="bk-mono" style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase', color: 'var(--bk-text-main)', lineHeight: 1.2 }}>
                {activeDef.label}
              </h3>
            </div>

            <div className="bk-tint-shade-body">
              {activeDef.match && (
                <label className="bk-tint-sync">
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.8125rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--bk-text-main)' }}>
                      Sync Symmetry
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--bk-text-muted)', marginTop: '0.125rem' }}>
                      Apply same tint to opposite side
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={syncSymmetry}
                    onChange={(e) => {
                      const next = e.target.checked;
                      setSyncSymmetry(next);
                      if (next && activeShade && activeDef.match) {
                        onChange({ ...value, [activeDef.match]: activeShade });
                      }
                    }}
                    className="bk-tint-sync-input"
                  />
                  <span
                    aria-hidden="true"
                    className="bk-tint-sync-box"
                    style={{
                      borderColor: syncSymmetry ? 'var(--bk-accent)' : 'var(--bk-border-focus)',
                      background: syncSymmetry ? 'var(--bk-accent)' : 'transparent',
                    }}
                  >
                    {syncSymmetry && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="3" strokeLinecap="square">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                </label>
              )}

              {activeShade && activeDef.legalMin > 0 && shadeToVLT(activeShade) < activeDef.legalMin && (
                <div className="bk-tint-warning">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" aria-hidden="true" style={{ flexShrink: 0, marginTop: '2px' }}>
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <div style={{ fontSize: '0.75rem', color: '#fed7aa', lineHeight: 1.5 }}>
                    <strong>{shadeToVLT(activeShade)}%</strong> is below the {activeDef.legalMin}% US legal minimum for this window. Off-road use only.
                  </div>
                </div>
              )}

              <div>
                <div
                  className="bk-mono"
                  style={{
                    fontSize: '0.65rem',
                    color: 'var(--bk-text-muted)',
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    marginBottom: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  VLT % Options
                </div>
                <div className="bk-tint-shade-grid">
                  {shades.map((shade) => {
                    const selected = activeShade === shade;
                    const darkness = shadeToDarkness(shade);
                    return (
                      <button
                        key={shade}
                        type="button"
                        onClick={() => applyShade(shade)}
                        className="bk-tint-shade"
                        style={{
                          borderColor: selected ? 'var(--bk-accent)' : 'var(--bk-border-subtle)',
                          background: selected ? 'var(--bk-bg-surface-elevated)' : 'var(--bk-bg-base)',
                        }}
                      >
                        <span
                          aria-hidden="true"
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: `rgba(0, 0, 0, ${darkness})`,
                            opacity: 0.25,
                            zIndex: 0,
                          }}
                        />
                        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.125rem' }}>
                            <span className="bk-mono" style={{ fontSize: '1.75rem', fontWeight: 700, color: selected ? 'var(--bk-text-main)' : 'var(--bk-text-muted)' }}>
                              {shadeToVLT(shade)}
                            </span>
                            <span className="bk-mono" style={{ fontSize: '0.75rem', color: 'var(--bk-border-focus)' }}>%</span>
                          </div>
                          {selected && (
                            <span aria-hidden="true" style={{ width: '0.5rem', height: '0.5rem', background: 'var(--bk-accent)' }} />
                          )}
                        </div>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.8125rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--bk-text-main)' }}>
                            {shadeLabel(shade)}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {activeShade && (
                <button
                  type="button"
                  onClick={() => clearZone(activeDef.id)}
                  className="bk-tint-clear"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Clear this window
                </button>
              )}
            </div>
          </>
        )}
      </aside>

      <style>{`
        .bk-tint-root {
          display: grid;
          gap: 1rem;
          grid-template-columns: minmax(0, 1fr);
          --tint-panel-bg: var(--bk-bg-surface);
        }
        @media (min-width: 1024px) {
          .bk-tint-root {
            grid-template-columns: 18rem minmax(0, 1fr) 20rem;
            gap: 1.25rem;
            align-items: stretch;
          }
        }
        .bk-tint-panel {
          background: var(--bk-bg-surface);
          border: 1px solid var(--bk-border-subtle);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .bk-tint-panel-header {
          padding: 1.25rem 1.25rem 1rem;
          border-bottom: 1px solid var(--bk-border-subtle);
          background: var(--bk-bg-surface-elevated);
        }
        .bk-tint-zone-list {
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
          overflow-y: auto;
          max-height: 26rem;
        }
        .bk-tint-zone-row {
          all: unset;
          box-sizing: border-box;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.875rem 1rem;
          border: 1px solid;
          cursor: pointer;
          transition: border-color 0.15s ease, background-color 0.15s ease;
        }
        .bk-tint-zone-row:hover { border-color: var(--bk-border-focus); }
        .bk-tint-panel-footer {
          padding: 1.25rem;
          border-top: 1px solid var(--bk-border-subtle);
          background: var(--bk-bg-base);
        }

        .bk-tint-diagram-panel {
          position: relative;
          min-height: 22rem;
        }
        .bk-tint-diagram-label {
          position: absolute;
          top: 1rem;
          left: 1rem;
          right: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 5;
          pointer-events: none;
        }
        .bk-tint-diagram-inner {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 1.5rem;
          min-height: 22rem;
        }
        .bk-tint-svg {
          width: 100%;
          max-width: 22rem;
          height: auto;
          z-index: 2;
          filter: drop-shadow(0 16px 32px rgba(0,0,0,0.5));
        }
        .bk-tint-scanline {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.18) 51%);
          background-size: 100% 4px;
          pointer-events: none;
          z-index: 1;
          opacity: 0.4;
        }
        .bk-tint-axis-h {
          position: absolute;
          top: 50%; left: 0; right: 0;
          height: 1px;
          background: var(--bk-border-subtle);
          z-index: 0;
        }
        .bk-tint-axis-v {
          position: absolute;
          left: 50%; top: 0; bottom: 0;
          width: 1px;
          background: var(--bk-border-subtle);
          z-index: 0;
        }
        .bk-tint-diagram-footer {
          position: absolute;
          bottom: 0.75rem; left: 1rem; right: 1rem;
          display: flex;
          justify-content: space-between;
          pointer-events: none;
          z-index: 5;
        }

        .bk-tint-shade-panel { position: relative; }
        .bk-tint-active-header {
          position: relative;
          overflow: hidden;
        }
        .bk-tint-shortid {
          position: absolute;
          right: -0.5rem;
          top: -1rem;
          font-family: "JetBrains Mono", monospace;
          font-size: 6rem;
          font-weight: 700;
          color: var(--bk-border-subtle);
          opacity: 0.4;
          pointer-events: none;
          user-select: none;
          line-height: 1;
        }
        .bk-tint-idle {
          padding: 2rem 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.75rem;
          flex: 1;
          justify-content: center;
          min-height: 16rem;
        }
        .bk-tint-idle-icon {
          width: 3.5rem;
          height: 3.5rem;
          border: 1px solid var(--bk-border-focus);
          background: var(--bk-bg-surface-elevated);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--bk-text-muted);
          margin-bottom: 0.5rem;
        }
        .bk-tint-shade-body {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          flex: 1;
          overflow-y: auto;
        }
        .bk-tint-sync {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.875rem 1rem;
          border: 1px solid var(--bk-border-subtle);
          background: var(--bk-bg-base);
          gap: 0.75rem;
          cursor: pointer;
          position: relative;
        }
        .bk-tint-sync-input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }
        .bk-tint-sync-box {
          width: 1.5rem;
          height: 1.5rem;
          border: 1px solid;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.15s ease, border-color 0.15s ease;
          flex-shrink: 0;
        }
        .bk-tint-warning {
          display: flex;
          gap: 0.625rem;
          padding: 0.875rem 1rem;
          border: 1px solid rgba(249, 115, 22, 0.25);
          background: rgba(249, 115, 22, 0.08);
        }
        .bk-tint-shade-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.625rem;
        }
        .bk-tint-shade {
          all: unset;
          box-sizing: border-box;
          position: relative;
          display: flex;
          flex-direction: column;
          padding: 0.875rem;
          border: 1px solid;
          cursor: pointer;
          overflow: hidden;
          transition: border-color 0.15s ease, background-color 0.15s ease;
          min-height: 5rem;
        }
        .bk-tint-shade:hover { border-color: var(--bk-border-focus); }
        .bk-tint-clear {
          all: unset;
          align-self: flex-start;
          padding: 0.5rem 0.75rem;
          font-family: "JetBrains Mono", monospace;
          font-size: 0.7rem;
          color: var(--bk-text-muted);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          border: 1px solid var(--bk-border-subtle);
          transition: color 0.15s ease, border-color 0.15s ease;
        }
        .bk-tint-clear:hover {
          color: var(--bk-accent);
          border-color: var(--bk-accent);
        }
      `}</style>
    </div>
  );
}
