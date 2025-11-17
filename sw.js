const STATIC_CACHE_NAME = 'mzansi-static-v1';
const DYNAMIC_CACHE_NAME = 'mzansi-dynamic-v1';
const MAP_CACHE_NAME = 'mzansi-map-tiles-v1';

// These assets are cached upon service worker installation.
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css',
  'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
];

self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then(cache => {
      console.log('[SW] Precaching App Shell');
      return cache.addAll(APP_SHELL_URLS);
    })
  );
});

self.addEventListener('activate', event => {
  console.log('[SW] Activating Service Worker...');
  const cacheWhitelist = [STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME, MAP_CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Strategy: Stale-while-revalidate for Google Maps tiles
  if (url.hostname.endsWith('google.com') && url.pathname.includes('/vt/')) {
    event.respondWith(
      caches.open(MAP_CACHE_NAME).then(cache => {
        return cache.match(event.request).then(response => {
          const fetchPromise = fetch(event.request).then(networkResponse => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          }).catch(err => console.log('[SW] Map tile fetch failed: ', err));
          return response || fetchPromise;
        });
      })
    );
    return;
  }
  
  // Strategy: Cache-first for placeholder images
  if (url.hostname === 'picsum.photos') {
     event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).then(fetchResponse => {
                return caches.open(DYNAMIC_CACHE_NAME).then(cache => {
                    cache.put(event.request.url, fetchResponse.clone());
                    return fetchResponse;
                });
            });
        })
    );
    return;
  }

  // Strategy: Cache-first for app shell assets.
  // For other requests, it will try to fetch from the network.
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => {
        // This is a basic offline fallback.
        // In a real app, you might want a dedicated offline page.
        console.log('[SW] Fetch failed, request for', event.request.url, 'could not be satisfied from cache or network.');
      });
    })
  );
});