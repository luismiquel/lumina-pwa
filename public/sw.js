const CACHE = "lumina-pwa-v1";
const CORE = ["/", "/index.html", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => (k === CACHE ? null : caches.delete(k))));
    await self.clients.claim();
  })());
});

function allowed(req) {
  if (req.method !== "GET") return false;
  let url;
  try { url = new URL(req.url); } catch { return false; }
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  if (url.origin !== self.location.origin) return false;
  return true;
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (!allowed(req)) return;

  const accept = req.headers.get("accept") || "";
  const isHTML = req.mode === "navigate" || accept.includes("text/html");

  if (isHTML) {
    event.respondWith(networkFirstHTML(req));
    return;
  }

  event.respondWith(cacheFirstAsset(req));
});

async function networkFirstHTML(request) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(request);
    if (res && res.ok && res.type === "basic") {
      await cache.put("/index.html", res.clone());
    }
    return res;
  } catch {
    const fallback = await cache.match("/index.html");
    if (fallback) return fallback;
    return new Response("Offline", { status: 503, statusText: "Offline (Lumina PWA)" });
  }
}

async function cacheFirstAsset(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const res = await fetch(request);
    if (res && res.ok && res.type === "basic") {
      await cache.put(request, res.clone());
    }
    return res;
  } catch {
    return new Response("", { status: 504, statusText: "Offline asset" });
  }
}
