type UpdateListener = () => void;

let updateReadyListeners: UpdateListener[] = [];
let waitingWorker: ServiceWorker | null = null;
let updateFlag = false;

export function onSWUpdateReady(fn: UpdateListener) {
  updateReadyListeners.push(fn);
  return () => { updateReadyListeners = updateReadyListeners.filter(x => x !== fn); };
}

function emitUpdateReady() {
  updateFlag = true;
  for (const fn of updateReadyListeners) {
    try { fn(); } catch {}
  }
}

export function hasSWUpdateReady() {
  return updateFlag;
}

export async function applySWUpdate() {
  if (!waitingWorker) return;
  try {
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
  } catch {}
}

export function registerSW() {
  // Solo producción
  if (!import.meta.env.PROD) return;
  if (!("serviceWorker" in navigator)) return;

  // Evita dolores de cabeza en localhost / vite preview
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") return;

  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");

      // Si ya hay uno esperando al cargar, avisa
      if (reg.waiting) {
        waitingWorker = reg.waiting;
        emitUpdateReady();
      }

      // Detecta cuando llega una actualización
      reg.addEventListener("updatefound", () => {
        const sw = reg.installing;
        if (!sw) return;

        sw.addEventListener("statechange", () => {
          // "installed" con controller => update lista
          if (sw.state === "installed" && navigator.serviceWorker.controller) {
            waitingWorker = sw;
            emitUpdateReady();
          }
        });
      });

      // Cuando el SW toma control, recarga para usar el nuevo bundle
      let reloaded = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (reloaded) return;
        reloaded = true;
        window.location.reload();
      });
    } catch {
      // silencioso
    }
  });
}

// Botón “Repair App”: desregistra SW + borra caches + recarga
export async function repairApp() {
  try {
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
    }
  } catch {}

  try {
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }
  } catch {}

  try {
    // limpia flags locales de guía si quieres (opcional)
    // localStorage.removeItem("lumina_seen_guide_v1");
  } catch {}

  window.location.reload();
}
