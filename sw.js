const CACHE_NAME = 'xingya-shell-v80';
const SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './songs.js',
  './manifest.webmanifest',
  './icons/icon-192-v3.png',
  './icons/icon-512-v3.png',
  './icons/apple-touch-icon-v3.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  // Cache songs from the same origin or the GitHub CDN after their first play.
  // jsDelivr sends CORS headers, so these responses can be stored by the Cache API.
  if (request.destination === 'audio') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      // Always use the song URL as the cache key. Browsers send a different
      // Range header while seeking, and partial responses must never replace
      // the complete cached song.
      const cacheKey = new URL(request.url).toString();
      const cached = await cache.match(cacheKey, { ignoreVary: true });
      if (cached) return cached;

      try {
        // Fetch the complete song once. Returning it to the initial Range
        // request is accepted by Chrome/Safari, and later seeks reuse the cache.
        const response = await fetch(request.url, { cache: 'default' });
        if (response.ok) {
          await cache.put(cacheKey, response.clone());
        }
        return response;
      } catch (error) {
        const fallback = await cache.match(cacheKey, { ignoreVary: true });
        if (fallback) return fallback;
        throw error;
      }
    })());
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request, { ignoreSearch: true }))
  );
});
