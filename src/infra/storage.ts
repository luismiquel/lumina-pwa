const KEY = "LUMINA_LOCAL_VAULT";
export function loadState<T>(fallback: T): T {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveState<T>(state: T) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // quota / private mode, etc.
  }
}
