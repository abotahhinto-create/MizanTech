const CACHE_NAME = 'mizantech-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
]; 

// تثبيت الكاش وتخزين الملفات الأساسية
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// تفعيل وحذف الكاش القديم
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// اعتراض الطلبات (Network First مع الرجوع للكاش)
self.addEventListener('fetch', (event) => {
  // لا نقوم بتخزين طلبات قاعدة البيانات (Firebase) لكي تظل المزامنة تعمل
  if (event.request.url.includes('firestore') || event.request.url.includes('google')) {
    return; 
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // إذا كان الاتصال ناجحاً، نقوم بتحديث الكاش
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // إذا انقطع الإنترنت، نعرض النسخة المخزنة
        return caches.match(event.request);
      })
  );
});
