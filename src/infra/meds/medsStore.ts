export type Med = {
  id: string;
  name: string;
  dose: string;        // "1 pastilla", "10mg", etc.
  times: string[];     // ["08:00","14:00","22:00"]
  active: boolean;
  createdAt: number;
  updatedAt: number;
  takenOn?: string;    // "YYYY-MM-DD" si se marcó tomado hoy
};

const KEY = "lumina_meds_v1";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function uuid(): string {
  // crypto.randomUUID si está disponible
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: any = globalThis.crypto as any;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function loadMeds(): Med[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr
      .map((m: any) => ({
        id: String(m.id ?? uuid()),
        name: String(m.name ?? ""),
        dose: String(m.dose ?? ""),
        times: Array.isArray(m.times) ? m.times.map(String) : [],
        active: m.active !== false,
        createdAt: Number(m.createdAt ?? Date.now()),
        updatedAt: Number(m.updatedAt ?? Date.now()),
        takenOn: typeof m.takenOn === "string" ? m.takenOn : undefined,
      }))
      .filter((m: Med) => m.name.trim().length > 0);
  } catch {
    return [];
  }
}

export function saveMeds(meds: Med[]): void {
  localStorage.setItem(KEY, JSON.stringify(meds));
}

export function addMed(input: { name: string; dose: string; times: string[] }): Med[] {
  const now = Date.now();
  const meds = loadMeds();
  const med: Med = {
    id: uuid(),
    name: input.name.trim(),
    dose: input.dose.trim(),
    times: input.times.map((t) => t.trim()).filter(Boolean),
    active: true,
    createdAt: now,
    updatedAt: now,
  };
  const next = [med, ...meds];
  saveMeds(next);
  return next;
}

export function removeMed(id: string): Med[] {
  const meds = loadMeds().filter((m) => m.id !== id);
  saveMeds(meds);
  return meds;
}

export function toggleActive(id: string): Med[] {
  const now = Date.now();
  const meds = loadMeds().map((m) =>
    m.id === id ? { ...m, active: !m.active, updatedAt: now } : m
  );
  saveMeds(meds);
  return meds;
}

export function setTakenToday(id: string, taken: boolean): Med[] {
  const now = Date.now();
  const t = todayISO();
  const meds = loadMeds().map((m) => {
    if (m.id !== id) return m;
    return { ...m, takenOn: taken ? t : undefined, updatedAt: now };
  });
  saveMeds(meds);
  return meds;
}

export function normalizeForToday(meds: Med[]): Med[] {
  const t = todayISO();
  let changed = false;

  const next = meds.map((m) => {
    if (m.takenOn && m.takenOn !== t) {
      changed = true;
      return { ...m, takenOn: undefined };
    }
    return m;
  });

  if (changed) saveMeds(next);
  return next;
}
