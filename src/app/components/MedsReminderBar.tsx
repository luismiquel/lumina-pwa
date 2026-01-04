import { useEffect, useMemo, useState } from "react";
import { BellRing, Pill } from "lucide-react";
import { loadMeds, normalizeForToday, type Med } from "@/infra/meds/medsStore";
import { navTo } from "@/app/navBus";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function minsUntil(timeHHMM: string): number | null {
  const m = /^(\d{2}):(\d{2})$/.exec(timeHHMM);
  if (!m) return null;
  const now = new Date();
  const target = new Date(now);
  target.setHours(Number(m[1]), Number(m[2]), 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 60000);
}

export default function MedsReminderBar(props: { senior: boolean }) {
  const { senior } = props;

  // "tick" para recalcular cada 30s sin permisos ni notificaciones
  const [now, setNow] = useState<number>(() => Date.now());
  const [meds, setMeds] = useState<Med[]>(() => normalizeForToday(loadMeds()));

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    // refresca meds desde localStorage a cada tick
    setMeds(normalizeForToday(loadMeds()));
  }, [now]);

  const info = useMemo(() => {
    const t = todayISO();
    const active = meds.filter((m) => m.active);

    // pendientes = activos no tomados hoy
    const pending = active.filter((m) => m.takenOn !== t);

    // próxima toma (minutos hasta) entre todos los pendientes
    let nextMin: number | null = null;
    let nextMed: Med | null = null;
    let nextTime: string | null = null;

    for (const m of pending) {
      for (const hhmm of m.times || []) {
        const mins = minsUntil(hhmm);
        if (mins === null) continue;
        if (mins < -60) continue; // ya muy pasado
        if (nextMin === null || mins < nextMin) {
          nextMin = mins;
          nextMed = m;
          nextTime = hhmm;
        }
      }
    }

    return { activeCount: active.length, pendingCount: pending.length, nextMin, nextMed, nextTime };
  }, [meds]);

  if (info.activeCount === 0) return null;

  const urgent =
    info.pendingCount > 0 &&
    info.nextMin !== null &&
    info.nextMin <= 15 &&
    info.nextMin >= -10; // ventana de recordatorio

  const bg = urgent ? "bg-red-500/15 border-red-400/30 text-red-200" : "bg-white/10 border-white/10";

  const line =
    info.pendingCount === 0
      ? "Medicaciones al día ✅"
      : info.nextMin === null
        ? `Tienes ${info.pendingCount} pendiente(s) hoy`
        : info.nextMin <= 0
          ? `Toma ahora: ${info.nextMed?.name ?? "Medicación"} (${info.nextTime})`
          : `Próxima: ${info.nextMed?.name ?? "Medicación"} en ${info.nextMin} min (${info.nextTime})`;

  return (
    <button
      onClick={() => navTo("NOTES", "medicacion")}
      className={
        "w-full rounded-2xl border px-4 py-3 flex items-center justify-between gap-3 " +
        bg
      }
      aria-label="Recordatorio de medicación"
      title="Abrir Medicación"
    >
      <div className="flex items-center gap-3">
        {urgent ? <BellRing /> : <Pill />}
        <div className={senior ? "text-base font-black" : "text-sm font-black"}>{line}</div>
      </div>
      <div className="text-xs opacity-70">Abrir</div>
    </button>
  );
}
