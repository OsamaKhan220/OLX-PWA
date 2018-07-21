var cacheName = 'olx-pwa-v2';
var filesToCache = [
    '/',
    '/index.html',
    '/src/templete/searchads.html',
    '/src/templete/signin.html',
    '/src/templete/signup.html',
    '/src/templete/ad.html',
    '/src/templete/adposting.html',
    '/src/templete/favads.html',
    '/src/templete/myads.html',
    '/src/templete/mymessages.html',
    '/src/templete/message.html',
    '/src/js/index.js',
    '/src/css/bootstrap-respnsive.min.css',
    '/src/css/bootstrap.min.css',
    '/src/css/style.css'
];

self.addEventListener('install', function(e) {
    console.log('[ServiceWorker] Install');
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            console.log('[ServiceWorker] Caching app shell');
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener('activate', function(e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function(keyList) {
            return Promise.all(keyList.map(function(key) {
                if (key !== cacheName) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        fetch(event.request).catch(function() {
            return caches.match(event.request);
        })
    );
});

// self.addEventListener('fetch', function(event) {
//     event.respondWith(
//         caches.open('cacheName').then(function(cache) {
//             return cache.match(event.request).then(function(response) {
//                 var fetchPromise = fetch(event.request).then(function(networkResponse) {
//                     cache.put(event.request, networkResponse.clone());
//                     return networkResponse;
//                 })
//                 return response || fetchPromise;
//             })
//         })
//     );
// });
