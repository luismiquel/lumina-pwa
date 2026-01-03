import { useEffect, useMemo, useState } from "react";
import { Card } from "@/app/components/Card";
import { ExpensesRepo } from "@/infra/db/repos";
import type { Expense } from "@/domain/models/entities";

export function ExpensesPage(props: { senior?: boolean }) {
  const { senior } = props;
  const [items, setItems] = useState<Expense[]>([]);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("General");

  const refresh = async () => setItems(await ExpensesRepo.list());
  useEffect(() => { refresh(); }, []);

  const total = useMemo(() => items.reduce((a, e) => a + e.amount, 0), [items]);

  const add = async () => {
    const val = parseFloat(amount);
    if (!desc.trim() || !Number.isFinite(val)) return;
    await ExpensesRepo.add(desc, val, category);
    setDesc(""); setAmount("");
    await refresh();
  };

  const del = async (id: string) => { await ExpensesRepo.remove(id); await refresh(); };

  return (
    <div className="flex flex-col gap-6">
      <Card title="Gastos">
        <p className="text-white/40 text-xs font-black uppercase tracking-[0.25em]">Total</p>
        <p className={["font-black text-green-400", senior ? "text-5xl" : "text-3xl"].join(" ")}>
          {total.toFixed(2)}€
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3">
          <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Descripción"
            className={["w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-green-400",
              senior ? "text-xl" : "text-sm"].join(" ")} />
          <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Importe" inputMode="decimal"
            className={["w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-green-400",
              senior ? "text-xl" : "text-sm"].join(" ")} />
          <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Categoría"
            className={["w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-green-400",
              senior ? "text-xl" : "text-sm"].join(" ")} />
          <button onClick={add} className="w-full bg-green-500 text-black font-black py-3 rounded-2xl">
            Añadir
          </button>
        </div>
      </Card>

      <div className="space-y-3">
        {items.map(e => (
          <div key={e.id} className="glass border border-white/10 rounded-3xl p-5 flex justify-between items-center">
            <div className="min-w-0">
              <p className={["font-black truncate", senior ? "text-2xl" : "text-base"].join(" ")}>{e.description}</p>
              <p className="text-xs text-white/40">{new Date(e.date).toLocaleDateString()} · {e.category}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className={["font-black text-green-400", senior ? "text-3xl" : "text-xl"].join(" ")}>
                -{e.amount}€
              </span>
              <button onClick={() => del(e.id)} className="text-red-400/70 hover:text-red-400 font-black">X</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-white/30">Sin gastos</p>}
      </div>
    </div>
  );
}
