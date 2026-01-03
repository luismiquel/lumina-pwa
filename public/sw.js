const CACHE = "lumina-cache-v2";

/**
 * Core mínimo: app shell + manifest + icons.
 * /assets se cachea dinámicamente (cache-first) y también se precalienta en activate.
 */
const CORE = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

function isSameOrigin(req) {
  try {
    const url = new URL(req.url);
    return (url.protocol === "http:" || url.protocol === "https:") && url.origin === self.location.origin;
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
    // limpia caches viejas
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => (k === CACHE ? null : caches.delete(k))));
    await self.clients.claim();

    // precalienta assets del build si podemos (best-effort)
    // No rompe si falla: sirve para mejorar offline tras 1ª carga.
    try {
      const cache = await caches.open(CACHE);
      // Intento obtener index.html desde cache (o red) y extraer /assets/...
      const res = (await cache.match("/index.html")) ?? (await fetch("/index.html", { cache: "no-store" }));
      const html = await res.text();
      const assetUrls = [];
      const re = /href="(\/assets\/[^"]+\.css)"/g;
      const re2 = /src="(\/assets\/[^"]+\.js)"/g;

      let m;
      while ((m = re.exec(html))) assetUrls.push(m[1]);
      while ((m = re2.exec(html))) assetUrls.push(m[1]);

      await Promise.all(assetUrls.map(async (u) => {
        try { await cache.add(u); } catch {}
      }));
    } catch {}
  })());
});

async function cacheFirst(req) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(req);
  if (cached) return cached;

  try {
    const res = await fetch(req);
    if (res && res.ok && isSameOrigin(req)) {
      try { await cache.put(req, res.clone()); } catch {}
    }
    return res;
  } catch {
    return new Response("Offline (Lumina Local)", { status: 503, headers: { "Content-Type": "text/plain" } });
  }
}

async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(req);
    if (res && res.ok && isSameOrigin(req)) {
      try { await cache.put(req, res.clone()); } catch {}
    }
    return res;
  } catch {
    const cached = await cache.match(req);
    if (cached) return cached;
    return new Response("Offline (Lumina Local)", { status: 503, headers: { "Content-Type": "text/plain" } });
  }
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (!isSameOrigin(req)) return;

  const url = new URL(req.url);

  // navegación SPA
  if (req.mode === "navigate") {
    event.respondWith((async () => {
      // intenta red, si no, app shell
      const res = await networkFirst(req);
      if (res && res.ok) return res;
      const cache = await caches.open(CACHE);
      return (await cache.match("/index.html")) ?? res;
    })());
    return;
  }

  // assets del build: cache-first
  if (url.pathname.startsWith("/assets/") || url.pathname.endsWith(".css") || url.pathname.endsWith(".js")) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // resto: network-first
  event.respondWith(networkFirst(req));
});
