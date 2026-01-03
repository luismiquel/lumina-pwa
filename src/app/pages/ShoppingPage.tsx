import { exportShoppingCsv, importShoppingCsv } from "@/infra/csv/shoppingCsv";
function downloadTextFile(name: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

import { confirmDanger, confirmDoubleDanger } from "@/app/utils/confirm";
import { focusByLuminaId } from "@/app/nav/focusHelpers";
import { consumeNavTarget } from "@/app/nav/navTarget";
import { useEffect, useState } from "react";
import { Card } from "@/app/components/Card";
import { ShoppingRepo } from "@/infra/db/repos";
import type { ShoppingItem } from "@/domain/models/entities";

export function ShoppingPage(props: { senior?: boolean }) {
  const { senior } = props;
  const [items, setItems] = useState<ShoppingItem[]>([]);
  

  const exportCsv = async () => {
    const repo: any = ShoppingRepo as any;
    const list: any[] = await repo.list();
    const csv = exportShoppingCsv(list as any);
    const name = `lumina_shopping_${new Date().toISOString().slice(0,10)}.csv`;
    downloadTextFile(name, csv, "text/csv;charset=utf-8");
  };

  const importCsv = async (file?: File) => {
    if (!file) return;
    const ok = confirmDanger(
      "Vas a IMPORTAR un CSV y AÑADIR elementos a tu lista.\n\nNo borra lo existente.\n\n¿Continuar?"
    );
    if (!ok) return;

    const txt = await file.text();
    const rows = importShoppingCsv(txt);

    if (!rows.length) {
      alert("CSV vacío o inválido.");
      return;
    }

    const repo: any = ShoppingRepo as any;

    // Inserta de forma compatible con distintos repos
    for (const r of rows) {
      const text = String(r.text ?? "").trim();
      if (!text) continue;

      // Preferimos add(text) si existe
      if (typeof repo.add === "function") {
        await repo.add(text);
        continue;
      }

      const item = {
        id: crypto.randomUUID(),
        text,
        completed: !!r.completed,
        createdAt: Number(r.createdAt) || Date.now(),
        updatedAt: Date.now(),
      };

      if (typeof repo.upsert === "function") {
        await repo.upsert(item);
      } else if (typeof repo.put === "function") {
        await repo.put(item);
      } else if (typeof repo.save === "function") {
        await repo.save(item);
      } else {
        // No hay método compatible: paramos para no “inventar”
        alert("Tu repositorio de compras no expone add/upsert/put/save.");
        break;
      }
    }

    alert(`Importado: ${rows.length} filas (se añadieron las válidas).`);
    await refresh();
  };const [text, setText] = useState("");

    const refresh = async () => {
    const data = await ShoppingRepo.list();
    setItems(data as any);
    const t = consumeNavTarget();
    if (t?.kind === "SHOPPING") {
      requestAnimationFrame(() => { focusByLuminaId(t.id); });
    }
  };
  useEffect(() => { refresh(); }, []);

  const add = async () => {
    if (!text.trim()) return;
    await ShoppingRepo.add(text);
    setText("");
    await refresh();
  };

  const toggle = async (id: string) => { await ShoppingRepo.toggle(id); await refresh(); };
  const del = async (id: string) => {       if (!confirmDanger("¿Borrar este elemento de la lista?")) return;
      await ShoppingRepo.remove(id);await refresh(); };

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
          <div key={i.id} data-lumina-id={i.id} className={["glass border rounded-3xl p-5 flex justify-between items-center cursor-pointer",
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








