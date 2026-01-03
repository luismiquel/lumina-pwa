const CACHE = "lumina-cache-v2";
const CORE = [
  "/",
  "/offline.html",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

function isCacheable(req) {
  try {
    const url = new URL(req.url);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    return url.origin === self.location.origin;
  } catch {
    return false;
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(CORE);
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.map((k) => (k === CACHE ? null : caches.delete(k)))
    );
    self.clients.claim();
  })());
});

async function cacheFirst(req) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(req);
  if (cached) return cached;

  try {
    const res = await fetch(req);
    if (res && res.ok && isCacheable(req)) {
      try { await cache.put(req, res.clone()); } catch {}
    }
    return res;
  } catch {
    return cache.match("/offline.html");
  }
}

async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(req);
    if (res && res.ok && isCacheable(req)) {
      try { await cache.put(req, res.clone()); } catch {}
    }
    return res;
  } catch {
    const cached = await cache.match(req);
    if (cached) return cached;
    return cache.match("/offline.html");
  }
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (!isCacheable(req)) return;

  if (req.mode === "navigate") {
    event.respondWith(networkFirst(req));
    return;
  }

  const url = new URL(req.url);
  if (
    url.pathname.startsWith("/assets/") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css")
  ) {
    event.respondWith(cacheFirst(req));
    return;
  }

  event.respondWith(networkFirst(req));
});
