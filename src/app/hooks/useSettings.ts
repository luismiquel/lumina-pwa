import { useEffect, useState } from "react";
import { DEFAULT_SETTINGS, type Settings } from "@/domain/models/appState";
import { SettingsRepo } from "@/infra/db/repositories";

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    (async () => {
      const s = await SettingsRepo.get();
      if (!s) {
        await SettingsRepo.set(DEFAULT_SETTINGS);
        setSettings(DEFAULT_SETTINGS);
      } else setSettings(s);
    })();
  }, []);

  const update = async (patch: Partial<Settings>) => {
    if (!settings) return;
    const next = { ...settings, ...patch };
    setSettings(next);
    await SettingsRepo.set(next);
  };

  return { settings, update };
}
