import { useEffect, useMemo, useState } from "react";
import { ExpensesRepo } from "@/infra/db/repositories";
import type { Expense } from "@/domain/models/entities";

export default function ExpensesScreen() {
  const [items, setItems] = useState<Expense[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  async function refresh() {
    setItems(await ExpensesRepo.list());
  }

  useEffect(() => {
    refresh();
  }, []);

  const total = useMemo(() => items.reduce((a, b) => a + (b.amount || 0), 0), [items]);

  const add = async () => {
    const a = Number(amount);
    if (!description.trim() || !Number.isFinite(a) || a <= 0) return;
    await ExpensesRepo.add({
      description: description.trim(),
      amount: a,
      category: "General",
      date: new Date().toISOString()
    });
    setDescription("");
    setAmount("");
    await refresh();
  };

  const remove = async (id: string) => {
    await ExpensesRepo.remove(id);
    await refresh();
  };

  return (
    <div className="glass rounded-3xl p-6 border border-white/10">
      <h2 className="text-xl font-black">Gastos</h2>

      <div className="mt-3 opacity-70 text-sm">Total: <span className="font-black text-[#00f2ff]">{total.toFixed(2)}€</span></div>

      <div className="mt-4 grid gap-2">
        <input
          className="bg-white/5 border border-white/10 rounded-2xl p-3 outline-none"
          placeholder="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          className="bg-white/5 border border-white/10 rounded-2xl p-3 outline-none"
          placeholder="Importe (€)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button
          onClick={add}
          className="bg-[#00f2ff] text-black font-black py-3 rounded-2xl hover:opacity-90 active:scale-[0.99] transition"
        >
          AÑADIR GASTO
        </button>
      </div>

      <div className="mt-6 grid gap-2">
        {items.length === 0 && <p className="opacity-40 text-sm">Aún no hay gastos.</p>}
        {items.map((e) => (
          <div key={e.id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-3">
            <div>
              <div className="font-black">{e.description}</div>
              <div className="opacity-40 text-xs">{new Date(e.date).toLocaleDateString()}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="font-black text-[#00f2ff]">{e.amount.toFixed(2)}€</div>
              <button onClick={() => remove(e.id)} className="text-red-400/80 hover:text-red-300 font-black px-2">X</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
