import { useEffect, useState } from "react";
import { onSWUpdateReady, hasSWUpdateReady, applySWUpdate } from "../swRegister";

export function useSWUpdate() {
  const [ready, setReady] = useState<boolean>(hasSWUpdateReady());

  useEffect(() => {
    const unsubscribe = onSWUpdateReady(() => {
      setReady(true);
    });
    return unsubscribe;
  }, []);

  const applyUpdate = () => {
    applySWUpdate();
  };

  return { ready, applyUpdate };
}
