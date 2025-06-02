// اسم ذاكرة التخزين المؤقت
const CACHE_NAME = 'gaming-hall-cache-v1';

// قائمة الملفات التي سيتم تخزينها في ذاكرة التخزين المؤقت
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/main.js',
  '/clear-data.js',
  '/users.json',
  '/icons/icon-48x48.png',
  '/icons/icon-96x96.png',
  '/icons/icon-144x144.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap'
];

// تثبيت Service Worker وتخزين الملفات في ذاكرة التخزين المؤقت
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('تم فتح ذاكرة التخزين المؤقت');
        return cache.addAll(urlsToCache);
      })
  );
});

// استجابة لطلبات الشبكة
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // إذا وجد الملف في ذاكرة التخزين المؤقت، أعد استخدامه
        if (response) {
          return response;
        }

        // إذا لم يوجد الملف في ذاكرة التخزين المؤقت، قم بجلبه من الشبكة
        return fetch(event.request)
          .then(response => {
            // تحقق من أن الاستجابة صالحة
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // انسخ الاستجابة لأننا سنستخدمها مرتين
            const responseToCache = response.clone();

            // أضف الاستجابة إلى ذاكرة التخزين المؤقت
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
      })
      .catch(() => {
        // إذا فشل كل شيء، عد إلى صفحة البداية
        if (event.request.url.indexOf('.html') > -1) {
          return caches.match('/index.html');
        }
      })
  );
});

// تحديث Service Worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // حذف ذاكرة التخزين المؤقت القديمة
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
