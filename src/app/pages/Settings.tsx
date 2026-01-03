import PasswordModal from "@/app/components/PasswordModal";
import { importAllFromZipBytes } from "@/infra/bundle/importBundle";
import { decryptEncFile, encryptZipAndDownload } from "@/infra/crypto/zipCrypto";
import { buildExportZipBytes } from "@/infra/bundle/exportBundle";
import { importAllFromZip } from "@/infra/bundle/importBundle";
import { exportAllAsZip } from "@/infra/bundle/exportBundle";
import { clearAllCaches, deleteAllIndexedDb, getSwStatus, hardReload, unregisterAllServiceWorkers } from "@/app/utils/repair";
import { resetSWAndCaches } from "@/swRegister";
import { confirmDanger, confirmDoubleDanger } from "@/app/utils/confirm";
import { db } from "@/infra/db/db";
import { useEffect, useMemo, useState } from "react";
import { Download, Lock, Upload } from "lucide-react";
import { exportBackup, importBackup, type BackupV1 } from "@/infra/db/backup";
import { useSettings } from "@/app/hooks/useSettings";
import { decryptBackup, encryptBackup, isEncryptedBackup, type EncryptedBackupV1 } from "@/infra/crypto/backupCrypto";

function downloadJson(name: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

export default function Settings() {
  const { settings, update } = useSettings();
  const [busy, setBusy] = useState(false);

  

  
  
  
  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwdMode, setPwdMode] = useState<"EXPORT" | "IMPORT">("EXPORT");
  const [pendingEncFile, setPendingEncFile] = useState<File | null>(null);const readOnly = !!settings?.readOnlyMode;
const [swStatus, setSwStatus] = useState<{ supported: boolean; controlled: boolean; registration: boolean; registrations?: number } | null>(null);

  useEffect(() => {
    getSwStatus().then(setSwStatus).catch(() => setSwStatus(null));
  }, []);const repairApp = async () => {
    const ok = confirmDanger(
      "Reparar app: se borrará la caché (Service Worker + caches) y se recargará.\n\nNo borra tus datos (notas/citas/compras).\n\n¿Continuar?"
    );
    if (!ok) return;

    setBusy(true);
    try {
      await resetSWAndCaches();
      alert("Caché limpiada. Recargando…");
      location.reload();
    } finally {
      setBusy(false);
    }
  };const [pwOpen, setPwOpen] = useState<null | "EXPORT" | "IMPORT">(null);
  const [pw, setPw] = useState("");
  const [pendingEncrypted, setPendingEncrypted] = useState<EncryptedBackupV1 | null>(null);

  const last = useMemo(
    () => (settings?.lastBackup ? new Date(settings.lastBackup).toLocaleString() : "nunca"),
    [settings]
  );

  const doBackupPlain = async () => {
    setBusy(true);
    try {
      const data = await exportBackup();
      downloadJson(`lumina_backup_${todayStamp()}.json`, data);
      await update({ lastBackup: Date.now() });
    } finally {
      setBusy(false);
    }
  };

  const doBackupEncrypted = async (passphrase: string) => {
    setBusy(true);
    try {
      const data = await exportBackup();
      const enc = await encryptBackup(passphrase, data);
      downloadJson(`lumina_backup_${todayStamp()}_ENCRYPTED.json`, enc);
      await update({ lastBackup: Date.now() });
      setPw("");
      setPwOpen(null);
    } finally {
      setBusy(false);
    }
  };

  

  const resetAll = async () => {
    const ok = confirmDoubleDanger(
      "RESET TOTAL: Se borrarán TODAS las notas, compras y citas del dispositivo.\n\n¿Seguro?",
      "Último aviso: esto NO se puede deshacer.\n\n¿Borrar todo ahora?"
    );
    if (!ok) return;

    setBusy(true);
    try {
      // Borra tablas principales (sin depender de keys antiguas)
      await db.transaction("rw", db.settings, db.notes, db.shopping, db.appointments, async () => {
        await db.notes.clear();
        await db.shopping.clear();
        await db.appointments.clear();
        await db.settings.clear();
      });

      alert("Datos borrados. Reiniciando…");
      location.reload();
    } finally {
      setBusy(false);
    }
  };
const restoreFromObject = async (obj: unknown) => {
    // Soporta plain (BackupV1) y cifrado (EncryptedBackupV1)
    if (isEncryptedBackup(obj)) {
      setPendingEncrypted(obj);
      setPwOpen("IMPORT");
      return;
    }

    const data = obj as BackupV1;
          const ok = confirmDanger(
        "Vas a RESTAURAR un backup y sobrescribir los datos locales.\n\n¿Continuar?"
      );
      if (!ok) return;

      await importBackup(data);
    alert("Restaurado OK.");
    location.reload();
  };

  const restoreFromFile = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      const txt = await file.text();
      const obj = JSON.parse(txt) as unknown;
      await restoreFromObject(obj);
    } catch (e: any) {
      alert(e?.message ?? "Restore falló.");
    } finally {
      setBusy(false);
    }
  };

  const confirmDecryptAndRestore = async (passphrase: string) => {
    if (!pendingEncrypted) return;
    setBusy(true);
    try {
      const plain = await decryptBackup(passphrase, pendingEncrypted);
            const ok = confirmDanger(
        "Vas a RESTAURAR un backup cifrado y sobrescribir los datos locales.\n\n¿Continuar?"
      );
      if (!ok) return;

      await restoreFromObject(plain);
      setPendingEncrypted(null);
      setPw("");
      setPwOpen(null);
    } catch (e: any) {
      alert(e?.message ?? "Contraseña incorrecta.");
    } finally {
      setBusy(false);
    }
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

      <button
        onClick={() => update({ readOnlyMode: !settings.readOnlyMode })}
        className="w-full bg-white/10 hover:bg-white/15 border border-white/10 font-black rounded-2xl py-4"
      >
        Modo Solo Lectura: {settings.readOnlyMode ? "ON" : "OFF"}
      </button>

      <div className="grid grid-cols-1 gap-2">
        <button
          disabled={busy}
          onClick={doBackupPlain}
          className="bg-[#00f2ff] text-black font-black rounded-2xl py-4 inline-flex items-center justify-center gap-2 disabled:opacity-30"
        >
          <Download /> BACKUP (normal)
        </button>

        <button
          disabled={busy}
          onClick={() => setPwOpen("EXPORT")}
          className="bg-purple-500 text-black font-black rounded-2xl py-4 inline-flex items-center justify-center gap-2 disabled:opacity-30"
        >
          <Lock /> BACKUP cifrado
        </button>

        <label className="bg-white/10 border border-white/10 font-black rounded-2xl py-4 inline-flex items-center justify-center gap-2 cursor-pointer">
          <Upload /> RESTORE (normal o cifrado)
          <input
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => restoreFromFile(e.target.files?.[0])}
          />
        </label>
      </div>

            <button
        disabled={busy}
        onClick={repairApp}
        className="w-full bg-white/10 hover:bg-white/15 border border-white/10 font-black rounded-2xl py-4 disabled:opacity-30"
      >
        Reparar app (limpiar caché)
      </button>

