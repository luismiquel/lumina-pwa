export type Id = string;

export interface Note {
  id: Id;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
}

export interface Expense {
  id: Id;
  description: string;
  amount: number;
  category: string;
  date: string; // ISO
  createdAt: number;
}

export interface Contact {
  id: Id;
  name: string;
  phone?: string;
  email?: string;
  note?: string;
  createdAt: number;
}

export interface HealthEntry {
  id: Id;
  type: "weight" | "steps" | "mood" | "blood_pressure";
  value: number | string;
  unit?: string;
  date: string; // ISO
  createdAt: number;
}

export interface Routine {
  id: Id;
  title: string;
  completedDays: string[]; // YYYY-MM-DD
  frequency: "daily" | "weekly";
  reminderTime?: string;
  createdAt: number;
}

export interface ShoppingItem {
  id: Id;
  text: string;
  completed: boolean;
  createdAt: number;
}
