import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, ChevronDown, ChevronUp, ChevronLeft, GripVertical, Clock, DollarSign } from 'lucide-react';
import { api } from '../../lib/api';
import { useMerchant } from '../../context/MerchantContext';
import type { Service, IntakeQuestion, QuestionType } from '../../types';

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  'tints': '/images/services/tints.jpg',
  'window tinting': '/images/services/tints.jpg',
  'radio installation': '/images/services/radio.jpg',
  'car audio': '/images/services/car-audio.jpg',
  'intoxalock': '/images/services/intoxalock.jpg',
  'remote start': '/images/services/remote-start.jpg',
  'lighting': '/images/services/lighting.jpg',
  'ppf': '/images/services/ppf.jpg',
  'paint protection': '/images/services/ppf.jpg',
  'accessories': '/images/services/accessories.jpg',
  'security': '/images/services/security.jpg',
};

function getDefaultImage(service: Service): string | null {
  if (service.imageUrl) return service.imageUrl;
  const cat = (service.category || '').toLowerCase();
  return DEFAULT_CATEGORY_IMAGES[cat] || null;
}

interface ServiceFormData {
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  durationMins: number;
  priceCents: number;
  isActive: boolean;
}

const EMPTY_FORM: ServiceFormData = {
  name: '',
  description: '',
  category: '',
  imageUrl: '',
  durationMins: 60,
  priceCents: 0,
  isActive: true,
};

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'RADIO', label: 'Radio (single choice)' },
  { value: 'CHECKBOX', label: 'Checkbox (multiple choice)' },
  { value: 'SELECT', label: 'Dropdown' },
  { value: 'TEXT', label: 'Free text' },
  { value: 'TINT_ZONE', label: 'Tint zone picker' },
];

