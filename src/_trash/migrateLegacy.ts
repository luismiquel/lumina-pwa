import { db } from "./db";
import { SettingsRepo } from "./repositories";
import type { BackupV1 } from "./backup";
import type { Settings } from "@/domain/models/appState";

/**
 * MIGRACIÓN ONE-SHOT desde localStorage legacy a IndexedDB (Dexie)
 * - No usa red, no usa APIs externas.
 * - Se ejecuta una vez y deja una marca para no repetir.
 */

const LEGACY_KEYS = [
  "LUMINA_PURE_VAULT",
  "LUMINA_PURE_VAULT_V3",
  "LUMINA_PURE_VAULT_VAULT",
  "LUMINA_PURE_VAULT_STATE"
] as const;

const MIGRATION_FLAG = "LUMINA_LOCAL_MIGRATED_V1";

type LegacyState = any;

function pickLegacyJson(): string | null {
  for (const k of LEGACY_KEYS) {
    const v = localStorage.getItem(k);
    if (v && v.trim().startsWith("{")) return v;
  }
  return null;
}

function toBackupV1(parsed: LegacyState): BackupV1 {
  const exportedAt = Date.now();
  const schema = 1 as const;

  // Normalizamos lo que típicamente existía en tu app antigua:
  // notes, expenses, contacts, health, routines, shoppingList, seniorMode, version, lastBackup?
  const settings: Settings = {
    seniorMode: !!parsed?.seniorMode,
    version: typeof parsed?.version === "string" ? parsed.version : "legacy",
    lastBackup: typeof parsed?.lastBackup === "number" ? parsed.lastBackup : undefined
  };

  return {
    schema,
    exportedAt,
    settings,
    notes: Array.isArray(parsed?.notes) ? parsed.notes : [],
    expenses: Array.isArray(parsed?.expenses) ? parsed.expenses : [],
    contacts: Array.isArray(parsed?.contacts) ? parsed.contacts : [],
    health: Array.isArray(parsed?.health) ? parsed.health : [],
    routines: Array.isArray(parsed?.routines) ? parsed.routines : [],
    shopping: Array.isArray(parsed?.shoppingList)
      ? parsed.shoppingList.map((it: any) => {
          // si venía como string[], lo adaptamos
          if (typeof it === "string") {
            return { id: crypto.randomUUID(), text: it, completed: false, createdAt: Date.now() };
          }
          // si venía como objeto ShoppingItem legacy
          return {
            id: typeof it?.id === "string" ? it.id : crypto.randomUUID(),
            text: typeof it?.text === "string" ? it.text : "",
            completed: !!it?.completed,
            createdAt: typeof it?.createdAt === "number" ? it.createdAt : Date.now()
          };
        })
      : []
  };
}

export async function migrateLegacyIfNeeded(): Promise<"migrated" | "skipped" | "none"> {
  // Ya migrado
  if (localStorage.getItem(MIGRATION_FLAG) === "1") return "skipped";

  const raw = pickLegacyJson();
  if (!raw) return "none";

  let parsed: LegacyState;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return "none";
  }

  const backup = toBackupV1(parsed);

  // Importamos a Dexie en transacción
  const tables = [db.settings, db.notes, db.expenses, db.contacts, db.health, db.routines, db.shopping] as const;

  await db.transaction("rw", tables, async () => {
    // No borramos si ya hay datos (modo seguro): si hay settings, asumimos que hay uso previo.
    const existing = await SettingsRepo.get();
    if (existing) return;

    // Limpieza por seguridad (DB nueva)
    await Promise.all([
      db.settings.clear(),
      db.notes.clear(),
      db.expenses.clear(),
      db.contacts.clear(),
      db.health.clear(),
      db.routines.clear(),
      db.shopping.clear()
    ]);

    if (backup.settings) await db.settings.put({ key: "settings", value: backup.settings });
    if (backup.notes.length) await db.notes.bulkAdd(backup.notes);
    if (backup.expenses.length) await db.expenses.bulkAdd(backup.expenses);
    if (backup.contacts.length) await db.contacts.bulkAdd(backup.contacts);
    if (backup.health.length) await db.health.bulkAdd(backup.health);
    if (backup.routines.length) await db.routines.bulkAdd(backup.routines);
    if (backup.shopping.length) await db.shopping.bulkAdd(backup.shopping);
  });

  // Marcamos como migrado y dejamos el legacy intacto (no borramos por seguridad)
  localStorage.setItem(MIGRATION_FLAG, "1");
  return "migrated";
}
