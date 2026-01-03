function downloadTextFile(name: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
import { exportNotesCsv, importNotesCsv } from "@/infra/csv/notesCsv";
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
  

  const exportCsv = async () => {
    const repo: any = NotesRepo as any;
    const list: any[] = await repo.list();
    const csv = exportNotesCsv(list as any);
    const name = `lumina_notes_${new Date().toISOString().slice(0,10)}.csv`;
    downloadTextFile(name, csv, "text/csv;charset=utf-8");
  };

  const importCsv = async (file?: File) => {
    if (!file) return;
    const ok = confirmDanger(
      "Vas a IMPORTAR un CSV y AÑADIR notas.\n\nNo borra lo existente.\n\n¿Continuar?"
    );
    if (!ok) return;

    const txt = await file.text();
    const rows = importNotesCsv(txt);

    if (!rows.length) {
      alert("CSV vacío o inválido.");
      return;
    }

    const repo: any = NotesRepo as any;

    for (const r of rows) {
      const title = String(r.title ?? "Sin título");
      const content = String(r.content ?? "");
      const tags = Array.isArray(r.tags) ? r.tags : [];

      // Preferimos add(title, content, tags)
      if (typeof repo.add === "function") {
        await repo.add(title, content, tags);
        continue;
      }

      // Fallback a upsert/put/save si existen
      const note = {
        id: crypto.randomUUID(),
        title,
        content,
        tags,
        createdAt: Number(r.createdAt) || Date.now(),
        updatedAt: Date.now(),
      };

      if (typeof repo.upsert === "function") {
        await repo.upsert(note);
      } else if (typeof repo.put === "function") {
        await repo.put(note);
      } else if (typeof repo.save === "function") {
        await repo.save(note);
      } else {
        alert("Tu repositorio de notas no expone add/upsert/put/save.");
        break;
      }
    }

    alert(`Importado: ${rows.length} filas (se añadieron las válidas).`);
    await refresh();
  };const [title, setTitle] = useState("");
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








