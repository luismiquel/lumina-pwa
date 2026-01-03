import { useEffect, useState } from "react";
import { ShoppingRepo } from "@/infra/db/repositories";
import type { ShoppingItem } from "@/domain/models/entities";

export default function ShoppingScreen() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [text, setText] = useState("");

  async function refresh() {
    setItems(await ShoppingRepo.list());
  }

  useEffect(() => {
    refresh();
  }, []);

  const add = async () => {
    if (!text.trim()) return;
    await ShoppingRepo.add(text.trim());
    setText("");
    await refresh();
  };

  const toggle = async (id: string) => {
    await ShoppingRepo.toggle(id);
    await refresh();
  };

  const remove = async (id: string) => {
    await ShoppingRepo.remove(id);
    await refresh();
  };

  return (
    <div className="glass rounded-3xl p-6 border border-white/10">
      <h2 className="text-xl font-black">Lista</h2>

      <div className="mt-4 flex gap-2">
        <input
          className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-3 outline-none"
          placeholder="Añadir item…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <button
          onClick={add}
          className="bg-[#00f2ff] text-black font-black px-5 rounded-2xl hover:opacity-90 active:scale-[0.99] transition"
        >
          +
        </button>
      </div>

      <div className="mt-6 grid gap-2">
        {items.length === 0 && <p className="opacity-40 text-sm">Lista vacía.</p>}
        {items.map((it) => (
          <div
            key={it.id}
            className={`flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-3 ${
              it.completed ? "opacity-40" : ""
            }`}
          >
            <button onClick={() => toggle(it.id)} className="flex-1 text-left">
              <span className={`font-bold ${it.completed ? "line-through" : ""}`}>{it.text}</span>
            </button>
            <button onClick={() => remove(it.id)} className="text-red-400/80 hover:text-red-300 font-black px-2">
              X
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
