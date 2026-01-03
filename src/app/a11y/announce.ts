let listener: ((msg: string) => void) | null = null;

export function registerAnnounceListener(fn: (msg: string) => void) {
  listener = fn;
}

export function announce(msg: string) {
  try {
    listener?.(msg);
  } catch {
    // silencio
  }
}
