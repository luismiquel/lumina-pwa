import { db } from "./db";
import type { Settings } from "@/domain/models/appState";
import type { Note, Expense, Contact, HealthEntry, Routine, ShoppingItem } from "@/domain/models/entities";

export interface BackupV1 {
  schema: 1;
  exportedAt: number;
  settings: Settings | null;
  notes: Note[];
  expenses: Expense[];
  contacts: Contact[];
  health: HealthEntry[];
  routines: Routine[];
  shopping: ShoppingItem[];
}

export async function exportBackup(): Promise<BackupV1> {
  const [settingsRow, notes, expenses, contacts, health, routines, shopping] = await Promise.all([
    db.settings.get("settings"),
    db.notes.toArray(),
    db.expenses.toArray(),
    db.contacts.toArray(),
    db.health.toArray(),
    db.routines.toArray(),
    db.shopping.toArray()
  ]);

  return {
    schema: 1,
    exportedAt: Date.now(),
    settings: settingsRow?.value ?? null,
    notes,
    expenses,
    contacts,
    health,
    routines,
    shopping
  };
}

export async function importBackup(data: BackupV1): Promise<void> {
  if (!data || data.schema !== 1) throw new Error("Backup inválido o schema no soportado.");

  const tables = [
    db.settings,
    db.notes,
    db.expenses,
    db.contacts,
    db.health,
    db.routines,
    db.shopping
  ] as const;

  await db.transaction("rw", tables, async () => {
    await Promise.all([
      db.settings.clear(),
      db.notes.clear(),
      db.expenses.clear(),
      db.contacts.clear(),
      db.health.clear(),
      db.routines.clear(),
      db.shopping.clear()
    ]);

    if (data.settings) await db.settings.put({ key: "settings", value: data.settings });

    if (data.notes?.length) await db.notes.bulkAdd(data.notes);
    if (data.expenses?.length) await db.expenses.bulkAdd(data.expenses);
    if (data.contacts?.length) await db.contacts.bulkAdd(data.contacts);
    if (data.health?.length) await db.health.bulkAdd(data.health);
    if (data.routines?.length) await db.routines.bulkAdd(data.routines);
    if (data.shopping?.length) await db.shopping.bulkAdd(data.shopping);
  });
}
