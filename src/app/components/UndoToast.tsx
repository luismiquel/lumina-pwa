import { RotateCcw } from "lucide-react";

export default function UndoToast(props: { show: boolean; label?: string; onUndo: () => void; onClose: () => void }) {
  if (!props.show) return null;

  return (
    <div className="absolute left-0 right-0 bottom-[92px] px-4 z-50">
      <div className="glass border border-white/10 rounded-3xl px-4 py-3 flex items-center justify-between gap-3 shadow-xl">
        <div className="text-sm opacity-90">
          {props.label ?? "Acción realizada."}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={props.onUndo}
            className="bg-[#00f2ff] text-black font-black rounded-2xl px-4 py-2 inline-flex items-center gap-2"
          >
            <RotateCcw size={18}/> DESHACER
          </button>

          <button
            onClick={props.onClose}
            className="bg-white/10 border border-white/10 font-black rounded-2xl px-3 py-2 opacity-80 hover:opacity-100"
            aria-label="Cerrar"
            title="Cerrar"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
