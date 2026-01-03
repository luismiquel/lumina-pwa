export type HealthReport = {
  ts: number;
  online: boolean;
  ua: string;
  sw: { supported: boolean; controlled: boolean; registrations?: number };
  caches: { supported: boolean; keys?: string[] };
  storage: { supported: boolean; persisted?: boolean; estimate?: { quota: number; usage: number } };
  idb: { ok: boolean; error?: string };
  permissions: { geolocation?: string; notifications?: string };
};

async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
  try { return await fn(); } catch { return null; }
}

export async function getHealthReport(): Promise<HealthReport> {
  const online = navigator.onLine;
  const ua = navigator.userAgent;

  const swSupported = "serviceWorker" in navigator;
  const controlled = swSupported ? !!navigator.serviceWorker.controller : false;
  const regs = swSupported ? await safe(() => navigator.serviceWorker.getRegistrations()) : null;

  const cachesSupported = "caches" in window;
  const cacheKeys = cachesSupported ? await safe(() => caches.keys()) : null;

  const storageSupported = !!navigator.storage;
  const persisted = storageSupported ? await safe(() => navigator.storage.persisted()) : null;
  const estimate = storageSupported ? await safe(() => navigator.storage.estimate()) : null;

  // IndexedDB check (abre y cierra una DB temporal)
  let idbOk = true;
  let idbErr: string | undefined;
  await new Promise<void>((resolve) => {
    try {
      const req = indexedDB.open("lumina_healthcheck_tmp", 1);
      req.onupgradeneeded = () => { /* noop */ };
      req.onsuccess = () => {
        try { req.result.close(); } catch {}
        try { indexedDB.deleteDatabase("lumina_healthcheck_tmp"); } catch {}
        resolve();
      };
      req.onerror = () => {
        idbOk = false;
        idbErr = "indexedDB open error";
        resolve();
      };
      req.onblocked = () => {
        idbOk = false;
        idbErr = "indexedDB blocked";
        resolve();
      };
    } catch (e: any) {
      idbOk = false;
      idbErr = e?.message ?? "indexedDB exception";
      resolve();
    }
  });

  // Permissions (no pide permiso, solo lee si el navegador lo permite)
  let geo: string | undefined;
  let noti: string | undefined;
  const permAny: any = (navigator as any).permissions;
  if (permAny?.query) {
    const g = await safe(() => permAny.query({ name: "geolocation" as any }));
    const n = await safe(() => permAny.query({ name: "notifications" as any }));
    geo = (g as any)?.state;
    noti = (n as any)?.state;
  }

  return {
    ts: Date.now(),
    online,
    ua,
    sw: { supported: swSupported, controlled, registrations: regs?.length },
    caches: { supported: cachesSupported, keys: cacheKeys ?? undefined },
    storage: {
      supported: storageSupported,
      persisted: persisted ?? undefined,
      estimate: estimate ? { quota: estimate.quota ?? 0, usage: estimate.usage ?? 0 } : undefined,
    },
    idb: { ok: idbOk, error: idbErr },
    permissions: { geolocation: geo, notifications: noti },
  };
}

export async function requestPersistentStorage(): Promise<boolean> {
  if (!navigator.storage?.persist) return false;
  try { return await navigator.storage.persist(); } catch { return false; }
}

export async function copyJson(data: unknown) {
  const txt = JSON.stringify(data, null, 2);
  await navigator.clipboard.writeText(txt);
}
