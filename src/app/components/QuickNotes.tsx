import { useEffect, useState } from "react";

export const NOTES_KEY = "lumina_quick_notes_v1";

/**
 * Añade texto a las Notas rápidas (append).
 * Se usa desde Dictado u otras partes de la app.
 */
export function appendToNotes(text: string) {
  try {
    const prev = localStorage.getItem(NOTES_KEY) ?? "";
    const next =
      prev.trim().length === 0
        ? text
        : prev.trimEnd() + "\n\n" + text;
    localStorage.setItem(NOTES_KEY, next);
  } catch {
    // silencioso
  }
}

export default function QuickNotes({ senior }: { senior: boolean }) {
  const [value, setValue] = useState("");

  // Cargar al iniciar
  useEffect(() => {
    try {
      const saved = localStorage.getItem(NOTES_KEY);
      if (saved !== null) setValue(saved);
    } catch {}
  }, []);

  // Guardar automáticamente
  useEffect(() => {
    try {
      localStorage.setItem(NOTES_KEY, value);
    } catch {}
  }, [value]);

  return (
    <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className={"font-bold " + (senior ? "text-xl" : "text-lg")}>
          Notas rápidas
        </h2>
        <span className="text-xs opacity-50">Guardado automático</span>
      </div>

      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Escribe o dicta aquí…"
        rows={senior ? 8 : 6}
        className={
          "w-full rounded-xl p-3 bg-black/40 border border-white/10 resize-none outline-none " +
          (senior ? "text-lg" : "text-sm")
        }
      />
    </section>
  );
}
