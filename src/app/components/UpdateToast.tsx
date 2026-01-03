import { useEffect, useState } from "react";
import { onSWUpdateReady, applySWUpdate } from "@/swRegister";

export default function UpdateToast() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const off = onSWUpdateReady(() => setShow(true));
    return off;
  }, []);

  if (!show) return null;

  return (
    <div className="fixed left-0 right-0 bottom-24 z-50 flex justify-center px-4">
      <div className="max-w-[560px] w-full glass border border-white/10 rounded-3xl p-4 flex items-center justify-between gap-3">
        <div className="text-sm">
          <div className="font-black">Nueva versión disponible</div>
          <div className="opacity-70">Actualiza para aplicar mejoras.</div>
        </div>

        <div className="flex gap-2">
          <button
            className="bg-white/10 border border-white/10 rounded-2xl px-4 py-2 font-black opacity-80 hover:opacity-100"
            onClick={() => setShow(false)}
          >
            Luego
          </button>

          <button
            className="bg-[#00f2ff] text-black rounded-2xl px-4 py-2 font-black"
            onClick={() => applySWUpdate()}
          >
            Actualizar
          </button>
        </div>
      </div>
    </div>
  );
}