<p className="text-xs opacity-50">Último backup: {last}</p>

      <button
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try { await exportAllAsZip(); }
          finally { setBusy(false); }
        }}
        className="w-full bg-emerald-400 text-black font-black rounded-2xl py-4 disabled:opacity-30"
      >
        EXPORT TODO (.zip)
      </button>

      {/* Modal simple de contraseña */}
      {pwOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-[520px] glass border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="font-black text-lg">
              {pwOpen === "EXPORT" ? "Backup cifrado" : "Restore cifrado"}
            </div>

            <p className="text-sm opacity-70">
              {pwOpen === "EXPORT"
                ? "Se generará un JSON cifrado con contraseña (AES-GCM). No se puede recuperar sin ella."
                : "Introduce la contraseña para descifrar el backup."}
            </p>

            <input
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              type="password"
              placeholder="Contraseña"
              className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 outline-none"
              autoFocus
            />

            <div className="flex gap-2 justify-end">
              <button
                className="bg-white/10 border border-white/10 rounded-2xl px-4 py-3 font-black"
                onClick={() => {
                  setPwOpen(null);
                  setPw("");
                  setPendingEncrypted(null);
                }}
                disabled={busy}
              >
                Cancelar
              </button>

              {pwOpen === "EXPORT" ? (
                <button
                  className="bg-purple-500 text-black rounded-2xl px-4 py-3 font-black disabled:opacity-30"
                  onClick={() => doBackupEncrypted(pw)}
                  disabled={busy}
                >
                  <Lock className="inline-block mr-2" size={18} />
                  Cifrar y descargar
                </button>
              ) : (
                <button
                  className="bg-[#00f2ff] text-black rounded-2xl px-4 py-3 font-black disabled:opacity-30"
                  onClick={() => confirmDecryptAndRestore(pw)}
                  disabled={busy}
                >
                  Desbloquear y restaurar
                </button>
              )}
            </div>

            <p className="text-xs opacity-50">
              Consejo: guarda la contraseña en un lugar seguro. Lumina no la almacena.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
















