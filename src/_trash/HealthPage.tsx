import { useEffect, useState } from "react";
import { Card } from "@/app/components/Card";
import { HealthRepo } from "@/infra/db/repos";
import type { HealthEntry } from "@/domain/models/entities";

export function HealthPage(props: { senior?: boolean }) {
  const { senior } = props;
  const [items, setItems] = useState<HealthEntry[]>([]);
  const [type, setType] = useState<HealthEntry["type"]>("weight");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("");

  const refresh = async () => setItems(await HealthRepo.list());
  useEffect(() => { refresh(); }, []);

  const add = async () => {
    if (!value.trim()) return;
    const vNum = Number(value);
    const v = Number.isFinite(vNum) ? vNum : value.trim();
    await HealthRepo.add(type, v, unit.trim() || undefined);
    setValue(""); setUnit("");
    await refresh();
  };

  const del = async (id: string) => { await HealthRepo.remove(id); await refresh(); };

  return (
    <div className="flex flex-col gap-6">
      <Card title="Salud">
        <div className="grid grid-cols-1 gap-3">
          <select value={type} onChange={e => setType(e.target.value as any)}
            className={["w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-red-400",
              senior ? "text-xl" : "text-sm"].join(" ")}>
            <option value="weight">Peso</option>
            <option value="steps">Pasos</option>
            <option value="mood">Ánimo</option>
            <option value="blood_pressure">Tensión</option>
          </select>

          <input value={value} onChange={e => setValue(e.target.value)} placeholder="Valor"
            className={["w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-red-400",
              senior ? "text-xl" : "text-sm"].join(" ")} />
          <input value={unit} onChange={e => setUnit(e.target.value)} placeholder="Unidad (kg, pasos...)"
            className={["w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-red-400",
              senior ? "text-xl" : "text-sm"].join(" ")} />

          <button onClick={add} className="w-full bg-red-500 text-black font-black py-3 rounded-2xl">
            Añadir
          </button>
        </div>
      </Card>

      <div className="space-y-3">
        {items.map(h => (
          <div key={h.id} className="glass border border-white/10 rounded-3xl p-5 flex justify-between gap-4">
            <div className="min-w-0">
              <p className={["font-black truncate", senior ? "text-2xl" : "text-base"].join(" ")}>
                {h.type} · {String(h.value)}{h.unit ? ` ${h.unit}` : ""}
              </p>
              <p className="text-xs text-white/40">{new Date(h.date).toLocaleString()}</p>
            </div>
            <button onClick={() => del(h.id)} className="text-red-400/70 hover:text-red-400 font-black">X</button>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-white/30">Sin registros</p>}
      </div>
    </div>
  );
}
