import { useState } from "react";

export default function Location({ senior }: { senior: boolean }) {
  const [pos, setPos] = useState<{ lat: number; lon: number; acc: number } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const get = () => {
    setErr(null);
    if (!navigator.geolocation) {
      setErr("Este navegador no soporta GPS.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos({ lat: p.coords.latitude, lon: p.coords.longitude, acc: p.coords.accuracy });
      },
      (e) => setErr(e.message),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );
  };

  const link = pos ? `https://maps.google.com/?q=${pos.lat},${pos.lon}` : "";
  const copy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    alert("Enlace copiado.");
  };

  const wa = () => {
    if (!link) return;
    window.open(`https://wa.me/?text=${encodeURIComponent("Mi ubicación: " + link)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="glass rounded-3xl p-6 border border-white/10">
      <h2 className={`font-black ${senior ? "text-3xl" : "text-xl"}`}>GPS / Ubicación</h2>

      <button onClick={get} className="mt-4 w-full bg-cyan-400 text-black font-black py-3 rounded-2xl">
        Obtener ubicación
      </button>

      {err && <p className="mt-3 text-sm text-red-300">{err}</p>}

      {pos && (
        <div className="mt-4 p-4 rounded-2xl border border-white/10 bg-white/5">
          <div className="font-bold">Lat: {pos.lat.toFixed(6)} · Lon: {pos.lon.toFixed(6)}</div>
          <div className="text-sm opacity-70">Precisión: ±{Math.round(pos.acc)}m</div>
          <div className="mt-3 flex gap-2">
            <a href={link} target="_blank" rel="noreferrer" className="bg-white/10 px-3 py-2 rounded-xl font-bold">
              Abrir mapa
            </a>
            <button onClick={copy} className="bg-white/10 px-3 py-2 rounded-xl font-bold">Copiar</button>
            <button onClick={wa} className="bg-white/10 px-3 py-2 rounded-xl font-bold">WhatsApp</button>
          </div>
        </div>
      )}
    </div>
  );
}
