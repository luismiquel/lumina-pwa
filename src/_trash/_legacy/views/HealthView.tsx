import { useEffect, useMemo, useState } from "react";
import { AppointmentsRepo, HealthRepo, MedsRepo } from "@/infra/db/repositories";
import type { Appointment, HealthEntry, Medication } from "@/domain/models/entities";

type Tab = "APPOINTMENTS" | "MEDS" | "BIOMETRICS";

function isoNowLocalDatetime() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function HealthView({ onBack, senior }: { onBack: () => void; senior: boolean }) {
  const [tab, setTab] = useState<Tab>("APPOINTMENTS");

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [meds, setMeds] = useState<Medication[]>([]);
  const [bio, setBio] = useState<HealthEntry[]>([]);

  const reload = async () => {
    const [a, m, b] = await Promise.all([
      AppointmentsRepo.list(),
      MedsRepo.list(),
      HealthRepo.list()
    ]);
    setAppointments(a);
    setMeds(m);
    setBio(b);
  };

  useEffect(() => { void reload(); }, []);

  const upcoming = useMemo(() => {
    const now = Date.now();
    return appointments
      .map(a => ({ ...a, t: new Date(a.startsAt).getTime() }))
      .filter(a => Number.isFinite(a.t) && a.t >= now)
      .sort((x, y) => x.t - y.t)
      .slice(0, 3);
  }, [appointments]);

  return (
    <div className="space-y-4">
      <div className="glass p-5 rounded-3xl border border-white/10">
        <div className="text-[10px] tracking-[0.3em] opacity-40 font-black">ESTADO BIOMÉTRICO</div>
        <div className={`mt-2 font-black ${senior ? "text-2xl" : "text-xl"}`}>Salud</div>
        <div className="mt-2 text-sm opacity-70">
          Próximas citas: <span className="font-black">{upcoming.length}</span>
        </div>

        {upcoming.length > 0 && (
          <div className="mt-3 space-y-2">
            {upcoming.map(a => (
              <div key={a.id} className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="font-black">{a.title}</div>
                <div className="text-xs opacity-60">
                  {new Date(a.startsAt).toLocaleString()} · {a.doctor ?? "—"} · {a.place ?? "—"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => setTab("APPOINTMENTS")} className={`px-3 py-3 rounded-2xl border font-black ${tab==="APPOINTMENTS" ? "bg-[#00f2ff] text-black border-[#00f2ff]" : "bg-white/5 border-white/10 hover:bg-white/10"}`}>
          CITAS
        </button>
        <button onClick={() => setTab("MEDS")} className={`px-3 py-3 rounded-2xl border font-black ${tab==="MEDS" ? "bg-[#00f2ff] text-black border-[#00f2ff]" : "bg-white/5 border-white/10 hover:bg-white/10"}`}>
          MEDS
        </button>
        <button onClick={() => setTab("BIOMETRICS")} className={`px-3 py-3 rounded-2xl border font-black ${tab==="BIOMETRICS" ? "bg-[#00f2ff] text-black border-[#00f2ff]" : "bg-white/5 border-white/10 hover:bg-white/10"}`}>
          BIO
        </button>
      </div>

      {tab === "APPOINTMENTS" && <AppointmentsPanel items={appointments} onChange={async()=>{await reload();}} />}
      {tab === "MEDS" && <MedsPanel items={meds} onChange={async()=>{await reload();}} />}
      {tab === "BIOMETRICS" && <BiometricsPanel items={bio} onChange={async()=>{await reload();}} />}

      <button onClick={onBack} className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition font-black">
        Volver
      </button>
    </div>
  );
}

function AppointmentsPanel({ items, onChange }: { items: Appointment[]; onChange: () => Promise<void> }) {
  const [title, setTitle] = useState("Cita médica");
  const [doctor, setDoctor] = useState("");
  const [place, setPlace] = useState("");
  const [startsAt, setStartsAt] = useState(isoNowLocalDatetime());
  const [notes, setNotes] = useState("");
  const [reminder, setReminder] = useState(true);

  const add = async () => {
    if (!title.trim() || !startsAt) return;
    await AppointmentsRepo.add({
      title: title.trim(),
      doctor: doctor.trim() || undefined,
      place: place.trim() || undefined,
      startsAt: new Date(startsAt).toISOString(),
      notes: notes.trim() || undefined,
      reminder
    });
    setDoctor(""); setPlace(""); setNotes("");
    await onChange();
  };

  const remove = async (id: string) => {
    await AppointmentsRepo.remove(id);
    await onChange();
  };

  const sorted = [...items].sort((a,b)=> new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  return (
    <div className="space-y-4">
      <div className="glass p-5 rounded-3xl border border-white/10">
        <div className="text-[10px] tracking-[0.3em] opacity-40 font-black">CITAS MÉDICAS</div>

        <div className="mt-3 grid grid-cols-1 gap-3">
          <input value={title} onChange={e=>setTitle(e.target.value)} className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 outline-none" placeholder="Título (Cardiólogo, Analítica...)" />
          <input value={doctor} onChange={e=>setDoctor(e.target.value)} className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 outline-none" placeholder="Doctor (opcional)" />
          <input value={place} onChange={e=>setPlace(e.target.value)} className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 outline-none" placeholder="Lugar (opcional)" />
          <input type="datetime-local" value={startsAt} onChange={e=>setStartsAt(e.target.value)} className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 outline-none" />
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 outline-none min-h-[90px]" placeholder="Notas (opcional)" />
          <label className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/10">
            <input type="checkbox" checked={reminder} onChange={e=>setReminder(e.target.checked)} />
            <span className="font-black">Recordatorio (flag local)</span>
          </label>
          <button onClick={add} className="px-5 py-4 rounded-2xl bg-[#00f2ff] text-black font-black">GUARDAR CITA</button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="opacity-30 text-center py-10">SIN CITAS</div>
      ) : (
        <div className="space-y-3">
          {sorted.map(a => (
            <div key={a.id} className="glass p-5 rounded-3xl border border-white/10">
              <div className="font-black">{a.title}</div>
              <div className="text-xs opacity-60 mt-1">
                {new Date(a.startsAt).toLocaleString()} · {a.doctor ?? "—"} · {a.place ?? "—"} · {a.reminder ? "⏰" : "—"}
              </div>
              {a.notes && <div className="mt-2 text-sm opacity-70 whitespace-pre-wrap">{a.notes}</div>}
              <button onClick={()=>void remove(a.id)} className="mt-3 px-4 py-2 rounded-2xl bg-red-500/15 border border-red-500/25 text-red-300 font-black">
                BORRAR
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MedsPanel({ items, onChange }: { items: Medication[]; onChange: () => Promise<void> }) {
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [schedule, setSchedule] = useState("08:00, 20:00");
  const [notes, setNotes] = useState("");

  const add = async () => {
    if (!name.trim()) return;
    await MedsRepo.add({
      name: name.trim(),
      dose: dose.trim() || undefined,
      schedule: schedule.trim() || undefined,
      notes: notes.trim() || undefined,
      active: true
    });
    setName(""); setDose(""); setNotes("");
    await onChange();
  };

  const toggle = async (id: string) => {
    await MedsRepo.toggleActive(id);
    await onChange();
  };

  const remove = async (id: string) => {
    await MedsRepo.remove(id);
    await onChange();
  };

  return (
    <div className="space-y-4">
      <div className="glass p-5 rounded-3xl border border-white/10">
        <div className="text-[10px] tracking-[0.3em] opacity-40 font-black">MEDICACIÓN</div>

        <div className="mt-3 grid grid-cols-1 gap-3">
          <input value={name} onChange={e=>setName(e.target.value)} className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 outline-none" placeholder="Medicamento (ej: Enalapril)" />
          <input value={dose} onChange={e=>setDose(e.target.value)} className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 outline-none" placeholder="Dosis (ej: 10mg)" />
          <input value={schedule} onChange={e=>setSchedule(e.target.value)} className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 outline-none" placeholder="Horario (ej: 08:00, 20:00)" />
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 outline-none min-h-[80px]" placeholder="Notas (opcional)" />
          <button onClick={add} className="px-5 py-4 rounded-2xl bg-[#00f2ff] text-black font-black">AÑADIR</button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="opacity-30 text-center py-10">SIN MEDICACIÓN</div>
      ) : (
        <div className="space-y-3">
          {items.map(m => (
            <div key={m.id} className={`glass p-5 rounded-3xl border border-white/10 ${m.active ? "" : "opacity-40"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-black">{m.name} {m.dose ? `· ${m.dose}` : ""}</div>
                  <div className="text-xs opacity-60 mt-1">{m.schedule ?? "—"}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>void toggle(m.id)} className="px-3 py-2 rounded-2xl bg-white/5 border border-white/10 font-black">
                    {m.active ? "ON" : "OFF"}
                  </button>
                  <button onClick={()=>void remove(m.id)} className="px-3 py-2 rounded-2xl bg-red-500/15 border border-red-500/25 text-red-300 font-black">
                    X
                  </button>
                </div>
              </div>
              {m.notes && <div className="mt-2 text-sm opacity-70 whitespace-pre-wrap">{m.notes}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BiometricsPanel({ items, onChange }: { items: HealthEntry[]; onChange: () => Promise<void> }) {
  const [type, setType] = useState<HealthEntry["type"]>("weight");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("kg");
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));

  const add = async () => {
    if (!value.trim()) return;
    const v: number | string = type === "mood" ? value.trim() : Number(value);
    await HealthRepo.add({
      type,
      value: v,
      unit: unit.trim() || undefined,
      date: new Date(date).toISOString()
    });
    setValue("");
    await onChange();
  };

  const remove = async (id: string) => {
    await HealthRepo.remove(id);
    await onChange();
  };

  return (
    <div className="space-y-4">
      <div className="glass p-5 rounded-3xl border border-white/10">
        <div className="text-[10px] tracking-[0.3em] opacity-40 font-black">BIOMÉTRICOS</div>

        <div className="mt-3 grid grid-cols-1 gap-3">
          <select value={type} onChange={e=>setType(e.target.value as any)} className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 outline-none">
            <option value="weight">Peso</option>
            <option value="steps">Pasos</option>
            <option value="mood">Ánimo</option>
            <option value="blood_pressure">Tensión</option>
          </select>
          <input value={value} onChange={e=>setValue(e.target.value)} className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 outline-none" placeholder="Valor (ej: 72 / 8000 / Bien / 120/80)" />
          <input value={unit} onChange={e=>setUnit(e.target.value)} className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 outline-none" placeholder="Unidad (kg, pasos...)" />
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 outline-none" />
          <button onClick={add} className="px-5 py-4 rounded-2xl bg-[#00f2ff] text-black font-black">REGISTRAR</button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="opacity-30 text-center py-10">SIN REGISTROS</div>
      ) : (
        <div className="space-y-3">
          {items.map(h => (
            <div key={h.id} className="glass p-5 rounded-3xl border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-black">{h.type}</div>
                <div className="text-xs opacity-60">{new Date(h.date).toLocaleDateString()} · {String(h.value)} {h.unit ?? ""}</div>
              </div>
              <button onClick={()=>void remove(h.id)} className="px-3 py-2 rounded-2xl bg-red-500/15 border border-red-500/25 text-red-300 font-black">
                X
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
