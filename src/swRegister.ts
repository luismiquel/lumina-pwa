export function registerSW() {
  if (!import.meta.env.PROD) return; // solo producción
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
