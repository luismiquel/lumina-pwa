import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Plus, Trash2 } from "lucide-react";
import { ShoppingRepo } from "@/infra/db/repositories";
import type { ShoppingItem } from "@/domain/models/entities";

export default function Shopping(props: { senior: boolean }) {
  const { senior } = props;
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
    <div className="space-y-4">
      <div className="glass rounded-3xl p-6 border border-white/10">
        <h2 className={"font-black " + (senior ? "text-3xl" : "text-xl")}>Lista de la compra</h2>
        <div className="flex gap-2 mt-4">
          <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==="Enter" && add()}
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 outline-none"
            placeholder="Añadir artículo…" />
          <button onClick={add} className="bg-[#00f2ff] text-black font-black rounded-2xl px-5">
            <Plus/>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {items.map(i => (
          <div key={i.id} className={"glass rounded-2xl p-4 border border-white/10 flex items-center justify-between " + (i.completed ? "opacity-50" : "")}>
            <button onClick={()=>toggle(i.id)} className="flex items-center gap-3 text-left">
              {i.completed ? <CheckCircle2 className="text-[#00f2ff]"/> : <Circle className="opacity-30"/>}
              <span className={senior ? "text-2xl" : "text-base"}>{i.text}</span>
            </button>
            <button onClick={()=>remove(i.id)} className="opacity-60 hover:opacity-100">
              <Trash2 className="text-red-400"/>
            </button>
          </div>
        ))}
        {items.length===0 && <p className="opacity-40 text-center py-6">Inventario completo.</p>}
      </div>
    </div>
  );
}
