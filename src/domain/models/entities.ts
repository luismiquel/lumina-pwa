export type Id = string;

export interface Note {
  id: Id;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  tags: string[];
}

export interface ShoppingItem {
  id: Id;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface Appointment {
  id: Id;
  title: string;
  place?: string;
  doctor?: string;
  dateTimeISO: string; // ISO
  note?: string;
  createdAt: number;
}
