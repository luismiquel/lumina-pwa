type UpdateHandler = () => void;

function dispatchUpdateReady() {
  window.dispatchEvent(new Event("lumina:sw:update-ready"));
}

export function onSWUpdateReady(handler: UpdateHandler) {
  const fn = () => handler();
  window.addEventListener("lumina:sw:update-ready", fn);
  return () => window.removeEventListener("lumina:sw:update-ready", fn);
}

export function applySWUpdate() {
  navigator.serviceWorker.getRegistration().then((reg) => {
    reg?.waiting?.postMessage({ type: "SKIP_WAITING" });
  });
}

export function registerSW() {
  if (!import.meta.env.PROD) return;
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");

      if (reg.waiting) dispatchUpdateReady();

      reg.addEventListener("updatefound", () => {
        const sw = reg.installing;
        if (!sw) return;

        sw.addEventListener("statechange", () => {
          if (sw.state === "installed" && navigator.serviceWorker.controller) {
            dispatchUpdateReady();
          }
        });
      });

      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
    } catch {
      // silencio
    }
  });
}
