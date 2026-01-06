import { useEffect, useState } from "react";

export default function OfflineBadge() {
  const [online, setOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const onUp = () => setOnline(true);
    const onDown = () => setOnline(false);
    window.addEventListener("online", onUp);
    window.addEventListener("offline", onDown);
    return () => {
      window.removeEventListener("online", onUp);
      window.removeEventListener("offline", onDown);
    };
  }, []);

  if (online) return null;

  return (
    <div
      className="fixed top-3 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
      role="status"
      aria-live="polite"
    >
      <div className="max-w-[560px] w-full bg-red-500/15 border border-red-400/30 text-red-200 rounded-2xl px-4 py-2 text-sm font-black">
        Sin conexión · Modo offline activo
      </div>
    </div>
  );
}

