import type { Settings } from "@/domain/models/settings";
import type { Note, ShoppingItem } from "@/domain/models/entities";
import { db } from "@/infra/db/db";
import { migrateFromLocalStorageIfNeeded } from "@/infra/db/migrateFromLocalStorage";

const SETTINGS_VERSION = "1";

async function ensureMigrated() {
  await migrateFromLocalStorageIfNeeded();
}

/* =========================
   SETTINGS (key/value)
========================= */
export class SettingsRepo {
  static async get(): Promise<Settings> {
    await ensureMigrated();

    const row = await db.settings.get("settings");
    if (row?.value) return row.value as Settings;

    const fresh: Settings = {
      version: SETTINGS_VERSION,
      seniorMode: false,
      lastBackup: undefined,
    } as Settings;

    await db.settings.put({ key: "settings", value: fresh });
    return fresh;
  }

  static async set(patch: Partial<Settings>): Promise<Settings> {
    await ensureMigrated();

    const cur = await SettingsRepo.get();
    const next = { ...cur, ...patch, version: cur.version ?? SETTINGS_VERSION } as Settings;
    await db.settings.put({ key: "settings", value: next });
    return next;
  }
}

/* =========================
   NOTES
========================= */
function normalizeNote(input: any): Note {
  return {
    ...input,
    id: String(input?.id ?? crypto.randomUUID()),
    title: String(input?.title ?? "Sin título"),
    content: String(input?.content ?? ""),
    tags: Array.isArray(input?.tags) ? input.tags : [],
  } as Note;
}

export class NotesRepo {
  static async list(): Promise<Note[]> {
    await ensureMigrated();
    const all = await db.notes.toArray();
    return all.map(normalizeNote);
  }

  static async add(title: string, content: string, tags: any[] = []): Promise<Note> {
    await ensureMigrated();
    const note = normalizeNote({
      id: crypto.randomUUID(),
      title,
      content,
      tags,
      ...({ createdAt: Date.now(), updatedAt: Date.now() } as any),
    });

    await db.notes.put({ ...(note as any), id: String((note as any).id) });
    return note;
  }

  static async update(id: string, patch: Partial<Note>): Promise<Note | null> {
    await ensureMigrated();
    const cur = await db.notes.get(id);
    if (!cur) return null;

    const next = normalizeNote({
      ...(cur as any),
      ...(patch as any),
      id,
      ...({ updatedAt: Date.now() } as any),
    });

    await db.notes.put({ ...(next as any), id });
    return next;
  }

  static async remove(id: string): Promise<void> {
    await ensureMigrated();
    await db.notes.delete(id);
  }

  static async clear(): Promise<void> {
    await ensureMigrated();
    await db.notes.clear();
  }
}

/* =========================
   SHOPPING
========================= */
function normalizeShopping(input: any): ShoppingItem {
  return {
    ...input,
    id: String(input?.id ?? crypto.randomUUID()),
    text: String(input?.text ?? ""),
    completed: typeof input?.completed === "boolean" ? input.completed : false,
  } as ShoppingItem;
}

export class ShoppingRepo {
  static async list(): Promise<ShoppingItem[]> {
    await ensureMigrated();
    const all = await db.shopping.toArray();
    return all.map(normalizeShopping).sort((a: any, b: any) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return 0;
    });
  }

  static async add(text: string): Promise<ShoppingItem> {
    await ensureMigrated();
    const item = normalizeShopping({
      id: crypto.randomUUID(),
      text: text.trim(),
      completed: false,
      ...({ createdAt: Date.now(), updatedAt: Date.now() } as any),
    });

    await db.shopping.put({ ...(item as any), id: String((item as any).id) });
    return item;
  }

  static async toggle(id: string): Promise<void> {
    await ensureMigrated();
    const cur = await db.shopping.get(id);
    if (!cur) return;

    const next = normalizeShopping({
      ...(cur as any),
      id,
      completed: !(cur as any).completed,
      ...({ updatedAt: Date.now() } as any),
    });

    await db.shopping.put({ ...(next as any), id });
  }

  static async remove(id: string): Promise<void> {
    await ensureMigrated();
    await db.shopping.delete(id);
  }

  static async clear(): Promise<void> {
    await ensureMigrated();
    await db.shopping.clear();
  }
}





