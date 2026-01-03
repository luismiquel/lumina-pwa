import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, EyeOff, Lock, X } from "lucide-react";

type Mode = "EXPORT" | "IMPORT";

export default function PasswordModal(props: {
  open: boolean;
  mode: Mode;
  onCancel: () => void;
  onConfirm: (password: string) => Promise<void> | void;
  busy?: boolean;
}) {
  const { open, mode, onCancel, onConfirm, busy } = props;
  const [show, setShow] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
    if (!open) return;
    setShow(false);
    setP1("");
    setP2("");
    setErr(null);
  }, [open]);

  // Focus trap + ESC
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (busy) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
        return;
      }

      if (e.key !== "Tab") return;

      const root = rootRef.current;
      if (!root) return;

      const focusables = Array.from(
        root.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      ).filter((el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden"));

      if (focusables.length === 0) return;

      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;

      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (active === first || !root.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, busy, onCancel]);const needConfirm = mode === "EXPORT";

  const strength = useMemo(() => {
    const p = p1;
    let s = 0;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[a-z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return Math.min(4, Math.floor((s / 5) * 4));
  }, [p1]);

  if (!open) return null;

  const submit = async () => {
    setErr(null);
    const pass = p1.trim();
    if (pass.length < 6) { setErr("La contraseña debe tener al menos 6 caracteres."); return; }
    if (needConfirm && pass !== p2.trim()) { setErr("Las contraseñas no coinciden."); return; }
    await onConfirm(pass);
  };

  const bar = ["bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-emerald-400"][strength] ?? "bg-red-500";
  const label = ["Débil", "Mejorable", "Ok", "Fuerte"][strength] ?? "Débil";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={busy ? undefined : onCancel} />
      <div ref={rootRef} role="dialog" aria-modal="true" aria-label="Contraseña" className="relative w-full max-w-[520px] glass rounded-3xl border border-white/10 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-lg">
            <Lock /> {mode === "EXPORT" ? "Export cifrado" : "Import cifrado"}
          </div>
          <button disabled={!!busy} onClick={onCancel} className="opacity-70 hover:opacity-100">
            <X />
          </button>
        </div>

        <p className="mt-2 text-sm opacity-70">
          {mode === "EXPORT"
            ? "Crea una contraseña. Sin ella no podrás recuperar el archivo cifrado."
            : "Introduce la contraseña del archivo cifrado."}
        </p>

        <div className="mt-4 space-y-3">
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={p1}
              onChange={(e) => setP1(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none pr-12"
              placeholder="Contraseña"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"
            >
              {show ? <EyeOff /> : <Eye />}
            </button>
          </div>

          {needConfirm && (
            <input
              type={show ? "text" : "password"}
              value={p2}
              onChange={(e) => setP2(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none"
              placeholder="Repite la contraseña"
            />
          )}

          {needConfirm && (
            <div className="space-y-2">
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div className={"h-2 " + bar} style={{ width: ((strength + 1) * 25) + "%" }} />
              </div>
              <div className="text-xs opacity-60">Fortaleza: <span className="font-black">{label}</span></div>
            </div>
          )}

          {err && <div className="text-sm text-red-200">{err}</div>}

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              disabled={!!busy}
              onClick={onCancel}
              className="bg-white/10 border border-white/10 font-black rounded-2xl py-4 disabled:opacity-30"
            >
              Cancelar
            </button>
            <button
              disabled={!!busy}
              onClick={submit}
              className="bg-[#00f2ff] text-black font-black rounded-2xl py-4 disabled:opacity-30"
            >
              {busy ? "..." : (mode === "EXPORT" ? "Cifrar" : "Descifrar")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

