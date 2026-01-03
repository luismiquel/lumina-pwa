/**
 * Repositorios 100% locales (localStorage) alineados con los modelos de dominio.
 * No dependencias, no servicios externos.
 */

import type { Settings } from "@/domain/models/settings";
import type { Note, ShoppingItem } from "@/domain/models/entities";

function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function lsSet<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

/* =========================
   SETTINGS
========================= */

const SETTINGS_KEY = "lumina:settings:v1";
const SETTINGS_VERSION = "1";

export class SettingsRepo {
  static async get(): Promise<Settings> {
    const cur = lsGet<Partial<Settings>>(SETTINGS_KEY, {});
    // Construimos el objeto final cumpliendo el dominio (version requerida)
    const next: Settings = {
      version: typeof cur.version === "string" ? cur.version : SETTINGS_VERSION,
      // estas props existen en tu app (Settings.tsx / useSettings)
      // si tu tipo Settings trae más campos, se conservarán al hacer merge en set()
      seniorMode: typeof (cur as any).seniorMode === "boolean" ? (cur as any).seniorMode : false,
      lastBackup: typeof (cur as any).lastBackup === "number" ? (cur as any).lastBackup : undefined,
    } as Settings;

    lsSet(SETTINGS_KEY, next);
    return next;
  }

  static async set(patch: Partial<Settings>): Promise<Settings> {
    const cur = await SettingsRepo.get();
    const next = { ...cur, ...patch, version: cur.version ?? SETTINGS_VERSION } as Settings;
    lsSet(SETTINGS_KEY, next);
    return next;
  }
}

/* =========================
   NOTES
========================= */

const NOTES_KEY = "lumina:notes:v1";

function normalizeNote(input: Partial<Note> & Pick<Note, "id">): Note {
  // Creamos SOLO los campos que el dominio requiere con seguridad.
  // Si tu Note tiene más campos (p.ej. createdAt/updatedAt), se preservan vía spread.
  const base: any = {
    ...(input as any),
    id: input.id,
    title: (input as any).title ?? "Sin título",
    content: (input as any).content ?? "",
    tags: Array.isArray((input as any).tags) ? (input as any).tags : [],
  };
  return base as Note;
}

export class NotesRepo {
  static async list(): Promise<Note[]> {
    const items = lsGet<any[]>(NOTES_KEY, []);
    return items.map((n) => normalizeNote(n));
  }

  static async add(title: string, content: string, tags: string[] = []): Promise<Note> {
    const items = lsGet<any[]>(NOTES_KEY, []);
    const note = normalizeNote({
      id: crypto.randomUUID(),
      title,
      content,
      tags,
      // si tu dominio tiene timestamps, los dejamos como extra; no rompe runtime
      ...( { createdAt: Date.now(), updatedAt: Date.now() } as any ),
    });

    items.unshift(note);
    lsSet(NOTES_KEY, items);
    return note;
  }

  static async update(id: string, patch: Partial<Note>): Promise<Note | null> {
    const items = lsGet<any[]>(NOTES_KEY, []);
    const idx = items.findIndex((n) => n?.id === id);
    if (idx < 0) return null;

    const cur = normalizeNote(items[idx]);
    const next = normalizeNote({
      ...(cur as any),
      ...(patch as any),
      id,
      ...( { updatedAt: Date.now() } as any ),
    });

    items[idx] = next;
    lsSet(NOTES_KEY, items);
    return next;
  }

  static async remove(id: string): Promise<void> {
    const items = lsGet<any[]>(NOTES_KEY, []);
    lsSet(NOTES_KEY, items.filter((n) => n?.id !== id));
  }

  static async clear(): Promise<void> {
    lsSet(NOTES_KEY, []);
  }
}

/* =========================
   SHOPPING
========================= */

const SHOPPING_KEY = "lumina:shopping:v1";

function normalizeShoppingItem(input: Partial<ShoppingItem> & Pick<ShoppingItem, "id">): ShoppingItem {
  const base: any = {
    ...(input as any),
    id: input.id,
    text: (input as any).text ?? "",
    completed: typeof (input as any).completed === "boolean" ? (input as any).completed : false,
  };
  return base as ShoppingItem;
}

export class ShoppingRepo {
  static async list(): Promise<ShoppingItem[]> {
    const items = lsGet<any[]>(SHOPPING_KEY, []);
    // pendientes arriba
    return items
      .map((i) => normalizeShoppingItem(i))
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return 0;
      });
  }

  static async add(text: string): Promise<ShoppingItem> {
    const items = lsGet<any[]>(SHOPPING_KEY, []);
    const item = normalizeShoppingItem({
      id: crypto.randomUUID(),
      text: text.trim(),
      completed: false,
      ...( { createdAt: Date.now(), updatedAt: Date.now() } as any ),
    });

    items.unshift(item);
    lsSet(SHOPPING_KEY, items);
    return item;
  }

  static async toggle(id: string): Promise<void> {
    const items = lsGet<any[]>(SHOPPING_KEY, []);
    const idx = items.findIndex((i) => i?.id === id);
    if (idx < 0) return;

    const cur = normalizeShoppingItem(items[idx]);
    const next = normalizeShoppingItem({
      ...(cur as any),
      id,
      completed: !cur.completed,
      ...( { updatedAt: Date.now() } as any ),
    });

    items[idx] = next;
    lsSet(SHOPPING_KEY, items);
  }

  static async remove(id: string): Promise<void> {
    const items = lsGet<any[]>(SHOPPING_KEY, []);
    lsSet(SHOPPING_KEY, items.filter((i) => i?.id !== id));
  }

  static async clear(): Promise<void> {
    lsSet(SHOPPING_KEY, []);
  }
}
