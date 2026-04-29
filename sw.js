const BUILD = "20260429";
const CACHE = "worldclock-" + BUILD;
const SHELL = [
  "/world-clock/world-clock.html",
  "/world-clock/manifest.json",
  "/world-clock/icons/icon-192.png",
  "/world-clock/icons/icon-512.png",
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  // Network-first for API calls (weather), cache-first for app shell
  const url = new URL(e.request.url);
  if (url.hostname === "api.open-meteo.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return res;
    }))
  );
});
