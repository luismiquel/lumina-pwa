import Dexie, { Table } from "dexie";
import { DB_NAME, DB_VERSION, STORES_V1 } from "./schema";
import type { Settings } from "@/domain/models/appState";
import type { Note, ShoppingItem, Appointment } from "@/domain/models/entities";

export type SettingsRow = { key: "settings"; value: Settings };

export class LuminaDB extends Dexie {
  settings!: Table<SettingsRow, string>;
  notes!: Table<Note, string>;
  shopping!: Table<ShoppingItem, string>;
  appointments!: Table<Appointment, string>;

  constructor() {
    super(DB_NAME);
    this.version(DB_VERSION).stores(STORES_V1);
  }
}

export const db = new LuminaDB();
