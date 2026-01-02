export type AppView = "HOME" | "NOTES" | "HEALTH" | "SHOPPING" | "EXPENSES" | "CONTACTS" | "FINDER" | "ROUTINES" | "SETTINGS";

export interface AppState {
  version: string;
  seniorMode: boolean;
}
