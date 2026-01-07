import { useEffect, useMemo, useState } from "react";
import { CalendarPlus, Trash2 } from "lucide-react";

import { confirmDanger } from "@/app/utils/confirm";
import { shareText } from "@/app/utils/share";

import { AppointmentsRepo } from "@/infra/db/repositories";
import type { Appointment } from "@/domain/models/entities";

import { buildICS, downloadICS, type IcsEvent } from "@/infra/calendar/ics";
import { parseICS } from "@/infra/calendar/icsImport";

import { loadDraft, saveDraft, clearDraft } from "@/infra/drafts/drafts";
function toLocalInputValue(d: Date): string {
  // YYYY-MM-DDTHH:mm
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function Appointments(props: { senior?: boolean; onHelp?: () => void; readOnly?: boolean }) {
  const senior = !!props.senior;
  const readOnly = !!props.readOnly;

  const DRAFT_KEY = "lumina_draft_appointments_v1";
  const draft = loadDraft(DRAFT_KEY, { title: "", place: "", doctor: "", dt: "" });

  const [title, setTitle] = useState<string>(draft.title ?? "");
  const [place, setPlace] = useState<string>(draft.place ?? "");
  const [doctor, setDoctor] = useState<string>(draft.doctor ?? "");
  const [dt, setDt] = useState<string>(draft.dt ?? toLocalInputValue(new Date()));

  
  useEffect(() => {
    saveDraft(DRAFT_KEY, { title, place, doctor, dt });
  }, [title, place, doctor, dt]);const [items, setItems] = useState<Appointment[]>([]);
  const refresh = async () => setItems(await AppointmentsRepo.list());

  useEffect(() => { refresh(); }, []);
  useEffect(() => {
    saveDraft(DRAFT_KEY, { title, place, doctor, dt });
  }, [title, place, doctor, dt]);

  const upcoming = useMemo(() => {
    const now = Date.now();
    return [...items]
      .sort((a, b) => a.dateTimeISO.localeCompare(b.dateTimeISO))
      .filter(a => {
        const t = Date.parse(a.dateTimeISO);
        return Number.isFinite(t) ? t >= now - 60_000 : true;
      });
  }, [items]);

  const addAppointment = async () => {
    if (readOnly) { alert("Modo solo lectura."); return; }
    if (!title.trim() || !dt) return;

    const ap: Appointment = {
      id: crypto.randomUUID(),
      title: title.trim(),
      place: place.trim() || undefined,
      doctor: doctor.trim() || undefined,
      dateTimeISO: new Date(dt).toISOString(),
      createdAt: Date.now(),
    };

    await AppointmentsRepo.add(ap);
    setTitle(""); setPlace(""); setDoctor("");
    clearDraft(DRAFT_KEY);
    await refresh();
  };

  const removeAppointment = async (id: string) => {
    if (readOnly) { alert("Modo solo lectura."); return; }
    if (!confirmDanger("¿Borrar esta cita?")) return;
    await AppointmentsRepo.remove(id);
    await refresh();
  };

  const exportIcs = async () => {
        const events: IcsEvent[] = upcoming.map((a) => {
      const startMs = Date.parse(a.dateTimeISO);
      return {
        title: a.title,
        startMs: Number.isFinite(startMs) ? startMs : Date.now(),
        // opcionales si tu tipo los tiene (no pasa nada si sobran y TS se queja, los quitamos luego)
      } as any;
    });

    const ics = buildICS("Lumina Local", events);
    downloadICS(`lumina_citas_${new Date().toISOString().slice(0,10)}.ics`, ics);
  };

  const importIcs = async (file?: File | null) => {
    if (!file) return;
    if (readOnly) { alert("Modo solo lectura."); return; }
    if (!confirmDanger("Vas a IMPORTAR eventos desde un ICS y añadirlos a tus citas.\n\n¿Continuar?")) return;

    const txt = await file.text();
    const parsed = parseICS(txt);

    // Mapea lo importado a Appointment
    const now = Date.now();
    const rows: Appointment[] = parsed.map((p) => ({
      id: crypto.randomUUID(),
      title: (p.title?.trim() || "Cita"),
      place: p.place?.trim() || undefined,
      doctor: p.doctor?.trim() || undefined,
      dateTimeISO: p.dateTimeISO,
      createdAt: now,
    }));

    for (const a of rows) await AppointmentsRepo.add(a);
    await refresh();
  };

  const shareNext = async () => {
    const n = upcoming[0];
    if (!n) return;
    const when = new Date(n.dateTimeISO).toLocaleString();
    const msg =
      `Cita: ${n.title}\n` +
      (n.place ? `Lugar: ${n.place}\n` : "") +
      (n.doctor ? `Doctor/a: ${n.doctor}\n` : "") +
      `Fecha: ${when}`;
    await shareText("Lumina - Próxima cita", msg);
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className={"font-black " + (senior ? "text-3xl" : "text-2xl")}>Citas médicas</h2>
          <p className="opacity-70 mt-1 text-sm">Local · Offline · Sin IA · Sin APIs de pago</p>
        </div>
        <div className="flex gap-2">
          
          <button
            className="bg-white/10 hover:bg-white/15 border border-white/10 font-black rounded-2xl px-4 py-3"
          >
          </button>
{props.onHelp && (
            <button
              onClick={props.onHelp}
              className="bg-white/10 hover:bg-white/15 border border-white/10 font-black rounded-2xl px-4 py-3"
              aria-label="Ayuda"
            >
              ? Ayuda
            </button>
          )}
        </div>
      </div>

      <div className="glass rounded-3xl p-6 border border-white/10 space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-2xl p-4 outline-none w-full"
          placeholder="Título (Cardiólogo, Analítica…)"
          aria-label="Título"
        />
        <input
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-2xl p-4 outline-none w-full"
          placeholder="Lugar (opcional)"
          aria-label="Lugar"
        />
        <input
          value={doctor}
          onChange={(e) => setDoctor(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-2xl p-4 outline-none w-full"
          placeholder="Doctor/a (opcional)"
          aria-label="Doctor"
        />
        <input
          type="datetime-local"
          value={dt}
          onChange={(e) => setDt(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-2xl p-4 outline-none w-full"
          aria-label="Fecha y hora"
        />

        <button
          onClick={addAppointment}
          className="bg-[#00f2ff] text-black font-black rounded-2xl py-4 w-full inline-flex items-center justify-center gap-2"
          aria-label="Guardar cita"
        >
          <CalendarPlus /> Guardar cita
        </button>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={exportIcs}
            className="bg-white/10 hover:bg-white/15 border border-white/10 font-black rounded-2xl py-3"
          >
            Exportar ICS
          </button>

          <label className="bg-purple-500 text-black font-black rounded-2xl py-3 text-center cursor-pointer">
            Importar ICS
            <input
              type="file"
              accept=".ics,text/calendar"
              className="hidden"
              onChange={(e) => importIcs(e.target.files?.[0])}
            />
          </label>
        </div>

        <button
          onClick={shareNext}
          className="bg-white/10 hover:bg-white/15 border border-white/10 font-black rounded-2xl py-3 w-full"
        >
          Compartir próxima cita
        </button>
      </div>

      <div className="space-y-2">
        {upcoming.length === 0 && (
          <div className="opacity-70">No hay próximas citas.</div>
        )}

        {upcoming.map((a) => (
          <div key={a.id} className="glass rounded-2xl p-4 border border-white/10 flex items-start justify-between gap-3">
            <div>
              <div className="font-black">{a.title}</div>
              <div className="text-sm opacity-70">
                {new Date(a.dateTimeISO).toLocaleString()}
                {a.place ? ` · ${a.place}` : ""}
                {a.doctor ? ` · ${a.doctor}` : ""}
              </div>
            </div>
            <button
              onClick={() => removeAppointment(a.id)}
              className="opacity-70 hover:opacity-100"
              aria-label="Borrar"
              title="Borrar"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


















