import { unzipSync, strFromU8 } from "fflate";
import { importBackup, type BackupV1 } from "@/infra/db/backup";
import { confirmDoubleDanger, confirmDanger } from "@/app/utils/confirm";
import { db } from "@/infra/db/db";
import { importNotesCsv } from "@/infra/csv/notesCsv";
import { importShoppingCsv } from "@/infra/csv/shoppingCsv";
import { parseIcsToAppointments } from "@/infra/calendar/icsImport";

function pickText(files: Record<string, Uint8Array>, name: string) {
  const key = Object.keys(files).find((k) => k.toLowerCase().endsWith(name.toLowerCase()));
  if (!key) return null;
  const v = (files as any)[key]; if (!v) return null; return strFromU8(v);
}

export async function importAllFromZipBytes(zipBytes: Uint8Array, readOnly: boolean) {
  if (readOnly) {
    alert("Modo solo lectura. Desactívalo para importar.");
    return;
  }

  const ok1 = confirmDanger("Vas a IMPORTAR un ZIP y modificar tus datos locales.\n\n¿Continuar?");
  if (!ok1) return;

  const ok2 = confirmDoubleDanger(
    "IMPORTACIÓN",
    "Esto puede REEMPLAZAR tus datos locales.\n\nHaz backup antes si lo necesitas.\n\n¿Confirmar importación?"
  );
  if (!ok2) return;

  const files = unzipSync(zipBytes);

  // 1) Si hay backup.json, es la vía principal (replace total)
  const backupTxt = pickText(files as any, "backup.json");
  if (backupTxt) {
    const data = JSON.parse(backupTxt) as BackupV1;
    await importBackup(data);
    alert("Import ZIP: restaurado desde backup.json.");
    location.reload();
    return;
  }

  // 2) Fallback: import parciales (merge)
  //    NOTA: esto no borra lo existente; añade/actualiza
  const notesCsv = pickText(files as any, "notes.csv");
  const shoppingCsv = pickText(files as any, "shopping.csv");
  const icsTxt = pickText(files as any, "appointments.ics");

  await db.transaction("rw", db.notes, db.shopping, db.appointments, async () => {
    if (notesCsv) {
      const rows = importNotesCsv(notesCsv);
      if (rows.length) await db.notes.bulkPut(rows as any);
    }
    if (shoppingCsv) {
      const rows = importShoppingCsv(shoppingCsv);
      if (rows.length) await db.shopping.bulkPut(rows as any);
    }
    if (icsTxt) {
      const ap = parseIcsToAppointments(icsTxt);
      if (ap.length) await db.appointments.bulkPut(ap as any);
    }
  });

  alert("Import ZIP: importación parcial (merge) completada.");
  location.reload();
}



export async function importAllFromZip(file: File, readOnly: boolean) {
  const u8 = new Uint8Array(await file.arrayBuffer());
  return importAllFromZipBytes(u8, readOnly);
}
