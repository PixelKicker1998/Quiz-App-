// Minimaler Service Worker (keine Offline-Caches)
self.addEventListener('install', event => {
  console.log('Service Worker installiert');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Service Worker aktiviert');
});
