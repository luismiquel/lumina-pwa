export type NavTarget =
  | { kind: "NOTE"; id: string; query?: string }
  | { kind: "SHOPPING"; id: string; query?: string }
  | { kind: "APPOINTMENT"; id: string; query?: string };

let target: NavTarget | null = null;

export function setNavTarget(t: NavTarget) {
  target = t;
}

export function peekNavTarget(): NavTarget | null {
  return target;
}

export function consumeNavTarget(): NavTarget | null {
  const t = target;
  target = null;
  return t;
}
