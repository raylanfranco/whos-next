/**
 * Powersports VehicleSelector — type-first selector for the BDCC vertical.
 *
 * Why not NHTSA? Their motorcycle data is incomplete for older / kit /
 * custom-built bikes (which is most of what a custom shop touches), and they
 * don't cover boats / ATVs / UTVs / snowmobiles meaningfully. Freeform fields
 * with a typed-up type picker is the honest answer for this market.
 */

import type { VehicleType } from '../../types';

export interface PowersportsVehicleData {
  type: VehicleType | '';
  year: string;
  make: string;
  model: string;
  trim: string;
}

export const EMPTY_POWERSPORTS_VEHICLE: PowersportsVehicleData = {
  type: '',
  year: '',
  make: '',
  model: '',
  trim: '',
};

interface VehicleSelectorProps {
  value: PowersportsVehicleData;
  onChange: (value: PowersportsVehicleData) => void;
}

const VEHICLE_TYPE_OPTIONS: { value: VehicleType; label: string; hint: string }[] = [
  { value: 'MOTORCYCLE', label: 'Motorcycle', hint: 'Cruiser, sport, chopper, scrambler' },
  { value: 'BOAT', label: 'Boat', hint: 'Outboard, inboard, sterndrive' },
  { value: 'ATV', label: 'ATV', hint: 'Quad / four-wheeler' },
  { value: 'UTV', label: 'UTV / Side-by-side', hint: 'RZR, Ranger, Wildcat' },
  { value: 'SNOWMOBILE', label: 'Snowmobile', hint: 'Sled' },
  { value: 'OTHER', label: 'Other', hint: 'Custom / kit / one-off' },
];

// Year range: 1950 → current year + 1 (custom shops touch old iron all the time)
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR + 2 - 1950 }, (_, i) =>
  String(CURRENT_YEAR + 1 - i),
);

export default function PowersportsVehicleSelector({ value, onChange }: VehicleSelectorProps) {
  function update<K extends keyof PowersportsVehicleData>(
    field: K,
    val: PowersportsVehicleData[K],
  ) {
    onChange({ ...value, [field]: val });
  }

  return (
    <div className="space-y-6">
      {/* Vehicle type — required first step */}
      <div>
        <label
          className="block text-sm font-medium mb-3"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          What are we working on? <span style={{ color: 'var(--color-accent)' }}>*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {VEHICLE_TYPE_OPTIONS.map((opt) => {
            const isSelected = value.type === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => update('type', opt.value)}
                className="p-3 text-left transition-all"
                style={{
                  background: isSelected
                    ? 'var(--color-accent-muted)'
                    : 'var(--color-accent-subtle)',
                  border: `1px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  color: isSelected ? 'var(--color-accent)' : 'var(--color-text-primary)',
                }}
              >
                <div className="font-medium text-sm">{opt.label}</div>
                <div
                  className="text-[10px] mt-1"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {opt.hint}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Year / Make / Model / Trim — only after type is picked */}
      {value.type && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Year
            </label>
            <select
              value={value.year}
              onChange={(e) => update('year', e.target.value)}
              className="premium-input w-full"
            >
              <option value="">Select year</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Make
            </label>
            <input
              value={value.make}
              onChange={(e) => update('make', e.target.value)}
              placeholder={makePlaceholder(value.type)}
              className="premium-input w-full"
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Model
            </label>
            <input
              value={value.model}
              onChange={(e) => update('model', e.target.value)}
              placeholder={modelPlaceholder(value.type)}
              className="premium-input w-full"
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Trim / variant{' '}
              <span className="font-normal" style={{ color: 'var(--color-text-muted)' }}>
                (optional)
              </span>
            </label>
            <input
              value={value.trim}
              onChange={(e) => update('trim', e.target.value)}
              placeholder="e.g. Heritage, FXR, T-Bucket"
              className="premium-input w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function makePlaceholder(type: VehicleType | ''): string {
  switch (type) {
    case 'MOTORCYCLE':
      return 'Harley, Indian, Triumph, Honda…';
    case 'BOAT':
      return 'Boston Whaler, Sea-Doo, Yamaha…';
    case 'ATV':
    case 'UTV':
      return 'Polaris, Can-Am, Yamaha, Honda…';
    case 'SNOWMOBILE':
      return 'Ski-Doo, Polaris, Arctic Cat…';
    default:
      return 'Manufacturer or builder';
  }
}

function modelPlaceholder(type: VehicleType | ''): string {
  switch (type) {
    case 'MOTORCYCLE':
      return 'Sportster, Street Glide, Bonneville…';
    case 'BOAT':
      return 'Outrage, GTI, FX SVHO…';
    case 'ATV':
      return 'Sportsman, Outlander, Grizzly…';
    case 'UTV':
      return 'RZR, Maverick, Ranger…';
    case 'SNOWMOBILE':
      return 'MXZ, RMK, ZR Thundercat…';
    default:
      return 'Model or "custom"';
  }
}
