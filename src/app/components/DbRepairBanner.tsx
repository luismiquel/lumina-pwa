import { useEffect, useState } from "react";
import { openDbSafe } from "@/infra/db/db";

export default function DbRepairBanner() {
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    // Si la DB no puede abrirse, mostramos banner
    openDbSafe({ autoRepair: false }).then((r: any) => {
      setBroken(!r.ok);
    }).catch(() => setBroken(true));
  }, []);

  const repair = async () => {
    const r = await openDbSafe({ autoRepair: true });
    if (r.ok) {
      try { location.reload(); } catch {}
      return;
    }
    alert("No se pudo reparar la base de datos local.");
  };

  if (!broken) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 px-4 flex justify-center">
      <div className="max-w-[640px] w-full bg-red-500/15 border border-red-400/30 text-red-100 rounded-2xl p-4 shadow-lg">
        <div className="font-black text-base">Base de datos local dañada</div>
        <div className="text-sm opacity-80 mt-1">
          Algunas pantallas pueden fallar. Puedes reparar borrando SOLO los datos locales de esta app.
        </div>
        <button
          onClick={repair}
          className="mt-3 w-full bg-[#00f2ff] text-black font-black rounded-2xl py-3"
        >
          Reparar ahora (borrar datos locales)
        </button>
      </div>
    </div>
  );
}

