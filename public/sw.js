const CACHE_NAME = 'martabak-gresik-v4'; // Increment version
const ASSETS = [
  '/',
  '/index.html',
  '/logo.webp',
  '/icon.webp',
  '/chef.ico',
  '/logo.ico',
  '/martabak.webp',
  '/terang-bulan.webp',
  '/manifest.json',
  '/ariftitana.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Stale-While-Revalidate strategy for a balance of speed and freshness
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Don't cache if not a success or if it's a cross-origin request we don't want to cache
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        // Fallback or just return undefined if network fails and no cache
      });

      return cachedResponse || fetchPromise;
    })
  );
});
