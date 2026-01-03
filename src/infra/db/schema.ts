export const DB_NAME = "lumina_local_db";
export const DB_VERSION = 1;

export const STORES_V1 = {
  settings: "&key",
  notes: "&id, createdAt, updatedAt",
  shopping: "&id, createdAt, completed",
  appointments: "&id, createdAt, dateTimeISO"
} as const;
