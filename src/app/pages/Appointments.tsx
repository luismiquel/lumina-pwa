import { shareText } from "@/app/utils/share";
import { confirmDanger } from "@/app/utils/confirm";
import { focusByLuminaId } from "@/app/nav/focusHelpers";
import { consumeNavTarget } from "@/app/nav/navTarget";
import { useEffect, useMemo, useState } from "react";
import { CalendarPlus, Trash2 } from "lucide-react";
import { AppointmentsRepo } from "@/infra/db/repositories";
import type { Appointment } from "@/domain/models/entities";

import { buildICS, downloadICS, type IcsEvent } from "@/infra/calendar/ics";
import { parseICS } from "@/infra/calendar/icsImport";
import { db } from "@/infra/db/db";
import { navTo } from "@/app/navBus";
export default function Appointments(props: { senior?: boolean; onHelp?: () => void }) {
  const { senior } = props;
  /* LUMINA_READONLY_APPOINTMENTS_COMPAT */
  const add = async () => {const title = prompt("Título de la cita:")?.trim() || "Cita";
    const dateTimeISO = prompt("Fecha/hora ISO (ej: 2026-01-03T12:30):")?.trim();

    if (!dateTimeISO) return;

    const repo: any = (AppointmentsRepo ?? (globalThis as any).AppointmentsRepo) as any;

    // si tienes repositorio en el archivo con otro nombre, intentamos db directo
    try {
      if (repo?.add) {
        await repo.add({ id: crypto.randomUUID(), title, dateTimeISO, createdAt: Date.now(), updatedAt: Date.now() });
      } else {
        // fallback: intenta db.appointments.add si existe
        const dbAny: any = (globalThis as any).db;
        if (dbAny?.appointments?.add) {
          await dbAny.appointments.add({ id: crypto.randomUUID(), title, dateTimeISO, createdAt: Date.now(), updatedAt: Date.now() });
        } else {
          alert("No encuentro AppointmentsRepo ni db.appointments.add.");
          return;
        }
      }
    } catch (e: any) {
      alert(e?.message ?? "No se pudo añadir la cita.");
      return;
    }

    try { location.reload(); } catch {}};

  const remove = async (id: string) => {const repo: any = (AppointmentsRepo ?? (globalThis as any).AppointmentsRepo) as any;

    try {
      if (repo?.remove) await repo.remove(id);
      else if (repo?.delete) await repo.delete(id);
      else {
        const dbAny: any = (globalThis as any).db;
        if (dbAny?.appointments?.delete) await dbAny.appointments.delete(id);
        else {
          alert("No encuentro AppointmentsRepo.remove/delete ni db.appointments.delete.");
          return;
        }
      }
    } catch (e: any) {
      alert(e?.message ?? "No se pudo borrar la cita.");
      return;
    }

    try { location.reload(); } catch {}};
  /* /LUMINA_READONLY_APPOINTMENTS_COMPAT */const [list, setList] = useState<Appointment[]>([]);
  const [title, setTitle] = useState("");
  const [place, setPlace] = useState("");
  const [doctor, setDoctor] = useState("");
  const [dt, setDt] = useState("");

  const load = async () => setList(await AppointmentsRepo.list());
  useEffect(() => { load(); }, []);

  const addAppointment = async () => {if (!title.trim() || !dt) return;
    await AppointmentsRepo.add({
      title: title.trim(),
      place: place.trim() || undefined,
      doctor: doctor.trim() || undefined,
      dateTimeISO: new Date(dt).toISOString(),
      note: undefined
    });
    setTitle(""); setPlace(""); setDoctor(""); setDt("");
    await load();
  };

  const removeAppointment = async (id: string) => {if (!confirmDanger("¿Borrar esta cita?")) return;
      await AppointmentsRepo.remove(id);await load(); };

  const upcoming = useMemo(
    () => list.filter(a => new Date(a.dateTimeISO).getTime() >= Date.now()),
    [list]
  );

  useEffect(() => {
  const t = consumeNavTarget();
  if (t?.kind === "APPOINTMENT") {
    // intentos suaves por si la lista tarda en pintar
    let tries = 0;
    const tick = () => {
      tries++;
      if (focusByLuminaId(t.id) || tries > 10) return;
      setTimeout(tick, 120);
    };
    tick();
  }
}, []);

return (
    <div className="space-y-4">
      <div className="glass rounded-3xl p-6 border border-white/10">
        <h2 className={"font-black " + (senior ? "text-3xl" : "text-xl")}>Citas médicas</h2>

        <div className="grid grid-cols-1 gap-2 mt-4">
          <input value={title} onChange={(e)=>setTitle(e.target.value)} className="bg-white/5 border border-white/10 rounded-2xl p-4 outline-none" placeholder="Título (Cardiólogo, Analítica…)" />
          <input value={place} onChange={(e)=>setPlace(e.target.value)} className="bg-white/5 border border-white/10 rounded-2xl p-4 outline-none" placeholder="Lugar (opcional)" />
          <input value={doctor} onChange={(e)=>setDoctor(e.target.value)} className="bg-white/5 border border-white/10 rounded-2xl p-4 outline-none" placeholder="Doctor/a (opcional)" />
          <input type="datetime-local" value={dt} aria-label="Fecha y hora" onChange={(e)=>setDt(e.target.value)} className="bg-white/5 border border-white/10 rounded-2xl p-4 outline-none" />
          <button onClick={add} className="bg-[#00f2ff] text-black font-black rounded-2xl py-4 flex items-center justify-center gap-2">
            <CalendarPlus/> Guardar cita
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {upcoming.map(a => (
          <div key={a.id} data-lumina-id={a.id} className="glass rounded-2xl p-4 border border-white/10 flex justify-between items-center">
            <div>
              <div className={senior ? "text-2xl font-black" : "text-base font-black"}>{a.title}</div>
              <div className="opacity-60 text-sm">
                {new Date(a.dateTimeISO).toLocaleString()}
                {a.place ? " · " + a.place : ""}
                {a.doctor ? " · " + a.doctor : ""}
              </div>
            </div>
            <button onClick={()=>remove(a.id)} className="opacity-70 hover:opacity-100">
              <Trash2 className="text-red-400"/>
            </button>
          </div>
        ))}
        {upcoming.length===0 && <p className="opacity-40 text-center py-6">No hay próximas citas.</p>}
      </div>
    </div>
  );
}






















