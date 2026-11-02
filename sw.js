const CACHE_NAME = 'mizantech-v1';
const urlsToCache = ['/', '/index.html', '/manifest.json'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});
self.addEventListener('fetch', event => {
  if (event.request.url.includes('firestore.googleapis.com') || event.request.url.includes('identitytoolkit.googleapis.com')) return;
  event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(cacheNames => Promise.all(cacheNames.map(cacheName => { if (cacheName !== CACHE_NAME) return caches.delete(cacheName); }))));
});