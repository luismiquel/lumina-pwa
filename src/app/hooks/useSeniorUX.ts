import { useEffect, useMemo } from "react";

export function useSeniorUX(senior: boolean) {
  useEffect(() => {
    const el = document.documentElement;
    if (senior) el.setAttribute("data-senior", "1");
    else el.removeAttribute("data-senior");
  }, [senior]);

  const haptic = useMemo(() => {
    return (pattern: number | number[] = 20) => {
      try {
        if (!("vibrate" in navigator)) return;
        navigator.vibrate(pattern);
      } catch {
        // silencio
      }
    };
  }, []);

  return { haptic };
}
