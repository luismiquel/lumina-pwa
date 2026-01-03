import { useEffect, useMemo, useState } from "react";
import { AppointmentsRepo } from "../../../infra/db/repositories";
import type { Appointment } from "../../../domain/models/entities";

function toLocalInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function Appointments({ senior }: { senior: boolean }) {
  const [items, setItems] = useState<Appointment[]>([]);
  const [title, setTitle] = useState("Cita médica");
  const [at, setAt] = useState(toLocalInputValue(new Date(Date.now() + 3600_000)));
  const [place, setPlace] = useState("");
  const [doctor, setDoctor] = useState("");

  const load = async () => setItems(await AppointmentsRepo.list());
  useEffect(() => { load(); }, []);

  const upcoming = useMemo(() => {
    const now = Date.now();
    return items
      .slice()
      .sort((a,b)=> new Date(a.at).getTime() - new Date(b.at).getTime())
      .map(x => ({...x, ts: new Date(x.at).getTime()}))
      .filter(x => x.ts >= now - 24*3600_000);
  }, [items]);

  const add = async () => {
    const iso = new Date(at).toISOString();
    await AppointmentsRepo.add({ title: title.trim(), at: iso, place: place.trim() || undefined, doctor: doctor.trim() || undefined });
    setPlace(""); setDoctor("");
    await load();
  };

  const remove = async (id: string) => { await AppointmentsRepo.remove(id); await load(); };

  return (
    <div className="glass rounded-3xl p-6 border border-white/10">
      <h2 className={`font-black ${senior ? "text-3xl" : "text-xl"}`}>Citas médicas</h2>

      <div className="mt-4 grid gap-2">
        <input className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none"
          value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Título" />
        <input className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none"
          value={place} onChange={(e)=>setPlace(e.target.value)} placeholder="Lugar (opcional)" />
        <input className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none"
          value={doctor} onChange={(e)=>setDoctor(e.target.value)} placeholder="Doctor/a (opcional)" />
        <input type="datetime-local" className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none"
          value={at} onChange={(e)=>setAt(e.target.value)} />

        <button onClick={add} className="mt-1 bg-cyan-400 text-black font-black py-3 rounded-2xl">
          Guardar cita
        </button>
      </div>

      <div className="mt-5 space-y-2">
        {upcoming.map(a => (
          <div key={a.id} className="p-4 rounded-2xl border border-white/10 flex justify-between gap-3">
            <div>
              <div className={`${senior ? "text-2xl" : "text-base"} font-bold`}>{a.title}</div>
              <div className="opacity-70 text-sm">{new Date(a.at).toLocaleString()}</div>
              {(a.place || a.doctor) && (
                <div className="opacity-60 text-sm">
                  {a.place ? `📍 ${a.place}` : ""} {a.doctor ? ` · 👨‍⚕️ ${a.doctor}` : ""}
                </div>
              )}
            </div>
            <button onClick={() => remove(a.id)} className="text-red-400 font-black px-3">X</button>
          </div>
        ))}
        {upcoming.length === 0 && <p className="opacity-50 mt-4">No hay citas.</p>}
      </div>
    </div>
  );
}
