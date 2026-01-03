import type { ShoppingItem } from "@/domain/models/entities";

function escCsv(v: string) {
  return `"${String(v ?? "").replace(/"/g, `""`)}"`;
}

export function exportShoppingCsv(items: ShoppingItem[]): string {
  const header = "text,completed,createdAt";
  const rows = items.map((i) => [escCsv(i.text), i.completed ? "1" : "0", String(i.createdAt)].join(","));
  return [header, ...rows].join("\n");
}

function parseLine(line: string) {
  const m = line.match(/^"((?:[^"]|"")*)",(0|1),(\d+)$/);
  if (!m) return null;

  const rawText = m[1];
  const flag = m[2];
  const ts = m[3];

  if (rawText == null || flag == null || ts == null) return null;

  const text = rawText.replace(/""/g, '"');
  const completed = flag === "1";
  const createdAt = Number(ts);
  if (!Number.isFinite(createdAt)) return null;

  return { text, completed, createdAt };
}

export function importShoppingCsv(csv: string): Array<Pick<ShoppingItem, "text" | "completed" | "createdAt">> {
  const lines = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return [];

  const firstLine = lines[0] ?? "";
  const start = /^text,completed,createdAt$/i.test(firstLine) ? 1 : 0;

  const out: Array<Pick<ShoppingItem, "text" | "completed" | "createdAt">> = [];
  for (let i = start; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const p = parseLine(line);
    if (!p) continue;
    out.push(p);
  }
  return out;
}
