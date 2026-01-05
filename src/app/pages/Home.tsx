import type { View } from "@/app/nav";
import { useEffect, useState } from "react";
import { Home as HomeIcon, CalendarDays, ShoppingCart, Mic, MapPin, BookOpen } from "lucide-react";

export default function HomePage(props: { onGo: (v: View) => void; senior: boolean }) {
  const { onGo, senior } = props;

  const [showGuide, setShowGuide] = useState(() => localStorage.getItem("lumina_seen_guide_v1") !== "1");

  useEffect(() => {
    setShowGuide(localStorage.getItem("lumina_seen_guide_v1") !== "1");
  }, []);

  return (
    <div className="space-y-4">
      <button
        onClick={() => onGo("GUIDE")}
        className="w-full bg-white/10 hover:bg-white/15 border border-white/10 rounded-3xl p-4 text-left"
        aria-label="Abrir guía e instrucciones"
      >
        <div className="flex items-center gap-2 font-black">
          <BookOpen size={18} />
          Guía / Instrucciones
        </div>
        <div className="text-sm opacity-70 mt-1">
          Qué incluye la app · Instalación PWA · Backup · Reparación
        </div>
      </button>

      <div className={"glass rounded-3xl p-6 border border-white/10 " + (senior ? "space-y-4" : "space-y-3")}>
        <div className={"font-black " + (senior ? "text-2xl" : "text-lg")}>Atajos</div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onGo("APPOINTMENTS")}
            className="glass border border-white/10 rounded-3xl p-5 min-h-[96px] flex flex-col items-start justify-center gap-2 hover:bg-white/10 transition"
          >
            <CalendarDays />
            <div className="font-black">Citas</div>
          </button>

          <button
            onClick={() => onGo("SHOPPING")}
            className="glass border border-white/10 rounded-3xl p-5 min-h-[96px] flex flex-col items-start justify-center gap-2 hover:bg-white/10 transition"
          >
            <ShoppingCart />
            <div className="font-black">Compras</div>
          </button>

          <button
            onClick={() => onGo("DICTATION")}
            className="glass border border-white/10 rounded-3xl p-5 min-h-[96px] flex flex-col items-start justify-center gap-2 hover:bg-white/10 transition"
          >
            <Mic />
            <div className="font-black">Dictado</div>
          </button>

          <button
            onClick={() => onGo("FINDER")}
            className="glass border border-white/10 rounded-3xl p-5 min-h-[96px] flex flex-col items-start justify-center gap-2 hover:bg-white/10 transition"
          >
            <MapPin />
            <div className="font-black">GPS</div>
          </button>
        </div>

        <button
          onClick={() => onGo("SETTINGS")}
          className="w-full bg-[#00f2ff] text-black font-black rounded-3xl py-5 inline-flex items-center justify-center gap-3"
        >
          <HomeIcon size={22} /> Ajustes
        </button>

        {showGuide && (
          <div className="text-xs opacity-60">
            Consejo: abre la guía la primera vez y pulsa “No mostrar al inicio”.
          </div>
        )}
      </div>
    </div>
  );
}