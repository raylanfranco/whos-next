import { Camera } from 'lucide-react';
import BodyMapPicker from './BodyMapPicker';
import {
  TATTOO_STYLES,
  TATTOO_SIZES,
  TATTOO_TYPES,
  COLOR_PREFERENCES,
  type TattooIntakeData,
} from './TattooIntakeSchema';

interface DesignIntakeProps {
  value: TattooIntakeData;
  onChange: (data: TattooIntakeData) => void;
}

function RadioGroup({
  options,
  value,
  onChange,
  columns = 3,
}: {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  columns?: number;
}) {
  return (
    <div className="flex flex-wrap gap-2" style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-3 py-2 text-xs font-medium transition-all text-left ${
            value === opt ? 'text-[var(--color-accent)]' : 'text-gray-400 hover:text-white'
          }`}
          style={value === opt
            ? { background: 'var(--color-accent-muted)', border: '1px solid var(--color-accent)' }
            : { background: 'var(--color-accent-subtle)', border: '1px solid var(--color-border)' }
          }
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function DesignIntake({ value, onChange }: DesignIntakeProps) {
  function update(field: keyof TattooIntakeData, val: unknown) {
    onChange({ ...value, [field]: val });
  }

  return (
    <div className="space-y-6">
      {/* Style */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
          Tattoo Style <span style={{ color: 'var(--color-danger)' }}>*</span>
        </label>
        <RadioGroup
          options={TATTOO_STYLES}
          value={value.style}
          onChange={(v) => update('style', v)}
          columns={3}
        />
      </div>

      {/* Placement */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
          Placement <span style={{ color: 'var(--color-danger)' }}>*</span>
        </label>
        <BodyMapPicker value={value.placement} onChange={(v) => update('placement', v)} />
      </div>

      {/* Size */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
          Estimated Size <span style={{ color: 'var(--color-danger)' }}>*</span>
        </label>
        <RadioGroup
          options={TATTOO_SIZES}
          value={value.sizeEstimate}
          onChange={(v) => update('sizeEstimate', v)}
          columns={2}
        />
      </div>

      {/* New/Touch-up/Cover-up */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
          Type <span style={{ color: 'var(--color-danger)' }}>*</span>
        </label>
        <RadioGroup
          options={TATTOO_TYPES}
          value={value.isNewOrRework}
          onChange={(v) => update('isNewOrRework', v)}
          columns={4}
        />
      </div>

      {/* Color preference */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
          Color Preference <span className="font-normal" style={{ color: 'var(--color-text-muted)' }}>(optional)</span>
        </label>
        <RadioGroup
          options={COLOR_PREFERENCES}
          value={value.colorPreference}
          onChange={(v) => update('colorPreference', v)}
          columns={3}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
          Describe Your Idea <span style={{ color: 'var(--color-danger)' }}>*</span>
        </label>
        <textarea
          value={value.description}
          onChange={(e) => update('description', e.target.value)}
          rows={3}
          placeholder="Tell us about your tattoo idea — theme, symbols, text, references..."
          className="premium-input w-full"
        />
      </div>

      {/* Reference photos */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
          Reference Photos <span className="font-normal" style={{ color: 'var(--color-text-muted)' }}>(optional, up to 5)</span>
        </label>
        <div
          className="p-6 text-center cursor-pointer transition-all"
          style={{ background: 'var(--color-accent-subtle)', border: '2px dashed var(--color-border-accent)' }}
          onClick={() => document.getElementById('ref-photos')?.click()}
        >
          <Camera className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-text-muted)' }} />
          <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {value.referencePhotos.length > 0
              ? `${value.referencePhotos.length} photo${value.referencePhotos.length > 1 ? 's' : ''} selected`
              : 'Tap to upload reference images'}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>PNG, JPG up to 5MB each</div>
        </div>
        <input
          id="ref-photos"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = e.target.files;
            if (!files) return;
            // For now, store file names — actual upload handled when backend storage is configured
            const names = Array.from(files).slice(0, 5).map((f) => f.name);
            update('referencePhotos', [...value.referencePhotos, ...names].slice(0, 5));
          }}
        />
        {value.referencePhotos.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {value.referencePhotos.map((name, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 flex items-center gap-1"
                style={{ background: 'var(--color-accent-subtle)', border: '1px solid var(--color-border-accent)', color: 'var(--color-text-secondary)' }}
              >
                {name}
                <button
                  type="button"
                  onClick={() => update('referencePhotos', value.referencePhotos.filter((_, j) => j !== i))}
                  className="hover:text-red-400 ml-1"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Skin tone notes */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
          Skin Tone / Condition Notes <span className="font-normal" style={{ color: 'var(--color-text-muted)' }}>(optional)</span>
        </label>
        <input
          type="text"
          value={value.skinToneNotes}
          onChange={(e) => update('skinToneNotes', e.target.value)}
          placeholder="Any scarring, skin conditions, or notes..."
          className="premium-input w-full"
        />
      </div>
    </div>
  );
}
