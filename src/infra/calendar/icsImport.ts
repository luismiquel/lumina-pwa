import type { Appointment } from "@/domain/models/entities";

/**
 * Parser ICS local (best-effort).
 * Soporta VEVENT: UID, SUMMARY, DTSTART, DTEND.
 * Devuelve Appointments listos para guardar.
 *
 * TS estricto compatible con noUncheckedIndexedAccess.
 */

function unfoldLines(text: string): string[] {
  const raw = text.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  for (const line of raw) {
    if (!line) continue;
    if (/^[ \t]/.test(line) && out.length) {
      out[out.length - 1] = out[out.length - 1] + line.slice(1);
    } else {
      out.push(line);
    }
  }
  return out;
}

function parseIcsDate(v: string): string {
  const s = v.trim();

  // YYYYMMDD
  const mDate = /^(\d{4})(\d{2})(\d{2})$/.exec(s);
  if (mDate) {
    const [_, y, mo, d] = mDate;
    // Evento "día completo": fijamos 09:00 local por defecto (editable luego)
    return new Date(Number(y), Number(mo) - 1, Number(d), 9, 0, 0).toISOString();
  }

  // YYYYMMDDTHHMMSS(Z?)
  const mDateTime = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/.exec(s);
  if (mDateTime) {
    const [_, y, mo, d, hh, mm, ss, z] = mDateTime;
    if (z === "Z") {
      return new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(hh), Number(mm), Number(ss))).toISOString();
    }
    return new Date(Number(y), Number(mo) - 1, Number(d), Number(hh), Number(mm), Number(ss)).toISOString();
  }

  const p = Date.parse(s);
  if (!Number.isNaN(p)) return new Date(p).toISOString();
  return new Date().toISOString();
}

function getProp(line: string): { key: string; value: string } | null {
  const idx = line.indexOf(":");
  if (idx < 0) return null;

  const left = line.slice(0, idx).trim();
  const value = line.slice(idx + 1);

  if (!left) return null;

  // KEY;PARAM=... => KEY
  const parts = left.split(";");
  const firstRaw = parts.shift(); // string | undefined (TS-safe)
  const first = (firstRaw ?? "").trim();
  if (!first) return null;

  return { key: first.toUpperCase(), value };
}

export function parseICS(text: string): Appointment[] {
  const lines = unfoldLines(text);
  const out: Appointment[] = [];

  let inEvent = false;
  let cur: { uid?: string; title?: string; startISO?: string; endISO?: string } | null = null;

  for (const line of lines) {
    const up = line.trim().toUpperCase();

    if (up === "BEGIN:VEVENT") {
      inEvent = true;
      cur = {};
      continue;
    }

    if (up === "END:VEVENT") {
      if (inEvent && cur) {
        const id = String(cur.uid ?? crypto.randomUUID());
        const title = String(cur.title ?? "Cita");
        const dateTimeISO = String(cur.startISO ?? new Date().toISOString());
        const createdAt = Date.now();

        const ap: any = { id, title, createdAt, dateTimeISO };
        if (cur.endISO) ap.endTimeISO = String(cur.endISO);

        out.push(ap as Appointment);
      }
      inEvent = false;
      cur = null;
      continue;
    }

    if (!inEvent || !cur) continue;

    const p = getProp(line);
    if (!p) continue;

    if (p.key === "UID") cur.uid = p.value.trim();
    if (p.key === "SUMMARY") cur.title = p.value.trim();
    if (p.key === "DTSTART") cur.startISO = parseIcsDate(p.value);
    if (p.key === "DTEND") cur.endISO = parseIcsDate(p.value);
  }

  // Dedup por UID/id
  const seen = new Set<string>();
  return out.filter((a: any) => {
    const id = String(a.id);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}
