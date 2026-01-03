import { db } from "./db";
import type { Settings } from "@/domain/models/appState";
import type { Note, ShoppingItem, Appointment, Id } from "@/domain/models/entities";

const now = () => Date.now();
const genId = (): Id => crypto.randomUUID();

export const SettingsRepo = {
  async get(): Promise<Settings | null> {
    const row = await db.settings.get("settings");
    return row?.value ?? null;
  },
  async set(value: Settings): Promise<void> {
    await db.settings.put({ key: "settings", value });
  }
};

export const NotesRepo = {
  async list(): Promise<Note[]> {
    return db.notes.orderBy("updatedAt").reverse().toArray();
  },
  async add(title: string, content: string, tags: string[] = []): Promise<Note> {
    const t = now();
    const note: Note = { id: genId(), title, content, tags, createdAt: t, updatedAt: t };
    await db.notes.add(note);
    return note;
  },
  async remove(id: Id): Promise<void> {
    await db.notes.delete(id);
  }
};

export const ShoppingRepo = {
  async list(): Promise<ShoppingItem[]> {
    return db.shopping.orderBy("createdAt").reverse().toArray();
  },
  async add(text: string): Promise<ShoppingItem> {
    const item: ShoppingItem = { id: genId(), text: text.trim(), completed: false, createdAt: now() };
    await db.shopping.add(item);
    return item;
  },
  async toggle(id: Id): Promise<void> {
    const item = await db.shopping.get(id);
    if (!item) return;
    await db.shopping.update(id, { completed: !item.completed });
  },
  async remove(id: Id): Promise<void> {
    await db.shopping.delete(id);
  }
};

export const AppointmentsRepo = {
  async list(): Promise<Appointment[]> {
    return db.appointments.orderBy("dateTimeISO").toArray();
  },
  async add(input: Omit<Appointment, "id" | "createdAt">): Promise<Appointment> {
    const ap: Appointment = { ...input, id: genId(), createdAt: now() };
    await db.appointments.add(ap);
    return ap;
  },
  async remove(id: Id): Promise<void> {
    await db.appointments.delete(id);
  }
};
