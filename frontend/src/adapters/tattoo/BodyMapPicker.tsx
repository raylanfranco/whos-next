import { useState } from 'react';

interface BodyMapPickerProps {
  value: string;
  onChange: (placement: string) => void;
}

/** Body zones for tattoo placement selection */
const BODY_ZONES = [
  { id: 'head', label: 'Head / Neck', front: { x: 140, y: 22, w: 40, h: 35 } },
  { id: 'chest', label: 'Chest', front: { x: 115, y: 65, w: 90, h: 50 } },
  { id: 'stomach', label: 'Stomach', front: { x: 125, y: 120, w: 70, h: 45 } },
  { id: 'left-upper-arm', label: 'Left Upper Arm', front: { x: 70, y: 65, w: 40, h: 55 } },
  { id: 'right-upper-arm', label: 'Right Upper Arm', front: { x: 210, y: 65, w: 40, h: 55 } },
  { id: 'left-forearm', label: 'Left Forearm', front: { x: 55, y: 125, w: 35, h: 55 } },
  { id: 'right-forearm', label: 'Right Forearm', front: { x: 230, y: 125, w: 35, h: 55 } },
  { id: 'left-hand', label: 'Left Hand', front: { x: 45, y: 185, w: 25, h: 25 } },
  { id: 'right-hand', label: 'Right Hand', front: { x: 250, y: 185, w: 25, h: 25 } },
  { id: 'left-thigh', label: 'Left Thigh', front: { x: 115, y: 175, w: 40, h: 60 } },
  { id: 'right-thigh', label: 'Right Thigh', front: { x: 165, y: 175, w: 40, h: 60 } },
  { id: 'left-calf', label: 'Left Calf', front: { x: 115, y: 245, w: 35, h: 55 } },
  { id: 'right-calf', label: 'Right Calf', front: { x: 170, y: 245, w: 35, h: 55 } },
  { id: 'upper-back', label: 'Upper Back', front: null },
  { id: 'lower-back', label: 'Lower Back', front: null },
  { id: 'left-foot', label: 'Left Foot', front: { x: 115, y: 305, w: 30, h: 20 } },
  { id: 'right-foot', label: 'Right Foot', front: { x: 175, y: 305, w: 30, h: 20 } },
  { id: 'ribs-left', label: 'Left Ribs', front: { x: 100, y: 95, w: 25, h: 40 } },
  { id: 'ribs-right', label: 'Right Ribs', front: { x: 195, y: 95, w: 25, h: 40 } },
];

export default function BodyMapPicker({ value, onChange }: BodyMapPickerProps) {
  const [mode, setMode] = useState<'visual' | 'text'>('visual');

  const selectedZone = BODY_ZONES.find((z) => z.label === value);

  return (
    <div>
      {/* Mode toggle */}
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => setMode('visual')}
          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === 'visual' ? 'text-[var(--color-accent)]' : 'text-gray-400 hover:text-white'
          }`}
          style={mode === 'visual' ? { background: 'var(--color-accent-muted)', border: '1px solid var(--color-border-accent)' } : { border: '1px solid var(--color-border)' }}
        >
          Body Map
        </button>
        <button
          type="button"
          onClick={() => setMode('text')}
          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === 'text' ? 'text-[var(--color-accent)]' : 'text-gray-400 hover:text-white'
          }`}
          style={mode === 'text' ? { background: 'var(--color-accent-muted)', border: '1px solid var(--color-border-accent)' } : { border: '1px solid var(--color-border)' }}
        >
          Type It
        </button>
      </div>

      {mode === 'text' ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. Inner left forearm, right shoulder blade..."
          className="premium-input w-full"
        />
      ) : (
        <div className="flex gap-4 flex-col sm:flex-row">
          {/* SVG body outline */}
          <div className="relative shrink-0" style={{ width: 320, height: 340 }}>
            <svg viewBox="0 0 320 340" className="w-full h-full">
              {/* Simple body outline */}
              <ellipse cx="160" cy="30" rx="22" ry="26" fill="none" stroke="var(--color-border-accent)" strokeWidth="1.5" />
              {/* Torso */}
              <path d="M 120 56 L 120 170 L 200 170 L 200 56" fill="none" stroke="var(--color-border-accent)" strokeWidth="1.5" />
              {/* Arms */}
              <path d="M 120 60 L 80 70 L 60 130 L 50 190" fill="none" stroke="var(--color-border-accent)" strokeWidth="1.5" />
              <path d="M 200 60 L 240 70 L 260 130 L 270 190" fill="none" stroke="var(--color-border-accent)" strokeWidth="1.5" />
              {/* Legs */}
              <path d="M 120 170 L 118 240 L 120 310" fill="none" stroke="var(--color-border-accent)" strokeWidth="1.5" />
              <path d="M 200 170 L 202 240 L 200 310" fill="none" stroke="var(--color-border-accent)" strokeWidth="1.5" />
              <path d="M 145 170 L 140 240 L 135 310" fill="none" stroke="var(--color-border-accent)" strokeWidth="1.5" />
              <path d="M 175 170 L 180 240 L 185 310" fill="none" stroke="var(--color-border-accent)" strokeWidth="1.5" />

              {/* Clickable zones */}
              {BODY_ZONES.filter((z) => z.front).map((zone) => {
                const isSelected = value === zone.label;
                const f = zone.front!;
                return (
                  <rect
                    key={zone.id}
                    x={f.x}
                    y={f.y}
                    width={f.w}
                    height={f.h}
                    rx={2}
                    fill={isSelected ? 'rgba(255, 179, 71, 0.25)' : 'rgba(255, 179, 71, 0.04)'}
                    stroke={isSelected ? 'var(--color-accent)' : 'transparent'}
                    strokeWidth={isSelected ? 2 : 0}
                    className="cursor-pointer transition-all"
                    onClick={() => onChange(zone.label)}
                  >
                    <title>{zone.label}</title>
                  </rect>
                );
              })}
            </svg>
          </div>

          {/* Zone list (for zones without visual, and as labels) */}
          <div className="flex-1 space-y-1.5">
            <div className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>Click a zone or select below:</div>
            <div className="flex flex-wrap gap-1.5">
              {BODY_ZONES.map((zone) => (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => onChange(zone.label)}
                  className={`px-2.5 py-1 text-xs font-medium transition-all ${
                    value === zone.label
                      ? 'text-[var(--color-accent)]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  style={value === zone.label
                    ? { background: 'var(--color-accent-muted)', border: '1px solid var(--color-accent)' }
                    : { background: 'var(--color-accent-subtle)', border: '1px solid var(--color-border)' }
                  }
                >
                  {zone.label}
                </button>
              ))}
            </div>
            {selectedZone && (
              <div className="mt-3 text-sm text-white font-display">
                Selected: <span style={{ color: 'var(--color-accent)' }}>{selectedZone.label}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
