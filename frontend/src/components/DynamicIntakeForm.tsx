import { Camera } from 'lucide-react';
import type { IntakeQuestion } from '../types';
import TintZonePicker from './TintZonePicker';
import BodyMapPicker from '../adapters/tattoo/BodyMapPicker';

interface DynamicIntakeFormProps {
  questions: IntakeQuestion[];
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
}

export default function DynamicIntakeForm({ questions, values, onChange }: DynamicIntakeFormProps) {
  function setValue(questionId: string, value: unknown) {
    onChange({ ...values, [questionId]: value });
  }

  function toggleCheckbox(questionId: string, option: string) {
    const current = (values[questionId] as string[]) || [];
    const next = current.includes(option)
      ? current.filter((v) => v !== option)
      : [...current, option];
    setValue(questionId, next);
  }

  if (questions.length === 0) return null;

  return (
    <div className="space-y-5">
      {questions.map((q) => (
        <div key={q.id}>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {q.question}
            {q.required && <span className="text-red-500 ml-0.5">*</span>}
            {!q.required && <span className="text-slate-400 font-normal ml-1">(optional)</span>}
          </label>

          {/* RADIO */}
          {q.type === 'RADIO' && q.options && (
            <div className="flex flex-wrap gap-2">
              {q.options.map((opt) => (
                <label
                  key={opt}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm cursor-pointer transition-all ${
                    values[q.id] === opt
                      ? 'border-primary bg-primary/5 text-primary font-medium shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
                  }`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={opt}
                    checked={values[q.id] === opt}
                    onChange={() => setValue(q.id, opt)}
                    className="sr-only"
                  />
                  {opt}
                </label>
              ))}
            </div>
          )}

          {/* CHECKBOX */}
          {q.type === 'CHECKBOX' && q.options && (
            <div className="flex flex-wrap gap-2">
              {q.options.map((opt) => {
                const checked = ((values[q.id] as string[]) || []).includes(opt);
                return (
                  <label
                    key={opt}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm cursor-pointer transition-all ${
                      checked
                        ? 'border-primary bg-primary/5 text-primary font-medium shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCheckbox(q.id, opt)}
                      className="sr-only"
                    />
                    {opt}
                  </label>
                );
              })}
            </div>
          )}

          {/* SELECT */}
          {q.type === 'SELECT' && q.options && (
            <select
              value={(values[q.id] as string) || ''}
              onChange={(e) => setValue(q.id, e.target.value)}
              className="premium-input w-full"
            >
              <option value="">Select an option...</option>
              {q.options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          )}

          {/* TEXT */}
          {q.type === 'TEXT' && (
            <textarea
              value={(values[q.id] as string) || ''}
              onChange={(e) => setValue(q.id, e.target.value)}
              rows={2}
              className="premium-input w-full"
            />
          )}

          {/* TINT_ZONE */}
          {q.type === 'TINT_ZONE' && (
            <TintZonePicker
              value={(values[q.id] as Record<string, string>) || {}}
              onChange={(val) => setValue(q.id, val)}
              shadeOptions={q.options && q.options.length > 0 ? q.options : ['5%', '20%', '35%', '50%', '70%']}
            />
          )}

          {/* BODY_MAP */}
          {q.type === 'BODY_MAP' && (
            <BodyMapPicker
              value={(values[q.id] as string) || ''}
              onChange={(val) => setValue(q.id, val)}
            />
          )}

          {/* PHOTO_UPLOAD */}
          {q.type === 'PHOTO_UPLOAD' && (
            <div>
              <div
                className="p-5 text-center cursor-pointer transition-all"
                style={{ background: 'var(--color-accent-subtle)', border: '2px dashed var(--color-border-accent)' }}
                onClick={() => document.getElementById(`photo-${q.id}`)?.click()}
              >
                <Camera className="w-6 h-6 mx-auto mb-1.5" style={{ color: 'var(--color-text-muted)' }} />
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {((values[q.id] as string[]) || []).length > 0
                    ? `${((values[q.id] as string[]) || []).length} file(s) selected`
                    : 'Tap to upload'}
                </div>
              </div>
              <input
                id={`photo-${q.id}`}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = e.target.files;
                  if (!files) return;
                  const names = Array.from(files).slice(0, 5).map((f) => f.name);
                  const current = (values[q.id] as string[]) || [];
                  setValue(q.id, [...current, ...names].slice(0, 5));
                }}
              />
              {((values[q.id] as string[]) || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {((values[q.id] as string[]) || []).map((name: string, i: number) => (
                    <span key={i} className="text-xs px-2 py-1" style={{ background: 'var(--color-accent-subtle)', border: '1px solid var(--color-border-accent)', color: 'var(--color-text-secondary)' }}>
                      {name}
                      <button
                        type="button"
                        onClick={() => setValue(q.id, ((values[q.id] as string[]) || []).filter((_: string, j: number) => j !== i))}
                        className="ml-1 hover:text-red-400"
                      >×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
