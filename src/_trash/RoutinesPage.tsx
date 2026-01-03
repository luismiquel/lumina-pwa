import { useEffect, useState } from "react";
import { Card } from "@/app/components/Card";
import { RoutinesRepo } from "@/infra/db/repos";
import type { Routine } from "@/domain/models/entities";

export function RoutinesPage(props: { senior?: boolean }) {
  const { senior } = props;
  const [items, setItems] = useState<Routine[]>([]);
  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState<Routine["frequency"]>("daily");

  const refresh = async () => setItems(await RoutinesRepo.list());
  useEffect(() => { refresh(); }, []);

  const add = async () => {
    if (!title.trim()) return;
    await RoutinesRepo.add(title, frequency);
    setTitle("");
    await refresh();
  };

  const toggleToday = async (id: string) => { await RoutinesRepo.toggleToday(id); await refresh(); };
  const del = async (id: string) => { await RoutinesRepo.remove(id); await refresh(); };

  return (
    <div className="flex flex-col gap-6">
      <Card title="Rutinas">
        <div className="grid grid-cols-1 gap-3">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Rutina"
            className={["w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-yellow-400",
              senior ? "text-xl" : "text-sm"].join(" ")} />

          <select value={frequency} onChange={e => setFrequency(e.target.value as any)}
            className={["w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-yellow-400",
              senior ? "text-xl" : "text-sm"].join(" ")}>
            <option value="daily">Diaria</option>
            <option value="weekly">Semanal</option>
          </select>

          <button onClick={add} className="w-full bg-yellow-400 text-black font-black py-3 rounded-2xl">
            Añadir
          </button>
        </div>
      </Card>

      <div className="space-y-3">
        {items.map(r => (
          <div key={r.id} className="glass border border-white/10 rounded-3xl p-5 flex justify-between items-center gap-4">
            <div className="min-w-0">
              <p className={["font-black truncate", senior ? "text-2xl" : "text-base"].join(" ")}>{r.title}</p>
              <p className="text-xs text-white/40">{r.frequency} · completados: {r.completedDays.length}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => toggleToday(r.id)} className="bg-white/10 border border-white/10 rounded-2xl px-4 py-2 font-black">
                Hoy
              </button>
              <button onClick={() => del(r.id)} className="text-red-400/70 hover:text-red-400 font-black">X</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-white/30">Sin rutinas</p>}
      </div>
    </div>
  );
}
