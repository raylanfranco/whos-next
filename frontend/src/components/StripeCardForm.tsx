import { useImperativeHandle, forwardRef, useState, useEffect } from 'react';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const ENV_STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

// Cache Stripe instances by publishable key
const stripeCache = new Map<string, Promise<Stripe | null>>();
function getStripe(pk: string) {
  if (!stripeCache.has(pk)) {
    stripeCache.set(pk, loadStripe(pk));
  }
  return stripeCache.get(pk)!;
}

export interface StripeCardFormRef {
  getToken: () => Promise<string>;
}

interface Props {
  merchantId?: string;
  publishableKey?: string;
  onError?: (error: string) => void;
}

const CARD_STYLE = {
  base: {
    fontSize: '15px',
    color: '#1e293b',
    fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
    '::placeholder': { color: '#94a3b8' },
  },
  invalid: { color: '#dc2626' },
};

const InnerCardForm = forwardRef<StripeCardFormRef, Props>(({ onError }, ref) => {
  const stripe = useStripe();
  const elements = useElements();

  useImperativeHandle(ref, () => ({
    getToken: async () => {
      if (!stripe || !elements) {
        const msg = 'Stripe is still loading. Please wait a moment.';
        onError?.(msg);
        throw new Error(msg);
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        const msg = 'Card element not found';
        onError?.(msg);
        throw new Error(msg);
      }

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        const msg = error.message || 'Payment method creation failed';
        onError?.(msg);
        throw new Error(msg);
      }

      return paymentMethod!.id;
    },
  }));

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
          Card Details
        </label>
        <div className="premium-input p-3">
          <CardElement options={{ style: CARD_STYLE, hidePostalCode: false }} />
        </div>
      </div>
    </div>
  );
});

InnerCardForm.displayName = 'InnerCardForm';

const StripeCardForm = forwardRef<StripeCardFormRef, Props>((props, ref) => {
  const [ready, setReady] = useState(false);

  // Use per-merchant key if provided, fall back to env var
  const pk = props.publishableKey || ENV_STRIPE_PK;

  useEffect(() => {
    if (pk) setReady(true);
  }, [pk]);

  if (!pk) {
    return (
      <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2">
        Stripe is not configured for this merchant.
      </p>
    );
  }

  if (!ready) return null;

  return (
    <Elements stripe={getStripe(pk)}>
      <InnerCardForm ref={ref} {...props} />
    </Elements>
  );
});

StripeCardForm.displayName = 'StripeCardForm';
export default StripeCardForm;
