import { useEffect, useState } from "react";
import { DEFAULT_SETTINGS, type Settings } from "@/domain/models/settings";
import { SettingsRepo } from "@/infra/db/repos";

export function useInit() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    (async () => {
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
