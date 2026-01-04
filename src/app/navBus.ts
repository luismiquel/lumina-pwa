import type { View } from "@/app/nav";

export type NavPayload = { view: View; section?: string };

const EVT = "lumina:navigate";

export function navTo(view: View, section?: string) {
  window.dispatchEvent(new CustomEvent<NavPayload>(EVT, { detail: { view, section } }));
}

export function onNav(handler: (p: NavPayload) => void) {
  const fn = (e: Event) => handler((e as CustomEvent<NavPayload>).detail);
  window.addEventListener(EVT, fn);
  return () => window.removeEventListener(EVT, fn);
}
