// Service worker — enough for the app to be recognized as an installable PWA, without
// trapping users on a stale cached copy of the game after updates.
// Network-first for the page itself (so updates show up immediately), cache is only
// a fallback for when there's genuinely no connection.
const CACHE_NAME = 'skylure-cache-v2';
const CORE_FILES = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_FILES)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Keep the cache fresh with whatever we just successfully fetched
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(()=>{});
        return response;
      })
      .catch(() => caches.match(event.request)) // offline fallback only
  );
});
