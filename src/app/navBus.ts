import type { View } from "@/app/nav";

export type NavTarget =
  | { kind: "NOTE"; id: string; query?: string }
  | { kind: "SHOPPING"; id: string; query?: string }
  | { kind: "APPOINTMENT"; id: string; query?: string }
  | { kind: "GUIDE"; section?: string };

export type NavEvent = { view: View; section?: string };

const KEY = "lumina_nav_target_v1";

function safeSet(key: string, value: string) { try { localStorage.setItem(key, value); } catch {} }
function safeGet(key: string): string | null { try { return localStorage.getItem(key); } catch { return null; } }
function safeDel(key: string) { try { localStorage.removeItem(key); } catch {} }

export function navTo(view: View, section?: string) {
  const ev: NavEvent = { view, section };
  safeSet(KEY, JSON.stringify(ev));
  try { window.dispatchEvent(new CustomEvent("lumina:navigate", { detail: ev })); } catch {}
}

export function onNav(handler: (ev: NavEvent) => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY || !e.newValue) return;
    try { handler(JSON.parse(e.newValue) as NavEvent); } catch {}
  };
  const onLocal = (e: Event) => {
    const ce = e as CustomEvent;
    if (!ce?.detail) return;
    handler(ce.detail as NavEvent);
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener("lumina:navigate", onLocal as any);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("lumina:navigate", onLocal as any);
  };
}

export function consumeNavTarget(): NavTarget | null {
  const raw = safeGet(KEY);
  if (!raw) return null;
  safeDel(KEY);

  try {
    const ev = JSON.parse(raw) as NavEvent;
    if (ev.view === "GUIDE") return { kind: "GUIDE", section: ev.section };
    return null;
  } catch { return null; }
}
