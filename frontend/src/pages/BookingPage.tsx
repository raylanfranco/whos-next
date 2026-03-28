import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, Clock, CreditCard, ShieldCheck, Car } from 'lucide-react';
import { api } from '../lib/api';
import BookingSidebar from '../components/BookingSidebar';
import VehicleSelector from '../components/VehicleSelector';
import IntakeQuestionnaire, { EMPTY_INTAKE } from '../components/IntakeQuestionnaire';
import DynamicIntakeForm from '../components/DynamicIntakeForm';
import StripeCardForm from '../components/StripeCardForm';
import type { StripeCardFormRef } from '../components/StripeCardForm';
import type { IntakeData } from '../components/IntakeQuestionnaire';
import type { Service, Merchant, IntakeQuestion } from '../types';

type Step = 'service' | 'vehicle' | 'datetime' | 'info' | 'payment' | 'confirm';

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

function getServiceImage(service: Service): string | null {
  if (service.imageUrl) return service.imageUrl;
  const cat = (service.category || '').toLowerCase();
  return DEFAULT_CATEGORY_IMAGES[cat] || null;
}

export default function BookingPage() {
  const { merchantId } = useParams<{ merchantId: string }>();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('service');
  const [booked, setBooked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Selections
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', phone: '' });
  const [vehicleInfo, setVehicleInfo] = useState({ year: '', make: '', model: '', trim: '' });
  const [intakeData, setIntakeData] = useState<IntakeData>(EMPTY_INTAKE);
  const [dynamicQuestions, setDynamicQuestions] = useState<IntakeQuestion[]>([]);
  const [dynamicIntakeValues, setDynamicIntakeValues] = useState<Record<string, unknown>>({});
  const [notes, setNotes] = useState('');

  // Vehicle image
  const vehicleImageUrl = vehicleInfo.year && vehicleInfo.make && vehicleInfo.model
    ? `https://cdn.imagin.studio/getimage?customer=img&make=${encodeURIComponent(vehicleInfo.make)}&modelFamily=${encodeURIComponent(vehicleInfo.model)}&modelYear=${vehicleInfo.year}&angle=01`
    : null;

  // Payment
  const cardFormRef = useRef<StripeCardFormRef>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [chargeId, setChargeId] = useState<string | null>(null);
  const [depositAmountCents, setDepositAmountCents] = useState(0);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Stripe Connect � fetch merchant's publishable key
  const [stripePublishableKey, setStripePublishableKey] = useState<string | null>(null);

  useEffect(() => {
    if (!merchantId) return;
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/stripe/connect/status?merchantId=${merchantId}`)
      .then(r => r.json())
      .then(data => { if (data.stripePublishableKey) setStripePublishableKey(data.stripePublishableKey); })
      .catch(() => {});
  }, [merchantId]);

  // Deposit config
  const depositPercent = (merchant?.settings as Record<string, unknown> | null)?.depositPercent as number | undefined ?? 0;
  const depositCalc = selectedService ? Math.round(selectedService.priceCents * depositPercent / 100) : 0;
  const requiresDeposit = depositPercent > 0 && selectedService != null && depositCalc > 0;

  // Vertical-specific: only show vehicle step for automotive merchants
  const showVehicle = (merchant?.settings as Record<string, unknown> | null)?.vertical === 'automotive';

  // Build steps dynamically
  const STEPS: { key: Step; label: string }[] = [
    { key: 'service', label: 'Service' },
    ...(showVehicle ? [{ key: 'vehicle' as Step, label: 'Vehicle' }] : []),
    { key: 'datetime', label: 'Date & Time' },
    { key: 'info', label: 'Your Info' },
    ...(requiresDeposit ? [{ key: 'payment' as Step, label: 'Payment' }] : []),
    { key: 'confirm', label: 'Confirm' },
  ];

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  useEffect(() => {
    async function load() {
      if (!merchantId) {
        setError('No merchant ID in URL');
        setLoading(false);
        return;
      }
      try {
        const [m, s] = await Promise.all([
          api.get<Merchant>(`/merchants/${merchantId}`),
          api.get<Service[]>(`/services?merchantId=${merchantId}&activeOnly=true`),
        ]);
        setMerchant(m);
        setServices(s);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load booking page');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [merchantId]);

  // Fetch intake questions when service changes
  useEffect(() => {
    async function fetchIntakeQuestions() {
      if (!selectedService) {
        setDynamicQuestions([]);
        setDynamicIntakeValues({});
        return;
      }
      try {
        const questions = await api.get<IntakeQuestion[]>(`/intake-questions?serviceId=${selectedService.id}`);
        setDynamicQuestions(questions);
        setDynamicIntakeValues({});
      } catch {
        setDynamicQuestions([]);
      }
    }
    fetchIntakeQuestions();
  }, [selectedService]);

  useEffect(() => {
    async function fetchSlots() {
      if (!merchantId || !selectedService || !selectedDate) return;
      setSlotsLoading(true);
      setSelectedTime('');
      const data = await api.get<string[]>(
        `/bookings/available-slots?merchantId=${merchantId}&serviceId=${selectedService.id}&date=${selectedDate}`
      );
      setSlots(data);
      setSlotsLoading(false);
    }
    fetchSlots();
  }, [merchantId, selectedService, selectedDate]);

  useEffect(() => {
    if (selectedService && depositPercent > 0) {
      setDepositAmountCents(Math.round(selectedService.priceCents * depositPercent / 100));
    } else {
      setDepositAmountCents(0);
    }
  }, [selectedService, depositPercent]);

  async function handlePayDeposit() {
    if (!cardFormRef.current || !merchantId) return;
    setPaymentProcessing(true);
    setPaymentError(null);

    try {
      // Step 1: Get payment method ID from Stripe Elements
      const paymentMethodId = await cardFormRef.current.getToken();

      // Step 2: Create PaymentIntent on backend
      const intent = await api.post<{ clientSecret: string; paymentIntentId: string }>(
        '/stripe/create-intent',
        {
          merchantId: merchantId!,
          amountCents: depositAmountCents,
          currency: 'usd',
          description: `Deposit for ${selectedService?.name}`,
          metadata: { merchantId: merchant?.id || '', service: selectedService?.name || '' },
        },
      );

      // Step 3: Confirm payment client-side with the payment method
      const stripePk = stripePublishableKey || import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
      const stripe = (await import('@stripe/stripe-js')).loadStripe(stripePk);
      if (!stripe) throw new Error('Stripe failed to load');
      const stripeInstance = await stripe;
      if (!stripeInstance) throw new Error('Stripe failed to load');

      const { error: confirmError, paymentIntent } = await stripeInstance.confirmCardPayment(
        intent.clientSecret,
        { payment_method: paymentMethodId },
      );

      if (confirmError) {
        throw new Error(confirmError.message || 'Payment confirmation failed');
      }

      if (paymentIntent?.status === 'succeeded') {
        setChargeId(paymentIntent.id);
        goNext();
      } else {
        throw new Error(`Payment status: ${paymentIntent?.status}`);
      }
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  }

  async function handleBook() {
    if (!merchantId || !selectedService) return;
    setSubmitting(true);

    // Build intake data — use dynamic answers if questions are configured, otherwise legacy format
    let intake: Record<string, unknown> = {};
    if (dynamicQuestions.length > 0) {
      // Store as { questionText: answer } for readability in dashboard
      for (const q of dynamicQuestions) {
        const val = dynamicIntakeValues[q.id];
        if (
          val !== undefined && val !== '' &&
          !(Array.isArray(val) && val.length === 0) &&
          !(typeof val === 'object' && !Array.isArray(val) && Object.keys(val as Record<string, unknown>).length === 0)
        ) {
          intake[q.question] = val;
        }
      }
    } else {
      if (intakeData.currentSetup) intake.currentSetup = intakeData.currentSetup;
      if (intakeData.existingMods.length > 0) intake.existingMods = intakeData.existingMods;
      if (intakeData.knownIssues) intake.knownIssues = intakeData.knownIssues;
      if (intakeData.additionalNotes) intake.additionalNotes = intakeData.additionalNotes;
    }

    try {
      await api.post('/bookings', {
        merchantId,
        serviceId: selectedService.id,
        date: selectedDate,
        time: selectedTime,
        customer: customerInfo,
        vehicle: vehicleInfo.make ? {
          year: vehicleInfo.year ? parseInt(vehicleInfo.year) : undefined,
          make: vehicleInfo.make,
          model: vehicleInfo.model,
          trim: vehicleInfo.trim || undefined,
        } : undefined,
        intakeData: Object.keys(intake).length > 0 ? intake : undefined,
        notes: notes || undefined,
        depositAmountCents: chargeId ? depositAmountCents : undefined,
        stripePaymentIntentId: chargeId || undefined,
      });
      setBooked(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  }

  function canAdvance() {
    if (step === 'service') return !!selectedService;
    if (step === 'vehicle') return true; // Vehicle info is optional
    if (step === 'datetime') return !!selectedDate && !!selectedTime;
    if (step === 'info') return !!customerInfo.name;
    if (step === 'payment') return !!chargeId;
    return true;
  }

  function goNext() {
    const next = STEPS[stepIndex + 1];
    if (next) setStep(next.key);
  }

  function goBack() {
    const prev = STEPS[stepIndex - 1];
    if (prev) setStep(prev.key);
  }

  function goToStep(targetStep: Step) {
    const targetIndex = STEPS.findIndex((s) => s.key === targetStep);
    if (targetIndex <= stepIndex) setStep(targetStep);
  }

  function getDateOptions() {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }

  function formatSlotTime(time: string) {
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
  }

  // ── Loading / Error / Success screens ──

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <div className="premium-card-static p-8 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-display">Loading booking...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <div className="premium-card-static p-8 text-center max-w-sm">
          <p className="text-red-600 font-display font-semibold mb-2">Failed to load booking page</p>
          <p className="text-sm text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  if (booked) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center p-6">
        <div className="premium-card-static p-8 sm:p-10 text-center max-w-md animate-step-enter">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 animate-pulse-ring">
            <Check className="w-10 h-10 text-green-600 animate-check-pop" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight font-display">Booking Confirmed!</h2>
          <p className="text-slate-600 mb-1">
            <span className="inline-block bg-primary/8 text-primary text-xs font-semibold px-3 py-1 rounded-full">{selectedService?.name}</span>
          </p>
          <p className="text-slate-600 mt-3">
            {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}{' '}
            at {formatSlotTime(selectedTime)}
          </p>
          {chargeId && (
            <p className="text-sm text-green-600 mt-3 font-medium">
              Deposit of {formatPrice(depositAmountCents)} paid successfully.
            </p>
          )}
          <p className="text-sm text-slate-400 mt-5">
            You'll receive a confirmation at {customerInfo.email || 'your contact info'}.
          </p>
        </div>
      </div>
    );
  }

  // ── Main Wizard Layout ──

  return (
    <div className="min-h-screen bg-warm-50 flex">
      {/* Sidebar — desktop only */}
      {merchant && <BookingSidebar merchant={merchant} />}

      {/* Main wizard content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden bg-white/80 backdrop-blur-sm border-b border-slate-100 px-4 py-3 shadow-sm">
          <h1 className="text-base font-bold text-slate-900 font-display tracking-tight">
            Book with <span className="text-primary">{merchant?.name}</span>
          </h1>
        </header>

        {/* Breadcrumb progress */}
        <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-100 px-4 sm:px-6 py-3">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {STEPS.map((s, i) => (
                <div key={s.key} className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => goToStep(s.key)}
                    disabled={i > stepIndex}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      i === stepIndex
                        ? 'bg-primary/10 text-primary'
                        : i < stepIndex
                          ? 'text-slate-600 hover:text-primary cursor-pointer'
                          : 'text-slate-400 cursor-default'
                    }`}
                  >
                    {i < stepIndex ? (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    ) : (
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                        i === stepIndex ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {i + 1}
                      </div>
                    )}
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className="w-4 border-t border-dashed border-slate-300 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </nav>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-step-enter" key={step}>

            {/* ── Step 1: Service ── */}
            {step === 'service' && (() => {
              const grouped = new Map<string, Service[]>();
              for (const s of services) {
                const cat = s.category || 'Other';
                if (!grouped.has(cat)) grouped.set(cat, []);
                grouped.get(cat)!.push(s);
              }
              const categories = Array.from(grouped.keys());
              const skipCategories = categories.length <= 1;

              const visibleServices = selectedCategory
                ? grouped.get(selectedCategory) || []
                : skipCategories
                  ? services
                  : [];

              return (
                <div>
                  {/* Category phase */}
                  {!selectedCategory && !skipCategories && (
                    <>
                      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 tracking-tight font-display heading-accent">What are you looking for?</h2>
                      <p className="text-sm text-slate-400 mb-8">Select a category to get started.</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {categories.map((cat) => {
                          const catServices = grouped.get(cat)!;
                          const firstImage = catServices.find((s) => getServiceImage(s))?.imageUrl
                            || DEFAULT_CATEGORY_IMAGES[(cat || '').toLowerCase()]
                            || null;
                          return (
                            <button
                              key={cat}
                              onClick={() => setSelectedCategory(cat)}
                              className="premium-card group text-left overflow-hidden"
                            >
                              {firstImage ? (
                                <div className="h-32 bg-slate-100 overflow-hidden">
                                  <img src={firstImage} alt={cat} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                </div>
                              ) : (
                                <div className="h-32 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                                  <span className="text-3xl font-bold text-primary/20">{cat.charAt(0)}</span>
                                </div>
                              )}
                              <div className="p-4">
                                <div className="font-semibold text-slate-900 group-hover:text-primary transition-colors font-display">{cat}</div>
                                <div className="text-sm text-slate-500 mt-0.5">
                                  {catServices.length} service{catServices.length !== 1 ? 's' : ''}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* Service cards phase */}
                  {(selectedCategory || skipCategories) && (
                    <>
                      <div className="flex items-center gap-3 mb-8">
                        {selectedCategory && !skipCategories && (
                          <button
                            onClick={() => { setSelectedCategory(null); setSelectedService(null); }}
                            className="text-sm text-primary hover:text-primary-dark flex items-center gap-1"
                          >
                            <ChevronLeft className="w-4 h-4" /> Back
                          </button>
                        )}
                        <div>
                          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-display heading-accent">
                            {selectedCategory && !skipCategories ? selectedCategory : 'Choose a Service'}
                          </h2>
                          <p className="text-sm text-slate-400 mt-0.5">Select the service you'd like to book.</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {visibleServices.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => setSelectedService(s)}
                            className={`group text-left overflow-hidden transition-all ${
                              selectedService?.id === s.id
                                ? 'premium-card premium-card-selected'
                                : 'premium-card'
                            }`}
                          >
                            {getServiceImage(s) ? (
                              <div className="h-36 bg-slate-100 overflow-hidden relative">
                                <img src={getServiceImage(s)!} alt={s.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-slate-900 shadow-sm">
                                  {formatPrice(s.priceCents)}
                                </div>
                                {selectedService?.id === s.id && (
                                  <div className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-sm">
                                    <Check className="w-3.5 h-3.5 text-white" />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="h-36 bg-gradient-to-br from-primary/10 to-slate-50 flex items-center justify-center relative">
                                <span className="text-4xl font-bold text-primary/15">{s.name.charAt(0)}</span>
                                <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-slate-900 shadow-sm">
                                  {formatPrice(s.priceCents)}
                                </div>
                                {selectedService?.id === s.id && (
                                  <div className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-sm">
                                    <Check className="w-3.5 h-3.5 text-white" />
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="p-4">
                              <div className="font-semibold text-slate-900 font-display">{s.name}</div>
                              {s.description && <div className="text-sm text-slate-500 mt-1 line-clamp-2">{s.description}</div>}
                              <div className="flex items-center gap-3 mt-3 text-sm">
                                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-medium">
                                  <Clock className="w-3 h-3" />{s.durationMins} min
                                </span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })()}

            {/* ── Step 2: Vehicle ── */}
            {showVehicle && step === 'vehicle' && (
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 tracking-tight font-display heading-accent">Your Vehicle</h2>
                <p className="text-sm text-slate-400 mb-8">Tell us about your vehicle so we can prepare for your appointment.</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="premium-card-static p-6">
                    <VehicleSelector value={vehicleInfo} onChange={setVehicleInfo} />
                  </div>

                  {/* Vehicle image preview */}
                  <div className="flex items-center justify-center">
                    {vehicleImageUrl ? (
                      <div className="w-full max-w-sm">
                        <div className="premium-card-static p-6">
                          <img
                            src={vehicleImageUrl}
                            alt={`${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}`}
                            className="w-full h-48 object-contain"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              const fallback = img.nextElementSibling as HTMLElement | null;
                              img.style.display = 'none';
                              if (fallback) fallback.classList.remove('hidden');
                            }}
                          />
                          <div className="hidden flex-col items-center justify-center h-48 text-slate-400">
                            <Car className="w-16 h-16 mb-2 opacity-30" />
                            <span className="text-sm">{vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}</span>
                          </div>
                          <div className="text-center mt-3">
                            <div className="text-sm font-semibold text-slate-900 font-display">
                              {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}
                            </div>
                            {vehicleInfo.trim && (
                              <div className="text-xs text-slate-500 mt-0.5">{vehicleInfo.trim}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full max-w-sm premium-card-static border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center">
                        <Car className="w-16 h-16 text-slate-300 mb-3" />
                        <p className="text-sm text-slate-400">
                          Select your vehicle details to see a preview
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 3: Date & Time ── */}
            {step === 'datetime' && (
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 tracking-tight font-display heading-accent">Pick a Date & Time</h2>
                <p className="text-sm text-slate-400 mb-8">
                  {selectedService && (
                    <span className="inline-flex items-center gap-1.5">
                      Booking <span className="inline-block bg-primary/8 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full">{selectedService.name}</span>
                      <span className="text-slate-300">·</span> {selectedService.durationMins} min
                    </span>
                  )}
                </p>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                    {getDateOptions().map((d) => {
                      const date = new Date(d + 'T00:00:00');
                      return (
                        <button
                          key={d}
                          onClick={() => setSelectedDate(d)}
                          className={`p-2.5 rounded-lg text-center text-sm transition-all ${
                            selectedDate === d
                              ? 'bg-primary text-white font-medium shadow-lg shadow-primary/25'
                              : 'bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm'
                          }`}
                        >
                          <div className={`text-xs ${selectedDate === d ? 'text-white/70' : 'text-slate-500'}`}>{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                          <div className="font-medium">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedDate && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Available Times</label>
                    {slotsLoading ? (
                      <div className="premium-card-static p-4 text-center">
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <span className="text-sm text-slate-500">Loading times...</span>
                      </div>
                    ) : slots.length === 0 ? (
                      <div className="premium-card-static p-6 text-center">
                        <p className="text-sm text-slate-500">No available times for this date. Try another day.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                        {slots.map((t) => (
                          <button
                            key={t}
                            onClick={() => setSelectedTime(t)}
                            className={`py-2.5 px-3 rounded-full text-center text-sm font-medium transition-all ${
                              selectedTime === t
                                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:shadow-sm'
                            }`}
                          >
                            {formatSlotTime(t)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Step 4: Your Info + Intake ── */}
            {step === 'info' && (
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 tracking-tight font-display heading-accent">Your Information</h2>
                <p className="text-sm text-slate-400 mb-8">How can we reach you?</p>
                <div className="premium-card-static p-6 sm:p-8 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                    <input
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      required
                      className="premium-input w-full"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                        className="premium-input w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                        className="premium-input w-full"
                      />
                    </div>
                  </div>

                  {/* Intake questionnaire — dynamic or legacy fallback */}
                  {dynamicQuestions.length > 0 ? (
                    <div className="pt-6 border-t border-slate-100">
                      <h3 className="text-lg font-semibold text-slate-900 mb-1 font-display">Service Details</h3>
                      <p className="text-sm text-slate-400 mb-4">Answer a few questions to help us prepare.</p>
                      <DynamicIntakeForm questions={dynamicQuestions} values={dynamicIntakeValues} onChange={setDynamicIntakeValues} />
                    </div>
                  ) : showVehicle ? (
                    <div className="pt-6 border-t border-slate-100">
                      <h3 className="text-lg font-semibold text-slate-900 mb-1 font-display">Vehicle Details</h3>
                      <p className="text-sm text-slate-400 mb-4">Help us prepare for your appointment.</p>
                      <IntakeQuestionnaire value={intakeData} onChange={setIntakeData} />
                    </div>
                  ) : null}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Additional Notes <span className="text-slate-400 font-normal">(optional)</span></label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      placeholder="Anything else we should know?"
                      className="premium-input w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 5: Payment (conditional) ── */}
            {step === 'payment' && (
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 tracking-tight font-display heading-accent">Secure Deposit Payment</h2>
                <p className="text-sm text-slate-400 mb-8">A deposit is required to confirm your booking.</p>

                <div className="premium-card-static shadow-[var(--shadow-elevated)] p-6 sm:p-8 mb-6">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 font-display">Deposit Required</div>
                      <div className="text-xs text-slate-500">
                        {depositPercent}% of service total ({formatPrice(selectedService?.priceCents || 0)})
                      </div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="text-2xl font-bold text-slate-900 font-display">{formatPrice(depositAmountCents)}</div>
                      <div className="text-xs text-slate-400">due now</div>
                    </div>
                  </div>

                  <div className="bg-warm-50 rounded-xl p-4 mb-5 text-xs text-slate-600 space-y-1.5">
                    <div className="flex justify-between">
                      <span>Service total</span>
                      <span>{formatPrice(selectedService?.priceCents || 0)}</span>
                    </div>
                    <div className="flex justify-between font-medium text-primary">
                      <span>Deposit ({depositPercent}%)</span>
                      <span>{formatPrice(depositAmountCents)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-1.5">
                      <span>Remaining balance (due at appointment)</span>
                      <span>{formatPrice((selectedService?.priceCents || 0) - depositAmountCents)}</span>
                    </div>
                  </div>

                  {chargeId ? (
                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-4">
                      <Check className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="text-sm font-medium text-green-800">Deposit paid successfully!</div>
                        <div className="text-xs text-green-600">You may proceed to confirm your booking.</div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <StripeCardForm ref={cardFormRef} publishableKey={stripePublishableKey || undefined} onError={setPaymentError} />

                      {paymentError && (
                        <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                          {paymentError}
                        </div>
                      )}

                      <button
                        onClick={handlePayDeposit}
                        disabled={paymentProcessing}
                        className="mt-5 w-full btn-primary flex items-center justify-center gap-2 px-8 py-3.5 text-base font-display"
                      >
                        {paymentProcessing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-5 h-5" />
                            Pay {formatPrice(depositAmountCents)} Deposit
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <ShieldCheck className="w-4 h-4" />
                  Card details are handled securely by Stripe. We never see your full card number.
                </div>
              </div>
            )}

            {/* ── Step 6: Confirm ── */}
            {step === 'confirm' && (
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 tracking-tight font-display heading-accent">Confirm Your Booking</h2>
                <p className="text-sm text-slate-400 mb-8">Review the details below and confirm.</p>

                <div className="premium-card-static shadow-[var(--shadow-elevated)] p-6 sm:p-8 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Service</span>
                    <span className="text-sm font-medium font-display">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Date</span>
                    <span className="text-sm font-medium">
                      {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Time</span>
                    <span className="text-sm font-medium">{formatSlotTime(selectedTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Duration</span>
                    <span className="text-sm font-medium">{selectedService?.durationMins} min</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-3">
                    <span className="text-base font-semibold text-slate-900 font-display">Total</span>
                    <span className="text-lg font-bold text-slate-900 font-display">{formatPrice(selectedService?.priceCents || 0)}</span>
                  </div>

                  {chargeId && (
                    <div className="flex justify-between text-green-600">
                      <span className="text-sm flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Deposit paid</span>
                      <span className="text-sm font-medium">{formatPrice(depositAmountCents)}</span>
                    </div>
                  )}
                  {chargeId && (
                    <div className="flex justify-between text-slate-500">
                      <span className="text-sm">Remaining (due at appointment)</span>
                      <span className="text-sm font-medium">{formatPrice((selectedService?.priceCents || 0) - depositAmountCents)}</span>
                    </div>
                  )}

                  {/* Customer & Vehicle */}
                  <div className="border-t border-slate-100 pt-3">
                    <div className="bg-warm-50 rounded-xl p-4 space-y-1.5">
                      <div className="text-sm"><strong>Name:</strong> {customerInfo.name}</div>
                      {customerInfo.email && <div className="text-sm"><strong>Email:</strong> {customerInfo.email}</div>}
                      {customerInfo.phone && <div className="text-sm"><strong>Phone:</strong> {customerInfo.phone}</div>}
                      {vehicleInfo.make && (
                        <div className="text-sm"><strong>Vehicle:</strong> {[vehicleInfo.year, vehicleInfo.make, vehicleInfo.model, vehicleInfo.trim].filter(Boolean).join(' ')}</div>
                      )}
                    </div>
                  </div>

                  {/* Intake summary — dynamic or legacy */}
                  {dynamicQuestions.length > 0 ? (
                    Object.keys(dynamicIntakeValues).some((k) => {
                      const v = dynamicIntakeValues[k];
                      if (v === undefined || v === '') return false;
                      if (Array.isArray(v) && v.length === 0) return false;
                      if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v as Record<string, unknown>).length === 0) return false;
                      return true;
                    }) && (
                      <div className="border-t border-slate-200 pt-3 space-y-1">
                        <div className="text-sm font-semibold text-slate-700">Service Details</div>
                        {dynamicQuestions.map((q) => {
                          const val = dynamicIntakeValues[q.id];
                          if (val === undefined || val === '' || (Array.isArray(val) && val.length === 0)) return null;
                          if (typeof val === 'object' && !Array.isArray(val) && Object.keys(val as Record<string, unknown>).length === 0) return null;
                          return (
                            <div key={q.id} className="text-sm">
                              <strong>{q.question}:</strong>{' '}
                              {typeof val === 'object' && !Array.isArray(val)
                                ? Object.entries(val as Record<string, string>)
                                    .map(([zoneId, shade]) => {
                                      const label = zoneId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
                                      return `${label}: ${shade}`;
                                    })
                                    .join(', ')
                                : Array.isArray(val)
                                  ? val.join(', ')
                                  : String(val)}
                            </div>
                          );
                        })}
                      </div>
                    )
                  ) : (
                    showVehicle && (intakeData.currentSetup || intakeData.existingMods.length > 0 || intakeData.knownIssues) && (
                      <div className="border-t border-slate-200 pt-3 space-y-1">
                        <div className="text-sm font-semibold text-slate-700">Vehicle Intake</div>
                        {intakeData.currentSetup && (
                          <div className="text-sm"><strong>Current setup:</strong> {intakeData.currentSetup.replace(/_/g, ' ')}</div>
                        )}
                        {intakeData.existingMods.length > 0 && (
                          <div className="text-sm"><strong>Existing mods:</strong> {intakeData.existingMods.join(', ')}</div>
                        )}
                        {intakeData.knownIssues && (
                          <div className="text-sm"><strong>Known issues:</strong> {intakeData.knownIssues}</div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* ── Navigation ── */}
            <div className="flex justify-between mt-10 pb-6">
              <button
                onClick={goBack}
                disabled={stepIndex === 0}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl disabled:invisible transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              {step === 'confirm' ? (
                <button
                  onClick={handleBook}
                  disabled={submitting}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-8 py-3.5 rounded-xl text-base font-semibold font-display shadow-[0_2px_8px_rgba(5,150,105,0.25)] hover:shadow-[0_4px_16px_rgba(5,150,105,0.35)] transition-all"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" /> Book Now
                    </>
                  )}
                </button>
              ) : step === 'payment' ? (
                chargeId ? (
                  <button
                    onClick={goNext}
                    className="btn-primary flex items-center gap-1.5 px-8 py-3.5 rounded-xl text-base font-display"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div />
                )
              ) : (
                <button
                  onClick={goNext}
                  disabled={!canAdvance()}
                  className="btn-primary flex items-center gap-1.5 disabled:opacity-50 px-8 py-3.5 rounded-xl text-base font-display"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
