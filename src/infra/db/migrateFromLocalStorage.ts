import { db } from "@/infra/db/db";

const FLAG_KEY = "lumina:migrated-to-idb:v2";

// Claves antiguas (localStorage)
const SETTINGS_KEY = "lumina:settings:v1";
const NOTES_KEY = "lumina:notes:v1";
const SHOPPING_KEY = "lumina:shopping:v1";
const APPOINTMENTS_KEY = "lumina:appointments:v1";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

export async function migrateFromLocalStorageIfNeeded() {
  try {
    if (localStorage.getItem(FLAG_KEY) === "1") return;

    const settingsRaw = localStorage.getItem(SETTINGS_KEY);
    const notesRaw = localStorage.getItem(NOTES_KEY);
    const shoppingRaw = localStorage.getItem(SHOPPING_KEY);
    const apRaw = localStorage.getItem(APPOINTMENTS_KEY);

    const settings = safeParse<any>(settingsRaw, null);
    const notes = safeParse<any[]>(notesRaw, []);
    const shopping = safeParse<any[]>(shoppingRaw, []);
    const appointments = safeParse<any[]>(apRaw, []);

    await db.transaction("rw", db.settings, db.notes, db.shopping, db.appointments, async () => {
      // SETTINGS key/value
      if (settings && typeof settings === "object") {
        await db.settings.put({ key: "settings", value: settings });
      }

      if (Array.isArray(notes) && notes.length) {
        const normalized = notes
          .filter((n) => n && n.id)
          .map((n) => ({ ...n, id: String(n.id) }));
        if (normalized.length) await db.notes.bulkPut(normalized as any);
      }

      if (Array.isArray(shopping) && shopping.length) {
        const normalized = shopping
          .filter((i) => i && i.id)
          .map((i) => ({ ...i, id: String(i.id) }));
        if (normalized.length) await db.shopping.bulkPut(normalized as any);
      }

      // APPOINTMENTS best-effort: garantiza campos mínimos esperados por dominio
      if (Array.isArray(appointments) && appointments.length) {
        const normalized = appointments
          .filter((a) => a && (a.id || a.dateTimeISO || a.date))
          .map((a, idx) => {
            const id = String(a.id ?? `${Date.now()}-${idx}`);
            const dateTimeISO = String(a.dateTimeISO ?? a.dateTime ?? a.date ?? new Date().toISOString());
            const title = String(a.title ?? a.name ?? a.text ?? "Cita");
            const createdAt = typeof a.createdAt === "number" ? a.createdAt : Date.now();

            return { ...a, id, dateTimeISO, title, createdAt };
          });

        if (normalized.length) await db.appointments.bulkPut(normalized as any);
      }
    });

    localStorage.setItem(FLAG_KEY, "1");
  } catch {
    // best-effort: no romper la app
  }
}
