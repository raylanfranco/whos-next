export interface IntakeData {
  currentSetup: string;
  existingMods: string[];
  knownIssues: string;
  additionalNotes: string;
}

export const EMPTY_INTAKE: IntakeData = {
  currentSetup: '',
  existingMods: [],
  knownIssues: '',
  additionalNotes: '',
};

interface IntakeQuestionnaireProps {
  value: IntakeData;
  onChange: (value: IntakeData) => void;
}

const SETUP_OPTIONS = [
  { value: 'stock', label: 'Stock / Factory' },
  { value: 'aftermarket_basic', label: 'Aftermarket (basic)' },
  { value: 'aftermarket_custom', label: 'Aftermarket (full custom)' },
];

const MOD_OPTIONS = [
  'Aftermarket head unit',
  'Amplifier',
  'Subwoofer',
  'Speaker upgrade',
  'Remote start',
  'Backup camera',
  'LED / Lighting',
  'Other',
];

export default function IntakeQuestionnaire({ value, onChange }: IntakeQuestionnaireProps) {
  function toggleMod(mod: string) {
    const next = value.existingMods.includes(mod)
      ? value.existingMods.filter((m) => m !== mod)
      : [...value.existingMods, mod];
    onChange({ ...value, existingMods: next });
  }

  return (
    <div className="space-y-4">
      {/* Current setup */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Current Audio Setup</label>
        <div className="flex flex-wrap gap-2">
          {SETUP_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm cursor-pointer transition-all ${
                value.currentSetup === opt.value
                  ? 'border-primary bg-primary/5 text-primary font-medium shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
              }`}
            >
              <input
                type="radio"
                name="currentSetup"
                value={opt.value}
                checked={value.currentSetup === opt.value}
                onChange={() => onChange({ ...value, currentSetup: opt.value })}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {/* Existing modifications */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Existing Modifications</label>
        <div className="flex flex-wrap gap-2">
          {MOD_OPTIONS.map((mod) => (
            <label
              key={mod}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm cursor-pointer transition-all ${
                value.existingMods.includes(mod)
                  ? 'border-primary bg-primary/5 text-primary font-medium shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
              }`}
            >
              <input
                type="checkbox"
                checked={value.existingMods.includes(mod)}
                onChange={() => toggleMod(mod)}
                className="sr-only"
              />
              {mod}
            </label>
          ))}
        </div>
      </div>

      {/* Known issues */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Known Issues
          <span className="text-slate-400 font-normal ml-1">(optional)</span>
        </label>
        <textarea
          value={value.knownIssues}
          onChange={(e) => onChange({ ...value, knownIssues: e.target.value })}
          rows={2}
          placeholder="Any electrical issues, blown speakers, previous install problems?"
          className="premium-input w-full"
        />
      </div>

      {/* Additional notes */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Additional Notes
          <span className="text-slate-400 font-normal ml-1">(optional)</span>
        </label>
        <textarea
          value={value.additionalNotes}
          onChange={(e) => onChange({ ...value, additionalNotes: e.target.value })}
          rows={2}
          placeholder="Wire harness type, dash kit requirements, specific requests..."
          className="premium-input w-full"
        />
      </div>
    </div>
  );
}
