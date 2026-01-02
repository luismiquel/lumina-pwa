import { db } from "./db";
import type { Settings } from "@/domain/models/appState";
import type {
  Note,
  Expense,
  Contact,
  HealthEntry,
  Routine,
  ShoppingItem,
  Id
} from "@/domain/models/entities";

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
  async add(input: Pick<Note, "title" | "content"> & Partial<Pick<Note, "tags">>): Promise<Note> {
    const t = now();
    const note: Note = {
      id: genId(),
      title: input.title.trim(),
      content: input.content.trim(),
      tags: input.tags ?? [],
      createdAt: t,
      updatedAt: t
    };
    await db.notes.add(note);
    return note;
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
  async add(input: Omit<Expense, "id" | "createdAt">): Promise<Expense> {
    const exp: Expense = { ...input, id: genId(), createdAt: now() };
    await db.expenses.add(exp);
    return exp;
  },
  async remove(id: Id): Promise<void> {
    await db.expenses.delete(id);
  }
};

export const ContactsRepo = {
  async list(): Promise<Contact[]> {
    return db.contacts.orderBy("createdAt").reverse().toArray();
  },
  async add(input: Omit<Contact, "id" | "createdAt">): Promise<Contact> {
    const c: Contact = { ...input, id: genId(), createdAt: now() };
    await db.contacts.add(c);
    return c;
  },
  async remove(id: Id): Promise<void> {
    await db.contacts.delete(id);
  }
};

export const HealthRepo = {
  async list(): Promise<HealthEntry[]> {
    return db.health.orderBy("createdAt").reverse().toArray();
  },
  async add(input: Omit<HealthEntry, "id" | "createdAt">): Promise<HealthEntry> {
    const h: HealthEntry = { ...input, id: genId(), createdAt: now() };
    await db.health.add(h);
    return h;
  },
  async remove(id: Id): Promise<void> {
    await db.health.delete(id);
  }
};

export const RoutinesRepo = {
  async list(): Promise<Routine[]> {
    return db.routines.orderBy("createdAt").reverse().toArray();
  },
  async add(input: Omit<Routine, "id" | "createdAt">): Promise<Routine> {
    const r: Routine = { ...input, id: genId(), createdAt: now() };
    await db.routines.add(r);
    return r;
  },
  async update(id: Id, patch: Partial<Omit<Routine, "id" | "createdAt">>): Promise<void> {
    await db.routines.update(id, patch);
  },
  async remove(id: Id): Promise<void> {
    await db.routines.delete(id);
  }
};

export const ShoppingRepo = {
  async list(): Promise<ShoppingItem[]> {
    return db.shopping.orderBy("createdAt").reverse().toArray();
  },
  async add(text: string): Promise<ShoppingItem> {
    const item: ShoppingItem = {
      id: genId(),
      text: text.trim(),
      completed: false,
      createdAt: now()
    };
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
