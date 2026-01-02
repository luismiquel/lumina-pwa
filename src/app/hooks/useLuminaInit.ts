import { useEffect, useState } from "react";
import { DEFAULT_SETTINGS, type Settings } from "@/domain/models/appState";
import { SettingsRepo } from "@/infra/db/repositories";
import { migrateLegacyIfNeeded } from "@/infra/db/migrateLegacy";

export function useLuminaInit() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    (async () => {
      // 1) Migración legacy (one-shot)
      try {
        await migrateLegacyIfNeeded();
      } catch {
        // No rompemos arranque nunca
      }

      // 2) Cargar settings desde IndexedDB
      const s = await SettingsRepo.get();
      if (!s) {
        await SettingsRepo.set(DEFAULT_SETTINGS);
        setSettings(DEFAULT_SETTINGS);
      } else {
        setSettings(s);
      }
    })();
  }, []);

  return { settings, setSettings };
}
