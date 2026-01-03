/**
 * Generador ICS 100% local.
 * - No APIs externas
 * - Compatible con import en Android/iOS/Outlook
 */

function pad(n: number) { return String(n).padStart(2, "0"); }

function toICSDateUTC(ms: number): string {
  const d = new Date(ms);
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

// ICS requiere líneas <= 75 chars (folding)
function foldLine(line: string): string {
  const limit = 75;
  if (line.length <= limit) return line;
  let out = "";
  let i = 0;
  while (i < line.length) {
    const chunk = line.slice(i, i + limit);
    out += (i === 0 ? chunk : "\r\n " + chunk);
    i += limit;
  }
  return out;
}

// Escapes básicos
function esc(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export type IcsEvent = {
  uid: string;
  title: string;
  startMs: number;
  endMs?: number;
  description?: string;
  location?: string;
  updatedMs?: number;
};

export function buildICS(calendarName: string, events: IcsEvent[]): string {
  const now = toICSDateUTC(Date.now());

  const lines: string[] = [];
  lines.push("BEGIN:VCALENDAR");
  lines.push("VERSION:2.0");
  lines.push("PRODID:-//Lumina Local//ES");
  lines.push("CALSCALE:GREGORIAN");
  lines.push(foldLine(`X-WR-CALNAME:${esc(calendarName)}`));

  for (const e of events) {
    const dtStart = toICSDateUTC(e.startMs);
    const dtEnd = e.endMs ? toICSDateUTC(e.endMs) : undefined;
    const dtStamp = toICSDateUTC(e.updatedMs ?? e.startMs ?? Date.now());

    lines.push("BEGIN:VEVENT");
    lines.push(foldLine(`UID:${esc(e.uid)}`));
    lines.push(`DTSTAMP:${dtStamp}`);
    lines.push(foldLine(`SUMMARY:${esc(e.title || "Cita")}`));
    lines.push(`DTSTART:${dtStart}`);
    if (dtEnd) lines.push(`DTEND:${dtEnd}`);
    if (e.location) lines.push(foldLine(`LOCATION:${esc(e.location)}`));
    if (e.description) lines.push(foldLine(`DESCRIPTION:${esc(e.description)}`));
    lines.push(foldLine(`LAST-MODIFIED:${toICSDateUTC(e.updatedMs ?? Date.now())}`));
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.map(foldLine).join("\r\n") + "\r\n";
}

export function downloadICS(filename: string, icsText: string) {
  const blob = new Blob([icsText], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".ics") ? filename : filename + ".ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

