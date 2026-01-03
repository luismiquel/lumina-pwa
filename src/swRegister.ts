type UpdateHandler = () => void;

let updateHandlers: UpdateHandler[] = [];
let waitingSW: ServiceWorker | null = null;

export function onSWUpdateReady(fn: UpdateHandler) {
  updateHandlers.push(fn);
}

export function applySWUpdate() {
  try {
    waitingSW?.postMessage({ type: "SKIP_WAITING" });
  } catch {}
}

// Registro SW solo en producción y fuera de localhost (evita 503/white screen en preview)
export function registerSW() {
  if (!import.meta.env.PROD) return;
  if (!("serviceWorker" in navigator)) return;

  const host = location.hostname;
  if (host === "localhost" || host === "127.0.0.1") return;

  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");

      // Si ya hay uno esperando (por ejemplo tras refresh), dispara aviso
      if (reg.waiting) {
        waitingSW = reg.waiting;
        updateHandlers.forEach((h) => h());
      }

      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          // Nuevo SW instalado y hay controlador previo => update listo
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            waitingSW = newWorker;
            updateHandlers.forEach((h) => h());
          }
        });
      });

      // Cuando el SW tome control, recargamos para coger assets nuevos
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (refreshing) return;
        refreshing = true;
        location.reload();
      });
    } catch {
      // silencio
    }
  });
}

// Utilidad opcional: reset manual (si algo se rompe en producción)
export async function resetSWAndCaches() {
  try {
    if (!("serviceWorker" in navigator)) return;

    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.unregister()));

    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } catch {}
}
