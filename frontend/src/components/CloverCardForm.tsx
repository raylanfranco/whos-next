// DEPRECATED: This component uses Clover's SDK for payment processing.
// For this Clover-decoupled fork, use StripeCardForm instead.
// Kept for backward compatibility reference.

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';

interface CloverElement {
  mount: (selector: string) => void;
  addEventListener: (event: string, cb: (e: unknown) => void) => void;
}

interface CloverTokenResult {
  token?: string;
  errors?: Record<string, { error?: string; touched?: boolean }>;
}

interface CloverInstance {
  elements: () => {
    create: (type: string, styles?: Record<string, unknown>) => CloverElement;
  };
  createToken: () => Promise<CloverTokenResult>;
}

export interface CloverCardFormRef {
  getToken: () => Promise<string>;
}

interface Props {
  merchantId: string;
  onError?: (error: string) => void;
}

const CLOVER_SDK_URL = 'https://checkout.clover.com/sdk.js';
const CLOVER_SDK_ID = 'clover-checkout-sdk';

function loadCloverSdk(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as unknown as { Clover?: unknown }).Clover) { resolve(); return; }
    const existing = document.getElementById(CLOVER_SDK_ID) as HTMLScriptElement | null;
    if (existing) {
      if ((window as unknown as { Clover?: unknown }).Clover) { resolve(); } else {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('Clover SDK failed to load')));
      }
      return;
    }
    const script = document.createElement('script');
    script.id = CLOVER_SDK_ID;
    script.src = CLOVER_SDK_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Clover SDK failed to load'));
    document.head.appendChild(script);
  });
}

const CONTAINER_IDS = ['clover-card-number', 'clover-card-date', 'clover-card-cvv', 'clover-card-postal'] as const;

const CloverCardForm = forwardRef<CloverCardFormRef, Props>(({ merchantId, onError }, ref) => {
  const cloverRef = useRef<CloverInstance | null>(null);
  const [ready, setReady] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    let cancelled = false;
    let mountTimer: ReturnType<typeof setTimeout> | null = null;
    async function init() {
      try { await loadCloverSdk(); } catch { if (!cancelled) setSdkError('Clover SDK failed to load. Please refresh the page.'); return; }
      if (cancelled) return;
      const apiKey = import.meta.env.VITE_CLOVER_ECOMM_PUBLIC_KEY;
      if (!apiKey) { setSdkError('Clover ecommerce key not configured. Contact the merchant.'); return; }
      const CloverConstructor = (window as unknown as { Clover?: new (apiKey: string, opts?: { merchantId: string }) => CloverInstance }).Clover;
      if (!CloverConstructor) { setSdkError('Clover SDK not available after load.'); return; }
      const waitForDom = () => new Promise<void>((resolve, reject) => { let attempts = 0; const check = () => { if (cancelled) { reject(new Error('cancelled')); return; } if (document.getElementById('clover-card-number')) { resolve(); } else if (attempts++ > 40) { reject(new Error('DOM containers not found')); } else { setTimeout(check, 50); } }; check(); });
      try { await waitForDom(); } catch { if (!cancelled) setSdkError('Card form containers failed to render.'); return; }
      if (cancelled) return;
      try {
        const clover = new CloverConstructor(apiKey, { merchantId });
        cloverRef.current = clover;
        const elements = clover.elements();
        const styles = { body: { fontFamily: '"Inter", sans-serif', fontSize: '14px', margin: '0', padding: '0' }, input: { fontSize: '14px', padding: '6px 8px', margin: '0' } };
        const cardNumber = elements.create('CARD_NUMBER', styles);
        const cardDate = elements.create('CARD_DATE', styles);
        const cardCvv = elements.create('CARD_CVV', styles);
        const cardPostalCode = elements.create('CARD_POSTAL_CODE', styles);
        cardNumber.addEventListener('change', (event: unknown) => { const e = event as { error?: { message?: string } }; if (e.error?.message) onErrorRef.current?.(e.error.message); });
        let focusDetected = false;
        const onFirstFocus = () => { if (!focusDetected && !cancelled) { focusDetected = true; setReady(true); } };
        cardNumber.addEventListener('focus', onFirstFocus);
        cardDate.addEventListener('focus', onFirstFocus);
        cardCvv.addEventListener('focus', onFirstFocus);
        cardPostalCode.addEventListener('focus', onFirstFocus);
        mountTimer = setTimeout(() => { if (cancelled) return; cardNumber.mount('#clover-card-number'); cardDate.mount('#clover-card-date'); cardCvv.mount('#clover-card-cvv'); cardPostalCode.mount('#clover-card-postal'); setTimeout(() => { if (!cancelled) setReady(true); }, 1500); }, 200);
      } catch { if (!cancelled) setSdkError('Failed to initialize card form. Please try again.'); }
    }
    init();
    return () => { cancelled = true; if (mountTimer) clearTimeout(mountTimer); cloverRef.current = null; for (const id of CONTAINER_IDS) { const el = document.getElementById(id); if (el) el.innerHTML = ''; } };
  }, [merchantId]);

  useImperativeHandle(ref, () => ({
    getToken: async () => {
      if (!cloverRef.current) throw new Error('Card form not ready');
      const result = await cloverRef.current.createToken();
      if (result.errors) { const firstError = Object.values(result.errors).find(v => v.error)?.error; throw new Error(firstError || 'Card validation failed'); }
      if (!result.token) throw new Error('No token returned');
      return result.token;
    },
  }));

  if (sdkError) {
    return (<div className="border border-red-200 bg-red-50 rounded-lg p-4 text-sm text-red-600">{sdkError}</div>);
  }

  const fieldClass = "border border-slate-200 rounded-lg bg-white h-[44px] overflow-hidden shadow-sm transition-all focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] [&>iframe]:w-full [&>iframe]:h-[50px] [&>iframe]:-mt-[2px]";

  return (
    <form id="payment-form" onSubmit={(e) => e.preventDefault()} className="space-y-3">
      <div><label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Card Number</label><div id="clover-card-number" className={fieldClass} /></div>
      <div className="grid grid-cols-3 gap-3">
        <div><label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Expiry</label><div id="clover-card-date" className={fieldClass} /></div>
        <div><label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">CVV</label><div id="clover-card-cvv" className={fieldClass} /></div>
        <div><label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">ZIP</label><div id="clover-card-postal" className={fieldClass} /></div>
      </div>
      {!ready && (<div className="text-xs text-slate-400 flex items-center gap-2"><div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />Loading secure card form...</div>)}
    </form>
  );
});

CloverCardForm.displayName = 'CloverCardForm';
export default CloverCardForm;
