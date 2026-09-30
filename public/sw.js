self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  // Pass-through fetch (não faz cache de nada, apenas cumpre o requisito do PWA)
  e.respondWith(fetch(e.request).catch(() => new Response("Offline")));
});
