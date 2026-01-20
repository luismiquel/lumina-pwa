import AppShell from "@/app/AppShell";
import ErrorBoundary from "@/app/components/ErrorBoundary";

import { useSWUpdate } from "./shared/useSWUpdate";
import { useOnline } from "./shared/useOnline";

export default function App() {
  const { ready: updateReady, applyUpdate } = useSWUpdate();
  const online = useOnline();

  return (
    <ErrorBoundary>
      {/* Banner OFFLINE */}
      {!online && (
        <div
          style={{
            background: "#facc15",
            color: "#000",
            textAlign: "center",
            padding: "6px",
            fontSize: "14px",
          }}
        >
          Estás sin conexión · Modo offline
        </div>
      )}

      {/* Banner UPDATE PWA */}
      {updateReady && (
        <div
          style={{
            position: "fixed",
            bottom: 16,
            left: 16,
            right: 16,
            background: "#111",
            color: "#fff",
            padding: "12px",
            borderRadius: "8px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <span>Nueva versión disponible</span>
          <button
            onClick={applyUpdate}
            style={{
              background: "#fff",
              color: "#000",
              border: "none",
              padding: "6px 10px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Actualizar
          </button>
        </div>
      )}

      {/* TU APP REAL */}
      <AppShell />
    </ErrorBoundary>
  );
}
