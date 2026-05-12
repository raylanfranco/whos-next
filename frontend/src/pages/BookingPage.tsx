import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Check } from 'lucide-react';
import { api } from '../lib/api';
import { StepService } from '../booking/StepService';
import { StepVehicle } from '../booking/StepVehicle';
import { StepDateTime } from '../booking/StepDateTime';
import { StepInfo } from '../booking/StepInfo';
import { StepPayment } from '../booking/StepPayment';
import { StepTattoo } from '../booking/StepTattoo';
import { StepConfirm, BookingConfirmed } from '../booking/StepConfirm';
import { BookingShell, BookingBreadcrumb, BookingFooter } from '../booking/BookingShell';
import IntakeQuestionnaire, { EMPTY_INTAKE } from '../components/IntakeQuestionnaire';
import DynamicIntakeForm from '../components/DynamicIntakeForm';
import DesignIntake from '../adapters/tattoo/DesignIntake';
import ArtistSelector from '../adapters/tattoo/ArtistSelector';
import { EMPTY_TATTOO_INTAKE, validateTattooIntake, type TattooIntakeData } from '../adapters/tattoo/TattooIntakeSchema';
import type { StripeCardFormRef } from '../components/StripeCardForm';
import type { IntakeData } from '../components/IntakeQuestionnaire';
import type { Service, Merchant, IntakeQuestion, VehicleType } from '../types';

