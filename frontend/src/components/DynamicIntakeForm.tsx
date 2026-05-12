import { useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { upload } from '@vercel/blob/client';
import type { IntakeQuestion } from '../types';
import TintZonePicker from './TintZonePicker';
import BodyMapPicker from '../adapters/tattoo/BodyMapPicker';

interface DynamicIntakeFormProps {
  questions: IntakeQuestion[];
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const MAX_PHOTOS = 6;

export default function DynamicIntakeForm({ questions, values, onChange }: DynamicIntakeFormProps) {
  // Per-question upload state. We only need to track which question is mid-upload
  // and surface error messages — the resulting URLs go straight into `values`.
  const [uploading, setUploading] = useState<Record<string, number>>({});
  const [uploadError, setUploadError] = useState<Record<string, string>>({});

  function setValue(questionId: string, value: unknown) {
    onChange({ ...values, [questionId]: value });
  }

  async function uploadPhotos(questionId: string, files: FileList) {
    const existing = (values[questionId] as string[]) || [];
    const room = MAX_PHOTOS - existing.length;
    if (room <= 0) return;
    const slice = Array.from(files).slice(0, room);

    setUploadError((s) => ({ ...s, [questionId]: '' }));
    setUploading((s) => ({ ...s, [questionId]: slice.length }));

    try {
      const uploaded: string[] = [];
      for (const file of slice) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const pathname = `booking-intake/${questionId}/${Date.now()}-${safeName}`;
        const blob = await upload(pathname, file, {
          access: 'public',
          handleUploadUrl: `${API_BASE}/uploads/blob-token`,
          contentType: file.type,
        });
        uploaded.push(blob.url);
      }
      onChange({ ...values, [questionId]: [...existing, ...uploaded] });
    } catch (err) {
      setUploadError((s) => ({
        ...s,
        [questionId]: err instanceof Error ? err.message : 'Upload failed',
      }));
    } finally {
      setUploading((s) => {
        const next = { ...s };
        delete next[questionId];
        return next;
      });
    }
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

          {/* PHOTO_UPLOAD — Vercel Blob direct upload */}
          {q.type === 'PHOTO_UPLOAD' && (() => {
            const urls = (values[q.id] as string[]) || [];
            const isUploading = uploading[q.id] > 0;
            const atCap = urls.length >= MAX_PHOTOS;
            const err = uploadError[q.id];

            return (
              <div>
                {!atCap && (
                  <label
                    htmlFor={`photo-${q.id}`}
                    className={`block p-5 text-center transition-all ${isUploading ? 'cursor-wait' : 'cursor-pointer'}`}
                    style={{
                      background: 'var(--color-accent-subtle)',
                      border: '2px dashed var(--color-border-accent)',
                      opacity: isUploading ? 0.6 : 1,
                    }}
                  >
                    {isUploading ? (
                      <>
                        <Loader2
                          className="w-6 h-6 mx-auto mb-1.5 animate-spin"
                          style={{ color: 'var(--color-accent)' }}
                        />
                        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          Uploading {uploading[q.id]} photo{uploading[q.id] === 1 ? '' : 's'}…
                        </div>
                      </>
                    ) : (
                      <>
                        <Camera className="w-6 h-6 mx-auto mb-1.5" style={{ color: 'var(--color-text-muted)' }} />
                        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          {urls.length === 0
                            ? `Tap to upload (up to ${MAX_PHOTOS})`
                            : `Add more (${urls.length} / ${MAX_PHOTOS})`}
                        </div>
                      </>
                    )}
                  </label>
                )}
                <input
                  id={`photo-${q.id}`}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic"
                  multiple
                  className="hidden"
                  disabled={isUploading}
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) uploadPhotos(q.id, files);
                    e.target.value = ''; // reset so re-picking same file works
                  }}
                />
                {err && (
                  <div className="mt-2 text-xs" style={{ color: '#f87171' }}>
                    {err}
                  </div>
                )}
                {urls.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                    {urls.map((url: string, i: number) => (
                      <div
                        key={url}
                        className="relative aspect-square overflow-hidden"
                        style={{
                          background: 'var(--color-accent-subtle)',
                          border: '1px solid var(--color-border-accent)',
                        }}
                      >
                        <img
                          src={url}
                          alt={`Reference ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setValue(q.id, urls.filter((_, j) => j !== i))}
                          className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center text-xs font-bold"
                          style={{
                            background: 'rgba(0,0,0,0.7)',
                            color: '#fff',
                          }}
                          aria-label="Remove photo"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      ))}
    </div>
  );
}
