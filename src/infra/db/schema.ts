export const DB_NAME = "lumina_local_db";
export const DB_VERSION = 1;

export const STORES_V1 = {
  settings: "&key",
  notes: "&id, createdAt, updatedAt",
  expenses: "&id, createdAt, date, category",
  contacts: "&id, createdAt, name",
  health: "&id, createdAt, date, type",
  routines: "&id, createdAt, title",
  shopping: "&id, createdAt, completed"
} as const;
