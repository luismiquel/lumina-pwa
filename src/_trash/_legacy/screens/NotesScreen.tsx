import { useEffect, useState } from "react";
import { NotesRepo } from "@/infra/db/repositories";
import type { Note } from "@/domain/models/entities";

export default function NotesScreen() {
  const [items, setItems] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  async function refresh() {
    setItems(await NotesRepo.list());
  }

  useEffect(() => {
    refresh();
  }, []);

  const add = async () => {
    if (!title.trim() && !content.trim()) return;
    await NotesRepo.add({ title: title.trim() || "Sin título", content: content.trim() });
    setTitle("");
    setContent("");
    await refresh();
  };

  const remove = async (id: string) => {
    await NotesRepo.remove(id);
    await refresh();
  };

  return (
    <div className="glass rounded-3xl p-6 border border-white/10">
      <h2 className="text-xl font-black">Notas</h2>

      <div className="mt-4 grid gap-3">
        <input
          className="bg-white/5 border border-white/10 rounded-2xl p-3 outline-none"
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="bg-white/5 border border-white/10 rounded-2xl p-3 outline-none min-h-[120px]"
          placeholder="Contenido"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button
          onClick={add}
          className="bg-[#00f2ff] text-black font-black py-3 rounded-2xl hover:opacity-90 active:scale-[0.99] transition"
        >
          GUARDAR NOTA
        </button>
      </div>

      <div className="mt-6 grid gap-3">
        {items.length === 0 && <p className="opacity-40 text-sm">Aún no hay notas.</p>}
        {items.map((n) => (
          <div key={n.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black">{n.title}</p>
                <p className="opacity-70 text-sm whitespace-pre-wrap mt-1">{n.content}</p>
                <p className="opacity-30 text-xs mt-2">
                  {new Date(n.updatedAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => remove(n.id)}
                className="text-red-400/80 hover:text-red-300 font-black"
              >
                X
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
