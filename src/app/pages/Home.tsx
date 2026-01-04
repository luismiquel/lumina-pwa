import type { View } from "@/app/nav";
import { CalendarDays, MapPin, ShoppingCart, FileText, Settings as SettingsIcon, Search } from "lucide-react";
import GlobalSearch from "@/app/components/GlobalSearch";

import { navTo } from "@/app/navBus";
export default function HomePage(props: { onGo: (v: View) => void; senior: boolean }) {
  const { onGo, senior } = props;

  
  const seenGuide = !!localStorage.getItem("lumina_seen_guide_v1");
  const showGuide = !!senior || !seenGuide;
// HOME ULTRA SIMPLE para Senior
  if (senior) {
    return (
      <div className="space-y-4">
      <button
        onClick={() => onGo("GUIDE")}
        className="w-full bg-white/10 hover:bg-white/15 border border-white/10 rounded-3xl p-4 text-left"
        aria-label="Ver qué incluye la app"
      >
        <div className="font-black">QUÉ TIENE LA APP</div>
        <div className="text-sm opacity-70 mt-1">
          Funciones, backups, export, PWA, mantenimiento y privacidad.
        </div>
      </button>
      {showGuide && (
        <button
          onClick={() => onGo("GUIDE")}
          className="w-full bg-white/10 hover:bg-white/15 border border-white/10 rounded-3xl p-4 text-left"
          aria-label="Abrir guía e instrucciones"
        >
          <div className="font-black">ABRIR GUÍA</div>
          <div className="text-sm opacity-70 mt-1">
            Instrucciones, copias de seguridad, instalación PWA y solución de problemas.
          </div>
        </button>
      )}
        <div className="glass rounded-3xl p-5 border border-white/10">
          <div className="font-black text-2xl tracking-tight">Inicio</div>
          <div className="opacity-70 mt-1">Botones grandes · Fácil · Offline</div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onGo("APPOINTMENTS")}
            className="glass border border-white/10 rounded-3xl p-5 min-h-[96px] flex flex-col items-start justify-center gap-2 hover:bg-white/10 transition"
          >
            <CalendarDays size={28} className="text-[#00f2ff]" />
            <div className="font-black text-xl">Citas</div>
            <div className="text-sm opacity-60">Ver y añadir</div>
          </button>

          <button
            onClick={() => onGo("SHOPPING")}
            className="glass border border-white/10 rounded-3xl p-5 min-h-[96px] flex flex-col items-start justify-center gap-2 hover:bg-white/10 transition"
          >
            <ShoppingCart size={28} className="text-[#00f2ff]" />
            <div className="font-black text-xl">Compras</div>
            <div className="text-sm opacity-60">Lista rápida</div>
          </button>

          <button
            onClick={() => onGo("FINDER")}
            className="glass border border-white/10 rounded-3xl p-5 min-h-[96px] flex flex-col items-start justify-center gap-2 hover:bg-white/10 transition"
          >
            <MapPin size={28} className="text-[#00f2ff]" />
            <div className="font-black text-xl">GPS SOS</div>
            <div className="text-sm opacity-60">Compartir ubicación</div>
          </button>

          <button
            onClick={() => navTo("NOTES")}
            className="glass border border-white/10 rounded-3xl p-5 min-h-[96px] flex flex-col items-start justify-center gap-2 hover:bg-white/10 transition"
          >
            <FileText size={28} className="text-[#00f2ff]" />
            <div className="font-black text-xl">Notas</div>
            <div className="text-sm opacity-60">Apuntar cosas</div>
          </button>
        </div>

        <button
          onClick={() => onGo("SETTINGS")}
          className="w-full bg-purple-500 text-black font-black rounded-3xl py-5 inline-flex items-center justify-center gap-3"
        >
          <SettingsIcon />
          Ajustes
        </button>

        <div className="glass rounded-3xl p-4 border border-white/10">
          <div className="flex items-center gap-2 opacity-80">
            <Search size={18} />
            <div className="font-black">Búsqueda</div>
          </div>
          <div className="mt-3">
            <GlobalSearch senior={true} onGo={onGo} />
          </div>
        </div>
      </div>
    );
  }

  // HOME normal (no senior): mantiene búsqueda global arriba
  return (
    <div className="space-y-4">
      <button
        onClick={() => onGo("GUIDE")}
        className="w-full bg-white/10 hover:bg-white/15 border border-white/10 rounded-3xl p-4 text-left"
        aria-label="Ver qué incluye la app"
      >
        <div className="font-black">QUÉ TIENE LA APP</div>
        <div className="text-sm opacity-70 mt-1">
          Funciones, backups, export, PWA, mantenimiento y privacidad.
        </div>
      </button>
      {showGuide && (
        <button
          onClick={() => onGo("GUIDE")}
          className="w-full bg-white/10 hover:bg-white/15 border border-white/10 rounded-3xl p-4 text-left"
          aria-label="Abrir guía e instrucciones"
        >
          <div className="font-black">ABRIR GUÍA</div>
          <div className="text-sm opacity-70 mt-1">
            Instrucciones, copias de seguridad, instalación PWA y solución de problemas.
          </div>
        </button>
      )}
      <GlobalSearch senior={false} onGo={onGo} />

      <div className="glass rounded-3xl p-6 border border-white/10">
        <div className="font-black text-xl">Accesos</div>
        <div className="opacity-70 mt-1">Rápido · Offline · Local</div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            onClick={() => onGo("APPOINTMENTS")}
            className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl py-4 font-black inline-flex items-center justify-center gap-2"
          >
            <CalendarDays size={18} /> Citas
          </button>
          <button
            onClick={() => onGo("SHOPPING")}
            className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl py-4 font-black inline-flex items-center justify-center gap-2"
          >
            <ShoppingCart size={18} /> Compras
          </button>
          <button
            onClick={() => onGo("FINDER")}
            className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl py-4 font-black inline-flex items-center justify-center gap-2"
          >
            <MapPin size={18} /> GPS
          </button>
          <button
            onClick={() => navTo("NOTES")}
            className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl py-4 font-black inline-flex items-center justify-center gap-2"
          >
            <FileText size={18} /> Notas
          </button>
        </div>
      </div>
    </div>
  );
}












