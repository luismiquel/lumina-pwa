export interface Settings {
  seniorMode: boolean;
  version: string;
  lastBackup?: number;
}

export const DEFAULT_SETTINGS: Settings = {
  seniorMode: false,
  version: "0.2.0"
};
