import { db } from "./db";
import type { Settings } from "@/domain/models/appState";
import type { Note, ShoppingItem, Appointment } from "@/domain/models/entities";

export interface BackupV1 {
  schema: 1;
  exportedAt: number;
  settings: Settings | null;
  notes: Note[];
  shopping: ShoppingItem[];
  appointments: Appointment[];
}

export async function exportBackup(): Promise<BackupV1> {
  const [settingsRow, notes, shopping, appointments] = await Promise.all([
    db.settings.get("settings"),
    db.notes.toArray(),
    db.shopping.toArray(),
    db.appointments.toArray()
  ]);

  return {
    schema: 1,
    exportedAt: Date.now(),
    settings: settingsRow?.value ?? null,
    notes,
    shopping,
    appointments
  };
}

export async function importBackup(data: BackupV1): Promise<void> {
  if (!data || data.schema !== 1) throw new Error("Backup inválido o schema no soportado.");

  await db.transaction("rw", db.settings, db.notes, db.shopping, db.appointments, async () => {
    await Promise.all([
      db.settings.clear(),
      db.notes.clear(),
      db.shopping.clear(),
      db.appointments.clear()
    ]);

    if (data.settings) await db.settings.put({ key: "settings", value: data.settings });

    if (data.notes?.length) await db.notes.bulkAdd(data.notes);
    if (data.shopping?.length) await db.shopping.bulkAdd(data.shopping);
    if (data.appointments?.length) await db.appointments.bulkAdd(data.appointments);
  });
}
