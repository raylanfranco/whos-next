import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Register for native push notifications (iOS/Android).
 * Sends the device token to the backend for APNS/FCM delivery.
 */
export async function registerNativePush(
  merchantId: string,
  apiPost: (path: string, body: unknown) => Promise<unknown>,
): Promise<boolean> {
  if (!isNativeApp()) return false;

  const permission = await PushNotifications.requestPermissions();
  if (permission.receive !== 'granted') return false;

  await PushNotifications.register();

  return new Promise((resolve) => {
    PushNotifications.addListener('registration', async (token) => {
      try {
        await apiPost('/push/subscribe-native', {
          token: token.value,
          platform: Capacitor.getPlatform(), // 'ios' or 'android'
          merchantId,
        });
        resolve(true);
      } catch (err) {
        console.error('Native push registration failed:', err);
        resolve(false);
      }
    });

    PushNotifications.addListener('registrationError', (err) => {
      console.error('Native push registration error:', err);
      resolve(false);
    });
  });
}

/**
 * Set up native push notification listeners.
 * Call once on app startup for native platforms.
 */
export function setupNativePushListeners() {
  if (!isNativeApp()) return;

  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Push received:', notification);
    // Could show an in-app toast here
  });

  PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    console.log('Push tapped:', action);
    // Navigate to relevant screen based on action.notification.data
    const data = action.notification.data;
    if (data?.url) {
      window.location.href = data.url;
    }
  });
}
