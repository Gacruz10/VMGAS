const CACHE_NAME = 'vm-gas-v1';
const ASSETS = [
  '/',
  '/index4.html', // o el nombre de tu archivo principal
  // Agregá aquí tus archivos CSS y JS críticos
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((response) => response || fetch(e.request)));
});
