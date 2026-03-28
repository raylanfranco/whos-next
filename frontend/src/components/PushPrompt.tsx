import { useState, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { api } from '../lib/api';

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
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if push is supported (PushManager + service worker + VAPID key)
    const isSupported =
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      !!VAPID_PUBLIC_KEY;
    setSupported(isSupported);

    if (!isSupported) return;

    // Check existing subscription
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        if (sub) setSubscribed(true);
      });
    });

    // Check if previously dismissed
    if (localStorage.getItem('whosnext_push_dismissed') === 'true') {
      setDismissed(true);
    }
  }, []);

  const handleSubscribe = async () => {
    setLoading(true);
    setError('');

    try {
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

  // Don't render if: not supported, already subscribed, or dismissed
  if (!supported || subscribed || dismissed) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-start gap-3">
      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
        <Bell className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-slate-900 font-display">Enable Notifications</div>
        <p className="text-xs text-slate-500 mt-0.5">
          Get notified when new bookings come in or statuses change.
        </p>
        {error && (
          <p className="text-xs text-red-600 mt-1">{error}</p>
        )}
        <div className="flex items-center gap-2 mt-2.5">
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5"
          >
            {loading ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
            className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1.5 flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
