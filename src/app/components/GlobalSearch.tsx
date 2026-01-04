import type { View } from "@/app/nav";
import { setNavTarget } from "@/app/nav/navTarget";
import { useEffect, useMemo, useState } from "react";
import { Search, FileText, ShoppingCart, CalendarDays, X } from "lucide-react";
import { db } from "@/infra/db/db";
import type { Note, ShoppingItem, Appointment } from "@/domain/models/entities";


type Result =
  | { kind: "NOTE"; id: string; title: string; subtitle: string }
  | { kind: "SHOPPING"; id: string; title: string; subtitle: string }
  | { kind: "APPOINTMENT"; id: string; title: string; subtitle: string };

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function clip(s: string, n: number) {
  const t = s.trim();
  if (t.length <= n) return t;
  return t.slice(0, n - 1) + "…";
}

export default function GlobalSearch(props: { senior: boolean; onGo: (v: View) => void }) {
  const { senior, onGo } = props;

  const [q, setQ] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [shopping, setShopping] = useState<ShoppingItem[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  // Carga datasets (local) una vez; si quieres live updates, lo hacemos luego.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [n, s, a] = await Promise.all([
          db.notes.toArray(),
          db.shopping.toArray(),
          db.appointments.orderBy("dateTimeISO").toArray(),
        ]);
        if (cancelled) return;
        setNotes(n as any);
        setShopping(s as any);
        setAppointments(a as any);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const results = useMemo<Result[]>(() => {
    const query = normalize(q);
    if (!query || query.length < 2) return [];

    const out: Result[] = [];

    // NOTES
    for (const n of notes) {
      const title = String((n as any).title ?? "Sin título");
      const content = String((n as any).content ?? "");
      const tags = Array.isArray((n as any).tags) ? (n as any).tags.join(" ") : "";
      const hay = normalize(`${title} ${content} ${tags}`);
      if (!hay.includes(query)) continue;

      out.push({
        kind: "NOTE",
        id: String((n as any).id),
        title: clip(title || "Sin título", 48),
        subtitle: clip(content || tags || "Nota", 70),
      });
    }

    // SHOPPING
    for (const it of shopping) {
      const text = String((it as any).text ?? "");
      const hay = normalize(text);
      if (!hay.includes(query)) continue;

      out.push({
        kind: "SHOPPING",
        id: String((it as any).id),
        title: clip(text || "Item", 52),
        subtitle: (it as any).completed ? "Completado" : "Pendiente",
      });
    }

    // APPOINTMENTS
    for (const ap of appointments) {
      const title = String((ap as any).title ?? "Cita");
      const when = String((ap as any).dateTimeISO ?? "");
      const hay = normalize(`${title} ${when}`);
      if (!hay.includes(query)) continue;

      const dateLabel = when ? new Date(when).toLocaleString() : "Sin fecha";
      out.push({
        kind: "APPOINTMENT",
        id: String((ap as any).id),
        title: clip(title, 52),
        subtitle: dateLabel,
      });
    }

    // límite por UX
    return out.slice(0, 25);
  }, [q, notes, shopping, appointments]);

    const go = (r: Result) => {
    if (r.kind === "NOTE") {
      setNavTarget({ kind: "NOTE", id: r.id, query: q });
      onGo("NOTES");
      return;
    }
    if (r.kind === "SHOPPING") {
      setNavTarget({ kind: "SHOPPING", id: r.id, query: q });
      onGo("SHOPPING");
      return;
    }
    setNavTarget({ kind: "APPOINTMENT", id: r.id, query: q });
    onGo("APPOINTMENTS");
  };

  return (
    <div className="space-y-3">
      <div className="glass rounded-3xl p-4 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="opacity-80">
            <Search size={22} />
          </div>

                    <span id="global-search-hint" style={{ position: "absolute", left: -9999 }}>
            Escribe al menos 2 caracteres para buscar en notas, compras y citas.
          </span>
<input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar en notas, compras y citas…" aria-label="Búsqueda global" role="searchbox" aria-describedby="global-search-hint" className={"w-full bg-transparent outline-none " + (senior ? "text-lg" : "text-base")}
            inputMode="search"
          />

          {q && (
            <button
              onClick={() => setQ("")}
              className="opacity-70 hover:opacity-100"
              aria-label="Limpiar búsqueda"
              title="Limpiar"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="mt-2 text-xs opacity-50">
          {loading ? "Cargando índice local…" : "Todo local · sin IA · sin APIs"}
        </div>
      </div>

      {q.length >= 2 && (
        <div className="glass rounded-3xl p-4 border border-white/10">
          <div className="text-xs opacity-60 mb-3">
            {results.length ? `${results.length} resultado(s)` : "Sin resultados"}
          </div>

          <div className="space-y-2">
            {results.map((r) => (
              <button
                key={r.kind + ":" + r.id}
                onClick={() => go(r)}
                className="w-full text-left rounded-2xl p-3 bg-white/5 hover:bg-white/10 border border-white/10 transition"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 opacity-80">
                    {r.kind === "NOTE" && <FileText size={18} />}
                    {r.kind === "SHOPPING" && <ShoppingCart size={18} />}
                    {r.kind === "APPOINTMENT" && <CalendarDays size={18} />}
                  </div>
                  <div className="flex-1">
                    <div className={"font-black " + (senior ? "text-lg" : "text-sm")}>{r.title}</div>
                    <div className={"opacity-70 " + (senior ? "text-base" : "text-xs")}>{r.subtitle}</div>
                  </div>
                  <div className="text-[10px] opacity-50 mt-1">
                    {r.kind === "NOTE" ? "Nota" : r.kind === "SHOPPING" ? "Compra" : "Cita"}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-3 text-[10px] opacity-50">
            Tip: escribe al menos 2 caracteres.
          </div>
        </div>
      )}
    </div>
  );
}





