import { useEffect, useState } from "react";

const KEY = "lumina_quick_notes_v1";

export default function QuickNotes({ senior }: { senior: boolean }) {
  const [text, setText] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) setText(saved);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, text);
    } catch {}
  }, [text]);

  return (
    <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className={"font-bold " + (senior ? "text-xl" : "text-lg")}>
          Notas rápidas
        </h2>
        <span className="text-xs opacity-50">Guardado automático</span>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Escribe aquí cualquier cosa…"
        rows={senior ? 8 : 6}
        className={
          "w-full rounded-xl p-3 bg-black/40 border border-white/10 resize-none outline-none " +
          (senior ? "text-lg" : "text-sm")
        }
      />
    </section>
  );
}
