import { useEffect, useState } from "react";
import { Card } from "@/app/components/Card";
import { ShoppingRepo } from "@/infra/db/repos";
import type { ShoppingItem } from "@/domain/models/entities";

export function ShoppingPage(props: { senior?: boolean }) {
  const { senior } = props;
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [text, setText] = useState("");

  const refresh = async () => setItems(await ShoppingRepo.list());
  useEffect(() => { refresh(); }, []);

  const add = async () => {
    if (!text.trim()) return;
    await ShoppingRepo.add(text);
    setText("");
    await refresh();
  };

  const toggle = async (id: string) => { await ShoppingRepo.toggle(id); await refresh(); };
  const del = async (id: string) => { await ShoppingRepo.remove(id); await refresh(); };

  return (
    <div className="flex flex-col gap-6">
      <Card title="Suministros">
        <div className="flex gap-3">
          <input value={text} onChange={e => setText(e.target.value)} placeholder="¿Qué falta?"
            className={["flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-[#00f2ff]",
              senior ? "text-xl" : "text-sm"].join(" ")} />
          <button onClick={add} className="bg-[#00f2ff] text-black font-black px-6 rounded-2xl">+</button>
        </div>
      </Card>

      <div className="space-y-3">
        {items.map(i => (
          <div key={i.id} className={["glass border rounded-3xl p-5 flex justify-between items-center cursor-pointer",
            i.completed ? "border-white/5 opacity-40" : "border-white/10 hover:border-[#00f2ff]/30"].join(" ")}
            onClick={() => toggle(i.id)}
          >
            <span className={["font-black", senior ? "text-2xl" : "text-base", i.completed ? "line-through" : ""].join(" ")}>
              {i.text}
            </span>
            <button onClick={(e) => { e.stopPropagation(); del(i.id); }} className="text-red-400/70 hover:text-red-400 font-black">
              X
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-white/30">Inventario completo</p>}
      </div>
    </div>
  );
}