export default function ServicesPage() {
  const { merchant } = useMerchant();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceFormData>(EMPTY_FORM);
  const [priceInput, setPriceInput] = useState('');

  const [detailService, setDetailService] = useState<Service | null>(null);

  const [questions, setQuestions] = useState<IntakeQuestion[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [qForm, setQForm] = useState({ question: '', type: 'RADIO' as QuestionType, options: '', required: false });

  const fetchServices = useCallback(async () => {
    if (!merchant) return;
    setLoading(true);
    const data = await api.get<Service[]>(`/services?merchantId=${merchant.id}`);
    setServices(data);
    setLoading(false);
  }, [merchant]);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const fetchQuestions = useCallback(async (serviceId: string) => {
    setQuestionsLoading(true);
    const data = await api.get<IntakeQuestion[]>(`/intake-questions?serviceId=${serviceId}`);
    setQuestions(data);
    setQuestionsLoading(false);
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setPriceInput('');
    setShowModal(true);
  }

  function openEdit(s: Service) {
    setEditingId(s.id);
    setForm({
      name: s.name,
      description: s.description || '',
      category: s.category || '',
      imageUrl: s.imageUrl || '',
      durationMins: s.durationMins,
      priceCents: s.priceCents,
      isActive: s.isActive,
    });
    setPriceInput((s.priceCents / 100).toFixed(2));
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, priceCents: Math.round(parseFloat(priceInput) * 100) || 0 };
    if (editingId) {
      await api.patch(`/services/${editingId}`, payload);
    } else {
      await api.post('/services', { ...payload, merchantId: merchant!.id });
    }
    setShowModal(false);
    await fetchServices();
    if (detailService && editingId === detailService.id) {
      setDetailService({ ...detailService, ...payload });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this service?')) return;
    await api.delete(`/services/${id}`);
    if (detailService?.id === id) setDetailService(null);
    fetchServices();
  }

  async function toggleActive(s: Service) {
    await api.patch(`/services/${s.id}`, { isActive: !s.isActive });
    fetchServices();
    if (detailService?.id === s.id) {
      setDetailService({ ...detailService, isActive: !s.isActive });
    }
  }

  function openDetail(s: Service) {
    setDetailService(s);
    fetchQuestions(s.id);
    setShowQuestionForm(false);
    setEditingQuestionId(null);
  }

  function closeDetail() {
    setDetailService(null);
    setQuestions([]);
    setShowQuestionForm(false);
    setEditingQuestionId(null);
  }

  function openAddQuestion() {
    setEditingQuestionId(null);
    setQForm({ question: '', type: 'RADIO', options: '', required: false });
    setShowQuestionForm(true);
  }

  function openEditQuestion(q: IntakeQuestion) {
    setEditingQuestionId(q.id);
    setQForm({
      question: q.question,
      type: q.type,
      options: q.options ? q.options.join(', ') : '',
      required: q.required,
    });
    setShowQuestionForm(true);
  }

  async function handleQuestionSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!detailService) return;

    const needsOptions = qForm.type !== 'TEXT';
    const options = needsOptions
      ? qForm.options.split(',').map((o) => o.trim()).filter(Boolean)
      : undefined;

    if (editingQuestionId) {
      await api.patch(`/intake-questions/${editingQuestionId}`, {
        question: qForm.question,
        type: qForm.type,
        options: options ?? null,
        required: qForm.required,
      });
    } else {
      await api.post('/intake-questions', {
        serviceId: detailService.id,
        question: qForm.question,
        type: qForm.type,
        options: options ?? null,
        required: qForm.required,
        sortOrder: questions.length,
      });
    }
    setShowQuestionForm(false);
    setEditingQuestionId(null);
    fetchQuestions(detailService.id);
  }

  async function handleDeleteQuestion(id: string) {
    if (!detailService) return;
    await api.delete(`/intake-questions/${id}`);
    fetchQuestions(detailService.id);
  }

  async function moveQuestion(index: number, direction: 'up' | 'down') {
    if (!detailService) return;
    const newQuestions = [...questions];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newQuestions.length) return;
    [newQuestions[index], newQuestions[swapIndex]] = [newQuestions[swapIndex], newQuestions[index]];
    setQuestions(newQuestions);
    await api.patch('/intake-questions/reorder', { ids: newQuestions.map((q) => q.id) });
  }

  if (loading) return (
    <div className="glass-panel-static p-6 text-center">
      <div className="w-5 h-5 border-2 border-t-transparent animate-spin mx-auto mb-2" style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }} />
      <div className="text-sm font-display" style={{ color: 'var(--color-text-secondary)' }}>Loading services...</div>
    </div>
  );

  // ── DETAIL VIEW ──

  if (detailService) {
    return (
      <div className="overflow-y-auto flex-1 min-h-0">
        <button
          onClick={closeDetail}
          className="flex items-center gap-1 text-sm mb-4 cursor-pointer transition-colors"
          style={{ color: 'var(--color-accent)' }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Services
        </button>

        {/* Service Info Card */}
        <div className="glass-panel-static overflow-hidden mb-6">
          <div className="flex flex-col sm:flex-row">
            {getDefaultImage(detailService) ? (
              <div className="sm:w-48 h-36 sm:h-auto shrink-0" style={{ background: 'var(--color-bg-surface)' }}>
                <img src={getDefaultImage(detailService)!} alt={detailService.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="sm:w-48 h-36 sm:h-auto shrink-0 flex items-center justify-center" style={{ background: 'var(--color-accent-subtle)' }}>
                <span className="text-4xl font-bold" style={{ color: 'rgba(255, 179, 71, 0.15)' }}>{detailService.name.charAt(0)}</span>
              </div>
            )}

            <div className="flex-1 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-xl font-bold text-white font-display tracking-tight">{detailService.name}</h1>
                  {detailService.category && (
                    <span className="text-xs px-2 py-0.5 mt-1 inline-block" style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border-accent)' }}>{detailService.category}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(detailService)}
                    className={`text-xs font-medium px-2.5 py-1 cursor-pointer ${
                      detailService.isActive ? 'status-completed' : 'status-no-show'
                    }`}
                  >
                    {detailService.isActive ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => openEdit(detailService)}
                    className="flex items-center gap-1 text-sm cursor-pointer"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                </div>
              </div>

              {detailService.description && (
                <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>{detailService.description}</p>
              )}

              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-1.5 text-sm font-display" style={{ color: 'var(--color-text-secondary)' }}>
                  <Clock className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                  {detailService.durationMins} min
                </div>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-white font-display">
                  <DollarSign className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                  {formatPrice(detailService.priceCents)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Intake Questions Section */}
        <div className="glass-panel-static overflow-hidden">
          <div className="flex items-center justify-between p-4" style={{ background: 'var(--color-bg-surface)', borderBottom: '1px solid var(--color-border)' }}>
            <div>
              <h2 className="text-base font-semibold text-white font-display">Intake Questions</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                Customize what customers see during booking for this service.
              </p>
            </div>
            <button
              onClick={openAddQuestion}
              className="flex items-center gap-1.5 btn-primary px-3 py-1.5 text-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
          </div>

          <div className="p-4">
            {questionsLoading ? (
              <div className="text-sm text-center py-6" style={{ color: 'var(--color-text-secondary)' }}>Loading questions...</div>
            ) : questions.length === 0 && !showQuestionForm ? (
              <div className="text-center py-8">
                <div className="text-sm mb-2 font-display" style={{ color: 'var(--color-text-muted)' }}>No intake questions configured yet.</div>
                <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
                  Add questions to customize what customers fill out when booking this service.
                  Without questions, the default vehicle intake form will be shown.
                </p>
                <button
                  onClick={openAddQuestion}
                  className="text-sm font-medium cursor-pointer"
                  style={{ color: 'var(--color-accent)' }}
                >
                  + Add your first question
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {questions.map((q, i) => (
                  <div key={q.id} className="flex items-start gap-3 glass-panel-static p-3">
                    <div className="flex flex-col gap-0.5 pt-0.5">
                      <button
                        onClick={() => moveQuestion(i, 'up')}
                        disabled={i === 0}
                        className="text-gray-500 hover:text-white disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <GripVertical className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
                      <button
                        onClick={() => moveQuestion(i, 'down')}
                        disabled={i === questions.length - 1}
                        className="text-gray-500 hover:text-white disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white">
                        {q.question}
                        {q.required && <span className="ml-1" style={{ color: 'var(--color-danger)' }}>*</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs px-1.5 py-0.5" style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border-accent)' }}>
                          {QUESTION_TYPES.find((t) => t.value === q.type)?.label || q.type}
                        </span>
                        {q.options && q.options.length > 0 && (
                          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            {q.options.join(' · ')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => openEditQuestion(q)} className="p-1 cursor-pointer text-gray-500 hover:text-[var(--color-accent)]">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteQuestion(q.id)} className="p-1 cursor-pointer text-gray-500 hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add/Edit Question Form */}
            {showQuestionForm && (
              <form onSubmit={handleQuestionSubmit} className="mt-4 p-4 space-y-3" style={{ background: 'var(--color-accent-subtle)', border: '1px solid var(--color-border-accent)' }}>
                <div className="text-sm font-semibold text-white">
                  {editingQuestionId ? 'Edit Question' : 'New Question'}
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Question</label>
                  <input
                    value={qForm.question}
                    onChange={(e) => setQForm({ ...qForm, question: e.target.value })}
                    placeholder="e.g. What type of film are you interested in?"
                    required
                    className="premium-input w-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Type</label>
                    <select
                      value={qForm.type}
                      onChange={(e) => setQForm({ ...qForm, type: e.target.value as QuestionType })}
                      className="premium-input w-full"
                    >
                      {QUESTION_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--color-text-secondary)' }}>
                      <input
                        type="checkbox"
                        checked={qForm.required}
                        onChange={(e) => setQForm({ ...qForm, required: e.target.checked })}
                      />
                      Required
                    </label>
                  </div>
                </div>
                {qForm.type !== 'TEXT' && (
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                      {qForm.type === 'TINT_ZONE' ? 'Shade Options' : 'Options'}{' '}
                      <span style={{ color: 'var(--color-text-muted)' }}>(comma-separated)</span>
                    </label>
                    <input
                      value={qForm.options}
                      onChange={(e) => setQForm({ ...qForm, options: e.target.value })}
                      placeholder={
                        qForm.type === 'TINT_ZONE'
                          ? 'e.g. 5%, 20%, 35%, 50%, 70%'
                          : 'e.g. Standard, Ceramic, Carbon'
                      }
                      className="premium-input w-full"
                    />
                    {qForm.options && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {qForm.options.split(',').map((o) => o.trim()).filter(Boolean).map((o, i) => (
                          <span key={i} className="text-xs px-2 py-0.5" style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border-accent)' }}>{o}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => { setShowQuestionForm(false); setEditingQuestionId(null); }}
                    className="btn-ghost px-3 py-1.5 text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary px-3 py-1.5 text-xs cursor-pointer"
                  >
                    {editingQuestionId ? 'Save' : 'Add Question'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {showModal && renderModal()}
      </div>
    );
  }

  // ── LIST VIEW ──

  return (
    <div className="overflow-y-auto flex-1 min-h-0">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white font-display tracking-tight">Services</h1>
          <div className="font-mono-custom text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            TOTAL: {services.length} {services.filter(s => s.isActive).length > 0 && <span style={{ color: 'var(--color-accent-dim)' }}>// ACTIVE: {services.filter(s => s.isActive).length}</span>}
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 btn-primary px-4 py-2 text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      </div>

      {services.length === 0 ? (
        <div className="glass-panel-static p-12 text-center">
          <div className="font-display" style={{ color: 'var(--color-text-secondary)' }}>No services yet. Add your first service to get started.</div>
        </div>
      ) : (
        <div className="glass-panel-static overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(5, 4, 4, 0.5)', borderBottom: '1px solid var(--color-border-accent)' }}>
                <th className="w-12 px-4 py-3.5"></th>
                <th className="text-left px-4 py-3.5 font-mono-custom uppercase" style={{ fontSize: '11px', letterSpacing: '0.15em', color: 'var(--color-text-muted)' }}>Name</th>
                <th className="text-left px-4 py-3.5 font-mono-custom uppercase hidden md:table-cell" style={{ fontSize: '11px', letterSpacing: '0.15em', color: 'var(--color-text-muted)' }}>Category</th>
                <th className="text-left px-4 py-3.5 font-mono-custom uppercase hidden sm:table-cell" style={{ fontSize: '11px', letterSpacing: '0.15em', color: 'var(--color-text-muted)' }}>Duration</th>
                <th className="text-left px-4 py-3.5 font-mono-custom uppercase" style={{ fontSize: '11px', letterSpacing: '0.15em', color: 'var(--color-text-muted)' }}>Price</th>
                <th className="text-left px-4 py-3.5 font-mono-custom uppercase hidden lg:table-cell" style={{ fontSize: '11px', letterSpacing: '0.15em', color: 'var(--color-text-muted)' }}>Status</th>
                <th className="text-right px-4 py-3.5 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id} className="service-row" style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td className="px-4 py-3">
                    {getDefaultImage(s) ? (
                      <img src={getDefaultImage(s)!} alt={s.name} className="w-10 h-10 object-cover" />
                    ) : (
                      <div className="w-10 h-10 flex items-center justify-center text-xs" style={{ background: 'var(--color-bg-surface)', color: 'var(--color-text-muted)' }}>—</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openDetail(s)}
                      className="text-left cursor-pointer group"
                    >
                      <div className="font-medium text-white group-hover:text-[var(--color-accent)] transition-colors">{s.name}</div>
                      {s.description && <div className="text-sm line-clamp-1" style={{ color: 'var(--color-text-muted)' }}>{s.description}</div>}
                    </button>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {s.category ? (
                      <span className="text-xs px-2 py-0.5" style={{ background: 'var(--color-accent-subtle)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>{s.category}</span>
                    ) : <span style={{ color: 'var(--color-text-muted)' }}>—</span>}
                  </td>
                  <td className="px-4 py-3 font-mono-custom text-[13px] hidden sm:table-cell" style={{ color: 'var(--color-text-secondary)' }}>{s.durationMins} min</td>
                  <td className="px-4 py-3 font-mono-custom text-[13px] text-white">{formatPrice(s.priceCents)}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <button
                      onClick={() => toggleActive(s)}
                      className={`text-xs font-medium px-2 py-1 cursor-pointer ${
                        s.isActive ? 'status-completed' : 'status-no-show'
                      }`}
                    >
                      {s.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap action-btns">
                    <button onClick={() => openEdit(s)} className="p-1 cursor-pointer text-gray-500 hover:text-[var(--color-accent)]">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="p-1 ml-1 cursor-pointer text-gray-500 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && renderModal()}
    </div>
  );

  // ── SHARED MODAL ──

  function renderModal() {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="w-full max-w-md animate-slide-up" style={{ background: 'var(--color-bg-base)', border: '1px solid var(--color-border-accent-strong)', boxShadow: '0 0 40px rgba(255, 179, 71, 0.1)' }}>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--color-border-accent)' }}>
            <div>
              <h3 className="text-lg font-semibold font-display text-white">{editingId ? 'Edit Service' : 'New Service'}</h3>
              <div className="font-mono-custom mt-0.5" style={{ fontSize: '10px', color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}>{editingId ? 'EDIT_RECORD' : 'NEW_RECORD'} // SERVICE_DB</div>
            </div>
            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block font-mono-custom mb-1.5" style={{ fontSize: '10px', color: 'var(--color-text-muted)', letterSpacing: '0.15em' }}>SERVICE NAME</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="premium-input w-full"
              />
            </div>
            <div>
              <label className="block font-mono-custom mb-1.5" style={{ fontSize: '10px', color: 'var(--color-text-muted)', letterSpacing: '0.15em' }}>CATEGORY</label>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. Tints, Radio Installation, Intoxalock"
                className="premium-input w-full"
              />
            </div>
            <div>
              <label className="block font-mono-custom mb-1.5" style={{ fontSize: '10px', color: 'var(--color-text-muted)', letterSpacing: '0.15em' }}>DESCRIPTION</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="premium-input w-full"
              />
            </div>
            <div>
              <label className="block font-mono-custom mb-1.5" style={{ fontSize: '10px', color: 'var(--color-text-muted)', letterSpacing: '0.15em' }}>IMAGE URL</label>
              <input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://example.com/service-image.jpg"
                className="premium-input w-full"
              />
              {form.imageUrl && (
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  className="mt-2 w-full h-24 object-cover"
                  style={{ border: '1px solid var(--color-border)' }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-mono-custom mb-1.5" style={{ fontSize: '10px', color: 'var(--color-text-muted)', letterSpacing: '0.15em' }}>DURATION (MIN)</label>
                <input
                  type="number"
                  value={form.durationMins}
                  onChange={(e) => setForm({ ...form, durationMins: parseInt(e.target.value) || 0 })}
                  min={15}
                  step={15}
                  required
                  className="premium-input w-full"
                />
              </div>
              <div>
                <label className="block font-mono-custom mb-1.5" style={{ fontSize: '10px', color: 'var(--color-text-muted)', letterSpacing: '0.15em' }}>PRICE ($)</label>
                <input
                  type="number"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  min={0}
                  step={0.01}
                  required
                  className="premium-input w-full"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 btn-ghost py-2.5 text-sm cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="flex-1 btn-primary py-2.5 text-sm cursor-pointer"
              >
                {editingId ? 'SAVE CHANGES' : 'CREATE SERVICE'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
