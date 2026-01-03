import { db } from "./db";
import type { Settings } from "@/domain/models/settings";
import type { Id, Note, Expense, Contact, HealthEntry, Routine, ShoppingItem } from "@/domain/models/entities";

const now = () => Date.now();
const genId = (): Id => crypto.randomUUID();
const dayKey = (d = new Date()) => d.toISOString().slice(0, 10);

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
  async add(title: string, content: string, tags: string[]): Promise<void> {
    const t = now();
    const note: Note = { id: genId(), title: title.trim(), content: content.trim(), tags, createdAt: t, updatedAt: t };
    await db.notes.add(note);
  },
  async update(id: Id, patch: Partial<Pick<Note, "title" | "content" | "tags">>): Promise<void> {
    await db.notes.update(id, { ...patch, updatedAt: now() });
  },
  async remove(id: Id): Promise<void> {
    await db.notes.delete(id);
  }
};

export const ExpensesRepo = {
  async list(): Promise<Expense[]> {
    return db.expenses.orderBy("createdAt").reverse().toArray();
  },
  async add(description: string, amount: number, category: string, dateISO?: string): Promise<void> {
    const exp: Expense = {
      id: genId(),
      description: description.trim(),
      amount: Number.isFinite(amount) && amount >= 0 ? amount : 0,
      category: category.trim() || "General",
      date: dateISO ?? new Date().toISOString(),
      createdAt: now()
    };
    await db.expenses.add(exp);
  },
  async remove(id: Id): Promise<void> {
    await db.expenses.delete(id);
  }
};

export const ContactsRepo = {
  async list(): Promise<Contact[]> {
    return db.contacts.orderBy("createdAt").reverse().toArray();
  },
  async add(input: Omit<Contact, "id" | "createdAt">): Promise<void> {
    const c: Contact = { ...input, id: genId(), createdAt: now() };
    await db.contacts.add(c);
  },
  async remove(id: Id): Promise<void> {
    await db.contacts.delete(id);
  }
};

export const HealthRepo = {
  async list(): Promise<HealthEntry[]> {
    return db.health.orderBy("createdAt").reverse().toArray();
  },
  async add(type: HealthEntry["type"], value: HealthEntry["value"], unit: string | undefined, dateISO?: string): Promise<void> {
    const h: HealthEntry = {
      id: genId(),
      type,
      value,
      unit,
      date: dateISO ?? new Date().toISOString(),
      createdAt: now()
    };
    await db.health.add(h);
  },
  async remove(id: Id): Promise<void> {
    await db.health.delete(id);
  }
};

export const RoutinesRepo = {
  async list(): Promise<Routine[]> {
    return db.routines.orderBy("createdAt").reverse().toArray();
  },
  async add(title: string, frequency: Routine["frequency"], reminderTime?: string): Promise<void> {
    const r: Routine = { id: genId(), title: title.trim(), completedDays: [], frequency, reminderTime, createdAt: now() };
    await db.routines.add(r);
  },
  async toggleToday(id: Id): Promise<void> {
    const r = await db.routines.get(id);
    if (!r) return;
    const today = dayKey();
    const has = r.completedDays.includes(today);
    const next = has ? r.completedDays.filter(d => d !== today) : [today, ...r.completedDays];
    await db.routines.update(id, { completedDays: next });
  },
  async remove(id: Id): Promise<void> {
    await db.routines.delete(id);
  }
};

export const ShoppingRepo = {
  async list(): Promise<ShoppingItem[]> {
    return db.shopping.orderBy("createdAt").reverse().toArray();
  },
  async add(text: string): Promise<void> {
    const item: ShoppingItem = { id: genId(), text: text.trim(), completed: false, createdAt: now() };
    await db.shopping.add(item);
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
