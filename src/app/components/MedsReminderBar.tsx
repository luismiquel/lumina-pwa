import { useEffect, useMemo, useState } from "react";
import { AlarmClock, CheckCircle2, Pill } from "lucide-react";
import { loadMeds, normalizeForToday, setTakenToday, type Med } from "@/infra/meds/medsStore";

function toMinutes(hhmm: string): number | null {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm);
  if (!m) return null;
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
  return hh * 60 + mm;
}

function nowMinutes(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// Ventana de “toca ahora”
const WINDOW_MIN = 30;

type NextDose = {
  med: Med;
  time: string;   // "HH:MM"
  inMin: number;  // puede ser negativo si se pasó hace poco
};

export default function MedsReminderBar(props: { senior: boolean }) {
  const { senior } = props;
  const [meds, setMeds] = useState<Med[]>(() => normalizeForToday(loadMeds()));
  const [tick, setTick] = useState(0);

  // refresca cada 30s para que el aviso se actualice
  useEffect(() => {
    const id = window.setInterval(() => setTick((x) => x + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  // si cambia storage en otra pestaña
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key.includes("lumina_meds_v1")) setMeds(normalizeForToday(loadMeds()));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const nextDose = useMemo<NextDose | null>(() => {
    void tick;

    const tmin = nowMinutes();
    const active = normalizeForToday(meds).filter((m) => m.active && m.times?.length);

    let best: NextDose | null = null;

    for (const m of active) {
      // si ya está marcado como tomado hoy, no molestamos (simple)
      if (m.takenOn === todayISO()) continue;

      for (const hhmm of m.times) {
        const mm = toMinutes(hhmm);
        if (mm === null) continue;

        // diferencia en minutos (hoy)
        let diff = mm - tmin;

        // si ya pasó, puede que siga “en ventana” (ej: hace 10 min)
        // o si pasó hace mucho, lo ignoramos (no queremos avisos de ayer)
        if (diff < -WINDOW_MIN) continue;

        // queremos el más cercano (puede ser negativo pequeño o el próximo)
        if (!best || diff < best.inMin) {
          best = { med: m, time: hhmm, inMin: diff };
        }
      }
    }
    return best;
  }, [meds, tick]);

  const show = !!nextDose && nextDose.inMin <= WINDOW_MIN;

  if (!show || !nextDose) return null;

  const label =
    nextDose.inMin < 0
      ? `Hace ${Math.abs(nextDose.inMin)} min`
      : nextDose.inMin === 0
      ? "Ahora"
      : `En ${nextDose.inMin} min`;

  const markTaken = () => {
    setMeds(setTakenToday(nextDose.med.id, true));
  };

  return (
    <div
      className="fixed top-3 left-0 right-0 z-50 flex justify-center px-4"
      role="status"
      aria-live="polite"
    >
      <div className="max-w-[820px] w-full glass border border-white/15 rounded-3xl px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-[#00f2ff] text-black rounded-2xl px-3 py-2 font-black flex items-center gap-2">
            <AlarmClock size={18} /> {label}
          </div>
          <div>
            <div className={"font-black flex items-center gap-2 " + (senior ? "text-lg" : "text-base")}>
              <Pill size={18} /> {nextDose.med.name} <span className="opacity-70">({nextDose.time})</span>
            </div>
            <div className="text-xs opacity-70">
              {nextDose.med.dose ? nextDose.med.dose : "Dosis no indicada"}
            </div>
          </div>
        </div>

        <button
          onClick={markTaken}
          className="bg-green-500 text-black font-black rounded-2xl px-4 py-3 inline-flex items-center gap-2"
          aria-label="Marcar tomado"
        >
          <CheckCircle2 size={18} /> Tomado
        </button>
      </div>
    </div>
  );
}
