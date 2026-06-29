const CACHE_NAME = 'svoz-palet-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// Instalace a uložení do paměti (cache)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Zajištění načítání offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});