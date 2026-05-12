import { useImperativeHandle, forwardRef } from 'react';
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
  theme?: 'light' | 'dark';
}

const LIGHT_CARD_STYLE = {
  base: {
    fontSize: '15px',
    color: '#1e293b',
    fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
    '::placeholder': { color: '#94a3b8' },
  },
  invalid: { color: '#dc2626' },
};

const DARK_CARD_STYLE = {
  base: {
    fontSize: '15px',
    color: '#ffffff',
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    '::placeholder': { color: '#666666' },
    iconColor: '#888888',
  },
  invalid: { color: '#E01020', iconColor: '#E01020' },
};

const InnerCardForm = forwardRef<StripeCardFormRef, Props>(({ onError, theme = 'light' }, ref) => {
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

  const cardStyle = theme === 'dark' ? DARK_CARD_STYLE : LIGHT_CARD_STYLE;
  if (theme === 'dark') {
    return (
      <div>
        <label
          className="bk-mono"
          style={{
            display: 'block',
            fontSize: '0.65rem',
            color: 'var(--bk-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.22em',
            fontWeight: 700,
            marginBottom: '0.75rem',
          }}
        >
          Card Details
        </label>
        <div
          style={{
            background: 'var(--bk-bg-base)',
            border: '1px solid var(--bk-border-subtle)',
            padding: '1rem',
            transition: 'border-color 0.15s ease',
          }}
        >
          <CardElement options={{ style: cardStyle, hidePostalCode: false }} />
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
          Card Details
        </label>
        <div className="premium-input p-3">
          <CardElement options={{ style: cardStyle, hidePostalCode: false }} />
        </div>
      </div>
    </div>
  );
});

InnerCardForm.displayName = 'InnerCardForm';

const StripeCardForm = forwardRef<StripeCardFormRef, Props>((props, ref) => {
  // Use per-merchant key if provided, fall back to env var
  const pk = props.publishableKey || ENV_STRIPE_PK;

  if (!pk) {
    if (props.theme === 'dark') {
      return (
        <p
          className="bk-mono"
          style={{
            fontSize: '0.75rem',
            color: 'var(--bk-accent)',
            background: 'rgba(var(--bk-accent-rgb), 0.08)',
            border: '1px solid rgba(var(--bk-accent-rgb), 0.25)',
            padding: '0.75rem 1rem',
            letterSpacing: '0.05em',
          }}
        >
          Stripe is not configured for this merchant.
        </p>
      );
    }
    return (
      <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2">
        Stripe is not configured for this merchant.
      </p>
    );
  }

  return (
    <Elements stripe={getStripe(pk)}>
      <InnerCardForm ref={ref} {...props} />
    </Elements>
  );
});

StripeCardForm.displayName = 'StripeCardForm';
export default StripeCardForm;
