import { Capacitor } from '@capacitor/core';

export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Register for native push notifications (iOS/Android).
 * Currently a stub — native push plugins will be added once
 * Capacitor plugin versions are compatible with Xcode 16.2+.
 * For now, push notifications use the web push path (PushManager API).
 */
export async function registerNativePush(
  _merchantId: string,
  _apiPost: (path: string, body: unknown) => Promise<unknown>,
): Promise<boolean> {
  // Native push registration disabled until @capacitor/push-notifications
  // is compatible with Capacitor core + Xcode 16.2
  console.log('Native push not yet available — use web push');
  return false;
}

/**
 * Set up native push notification listeners.
 * No-op until native push plugin is re-added.
 */
export function setupNativePushListeners() {
  // Stub — will be implemented when plugin compatibility is resolved
}
