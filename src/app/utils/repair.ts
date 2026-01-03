export async function getSwStatus() {
  const hasSw = "serviceWorker" in navigator;
  if (!hasSw) return { supported: false, controlled: false, registration: false };

  const controlled = !!navigator.serviceWorker.controller;
  const regs = await navigator.serviceWorker.getRegistrations().catch(() => []);
  const registration = regs.length > 0;

  return { supported: true, controlled, registration, registrations: regs.length };
}

export async function unregisterAllServiceWorkers() {
  if (!("serviceWorker" in navigator)) return 0;
  const regs = await navigator.serviceWorker.getRegistrations();
  let n = 0;
  for (const r of regs) {
    const ok = await r.unregister();
    if (ok) n++;
  }
  return n;
}

export async function clearAllCaches() {
  if (!("caches" in window)) return 0;
  const keys = await caches.keys();
  let n = 0;
  for (const k of keys) {
    const ok = await caches.delete(k);
    if (ok) n++;
  }
  return n;
}

export async function deleteAllIndexedDb() {
  // Peligroso: borra TODAS las BDs del origen
  const anyWin: any = window as any;
  if (!anyWin.indexedDB?.databases) return { supported: false, deleted: 0 };

  const dbs: Array<{ name?: string }> = await anyWin.indexedDB.databases();
  let deleted = 0;

  await Promise.all(
    dbs.map(
      (d) =>
        new Promise<void>((resolve) => {
          if (!d.name) return resolve();
          const req = indexedDB.deleteDatabase(d.name);
          req.onsuccess = () => { deleted++; resolve(); };
          req.onerror = () => resolve();
          req.onblocked = () => resolve();
        })
    )
  );

  return { supported: true, deleted };
}

export function hardReload() {
  try {
    // @ts-ignore
    location.reload(true);
  } catch {
    location.reload();
  }
}
