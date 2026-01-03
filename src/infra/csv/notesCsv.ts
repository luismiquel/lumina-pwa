import type { Note } from "@/domain/models/entities";

function escCsv(v: string) {
  return `"${String(v ?? "").replace(/"/g, `""`)}"`;
}

function unescCsv(v: string) {
  return String(v ?? "").replace(/""/g, '"');
}

// Formato: title,content,tags,createdAt
export function exportNotesCsv(items: Note[]): string {
  const header = "title,content,tags,createdAt";
  const rows = items.map((n) => {
    const tags = Array.isArray((n as any).tags) ? (n as any).tags.join(";") : "";
    const createdAt = Number((n as any).createdAt ?? Date.now());
    return [escCsv((n as any).title ?? ""), escCsv((n as any).content ?? ""), escCsv(tags), String(createdAt)].join(",");
  });
  return [header, ...rows].join("\n");
}

function parseLine(line: string) {
  // "title","content","tags",digits
  const m = line.match(/^"((?:[^"]|"")*)","((?:[^"]|"")*)","((?:[^"]|"")*)",(\d+)$/);
  if (!m) return null;

  const t = m[1], c = m[2], g = m[3], ts = m[4];
  if (t == null || c == null || g == null || ts == null) return null;

  const title = unescCsv(t).trim();
  const content = unescCsv(c);
  const tagsRaw = unescCsv(g).trim();
  const createdAt = Number(ts);
  if (!Number.isFinite(createdAt)) return null;

  const tags = tagsRaw ? tagsRaw.split(";").map((x) => x.trim()).filter(Boolean) : [];
  return { title: title || "Sin título", content, tags, createdAt };
}

export function importNotesCsv(csv: string): Array<{ title: string; content: string; tags: string[]; createdAt: number }> {
  const lines = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return [];

  const firstLine = lines[0] ?? "";
  const start = /^title,content,tags,createdAt$/i.test(firstLine) ? 1 : 0;

  const out: Array<{ title: string; content: string; tags: string[]; createdAt: number }> = [];
  for (let i = start; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const p = parseLine(line);
    if (!p) continue;
    out.push(p);
  }
  return out;
}
