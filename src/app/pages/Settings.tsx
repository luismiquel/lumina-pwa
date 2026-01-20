import { exportNotesBackup, importNotesBackup } from "@/app/backupActions";

export default function Settings() {
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await importNotesBackup(file);
      alert("Backup restaurado correctamente");
      window.location.reload();
    } catch {
      alert("Error al importar el backup");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-black text-xl">Ajustes</h1>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
        <h2 className="font-bold">Backup local</h2>

        <button
          onClick={exportNotesBackup}
          className="w-full rounded-2xl bg-[#00f2ff]/20 border border-[#00f2ff]/40 py-3 font-semibold"
        >
          Exportar notas (backup)
        </button>

        <label className="block w-full text-center rounded-2xl bg-white/10 border border-white/10 py-3 cursor-pointer">
          Importar backup
          <input
            type="file"
            accept="application/json"
            onChange={handleImport}
            className="hidden"
          />
        </label>
      </section>
    </div>
  );
}
