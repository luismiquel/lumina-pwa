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
  }
}

export const db = new LuminaDB();
