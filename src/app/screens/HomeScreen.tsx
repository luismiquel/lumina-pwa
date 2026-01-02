import { useRef, useState } from "react";
import { useLuminaInit } from "@/app/hooks/useLuminaInit";
import { SettingsRepo } from "@/infra/db/repositories";
import { doBackup, doRestore } from "@/app/backupActions";

export default function HomeScreen() {
  const { settings, setSettings } = useLuminaInit();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState<"backup" | "restore" | null>(null);

  if (!settings) {
    return <div className="glass rounded-3xl p-6 border border-white/10">Cargando búnker…</div>;
  }

  const toggleSenior = async () => {
    const next = { ...settings, seniorMode: !settings.seniorMode };
    setSettings(next);
    await SettingsRepo.set(next);
  };

  const onBackup = async () => {
    setBusy("backup");
    try {
      await doBackup();
      const s = await SettingsRepo.get();
      if (s) setSettings(s);
      alert("✅ Backup descargado.");
    } catch (e: any) {
      alert(e?.message ?? "Backup fallido.");
    } finally {
      setBusy(null);
    }
  };

  const onPickRestore = () => fileRef.current?.click();

  const onRestoreFile = async (file: File) => {
    setBusy("restore");
    try {
      await doRestore(file);
      const s = await SettingsRepo.get();
      if (s) setSettings(s);
      alert("✅ Búnker restaurado (IndexedDB).");
    } catch (e: any) {
      alert(e?.message ?? "Restore fallido.");
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="glass rounded-3xl p-8 w-full border border-white/10">
      <h1 className="text-3xl font-black tracking-tight">
        LUMINA <span className="text-[#00f2ff]">LOCAL</span>
      </h1>

      <p className="mt-3 opacity-70">Offline · Sin IA · Sin APIs de pago</p>

      <button
        onClick={toggleSenior}
        className="mt-6 w-full bg-white/10 hover:bg-white/15 border border-white/10 font-black py-3 rounded-2xl transition disabled:opacity-60"
        disabled={busy !== null}
      >
        Modo Senior: {settings.seniorMode ? "ON" : "OFF"}
      </button>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          onClick={onBackup}
          className="w-full bg-[#00f2ff] text-black font-black py-3 rounded-2xl hover:opacity-90 active:scale-[0.99] transition disabled:opacity-60"
          disabled={busy !== null}
        >
          {busy === "backup" ? "BACKUP..." : "BACKUP"}
        </button>

        <button
          onClick={onPickRestore}
          className="w-full bg-white/10 hover:bg-white/15 border border-white/10 font-black py-3 rounded-2xl transition disabled:opacity-60"
          disabled={busy !== null}
        >
          {busy === "restore" ? "RESTORE..." : "RESTORE"}
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onRestoreFile(f);
          }}
        />
      </div>

      <p className="mt-4 text-xs opacity-40">
        Settings persistidos en IndexedDB (Dexie).
        {settings.lastBackup ? ` Último backup: ${new Date(settings.lastBackup).toLocaleString()}` : ""}
      </p>
    </div>
  );
}
