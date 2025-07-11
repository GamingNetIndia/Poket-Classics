// sw.js

const CACHE_NAME = 'pocket-classics-loader-v1';
const FILES_TO_CACHE = [
    '/', // This caches the root index.html
    '/index.html',
    '/developer-logo.png',
    '/logo.png',
    '/manifest.json' // Also cache the PWA manifest
];

// Install event: open cache and add the loader files
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(FILES_TO_CACHE);
            })
    );
});

// Fetch event: serve cached content if available for the loader files
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                // Not in cache - fetch from network
                return fetch(event.request);
            })
    );
});