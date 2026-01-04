import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Pill, Plus, Trash2 } from "lucide-react";
import {
  addMed,
  loadMeds,
  normalizeForToday,
  removeMed,
  setTakenToday,
  toggleActive,
  type Med,
} from "@/infra/meds/medsStore";

function parseTimes(input: string): string[] {
  // acepta: "08:00, 14:00, 22:00"
  return input
    .split(/[,\s]+/g)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => (t.length === 4 && t.includes(":") ? "0" + t : t)) // "8:00" -> "08:00" si te lo meten raro
    .filter((t) => /^\d{2}:\d{2}$/.test(t))
    .slice(0, 8);
}

export default function MedsPanel(props: { senior: boolean }) {
  const { senior } = props;
  const [meds, setMeds] = useState<Med[]>(() => normalizeForToday(loadMeds()));
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [times, setTimes] = useState("08:00 14:00 22:00");

  useEffect(() => {
    setMeds((m) => normalizeForToday(m));
  }, []);

  const active = useMemo(() => meds.filter((m) => m.active), [meds]);

  const add = () => {
    const n = name.trim();
    if (!n) return alert("Pon el nombre del medicamento.");
    const t = parseTimes(times);
    const next = addMed({ name: n, dose, times: t });
    setMeds(next);
    setName("");
    setDose("");
  };

  const del = (id: string) => {
    if (!confirm("¿Borrar este medicamento?")) return;
    setMeds(removeMed(id));
  };

  const toggle = (id: string) => setMeds(toggleActive(id));

  const toggleTaken = (id: string, current: boolean) => {
    setMeds(setTakenToday(id, !current));
  };

  return (
    <div className="glass rounded-3xl p-6 border border-white/10 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className={"font-black flex items-center gap-2 " + (senior ? "text-2xl" : "text-xl")}>
          <Pill /> Medicación
        </h3>
        <div className="text-xs opacity-60">{active.length} activos</div>
      </div>

      <div className="grid gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-2xl p-4 outline-none"
          placeholder="Nombre (Ej: Enalapril)"
          aria-label="Nombre del medicamento"
        />
        <input
          value={dose}
          onChange={(e) => setDose(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-2xl p-4 outline-none"
          placeholder="Dosis (Ej: 10mg, 1 pastilla)"
          aria-label="Dosis"
        />
        <input
          value={times}
          onChange={(e) => setTimes(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-2xl p-4 outline-none"
          placeholder="Horas (Ej: 08:00 14:00 22:00)"
          aria-label="Horas"
        />
        <button
          onClick={add}
          className="bg-[#00f2ff] text-black font-black rounded-2xl py-4 inline-flex items-center justify-center gap-2"
          aria-label="Añadir medicamento"
        >
          <Plus /> Añadir
        </button>
        <p className="text-xs opacity-60">
          Horas: ponlas separadas por espacios o comas. Ej: <span className="opacity-80">08:00,14:00,22:00</span>
        </p>
      </div>

      <div className="space-y-2">
        {meds.length === 0 && <div className="opacity-60 text-sm">No hay medicación guardada.</div>}

        {meds.map((m) => {
          const takenToday = !!m.takenOn;
          return (
            <div key={m.id} className="glass rounded-2xl p-4 border border-white/10 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-black">{m.name}</div>
                  <div className="text-sm opacity-70">
                    {m.dose ? m.dose : "—"} ·{" "}
                    {m.times?.length ? m.times.join(" · ") : "sin horas"}
                  </div>
                </div>

                <button
                  onClick={() => del(m.id)}
                  className="opacity-70 hover:opacity-100"
                  aria-label="Borrar medicamento"
                  title="Borrar"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => toggle(m.id)}
                  className={
                    "font-black rounded-2xl py-3 border " +
                    (m.active
                      ? "bg-white/10 border-white/10"
                      : "bg-red-500/15 border-red-400/30 text-red-200")
                  }
                  aria-label="Activar o desactivar"
                >
                  {m.active ? "Activo" : "Pausado"}
                </button>

                <button
                  onClick={() => toggleTaken(m.id, takenToday)}
                  className={
                    "font-black rounded-2xl py-3 border inline-flex items-center justify-center gap-2 " +
                    (takenToday
                      ? "bg-green-500 text-black border-green-400/30"
                      : "bg-white/10 border-white/10")
                  }
                  aria-label="Marcar tomado hoy"
                >
                  <CheckCircle2 size={18} />
                  {takenToday ? "Tomado hoy" : "No marcado"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
