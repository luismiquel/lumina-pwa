import { shareText } from "@/app/utils/share";
import { useState } from "react";
import { Copy, MapPin, Send } from "lucide-react";

import { navTo } from "@/app/navBus";
export default function Finder(props: { senior: boolean; onHelp?: () => void }) {
  const { senior } = props;
  const [pos, setPos] = useState<{lat:number; lon:number} | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const locate = () => {
    setErr(null);
    if (!navigator.geolocation) { setErr("Geolocalización no disponible."); return; }
    navigator.geolocation.getCurrentPosition(
      p => setPos({ lat: p.coords.latitude, lon: p.coords.longitude }),
      e => setErr(e.message),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const link = pos ? `https://www.openstreetmap.org/?mlat=${pos.lat}&mlon=${pos.lon}#map=18/${pos.lat}/${pos.lon}` : "";

  const copyLink = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    alert("Enlace copiado.");
  };

    const share = async () => {
    if (!link) return;
    await shareText("Mi ubicación (Lumina)", "Mi ubicación: " + link);
  };

  const wa = () => {
    if (!link) return;
    window.open("https://wa.me/?text=" + encodeURIComponent("Mi ubicación: " + link), "_blank");
  };

  return (
    <div className="space-y-4">
      <div className="glass rounded-3xl p-6 border border-white/10">
        <h2 className={"font-black flex items-center gap-2 " + (senior ? "text-3xl" : "text-xl")}><MapPin/> GPS emergencia</h2>
        <p className="opacity-70 mt-2">Obtén un enlace de ubicación y compártelo.</p>

        <button onClick={locate} aria-label="Localizar ahora" className="mt-4 bg-[#00f2ff] text-black font-black rounded-2xl py-4 w-full">
          Localizar ahora
        </button>

        {err && <p className="mt-3 text-red-300">{err}</p>}

        {pos && (
          <div className="mt-4 space-y-2">
            <div className="glass rounded-2xl p-4 border border-white/10 break-all text-sm opacity-80">
              {link}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={copyLink} className="bg-white/10 border border-white/10 font-black rounded-2xl py-3 inline-flex items-center justify-center gap-2">
                <Copy/> Copiar
              </button>
              <button onClick={wa} className="bg-green-500 text-black font-black rounded-2xl py-3 inline-flex items-center justify-center gap-2">
                <Send/> WhatsApp
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}





