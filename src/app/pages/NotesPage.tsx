import { shareText } from "@/app/utils/share";
import { confirmDanger, confirmDoubleDanger } from "@/app/utils/confirm";
import { focusByLuminaId } from "@/app/nav/focusHelpers";
import { consumeNavTarget } from "@/app/nav/navTarget";
import { useEffect, useState } from "react";
import { Card } from "@/app/components/Card";
import { NotesRepo } from "@/infra/db/repos";
import type { Note } from "@/domain/models/entities";

export function NotesPage(props: { senior?: boolean }) {
  const { senior } = props;
  const [items, setItems] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

    const refresh = async () => {
    const data = await NotesRepo.list();
    setItems(data as any);
    const t = consumeNavTarget();
    if (t?.kind === "NOTE") {
      requestAnimationFrame(() => { focusByLuminaId(t.id); });
    }
  };

  useEffect(() => { refresh(); }, []);

  const add = async () => {
    if (!title.trim() && !content.trim()) return;
    const t = tags.split(",").map(s => s.trim()).filter(Boolean);
    await NotesRepo.add(title || "Sin título", content, t);
    setTitle(""); setContent(""); setTags("");
    await refresh();
  };

  const del = async (id: string) => {
          if (!confirmDanger("¿Borrar esta nota?")) return;
      await NotesRepo.remove(id);await refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      <Card title="Notas">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Título"
          className={["w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-[#00f2ff]",
            senior ? "text-xl" : "text-sm"].join(" ")}
        />
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Contenido"
          className={["mt-3 w-full bg-white/5 border border-white/10 rounded-2xl p-4 h-32 resize-none focus:outline-none focus:border-[#00f2ff]",
            senior ? "text-xl" : "text-sm"].join(" ")}
        />
        <input
          value={tags}
          onChange={e => setTags(e.target.value)}
          placeholder="Tags (coma)"
          className={["mt-3 w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-[#00f2ff]",
            senior ? "text-xl" : "text-sm"].join(" ")}
        />
        <button onClick={add} className="mt-4 w-full bg-[#00f2ff] text-black font-black py-3 rounded-2xl">
          Guardar
        </button>
      </Card>

      <div className="space-y-3">
        {items.map(n => (
          <div key={n.id} data-lumina-id={n.id} className="glass border border-white/10 rounded-3xl p-5">
            <div className="flex justify-between gap-4">
              <div className="min-w-0">
                <p className={["font-black truncate", senior ? "text-2xl" : "text-base"].join(" ")}>{n.title}</p>
                <p className="mt-2 text-white/60 text-sm whitespace-pre-wrap">{n.content}</p>
                {n.tags.length > 0 && (
                  <p className="mt-2 text-xs text-white/40">#{n.tags.join("  #")}</p>
                )}
              </div>
              <button onClick={() => del(n.id)} className="text-red-400/70 hover:text-red-400 font-black">
                X
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-white/30">Sin notas</p>}
      </div>
    </div>
  );
}







