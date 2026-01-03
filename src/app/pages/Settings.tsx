import { useMemo, useState } from "react";
import { Download, Upload } from "lucide-react";
import { exportBackup, importBackup, type BackupV1 } from "@/infra/db/backup";
import { useSettings } from "@/app/hooks/useSettings";

function downloadJson(name: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function Settings() {
  const { settings, update } = useSettings();
  const [busy, setBusy] = useState(false);

  const last = useMemo(() => settings?.lastBackup ? new Date(settings.lastBackup).toLocaleString() : "nunca", [settings]);

  const backup = async () => {
    setBusy(true);
    try {
      const data = await exportBackup();
      downloadJson(`lumina_backup_${new Date().toISOString().slice(0,10)}.json`, data);
      await update({ lastBackup: Date.now() });
    } finally { setBusy(false); }
  };

  const restore = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      const txt = await file.text();
      const data = JSON.parse(txt) as BackupV1;
      await importBackup(data);
      alert("Restaurado OK.");
      location.reload();
    } catch (e: any) {
      alert(e?.message ?? "Restore falló.");
    } finally { setBusy(false); }
  };

  if (!settings) return null;

  return (
    <div className="glass rounded-3xl p-6 border border-white/10 space-y-4">
      <h2 className="font-black text-xl">Configuración</h2>

      <button
        onClick={() => update({ seniorMode: !settings.seniorMode })}
        className="w-full bg-white/10 hover:bg-white/15 border border-white/10 font-black rounded-2xl py-4"
      >
        Modo Senior: {settings.seniorMode ? "ON" : "OFF"}
      </button>

      <div className="grid grid-cols-2 gap-2">
        <button disabled={busy} onClick={backup} className="bg-[#00f2ff] text-black font-black rounded-2xl py-4 inline-flex items-center justify-center gap-2 disabled:opacity-30">
          <Download/> BACKUP
        </button>

        <label className="bg-purple-500 text-black font-black rounded-2xl py-4 inline-flex items-center justify-center gap-2 cursor-pointer">
          <Upload/> RESTORE
          <input type="file" accept=".json,application/json" className="hidden" onChange={(e)=>restore(e.target.files?.[0])} />
        </label>
      </div>

      <p className="text-xs opacity-50">Último backup: {last}</p>
    </div>
  );
}
