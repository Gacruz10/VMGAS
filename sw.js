const CACHE_NAME = 'vm-gas-v2';

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Guardamos la base. IMPORTANTE: Si index4.html es tu página, debe estar aquí.
      return cache.addAll(['/', '/index4.html']);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((response) => {
      // Si está en el caché, lo devuelve (ignoreSearch: true ignora el ?k=...)
      if (response) return response;

      // Si no, intenta buscar en la red
      return fetch(e.request).catch(() => {
        // Fallback: si falla la red, devuelve el index4.html si es una navegación
        if (e.request.mode === 'navigate') {
          return caches.match('/index4.html');
        }
      });
    })
  );
});
