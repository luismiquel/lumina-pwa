import { useEffect, useState } from "react";
import { ShoppingRepo } from "../../../infra/db/repositories";
import type { ShoppingItem } from "../../../domain/models/entities";

export default function Shopping({ senior }: { senior: boolean }) {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [text, setText] = useState("");

  const load = async () => setItems(await ShoppingRepo.list());

  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!text.trim()) return;
    await ShoppingRepo.add(text);
    setText("");
    await load();
  };

  const toggle = async (id: string) => { await ShoppingRepo.toggle(id); await load(); };
  const remove = async (id: string) => { await ShoppingRepo.remove(id); await load(); };

  return (
    <div className="glass rounded-3xl p-6 border border-white/10">
      <h2 className={`font-black ${senior ? "text-3xl" : "text-xl"}`}>Lista de la compra</h2>

      <div className="mt-4 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Añadir producto…"
          className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-cyan-400"
        />
        <button onClick={add} className="bg-cyan-400 text-black font-black px-5 rounded-2xl">
          +
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {items.map(i => (
          <div
            key={i.id}
            className={`flex items-center justify-between p-4 rounded-2xl border border-white/10 ${i.completed ? "opacity-40" : ""}`}
          >
            <button onClick={() => toggle(i.id)} className="text-left flex-1">
              <div className={`${senior ? "text-2xl" : "text-base"} font-semibold`}>
                {i.completed ? "✅ " : "⬜ "} {i.text}
              </div>
            </button>
            <button onClick={() => remove(i.id)} className="text-red-400 font-black px-3">X</button>
          </div>
        ))}
        {items.length === 0 && <p className="opacity-50 mt-4">No hay items.</p>}
      </div>
    </div>
  );
}
