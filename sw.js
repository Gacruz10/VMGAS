const CACHE_NAME = 'vm-gas-v5';

const ASSETS = [
  '/',
  '/index.html',
  '/inicio.html',
  '/index4.html',
  '/icon.png' // Importante para que no falte el logo offline
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Esta parte borra los cachés viejos (v2, v3, v4) para que no hagan conflicto
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((response) => {
      // 1. Si el archivo está en caché (ignorando el ?k=), lo devuelve
      if (response) return response;

      // 2. Si no está en caché, intenta ir a internet
      return fetch(e.request).catch(() => {
        // 3. Si no hay internet y es una navegación, te manda al Login (index.html)
        if (e.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
