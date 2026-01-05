import Dexie, { type Table } from "dexie";
import type { Settings } from "@/domain/models/appState";

// Ajusta estos imports si en tu proyecto están en otra ruta
import type { Note, ShoppingItem, Appointment } from "@/domain/models/entities";

type DbKeyValueRow<T> = { key: string; value: T };

export class LuminaDB extends Dexie {
  settings!: Table<DbKeyValueRow<Settings>, string>;
  notes!: Table<(Note & { id: string }), string>;
  appointments!: Table<(Appointment & { id: string }), string>;
  shopping!: Table<(ShoppingItem & { id: string }), string>;

  constructor() {
    super("lumina-db");

    // v1
    this.version(1).stores({
      settings: "key",
      notes: "id",
    });

    // v2: tablas nuevas
    this.version(2).stores({
      settings: "key",
      notes: "id",
      appointments: "id,dateTimeISO,createdAt",
      shopping: "id,completed,createdAt",
    });
  }
}

export const db = new LuminaDB();

/**
 * Open DB safely. If the IndexedDB is corrupted or the schema is incompatible,
 * offer a one-click repair (delete local DB).
 */
export async function openDbSafe(
  opts?: { autoRepair?: boolean }
): Promise<{ ok: boolean; repaired?: boolean; error?: unknown }> {
  try {
    await db.open();
    return { ok: true };
  } catch (e) {
    console.error("Dexie open failed:", e);

    const auto = !!opts?.autoRepair;

    let doRepair = auto;
    if (!auto) {
      try {
        doRepair = confirm(
          "La base de datos local está dañada o es incompatible.\n\n¿Reparar borrando SOLO los datos locales de esta app?"
        );
      } catch {
        doRepair = false;
      }
    }

    if (!doRepair) return { ok: false, error: e };

    try {
      await Dexie.delete("lumina-db");
      await db.open();
      return { ok: true, repaired: true };
    } catch (e2) {
      console.error("Dexie repair failed:", e2);
      return { ok: false, error: e2, repaired: false };
    }
  }
}




