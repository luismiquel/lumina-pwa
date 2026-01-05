import { useEffect, useMemo, useState } from "react";
import { Pill, CheckCircle2, ExternalLink } from "lucide-react";
import { loadMeds, normalizeForToday, setTakenToday, type Med } from "@/infra/meds/medsStore";
import { navTo } from "@/app/navBus";

function pad2(n: number) { return n < 10 ? "0" + n : "" + n; }

function msToHHMM(ms: number): string {
  const d = new Date(ms);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function parseHHMM(t: string): { h: number; m: number } | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const mm = Number(m[2]);
  if (h < 0 || h > 23 || mm < 0 || mm > 59) return null;
  return { h, m: mm };
}

function dayStart(ms: number): number {
  const d = new Date(ms);
  d.setHours(0,0,0,0);
  return d.getTime();
}

function timeTodayMs(now: number, hhmm: string): number | null {
  const p = parseHHMM(hhmm);
  if (!p) return null;
  return dayStart(now) + p.h * 3600000 + p.m * 60000;
}

type DueItem = {
  med: Med;
  dueAt: number;          // timestamp
  dueLabel: string;       // "08:00"
  deltaMin: number;       // negativo si ya pasó
};

function computeDue(meds: Med[], now: number): { dueNow: DueItem[]; nextUp: DueItem[] } {
  // Ventanas:
  // - "Toca ahora": dentro de ±30 minutos
  // - "Próximo": dentro de las próximas 4 horas
  const NOW_WINDOW_MIN = 30;
  const UPCOMING_HOURS = 4;

  const dueNow: DueItem[] = [];
  const nextUp: DueItem[] = [];

  for (const med of meds) {
    if (!med.active) continue;
    if (med.takenOn) continue; // este modelo marca el medicamento "tomado hoy" (simple y robusto)

    const times = Array.isArray(med.times) ? med.times : [];
    for (const t of times) {
      const dueAt = timeTodayMs(now, t);
      if (dueAt == null) continue;

      const deltaMin = Math.round((dueAt - now) / 60000);
      const item: DueItem = { med, dueAt, dueLabel: t, deltaMin };

      // Toca ahora (±30m)
      if (Math.abs(deltaMin) <= NOW_WINDOW_MIN) {
        dueNow.push(item);
        continue;
      }

      // Próximo (0..4h)
      if (deltaMin > 0 && deltaMin <= UPCOMING_HOURS * 60) {
        nextUp.push(item);
      }
    }
  }

  // Orden: los más urgentes primero
  dueNow.sort((a, b) => a.dueAt - b.dueAt);
  nextUp.sort((a, b) => a.dueAt - b.dueAt);

  // Quita duplicados por med.id (si el med tiene varias horas, nos quedamos con la más cercana)
  const uniqByMed = (arr: DueItem[]) => {
    const seen = new Set<string>();
    const out: DueItem[] = [];
    for (const it of arr) {
      if (seen.has(it.med.id)) continue;
      seen.add(it.med.id);
      out.push(it);
    }
    return out;
  };

  return { dueNow: uniqByMed(dueNow), nextUp: uniqByMed(nextUp).slice(0, 3) };
}

export default function MedsReminderBar(props: { senior: boolean }) {
  const { senior } = props;
  const [now, setNow] = useState<number>(() => Date.now());
  const [meds, setMeds] = useState<Med[]>(() => normalizeForToday(loadMeds()));

  // refresca "now" cada 30s (sin permisos / sin background)
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(id);
  }, []);

  // recarga meds cuando vuelve el foco (por si se editó en otra pantalla)
  useEffect(() => {
    const onFocus = () => setMeds(normalizeForToday(loadMeds()));
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const { dueNow, nextUp } = useMemo(() => computeDue(meds, now), [meds, now]);

  
  const firstNext = nextUp[0];
const markTaken = (id: string) => {
    setMeds(setTakenToday(id, true));
  };

  const openMeds = () => {
    // Abrimos Notes filtrado a medicación
    try { navTo("NOTES", "medicacion"); } catch {}
  };

  if (dueNow.length === 0 && nextUp.length === 0) return null;

  return (
    <div className="fixed bottom-3 left-0 right-0 z-50 flex justify-center px-3">
      <div className={"max-w-[720px] w-full border border-white/10 rounded-3xl px-4 py-3 shadow-xl " +
        (dueNow.length ? "bg-yellow-400/15" : "bg-white/10")
      }>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Pill />
            <div className={senior ? "text-lg font-black" : "text-base font-black"}>
              {dueNow.length ? "Toca medicación ahora" : "Próxima medicación"}
            </div>
          </div>

          <button
            onClick={openMeds}
            className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl px-3 py-2 font-black inline-flex items-center gap-2"
            aria-label="Abrir medicación"
            title="Abrir medicación"
          >
            <ExternalLink size={18} />
            Abrir
          </button>
        </div>

        {dueNow.length > 0 && (
          <div className="mt-3 space-y-2">
            {dueNow.map((it) => (
              <div key={it.med.id} className="flex items-center justify-between gap-2 bg-black/20 rounded-2xl px-3 py-2 border border-white/10">
                <div>
                  <div className="font-black">
                    {it.med.name}{" "}
                    <span className="opacity-70 font-normal">
                      {it.med.dose ? `· ${it.med.dose}` : ""}
                    </span>
                  </div>
                  <div className="text-sm opacity-70">
                    Hora: {it.dueLabel}{" "}
                    {it.deltaMin < 0 ? `· hace ${Math.abs(it.deltaMin)} min` : it.deltaMin > 0 ? `· en ${it.deltaMin} min` : "· ahora"}
                  </div>
                </div>

                <button
                  onClick={() => markTaken(it.med.id)}
                  className="bg-green-500 text-black font-black rounded-2xl px-3 py-2 inline-flex items-center gap-2"
                  aria-label="Marcar tomado hoy"
                >
                  <CheckCircle2 size={18} />
                  Tomado
                </button>
              </div>
            ))}
          </div>
        )}

        {dueNow.length === 0 && nextUp.length > 0 && (
          <div className="mt-3 text-sm opacity-80">
            Próximo:{" "}
            <span className="font-black">
              {firstNext!.med.name}
            </span>{" "}
            <span className="opacity-80">
              ({firstNext!.dueLabel})
            </span>
            {nextUp.length > 1 && (
              <span className="opacity-70">
                {" · "}Después: {nextUp.slice(1).map(x => `${x.med.name} (${x.dueLabel})`).join(" · ")}
              </span>
            )}
          </div>
        )}

        <div className="mt-2 text-xs opacity-60">
          Actualiza cada 30s · Sin permisos · Todo local
        </div>
      </div>
    </div>
  );
}


