const CACHE = "lumina-cache-v3";

const CORE = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

function isSameOrigin(req) {
  try {
    const url = new URL(req.url);
    return (url.protocol === "http:" || url.protocol === "https:") && url.origin === self.location.origin;
  } catch {
    return false;
  }
}

async function precacheCore() {
  const cache = await caches.open(CACHE);
  await cache.addAll(CORE);
}

async function warmAssetsFromIndex() {
  try {
    const cache = await caches.open(CACHE);
    const res = (await cache.match("/index.html")) ?? (await fetch("/index.html", { cache: "no-store" }));
    const html = await res.text();

    const assets = [];
    const cssRe = /href="(\/assets\/[^"]+\.css)"/g;
    const jsRe = /src="(\/assets\/[^"]+\.js)"/g;

    let m;
    while ((m = cssRe.exec(html))) assets.push(m[1]);
    while ((m = jsRe.exec(html))) assets.push(m[1]);

    await Promise.all(
      assets.map(async (u) => {
        try { await cache.add(u); } catch {}
      })
    );
  } catch {}
}

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    await precacheCore();
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => (k === CACHE ? null : caches.delete(k))));
    await self.clients.claim();
    await warmAssetsFromIndex();
  })());
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
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
    return new Response("Offline (Lumina Local)", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
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

    return new Response("Offline (Lumina Local)", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (!isSameOrigin(req)) return;

  const url = new URL(req.url);

  if (req.mode === "navigate") {
    event.respondWith((async () => {
      const res = await networkFirst(req);
      if (res && res.ok) return res;
      const cache = await caches.open(CACHE);
      return (await cache.match("/index.html")) ?? res;
    })());
    return;
  }

  if (url.pathname.startsWith("/assets/") || url.pathname.endsWith(".css") || url.pathname.endsWith(".js")) {
    event.respondWith(cacheFirst(req));
    return;
  }

  event.respondWith(networkFirst(req));
});
