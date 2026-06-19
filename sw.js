// Simple Service Worker for Maalem PWA
const CACHE_NAME = 'maalem-cache-v8'; // Increment cache version
const ASSETS = [
  '/Maalem.dc',
  '/manifest.json',
  '/maalem-logo.png',
  '/maalem-mark.png',
  '/support.js',
  '/image-slot.js'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Force the waiting service worker to become active
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS).catch(err => {
          console.error('Cache addAll failed', err);
        });
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim()) // Claim clients immediately
  );
});

self.addEventListener('fetch', event => {
  // Only handle GET requests to avoid API issues (like POST /api/chat)
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  
  // If requesting /Maalem.dc, root (/), or /index.html, serve the cached /Maalem.dc
  if (url.pathname === '/Maalem.dc' || url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(
      caches.match('/Maalem.dc').then(cached => {
        if (cached) return cached;
        // Fallback: fetch the clean /Maalem.dc route
        return fetch('/Maalem.dc');
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});
