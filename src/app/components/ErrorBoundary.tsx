import React from "react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; message?: string };

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(err: unknown): State {
    const msg =
      err instanceof Error ? err.message :
      typeof err === "string" ? err :
      "Error inesperado";
    return { hasError: true, message: msg };
  }

  componentDidCatch() {}

  private async repair() {
    try {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
      }
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
    } catch {}
    location.reload();
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-[#020408] text-white flex items-center justify-center p-6">
        <div className="w-full max-w-[560px] glass rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="font-black text-2xl">Lumina se ha recuperado</div>
          <div className="opacity-70 text-sm">
            Ha ocurrido un error. Si usas extensiones, prueba en incógnito o desactívalas.
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-xs break-words opacity-80">
            {this.state.message}
          </div>
          <button
            onClick={() => this.repair()}
            className="w-full bg-[#00f2ff] text-black font-black rounded-2xl py-4"
          >
            Reparar app (SW + cachés) y recargar
          </button>
        </div>
      </div>
    );
  }
}
