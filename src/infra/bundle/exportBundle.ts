import { zipSync, strToU8 } from "fflate";
import { exportBackup } from "@/infra/db/backup";
import { db } from "@/infra/db/db";
import { exportNotesCsv } from "@/infra/csv/notesCsv";
import { exportShoppingCsv } from "@/infra/csv/shoppingCsv";
import { buildICS } from "@/infra/calendar/ics";

function downloadBlob(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function buildExportZipBytes() {
  // 1) JSON backup (ya existente)
  const backup = await exportBackup();

  // 2) CSV notes/shopping desde DB (evita depender del estado UI)
  const notes = await db.notes.toArray();
  const shopping = await db.shopping.toArray();

  const notesCsv = exportNotesCsv(notes as any);
  const shoppingCsv = exportShoppingCsv(shopping as any);

  // 3) ICS citas desde DB + builder
  const appointments = await db.appointments.orderBy("dateTimeISO").toArray();
  const ics = buildICS("Lumina Local", appointments as any);

  // 4) ZIP
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  const zip = zipSync(
    {
      "backup.json": strToU8(JSON.stringify(backup, null, 2)),
      "notes.csv": strToU8(notesCsv),
      "shopping.csv": strToU8(shoppingCsv),
      "appointments.ics": strToU8(ics),
      "README.txt": strToU8(
        [
          "LUMINA LOCAL - Export completo",
          "",
          "Contenido:",
          "- backup.json: backup Dexie/Lumina",
          "- notes.csv: notas",
          "- shopping.csv: compras",
          "- appointments.ics: citas calendario",
          "",
          "Todo local, sin IA, sin APIs."
        ].join("\n")
      ),
    },
    { level: 9 }
  );

    const zipArray = zip instanceof Uint8Array ? zip : new Uint8Array(zip as any);
  const zipBuf = zipArray.buffer.slice(zipArray.byteOffset, zipArray.byteOffset + zipArray.byteLength);
  return { zip, stamp };}



export async function exportAllAsZip() {
  const { zip, stamp } = await buildExportZipBytes();
  const zipArray = zip instanceof Uint8Array ? zip : new Uint8Array(zip as any);
  const zipBuf = zipArray.buffer.slice(zipArray.byteOffset, zipArray.byteOffset + zipArray.byteLength);
  const blob = new Blob([zipBuf], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lumina_export_${stamp}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
