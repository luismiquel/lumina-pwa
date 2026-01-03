const CACHE = "lumina-cache-v3";

// OJO: NO precacheamos "/" para evitar index.html desincronizado con assets hasheados.
const CORE = [
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
    await Promise.all(keys.map((k) => (k === CACHE ? null : caches.delete(k))));
    self.clients.claim();
  })());
});

async function cachePutSafe(cache, req, res) {
  try {
    if (res && res.ok && isCacheable(req)) await cache.put(req, res.clone());
  } catch {}
}

async function cacheFirst(req) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(req);
  if (cached) return cached;

  try {
    const res = await fetch(req);
    await cachePutSafe(cache, req, res);
    return res;
  } catch {
    return new Response("Offline (Lumina Local)", { status: 503, headers: { "Content-Type": "text/plain" } });
  }
}

async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(req);
    await cachePutSafe(cache, req, res);
    return res;
  } catch {
    const cached = await cache.match(req);
    if (cached) return cached;
    return new Response("Offline (Lumina Local)", { status: 503, headers: { "Content-Type": "text/plain" } });
  }
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (!isCacheable(req)) return;

  const url = new URL(req.url);

  // Navegación (index.html / SPA)
  if (req.mode === "navigate") {
    event.respondWith((async () => {
      // Intentamos red primero
      try {
        const res = await fetch(req);
        const cache = await caches.open(CACHE);
        await cachePutSafe(cache, req, res);
        return res;
      } catch {
        // Si no hay red: intenta servir lo que haya cacheado para esta navegación
        const cache = await caches.open(CACHE);
        const cachedNav = await cache.match(req);
        if (cachedNav) return cachedNav;

        // Fallback offline bonito
        const offline = await cache.match("/offline.html");
        return offline || new Response("Offline", { status: 503 });
      }
    })());
    return;
  }

  // Assets hasheados: cache-first para velocidad
  if (url.pathname.startsWith("/assets/") || url.pathname.endsWith(".js") || url.pathname.endsWith(".css")) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // Resto: network-first
  event.respondWith(networkFirst(req));
});
