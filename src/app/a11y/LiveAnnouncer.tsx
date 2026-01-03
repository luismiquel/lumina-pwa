import { useEffect, useState } from "react";
import { registerAnnounceListener } from "@/app/a11y/announce";

export default function LiveAnnouncer() {
  const [msg, setMsg] = useState("");

  useEffect(() => {
    registerAnnounceListener((m) => {
      // reinicia para que lectores lo lean aunque sea el mismo texto
      setMsg("");
      setTimeout(() => setMsg(m), 50);
    });
  }, []);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: "absolute",
        width: 1,
        height: 1,
        padding: 0,
        overflow: "hidden",
        clip: "rect(0,0,0,0)",
        whiteSpace: "nowrap",
        border: 0,
      }}
    >
      {msg}
    </div>
  );
}
