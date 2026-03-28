import { useState, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { api } from '../lib/api';
import { usePlatform } from '../context/PlatformContext';
import { isNativeApp, registerNativePush } from '../lib/capacitor-push';
import { useMerchant } from '../context/MerchantContext';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushPrompt() {
  const { isNative } = usePlatform();
  const { merchant } = useMerchant();
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isNative) {
      // Native always supports push (permission will be requested on subscribe)
      setSupported(true);
    } else {
      // Web push requires service worker + PushManager + VAPID key
      const isSupported =
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        !!VAPID_PUBLIC_KEY;
      setSupported(isSupported);

      if (isSupported) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.pushManager.getSubscription().then((sub) => {
            if (sub) setSubscribed(true);
          });
        });
      }
    }

    if (localStorage.getItem('whosnext_push_dismissed') === 'true') {
      setDismissed(true);
    }
  }, [isNative]);

  const handleSubscribe = async () => {
    setLoading(true);
    setError('');

    try {
      if (isNativeApp() && merchant) {
        // Native path — request APNS/FCM token and send to backend
        const success = await registerNativePush(merchant.id, api.post.bind(api));
        if (success) {
          setSubscribed(true);
        } else {
          setError('Push permission denied or registration failed');
        }
      } else {
        // Web push path
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
        });

        const json = sub.toJSON();
        await api.post('/push/subscribe', {
          endpoint: json.endpoint,
          p256dh: json.keys?.p256dh,
          auth: json.keys?.auth,
          deviceLabel: navigator.userAgent.substring(0, 100),
        });

        setSubscribed(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to enable notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('whosnext_push_dismissed', 'true');
  };

  if (!supported || subscribed || dismissed) return null;

  return (
    <div className="glass-panel-amber p-4 flex items-start gap-3">
      <div className="w-10 h-10 flex items-center justify-center shrink-0" style={{ background: 'var(--color-accent-muted)', border: '1px solid var(--color-border-accent)' }}>
        <Bell className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-white font-display">Enable Notifications</div>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
          {isNative
            ? 'Get instant alerts when new bookings come in.'
            : 'Get notified when new bookings come in or statuses change.'}
        </p>
        {error && (
          <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{error}</p>
        )}
        <div className="flex items-center gap-2 mt-2.5">
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5"
          >
            {loading ? (
              <>
                <div className="w-3 h-3 border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-bg-base)', borderTopColor: 'transparent' }} />
                Enabling...
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                Enable
              </>
            )}
          </button>
          <button
            onClick={handleDismiss}
            className="text-xs px-2 py-1.5 flex items-center gap-1 text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
