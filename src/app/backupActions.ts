import { exportBackup, importBackup, type BackupV1 } from "@/infra/db/backup";
import { downloadJson, readJsonFile } from "@/shared/fileIO";
import { SettingsRepo } from "@/infra/db/repositories";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export async function doBackup() {
  const backup = await exportBackup();
  const name = `lumina_backup_${today()}.json`;
  downloadJson(name, backup);

  const s = await SettingsRepo.get();
  if (s) await SettingsRepo.set({ ...s, lastBackup: Date.now() });
}

export async function doRestore(file: File) {
  const data = await readJsonFile<BackupV1>(file);
  await importBackup(data);
}
