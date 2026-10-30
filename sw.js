'use strict';

// Direct share service worker.
// It only keeps the app itself (HTML, icons, the Trystero library) so the page opens
// instantly and offline. It never touches WebSockets, WebRTC or file data, and it caches
// nothing from other sites.
//
// To ship an update, change VERSION below. Online, pages are always fetched fresh first;
// the cache is only the fallback when the network is unavailable.

const VERSION = 'v2';
const CACHE = 'directshare-' + VERSION;
const SHELL = [
  './',
  'index.html',
  'how-it-works.html',
  'trystero.js',
  'qr.js',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'icon-maskable-512.png',
  'apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(SHELL.map((url) => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('directshare-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // other sites: not our business

  event.respondWith(networkFirst(req));
});

async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  try {
    // 'no-cache' makes the browser revalidate, so a stale HTTP cache can't hide an update
    const fresh = await fetch(req, { cache: 'no-cache' });
    if (fresh.ok && fresh.type === 'basic') cache.put(req, fresh.clone()).catch(() => {});
    return fresh;
  } catch (_) {
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    if (req.mode === 'navigate') {
      const page = await cache.match('index.html');
      if (page) return page;
    }
    return new Response('Offline', { status: 503, statusText: 'Offline', headers: { 'Content-Type': 'text/plain' } });
  }
}
