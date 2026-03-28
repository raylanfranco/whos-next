// BayReady Service Worker — Push notifications + offline dashboard shell cache

const CACHE_NAME = 'bayready-shell-v1';
const SHELL_URLS = [
  '/dashboard',
  '/manifest.json',
  '/logo.svg',
];

// ── Install: pre-cache dashboard shell ──
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS))
  );
  self.skipWaiting();
});

// ── Activate: clean old caches ──
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch: network-first, fallback to cache for navigation ──
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/dashboard'))
    );
  }
});

// ── Push: show notification ──
self.addEventListener('push', (event) => {
  let data = { title: 'BayReady', body: 'You have a new notification', url: '/dashboard/bookings' };
  try {
    data = { ...data, ...event.data.json() };
  } catch {
    // Use defaults
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { url: data.url || '/dashboard/bookings' },
    })
  );
});

// ── Notification click: open dashboard bookings ──
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/dashboard/bookings';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes('/dashboard') && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
