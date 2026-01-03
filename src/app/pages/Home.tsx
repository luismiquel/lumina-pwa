import { CalendarDays, Mic, MapPin, ShoppingCart } from "lucide-react";

export default function Home(props: { onGo: (v: any) => void; senior: boolean }) {
  const { onGo, senior } = props;
  const b = senior ? "text-xl py-5" : "text-sm py-4";

  return (
    <div className="glass rounded-3xl p-6 border border-white/10 space-y-4">
      <h2 className="font-black tracking-tight text-2xl">BÚNKER SOBERANO</h2>
      <p className="opacity-70">Offline · Sin IA · Sin APIs de pago</p>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => onGo("APPOINTMENTS")} className={"glass rounded-2xl border border-white/10 px-4 " + b}>
          <div className="flex items-center gap-2 font-black"><CalendarDays size={20}/> Citas</div>
        </button>
        <button onClick={() => onGo("SHOPPING")} className={"glass rounded-2xl border border-white/10 px-4 " + b}>
          <div className="flex items-center gap-2 font-black"><ShoppingCart size={20}/> Compra</div>
        </button>
        <button onClick={() => onGo("DICTATION")} className={"glass rounded-2xl border border-white/10 px-4 " + b}>
          <div className="flex items-center gap-2 font-black"><Mic size={20}/> Ideas</div>
        </button>
        <button onClick={() => onGo("FINDER")} className={"glass rounded-2xl border border-white/10 px-4 " + b}>
          <div className="flex items-center gap-2 font-black"><MapPin size={20}/> GPS</div>
        </button>
      </div>
    </div>
  );
}