type Step = 'service' | 'vehicle' | 'tattoo' | 'datetime' | 'info' | 'payment' | 'confirm';

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function BookingPage() {
  const { merchantId } = useParams<{ merchantId: string }>();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('service');
  const [booked, setBooked] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Selections
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', phone: '' });
  // vehicleInfo carries the union of fields for both AUTOMOTIVE and POWERSPORTS verticals.
  // `type` stays empty for AUTOMOTIVE (the legacy selector doesn't set it) and powers
  // the new POWERSPORTS adapter.
  const [vehicleInfo, setVehicleInfo] = useState<{
    type: VehicleType | '';
    year: string;
    make: string;
    model: string;
    trim: string;
  }>({ type: '', year: '', make: '', model: '', trim: '' });
  const [intakeData, setIntakeData] = useState<IntakeData>(EMPTY_INTAKE);
  const [dynamicQuestions, setDynamicQuestions] = useState<IntakeQuestion[]>([]);
  const [dynamicIntakeValues, setDynamicIntakeValues] = useState<Record<string, unknown>>({});
  const [tattooIntake, setTattooIntake] = useState<TattooIntakeData>(EMPTY_TATTOO_INTAKE);
  const [selectedArtist, setSelectedArtist] = useState('');
  const [notes, setNotes] = useState('');

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

  // Vertical-specific steps
  const vertical = merchant?.vertical || 'GENERIC';
  const showVehicle = vertical === 'AUTOMOTIVE' || vertical === 'POWERSPORTS';
  const showPowersports = vertical === 'POWERSPORTS';
  const showTattoo = vertical === 'TATTOO';

  // Build steps dynamically based on vertical
  const STEPS: { key: Step; label: string }[] = [
    { key: 'service', label: 'Service' },
    ...(showVehicle ? [{ key: 'vehicle' as Step, label: 'Vehicle' }] : []),
    ...(showTattoo ? [{ key: 'tattoo' as Step, label: 'Design' }] : []),
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

    // Build intake data based on vertical + dynamic questions
    let intake: Record<string, unknown> = {};

    if (showTattoo) {
      // Tattoo vertical — store tattoo-specific intake
      intake = { ...tattooIntake };
      if (selectedArtist) intake.artistId = selectedArtist;
    } else if (dynamicQuestions.length > 0) {
      // Dynamic questions configured — store as { questionText: answer }
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
      // Legacy automotive intake fallback
      if (intakeData.currentSetup) intake.currentSetup = intakeData.currentSetup;
      if (intakeData.existingMods.length > 0) intake.existingMods = intakeData.existingMods;
      if (intakeData.knownIssues) intake.knownIssues = intakeData.knownIssues;
      if (intakeData.additionalNotes) intake.additionalNotes = intakeData.additionalNotes;
    }

    try {
      const created = await api.post<{ id: string }>('/bookings', {
        merchantId,
        serviceId: selectedService.id,
        date: selectedDate,
        time: selectedTime,
        customer: customerInfo,
        vehicle: (vehicleInfo.make || vehicleInfo.type) ? {
          type: vehicleInfo.type || undefined,
          year: vehicleInfo.year ? parseInt(vehicleInfo.year) : undefined,
          make: vehicleInfo.make || undefined,
          model: vehicleInfo.model || undefined,
          trim: vehicleInfo.trim || undefined,
        } : undefined,
        intakeData: Object.keys(intake).length > 0 ? intake : undefined,
        notes: notes || undefined,
        depositAmountCents: chargeId ? depositAmountCents : undefined,
        stripePaymentIntentId: chargeId || undefined,
      });
      setBookingId(created?.id ?? null);
      setBooked(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  }

  function handleBookAnother() {
    setBooked(false);
    setBookingId(null);
    setSelectedCategory(null);
    setSelectedService(null);
    setSelectedDate('');
    setSelectedTime('');
    setSlots([]);
    setVehicleInfo({ type: '', year: '', make: '', model: '', trim: '' });
    setCustomerInfo({ name: '', email: '', phone: '' });
    setIntakeData(EMPTY_INTAKE);
    setDynamicIntakeValues({});
    setTattooIntake(EMPTY_TATTOO_INTAKE);
    setSelectedArtist('');
    setNotes('');
    setChargeId(null);
    setPaymentError(null);
    setStep('service');
  }

  function canAdvance() {
    if (step === 'service') return !!selectedService;
    // Vehicle info is optional for automotive (legacy NLA flow); for powersports
    // the type picker is the whole point of the step — require it.
    if (step === 'vehicle') return showPowersports ? !!vehicleInfo.type : true;
    if (step === 'tattoo') return validateTattooIntake(tattooIntake);
    if (step === 'datetime') return !!selectedDate && !!selectedTime;
    if (step === 'info') return !!customerInfo.name;
    if (step === 'payment') return !!chargeId;
    return true;
  }

  function goNext() {
    const next = STEPS[stepIndex + 1];
    if (next) setStep(next.key);
  }

  function goToStep(targetStep: Step) {
    const targetIndex = STEPS.findIndex((s) => s.key === targetStep);
    if (targetIndex <= stepIndex) setStep(targetStep);
  }

  function renderIntakeSummary() {
    if (dynamicQuestions.length > 0) {
      const hasAny = Object.keys(dynamicIntakeValues).some((k) => {
        const v = dynamicIntakeValues[k];
        if (v === undefined || v === '') return false;
        if (Array.isArray(v) && v.length === 0) return false;
        if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v as Record<string, unknown>).length === 0) return false;
        return true;
      });
      if (!hasAny) return null;
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {dynamicQuestions.map((q) => {
            const val = dynamicIntakeValues[q.id];
            if (val === undefined || val === '' || (Array.isArray(val) && val.length === 0)) return null;
            if (typeof val === 'object' && !Array.isArray(val) && Object.keys(val as Record<string, unknown>).length === 0) return null;
            const display =
              typeof val === 'object' && !Array.isArray(val)
                ? Object.entries(val as Record<string, string>)
                    .map(([zoneId, shade]) => `${zoneId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}: ${shade}`)
                    .join(', ')
                : Array.isArray(val)
                  ? val.join(', ')
                  : String(val);
            return <IntakeSummaryRow key={q.id} label={q.question} value={display} />;
          })}
        </div>
      );
    }
    if (showVehicle && !showPowersports && (intakeData.currentSetup || intakeData.existingMods.length > 0 || intakeData.knownIssues)) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {intakeData.currentSetup && <IntakeSummaryRow label="Current setup" value={intakeData.currentSetup.replace(/_/g, ' ')} />}
          {intakeData.existingMods.length > 0 && <IntakeSummaryRow label="Existing mods" value={intakeData.existingMods.join(', ')} />}
          {intakeData.knownIssues && <IntakeSummaryRow label="Known issues" value={intakeData.knownIssues} />}
        </div>
      );
    }
    return null;
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
      <BookingShell merchant={merchant}>
        <BookingBreadcrumb steps={STEPS} currentStep={'confirm'} allComplete />
        <BookingConfirmed
          details={{
            service: selectedService,
            date: selectedDate,
            time: selectedTime,
            vehicle: vehicleInfo,
            customer: customerInfo,
            notes,
            deposit: { required: requiresDeposit, amountCents: depositAmountCents, paid: !!chargeId },
            merchant,
          }}
          bookingId={bookingId}
          onBookAnother={handleBookAnother}
        />
      </BookingShell>
    );
  }

  // ── Main Wizard Layout ──

  return (
    <BookingShell merchant={merchant}>
      <BookingBreadcrumb steps={STEPS} currentStep={step} onStepClick={goToStep} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }} key={step}>
            {/* ── Step 1: Service (Variant redesign) ── */}
            {step === 'service' && (
              <StepService
                merchant={merchant}
                services={services}
                selectedCategory={selectedCategory}
                onSelectCategory={(cat) => { setSelectedCategory(cat); if (cat === null) setSelectedService(null); }}
                selectedService={selectedService}
                onSelectService={setSelectedService}
              />
            )}

            {/* ── Step 2: Vehicle (Variant redesign) ── */}
            {showVehicle && step === 'vehicle' && (
              <StepVehicle
                merchant={merchant}
                value={vehicleInfo}
                onChange={setVehicleInfo}
              />
            )}

            {/* ── Tattoo Design Step (Variant redesign) ── */}
            {showTattoo && step === 'tattoo' && (
              <StepTattoo
                designIntakeSlot={<DesignIntake value={tattooIntake} onChange={setTattooIntake} />}
                artistSlot={
                  merchant?.settings && !!(merchant.settings as Record<string, unknown>).artists ? (
                    <ArtistSelector
                      artists={(merchant.settings as Record<string, unknown>).artists as { id: string; name: string; specialties: string[]; photoUrl?: string }[]}
                      value={selectedArtist}
                      onChange={setSelectedArtist}
                    />
                  ) : undefined
                }
              />
            )}

            {/* ── Step 3: Date & Time (Variant redesign) ── */}
            {step === 'datetime' && (
              <StepDateTime
                merchant={merchant}
                service={selectedService}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                slots={slots}
                slotsLoading={slotsLoading}
                onSelectDate={setSelectedDate}
                onSelectTime={setSelectedTime}
              />
            )}

            {/* ── Step 4: Your Info + Intake (Variant redesign) ── */}
            {step === 'info' && (
              <StepInfo
                customerInfo={customerInfo}
                onCustomerInfoChange={setCustomerInfo}
                notes={notes}
                onNotesChange={setNotes}
                intakeSlot={
                  dynamicQuestions.length > 0 ? (
                    <DynamicIntakeForm
                      questions={dynamicQuestions}
                      values={dynamicIntakeValues}
                      onChange={setDynamicIntakeValues}
                    />
                  ) : showVehicle && !showPowersports ? (
                    // Legacy NLA-style automotive intake. Powersports always uses
                    // seeded DynamicIntakeForm questions — no legacy fallback.
                    <IntakeQuestionnaire value={intakeData} onChange={setIntakeData} />
                  ) : null
                }
              />
            )}

            {/* ── Step 5: Payment (Variant redesign) ── */}
            {step === 'payment' && (
              <StepPayment
                merchant={merchant}
                service={selectedService}
                vehicle={vehicleInfo}
                date={selectedDate}
                time={selectedTime}
                depositAmountCents={depositAmountCents}
                depositPercent={depositPercent}
                chargeId={chargeId}
                paymentProcessing={paymentProcessing}
                paymentError={paymentError}
                stripePublishableKey={stripePublishableKey}
                cardFormRef={cardFormRef}
                onError={setPaymentError}
                onPay={handlePayDeposit}
              />
            )}

            {/* ── Step 6: Confirm (Variant redesign) ── */}
            {step === 'confirm' && (
              <StepConfirm
                details={{
                  service: selectedService,
                  date: selectedDate,
                  time: selectedTime,
                  vehicle: vehicleInfo,
                  customer: customerInfo,
                  notes,
                  deposit: { required: requiresDeposit, amountCents: depositAmountCents, paid: !!chargeId },
                  merchant,
                }}
                intakeSummary={renderIntakeSummary()}
              />
            )}

      </div>

      <BookingFooter
        stepIndex={stepIndex}
        totalSteps={STEPS.length}
        side={
          step === 'service' && selectedService ? (
            <FooterReadout label="Total Est." value={formatPrice(selectedService.priceCents)} />
          ) : step === 'payment' ? (
            <FooterReadout
              label={chargeId ? 'Paid' : 'Deposit'}
              value={formatPrice(depositAmountCents)}
              accent={!chargeId}
            />
          ) : null
        }
        action={
          step === 'confirm' ? (
            <button
              className="bk-btn bk-btn-primary"
              onClick={handleBook}
              disabled={submitting}
            >
              {submitting ? 'Booking…' : (
                <>
                  <Check style={{ width: '1.125rem', height: '1.125rem' }} />
                  <span>Book Now</span>
                </>
              )}
            </button>
          ) : step === 'payment' && !chargeId ? (
            <span style={{ minWidth: '8rem' }} aria-hidden="true" />
          ) : (
            <button
              className="bk-btn bk-btn-primary"
              onClick={goNext}
              disabled={!canAdvance()}
            >
              <span>Continue</span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="square"
                aria-hidden="true"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          )
        }
      />
    </BookingShell>
  );
}

function FooterReadout({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        paddingRight: '1.5rem',
        borderRight: '1px solid var(--bk-border-subtle)',
      }}
    >
      <span
        className="bk-mono"
        style={{
          fontSize: '0.6rem',
          color: 'var(--bk-text-muted)',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          marginBottom: '0.25rem',
        }}
      >
        {label}
      </span>
      <span
        className="bk-mono"
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: accent ? 'var(--bk-accent)' : 'var(--bk-text-main)',
          lineHeight: 1,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function IntakeSummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)',
        gap: '1rem',
        fontSize: '0.875rem',
        alignItems: 'baseline',
      }}
    >
      <span style={{ color: 'var(--bk-text-muted)' }}>{label}</span>
      <span style={{ color: 'var(--bk-text-main)' }}>{value}</span>
    </div>
  );
}
