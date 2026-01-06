import { useEffect, useMemo, useState } from "react";
import { Pill, Plus, PauseCircle, PlayCircle, Trash2, Save } from "lucide-react";
import { MedsRepo } from "@/infra/db/repos";

type Med = {
  id: string;
  name: string;
  dosage?: string;
  schedule?: string; // texto libre: "08:00 y 20:00"
  notes?: string;    // indicaciones del médico
  active: boolean;
  createdAt: number;
  updatedAt: number;
};

export default function Meds(props: { senior?: boolean; onClose?: () => void }) {
  const senior = !!props.senior;

  const [items, setItems] = useState<Med[]>([]);
  const [editing, setEditing] = useState<Med | null>(null);

  const empty: Med = useMemo(() => ({
    id: crypto.randomUUID(),
    name: "",
    dosage: "",
    schedule: "",
    notes: "",
    active: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }), []);

  const refresh = async () => {
    const list = await MedsRepo.list();
    setItems(list as Med[]);
  };

  useEffect(() => { refresh(); }, []);

  const startNew = () => setEditing({ ...empty });

  const save = async () => {
    if (!editing) return;
    const name = (editing.name || "").trim();
    if (!name) { alert("Nombre del medicamento obligatorio."); return; }

    await MedsRepo.upsert({
      ...editing,
      name,
      updatedAt: Date.now(),
      createdAt: editing.createdAt || Date.now(),
      active: editing.active !== false,
    });

    setEditing(null);
    await refresh();
  };

  const toggleActive = async (m: Med) => {
    await MedsRepo.setActive(m.id, !m.active);
    await refresh();
  };

  const del = async (m: Med) => {
    if (!confirm("¿Borrar este medicamento?")) return;
    await MedsRepo.remove(m.id);
    await refresh();
  };

  const actives = items.filter(i => i.active).sort((a,b) => a.name.localeCompare(b.name));
  const paused  = items.filter(i => !i.active).sort((a,b) => a.name.localeCompare(b.name));

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto text-white relative z-[60] pointer-events-auto">
      <div className="glass rounded-3xl p-6 border border-white/10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className={"font-black tracking-tight " + (senior ? "text-3xl" : "text-2xl")}>
              <span className="inline-flex items-center gap-2"><Pill size={20}/> Medicamentos</span>
            </h2>
            <p className="opacity-70 mt-1 text-sm">Lista de medicamentos recetados (uso personal). Local · Offline.</p>
            <p className="text-xs opacity-60 mt-2">Importante: Lumina no da consejos médicos. Sigue siempre la pauta de tu médico.</p>
          </div>

          {props.onClose && (
            <button
              onClick={props.onClose}
              className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl px-4 py-2 font-black"
            >
              Cerrar
            </button>
          )}
        </div>

        <button
          onClick={startNew}
          className="mt-4 w-full rounded-2xl py-3 font-black inline-flex items-center justify-center gap-2 bg-[#00f2ff] text-black"
        >
          <Plus size={18}/> Añadir medicamento
        </button>
      </div>

      {editing && (
        <div className="glass rounded-3xl p-6 border border-white/10 space-y-3">
          <div className="font-black text-lg">Editar / Nuevo</div>

          <input
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none"
            placeholder="Nombre (obligatorio) — ej: Enalapril"
            value={editing.name}
            onChange={(e) => setEditing({ ...editing, name: e.target.value })}
          />

          <div className="grid grid-cols-1 gap-2">
            <input
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none"
              placeholder="Dosis — ej: 10 mg"
              value={editing.dosage || ""}
              onChange={(e) => setEditing({ ...editing, dosage: e.target.value })}
            />
            <input
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none"
              placeholder="Horario — ej: 08:00 y 20:00"
              value={editing.schedule || ""}
              onChange={(e) => setEditing({ ...editing, schedule: e.target.value })}
            />
            <textarea
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none min-h-[88px]"
              placeholder="Indicaciones del médico (opcional)"
              value={editing.notes || ""}
              onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setEditing(null)}
              className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl py-3 font-black"
            >
              Cancelar
            </button>
            <button
              onClick={save}
              className="bg-purple-500 text-black rounded-2xl py-3 font-black inline-flex items-center justify-center gap-2"
            >
              <Save size={18}/> Guardar
            </button>
          </div>
        </div>
      )}

      <div className="glass rounded-3xl p-6 border border-white/10 space-y-4">
        <div className="font-black text-lg">Activos</div>
        {actives.length === 0 && <div className="opacity-60">No hay medicamentos activos.</div>}

        <div className="space-y-2">
          {actives.map(m => (
            <div key={m.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-black">{m.name}</div>
                  {(m.dosage || m.schedule) && (
                    <div className="text-sm opacity-70 mt-1">
                      {[m.dosage, m.schedule].filter(Boolean).join(" · ")}
                    </div>
                  )}
                  {m.notes && <div className="text-sm opacity-70 mt-1">{m.notes}</div>}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing({ ...m })}
                    className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl px-3 py-2 font-black"
                    title="Editar"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => toggleActive(m)}
                    className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl px-3 py-2 font-black inline-flex items-center gap-2"
                    title="Pausar"
                  >
                    <PauseCircle size={16}/> Pausar
                  </button>

                  <button
                    onClick={() => del(m)}
                    className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-2xl px-3 py-2 font-black inline-flex items-center gap-2"
                    title="Borrar"
                  >
                    <Trash2 size={16}/> Borrar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {paused.length > 0 && (
          <>
            <div className="font-black text-lg pt-2 border-t border-white/10">Pausados</div>
            <div className="space-y-2">
              {paused.map(m => (
                <div key={m.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 opacity-80">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-black">{m.name}</div>
                      {(m.dosage || m.schedule) && (
                        <div className="text-sm opacity-70 mt-1">
                          {[m.dosage, m.schedule].filter(Boolean).join(" · ")}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleActive(m)}
                        className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl px-3 py-2 font-black inline-flex items-center gap-2"
                        title="Reactivar"
                      >
                        <PlayCircle size={16}/> Reactivar
                      </button>
                      <button
                        onClick={() => del(m)}
                        className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-2xl px-3 py-2 font-black inline-flex items-center gap-2"
                        title="Borrar"
                      >
                        <Trash2 size={16}/> Borrar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

