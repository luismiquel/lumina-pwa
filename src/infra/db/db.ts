import Dexie, { type Table } from "dexie";
import type { Settings } from "@/domain/models/settings";
import type { Note, ShoppingItem, Appointment } from "@/domain/models/entities";

/**
 * La app existente (backup.ts / repositories.ts) espera:
 * - settings como { key, value }
 * - appointments como Appointment (con dateTimeISO para orderBy)
 */

export type DbKeyValueRow<T> = {
  key: string;
  value: T;
};

export class LuminaDB extends Dexie {
  settings!: Table<DbKeyValueRow<Settings>, string>;
  notes!: Table<Note & { id: string }, string>;
  shopping!: Table<ShoppingItem & { id: string }, string>;
  appointments!: Table<Appointment, string>;

  constructor() {
    super("lumina-db");

    this.version(1).stores({
      settings: "key",
      notes: "id",
      shopping: "id",
      // primary key id + índice dateTimeISO (lo usa repositories.ts)
      appointments: "id,dateTimeISO",
    });
  
    // v2: añadimos tablas nuevas (upgrade automático)
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
 *
 * IMPORTANT: This is local-only (no network, no permissions).
 */
export async function openDbSafe(opts?: { autoRepair?: boolean }): Promise<{ ok: boolean; repaired?: boolean; error?: unknown }> {
  try {
    await db.open();
    return { ok: true };
  } catch (e) {
    // Dexie can throw DexieError (e.g. VersionError, DatabaseClosedError, etc.)
    console.error("Dexie open failed:", e);

    const auto = !!opts?.autoRepair;

    let doRepair = auto;
    if (!auto) {
      try {
        doRepair = confirm("La base de datos local está dañada o es incompatible.\n\n¿Reparar borrando SOLO los datos locales de esta app?");
      } catch {
        doRepair = false;
      }
    }

    if (!doRepair) {
      // Let the app continue (some screens may not work until repaired).
      return { ok: false, error: e };
    }

    // Attempt repair: delete DB by name
    try {
      const dbName = (db as any).name || "LuminaDB";
      await Dexie.delete(dbName);
      // Re-open a fresh DB
      await db.open();
      return { ok: true, repaired: true };
    } catch (e2) {
      console.error("Dexie repair failed:", e2);
      return { ok: false, error: e2, repaired: false };
    }
  }
}



