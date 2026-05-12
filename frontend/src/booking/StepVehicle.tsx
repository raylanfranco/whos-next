import { useEffect, useRef, useState } from 'react';
import type { Merchant, VehicleType } from '../types';

export interface VehicleFormValue {
  type: VehicleType | '';
  year: string;
  make: string;
  model: string;
  trim: string;
}

interface StepVehicleProps {
  merchant: Merchant | null;
  value: VehicleFormValue;
  onChange: (v: VehicleFormValue) => void;
}

const POWERSPORTS_TYPES: { value: VehicleType; label: string; hint: string }[] = [
  { value: 'MOTORCYCLE', label: 'Motorcycle', hint: 'Cruiser, sport, chopper' },
  { value: 'BOAT', label: 'Boat', hint: 'Outboard, inboard' },
  { value: 'ATV', label: 'ATV', hint: 'Quad / 4-wheeler' },
  { value: 'UTV', label: 'UTV', hint: 'RZR, Ranger, Wildcat' },
  { value: 'SNOWMOBILE', label: 'Snowmobile', hint: 'Sled' },
  { value: 'OTHER', label: 'Other', hint: 'Custom / kit / one-off' },
];

const CURRENT_YEAR = new Date().getFullYear();
const AUTOMOTIVE_YEARS = Array.from({ length: 38 }, (_, i) => String(CURRENT_YEAR + 1 - i));
const POWERSPORTS_YEARS = Array.from({ length: CURRENT_YEAR + 2 - 1950 }, (_, i) => String(CURRENT_YEAR + 1 - i));

const nhtsaCache: Record<string, string[]> = {};

async function fetchMakes(): Promise<string[]> {
  const key = 'makes';
  if (nhtsaCache[key]) return nhtsaCache[key];
  const res = await fetch('https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json');
  const data = (await res.json()) as { Results: { MakeName: string }[] };
  const sorted = data.Results.map((m) => m.MakeName).sort((a, b) => a.localeCompare(b));
  nhtsaCache[key] = sorted;
  return sorted;
}

