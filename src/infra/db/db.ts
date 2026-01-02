import Dexie, { Table } from "dexie";
import { DB_NAME, DB_VERSION, STORES_V1 } from "./schema";
import type { Settings } from "@/domain/models/appState";
import type {
  Note,
  Expense,
  Contact,
  HealthEntry,
  Routine,
  ShoppingItem
} from "@/domain/models/entities";

export type SettingsRow = { key: "settings"; value: Settings };

export class LuminaDB extends Dexie {
  settings!: Table<SettingsRow, string>;
  notes!: Table<Note, string>;
  expenses!: Table<Expense, string>;
  contacts!: Table<Contact, string>;
  health!: Table<HealthEntry, string>;
  routines!: Table<Routine, string>;
  shopping!: Table<ShoppingItem, string>;

  constructor() {
    super(DB_NAME);
    this.version(DB_VERSION).stores(STORES_V1);
  }
}

export const db = new LuminaDB();
