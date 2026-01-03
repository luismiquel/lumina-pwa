export function haptic(pattern: number | number[] = 18) {
  try {
    if ("vibrate" in navigator) navigator.vibrate(pattern);
  } catch {}
}

export function confirmDanger(message: string): boolean {
  haptic(12);
  return window.confirm(message);
}

export function confirmDoubleDanger(message1: string, message2: string): boolean {
  haptic([10, 40, 10]);
  if (!window.confirm(message1)) return false;
  haptic([10, 40, 10]);
  return window.confirm(message2);
}