async function fetchModels(year: string, make: string): Promise<string[]> {
  const key = `models:${year}:${make}`;
  if (nhtsaCache[key]) return nhtsaCache[key];
  const encoded = encodeURIComponent(make);
  const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${encoded}/modelyear/${year}?format=json`);
  const data = (await res.json()) as { Results: { Model_Name: string }[] };
  const sorted = data.Results.map((m) => m.Model_Name).sort((a, b) => a.localeCompare(b));
  nhtsaCache[key] = sorted;
  return sorted;
}

export function StepVehicle({ merchant, value, onChange }: StepVehicleProps) {
  const isPowersports = merchant?.vertical === 'POWERSPORTS';
  const headingMain = isPowersports ? 'Your Build' : 'Your Vehicle';
  const headingSub = isPowersports
    ? "Tell us what we're working on so we can prep parts, paint, and tooling."
    : 'Pick your year, make, and model so we can prepare for your appointment.';

  function patch<K extends keyof VehicleFormValue>(field: K, val: VehicleFormValue[K]) {
    const next: VehicleFormValue = { ...value, [field]: val };
    if (field === 'type') { next.year = ''; next.make = ''; next.model = ''; next.trim = ''; }
    if (field === 'year' || field === 'make') { next.model = ''; next.trim = ''; }
    if (field === 'model') { next.trim = ''; }
    onChange(next);
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
      <header className="bk-heading" style={{ marginBottom: '3rem' }}>
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
          {headingMain}
        </h1>
        <p style={{ color: 'var(--bk-text-muted)', marginTop: '1rem', maxWidth: '40rem' }}>
          {headingSub}
        </p>
      </header>

      {isPowersports && (
        <TypePicker
          value={value.type as VehicleType | ''}
          onChange={(t) => patch('type', t)}
        />
      )}

      {(!isPowersports || value.type) && (
        <FormCard>
          {isPowersports ? (
            <PowersportsFields value={value} patch={patch} />
          ) : (
            <AutomotiveFields value={value} patch={patch} />
          )}
        </FormCard>
      )}

      {!isPowersports && value.year && value.make && value.model && (
        <VehiclePreview
          year={value.year}
          make={value.make}
          model={value.model}
          trim={value.trim}
        />
      )}
    </main>
  );
}

function TypePicker({
  value,
  onChange,
}: {
  value: VehicleType | '';
  onChange: (t: VehicleType) => void;
}) {
  return (
    <section style={{ marginBottom: '2rem' }}>
      <FieldLabel>What are we working on? <Required /></FieldLabel>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 14rem), 1fr))',
          gap: '0.75rem',
          marginTop: '0.75rem',
        }}
      >
        {POWERSPORTS_TYPES.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`bk-card ${isSelected ? 'bk-card-selected' : ''}`}
              style={{
                position: 'relative',
                textAlign: 'left',
                padding: '1rem 1.25rem',
                cursor: 'pointer',
                background: isSelected ? 'var(--bk-bg-surface-elevated)' : 'var(--bk-bg-surface)',
              }}
            >
              <div
                className="bk-mono"
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: isSelected ? 'var(--bk-accent)' : 'var(--bk-text-main)',
                }}
              >
                {opt.label}
              </div>
              <div
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--bk-text-muted)',
                  marginTop: '0.25rem',
                }}
              >
                {opt.hint}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function FormCard({ children }: { children: React.ReactNode }) {
  return (
    <section
      className="bk-card"
      style={{ position: 'relative', padding: '2rem', backgroundColor: 'var(--bk-bg-surface)' }}
    >
      <CornerBrackets />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 16rem), 1fr))',
          gap: '1.5rem 2rem',
        }}
      >
        {children}
      </div>
    </section>
  );
}

function CornerBrackets() {
  const base: React.CSSProperties = { position: 'absolute', width: '8px', height: '8px' };
  return (
    <>
      <span style={{ ...base, top: 0, left: 0, borderTop: '1px solid var(--bk-text-muted)', borderLeft: '1px solid var(--bk-text-muted)' }} aria-hidden="true" />
      <span style={{ ...base, top: 0, right: 0, borderTop: '1px solid var(--bk-text-muted)', borderRight: '1px solid var(--bk-text-muted)' }} aria-hidden="true" />
      <span style={{ ...base, bottom: 0, left: 0, borderBottom: '1px solid var(--bk-text-muted)', borderLeft: '1px solid var(--bk-text-muted)' }} aria-hidden="true" />
      <span style={{ ...base, bottom: 0, right: 0, borderBottom: '1px solid var(--bk-text-muted)', borderRight: '1px solid var(--bk-text-muted)' }} aria-hidden="true" />
    </>
  );
}

function AutomotiveFields({
  value,
  patch,
}: {
  value: VehicleFormValue;
  patch: <K extends keyof VehicleFormValue>(field: K, val: VehicleFormValue[K]) => void;
}) {
  const [makes, setMakes] = useState<string[]>([]);
  const [modelsForKey, setModelsForKey] = useState<{ key: string; list: string[] }>({ key: '', list: [] });
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    let cancelled = false;
    fetchMakes()
      .then((m) => { if (!cancelled) setMakes(m); })
      .catch(() => { if (!cancelled) setMakes([]); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!value.year || !value.make) return;
    const key = `${value.year}:${value.make}`;
    let cancelled = false;
    fetchModels(value.year, value.make)
      .then((m) => { if (!cancelled) setModelsForKey({ key, list: m }); })
      .catch(() => { if (!cancelled) setModelsForKey({ key, list: [] }); });
    return () => { cancelled = true; };
  }, [value.year, value.make]);

  const modelsLoaded = modelsForKey.key === `${value.year}:${value.make}`;
  const models = modelsLoaded ? modelsForKey.list : [];
  const makesReady = makes.length > 0;

  return (
    <>
      <Field label="Year">
        <SelectInput value={value.year} onChange={(v) => patch('year', v)}>
          <option value="">Select year</option>
          {AUTOMOTIVE_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </SelectInput>
      </Field>
      <Field label="Make">
        <SelectInput
          value={value.make}
          onChange={(v) => patch('make', v)}
          disabled={!makesReady || !value.year}
        >
          <option value="">{makesReady ? 'Select make' : 'Loading…'}</option>
          {makes.map((m) => <option key={m} value={m}>{m}</option>)}
        </SelectInput>
      </Field>
      <Field label="Model">
        <SelectInput
          value={value.model}
          onChange={(v) => patch('model', v)}
          disabled={!value.year || !value.make || !modelsLoaded}
        >
          <option value="">{!value.year || !value.make ? 'Select year & make first' : !modelsLoaded ? 'Loading…' : 'Select model'}</option>
          {models.map((m) => <option key={m} value={m}>{m}</option>)}
        </SelectInput>
      </Field>
      <Field label="Trim" optional>
        <TextInput
          value={value.trim}
          onChange={(v) => patch('trim', v)}
          placeholder="e.g. EX, Sport, Limited"
        />
      </Field>
    </>
  );
}

function PowersportsFields({
  value,
  patch,
}: {
  value: VehicleFormValue;
  patch: <K extends keyof VehicleFormValue>(field: K, val: VehicleFormValue[K]) => void;
}) {
  const placeholders = makePlaceholders(value.type);
  return (
    <>
      <Field label="Year">
        <SelectInput value={value.year} onChange={(v) => patch('year', v)}>
          <option value="">Select year</option>
          {POWERSPORTS_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </SelectInput>
      </Field>
      <Field label="Make">
        <TextInput
          value={value.make}
          onChange={(v) => patch('make', v)}
          placeholder={placeholders.make}
        />
      </Field>
      <Field label="Model">
        <TextInput
          value={value.model}
          onChange={(v) => patch('model', v)}
          placeholder={placeholders.model}
        />
      </Field>
      <Field label="Trim / Variant" optional>
        <TextInput
          value={value.trim}
          onChange={(v) => patch('trim', v)}
          placeholder='e.g. Heritage, FXR, T-Bucket'
        />
      </Field>
    </>
  );
}

function makePlaceholders(type: VehicleType | ''): { make: string; model: string } {
  switch (type) {
    case 'MOTORCYCLE': return { make: 'Harley, Indian, Triumph…', model: 'Sportster, Street Glide…' };
    case 'BOAT': return { make: 'Boston Whaler, Sea-Doo…', model: 'Outrage, GTI, FX SVHO…' };
    case 'ATV': return { make: 'Polaris, Can-Am, Honda…', model: 'Sportsman, Outlander…' };
    case 'UTV': return { make: 'Polaris, Can-Am, Yamaha…', model: 'RZR, Maverick, Ranger…' };
    case 'SNOWMOBILE': return { make: 'Ski-Doo, Polaris, Arctic Cat…', model: 'MXZ, RMK, ZR…' };
    default: return { make: 'Manufacturer or builder', model: 'Model or "custom"' };
  }
}

function Field({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <FieldLabel>
        {label}
        {optional && <OptionalTag />}
      </FieldLabel>
      <div style={{ position: 'relative' }}>
        {children}
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="bk-mono"
      style={{
        fontSize: '0.65rem',
        color: 'var(--bk-text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
      }}
    >
      {children}
    </label>
  );
}

function OptionalTag() {
  return (
    <span
      className="bk-mono"
      style={{
        fontSize: '0.55rem',
        color: 'var(--bk-border-focus)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        marginLeft: '0.5rem',
      }}
    >
      Optional
    </span>
  );
}

function Required() {
  return <span style={{ color: 'var(--bk-accent)', marginLeft: '0.25rem' }}>*</span>;
}

function SelectInput({
  value,
  onChange,
  disabled,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ position: 'relative' }}>
      <select
        className="bk-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{ paddingRight: '2.5rem' }}
      >
        {children}
      </select>
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          width: 0,
          height: 0,
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderTop: `6px solid ${disabled ? 'var(--bk-border-focus)' : 'var(--bk-text-muted)'}`,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      className="bk-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function VehiclePreview({
  year,
  make,
  model,
  trim,
}: {
  year: string;
  make: string;
  model: string;
  trim: string;
}) {
  const imgUrl = `https://cdn.imagin.studio/getimage?customer=img&make=${encodeURIComponent(make)}&modelFamily=${encodeURIComponent(model)}&modelYear=${year}&angle=01`;
  const title = [year, make, model, trim].filter(Boolean).join(' ');

  return (
    <section
      className="bk-card"
      style={{
        marginTop: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'var(--bk-bg-base)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          padding: '0.25rem 0.5rem',
          background: 'var(--bk-bg-surface)',
          border: '1px solid var(--bk-border-focus)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          zIndex: 10,
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            background: 'var(--bk-accent)',
            animation: 'bk-pulse-dot 2s infinite',
          }}
          aria-hidden="true"
        />
        <span
          className="bk-mono"
          style={{
            fontSize: '0.6rem',
            color: 'var(--bk-text-muted)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          Vehicle Detected
        </span>
      </div>

      <div
        className="bk-dot-grid"
        style={{
          width: '100%',
          aspectRatio: '16 / 6',
          maxHeight: '280px',
          borderBottom: '1px solid var(--bk-border-subtle)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={imgUrl}
          alt={title}
          style={{
            maxWidth: '70%',
            maxHeight: '100%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.5))',
            zIndex: 1,
          }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>

      <div style={{ padding: '1.5rem 2rem' }}>
        <h2
          className="bk-display"
          style={{
            fontSize: '1.75rem',
            margin: 0,
            textTransform: 'uppercase',
            color: 'var(--bk-text-main)',
            letterSpacing: '0.02em',
            lineHeight: 1,
          }}
        >
          {title}
        </h2>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'var(--bk-border-subtle)',
          overflow: 'hidden',
        }}
        aria-hidden="true"
      >
        <div
          style={{
            height: '100%',
            background: 'var(--bk-accent)',
            transformOrigin: 'left',
            animation: 'bk-scan-bar 1s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>
    </section>
  );
}
