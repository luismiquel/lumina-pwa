import { NotesRepo } from "@/infra/db/repositories";
import { NOTES_KEY } from "@/app/components/QuickNotes";

type BackupPayload = {
  version: 1;
  date: string;
  notes: Array<{
    title: string;
    content: string;
    tags: string[];
  }>;
  quickNotes: string | null;
};

export async function exportNotesBackup() {
  // API real del repositorio
  const notes = await NotesRepo.list();
  const quickNotes = localStorage.getItem(NOTES_KEY);

  const payload: BackupPayload = {
    version: 1,
    date: new Date().toISOString(),
    notes,
    quickNotes,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "lumina-backup-notes.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function importNotesBackup(file: File) {
  const raw = await file.text();
  const data = JSON.parse(raw) as BackupPayload;

  if (!data || data.version !== 1) {
    throw new Error("Backup no compatible");
  }

  if (Array.isArray(data.notes)) {
    for (const n of data.notes) {
      if (n?.title && n?.content) {
        await NotesRepo.add(n.title, n.content, n.tags ?? []);
      }
    }
  }

  if (typeof data.quickNotes === "string") {
    localStorage.setItem(NOTES_KEY, data.quickNotes);
  }
}
