const CACHE = "lumina-pwa-v1";
const CORE = ["/", "/index.html", "/manifest.webmanifest"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => (k === CACHE ? null : caches.delete(k))));
    await self.clients.claim();
  })());
});

function allowed(req) {
  if (req.method !== "GET") return false;
  let u;
  try { u = new URL(req.url); } catch { return false; }
  if (u.protocol !== "http:" && u.protocol !== "https:") return false;   // bloquea chrome-extension
  if (u.origin !== self.location.origin) return false;                    // bloquea terceros
  return true;
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (!allowed(req)) return;

  const accept = req.headers.get("accept") || "";
  const isHTML = req.mode === "navigate" || accept.includes("text/html");

  if (isHTML) {
    e.respondWith(networkFirst(req));
  } else {
    e.respondWith(cacheFirst(req));
  }
});

async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(req);
    return res;
  } catch {
    const cached = await cache.match("/index.html");
    return cached || new Response("Offline", { status: 503, statusText: "Offline (Lumina PWA)" });
  }
}

async function cacheFirst(req) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(req);
  if (cached) return cached;

  try {
    const res = await fetch(req);
    if (res && res.ok && res.type === "basic") await cache.put(req, res.clone());
    return res;
  } catch {
    return new Response("", { status: 504, statusText: "Offline asset" });
  }
}
