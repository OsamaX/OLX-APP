var cacheName = 'olx-cache-1'
// var dataCacheName = 'weatherData-v1'

var filesToCache = [
    '/home',
    '/offline',
    '/message',
    '/myads',
    '/static/css/style.css',
    '/static/js/adUtility.js',
    '/static/js/utility.js',
    '/static/js/offline.js'
  ];

self.addEventListener('install', function(e) {
    console.log('[Serivce Worker] Install')
    e.waitUntil(
        caches.open(cacheName).then((cache) => {
            console.log('[ServiceWorker] Caching app shell')
            return cache.addAll(filesToCache)
        })
    )
})

self.addEventListener('activate', function (e) {
    console.log('[ServiceWorker] Activate')
    e.waitUntil(
        caches.keys().then((keyList) => {
            console.log(keyList)
            return Promise.all(keyList.map((key) => {
            if (key !== cacheName && key !== dataCacheName) {
                console.log('[ServiceWorker] Removing old cache', key)
                return caches.delete(key)
            }
        }))
    })
    )
    return self.clients.claim()
})

self.addEventListener('fetch', function (e) { 
    // console.log('[ServiceWorker] Fetch', e.request.url)
    // var dataUrl = 'https://query.yahooapis.com/v1/public/yql'
    // console.log(e.request.url)
    // if (e.request.url.indexOf(dataUrl) > -1) {
    //     e.respondWith(
    //         caches.open(dataCacheName).then(function(cache) {
    //             return fetch(e.request).then(function (response) { 
    //                 cache.put(e.request.url, response.clone())
    //                 return response
    //              })
    //         })
    //     )
    // } else {
        e.respondWith(
            caches.match(e.request).then((response) => response || fetch(e.request))
        )
    // }
 })