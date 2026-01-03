import { useEffect, useRef, useState } from "react";

type UndoAction = {
  label: string;
  run: () => Promise<void> | void;
};

export function useUndo(timeoutMs = 8000) {
  const [action, setAction] = useState<UndoAction | null>(null);
  const tRef = useRef<number | null>(null);

  const push = (a: UndoAction) => {
    setAction(a);
    if (tRef.current) window.clearTimeout(tRef.current);
    tRef.current = window.setTimeout(() => setAction(null), timeoutMs);
  };

  const clear = () => {
    if (tRef.current) window.clearTimeout(tRef.current);
    tRef.current = null;
    setAction(null);
  };

  const undo = async () => {
    const a = action;
    clear();
    if (!a) return;
    await a.run();
  };

  useEffect(() => () => clear(), []);

  return { action, push, undo, clear };
}
