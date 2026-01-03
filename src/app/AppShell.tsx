import { useState } from "react";
import { Home, CalendarDays, ShoppingCart, Mic, MapPin, Settings as SettingsIcon } from "lucide-react";
import { useSettings } from "@/app/hooks/useSettings";
import HomePage from "@/app/pages/Home";
import Shopping from "@/app/pages/Shopping";
import Appointments from "@/app/pages/Appointments";
import Dictation from "@/app/pages/Dictation";
import Finder from "@/app/pages/Finder";
import Settings from "@/app/pages/Settings";

type View = "HOME" | "APPOINTMENTS" | "SHOPPING" | "DICTATION" | "FINDER" | "SETTINGS";

export default function AppShell() {
  const { settings } = useSettings();
  const [view, setView] = useState<View>("HOME");
  const senior = !!settings?.seniorMode;

  return (
    <div className="min-h-screen bg-[#020408] text-white flex items-center justify-center p-3">
      <div className="w-full max-w-[560px] h-[92vh] rounded-[2.2rem] border border-white/10 bg-black/60 overflow-hidden relative">
        <header className="px-6 py-5 border-b border-white/10 bg-black/60 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className={"font-black tracking-tight " + (senior ? "text-2xl" : "text-xl")}>LUMINA LOCAL</div>
              <div className="text-xs opacity-50">Offline · Sin IA · Sin APIs de pago</div>
            </div>
            <button onClick={()=>setView("SETTINGS")} className="opacity-70 hover:opacity-100">
              <SettingsIcon/>
            </button>
          </div>
        </header>

        <main className="p-6 overflow-y-auto" style={{ height: "calc(92vh - 86px - 84px)" }}>
          {view === "HOME" && <HomePage onGo={setView} senior={senior}/>}
          {view === "APPOINTMENTS" && <Appointments senior={senior}/>}
          {view === "SHOPPING" && <Shopping senior={senior}/>}
          {view === "DICTATION" && <Dictation senior={senior}/>}
          {view === "FINDER" && <Finder senior={senior}/>}
          {view === "SETTINGS" && <Settings/>}
        </main>

        <nav className="absolute bottom-0 left-0 right-0 p-4 bg-black/70 border-t border-white/10 backdrop-blur-xl">
          <div className="grid grid-cols-6 gap-2">
            <NavBtn onClick={()=>setView("HOME")} active={view==="HOME"}><Home size={20}/></NavBtn>
            <NavBtn onClick={()=>setView("APPOINTMENTS")} active={view==="APPOINTMENTS"}><CalendarDays size={20}/></NavBtn>
            <NavBtn onClick={()=>setView("SHOPPING")} active={view==="SHOPPING"}><ShoppingCart size={20}/></NavBtn>
            <NavBtn onClick={()=>setView("DICTATION")} active={view==="DICTATION"}><Mic size={20}/></NavBtn>
            <NavBtn onClick={()=>setView("FINDER")} active={view==="FINDER"}><MapPin size={20}/></NavBtn>
            <NavBtn onClick={()=>setView("SETTINGS")} active={view==="SETTINGS"}><SettingsIcon size={20}/></NavBtn>
          </div>
        </nav>
      </div>
    </div>
  );
}

function NavBtn(props: { active: boolean; onClick: ()=>void; children: any }) {
  return (
    <button onClick={props.onClick}
      className={"rounded-2xl py-3 border transition " + (props.active ? "bg-[#00f2ff]/15 border-[#00f2ff]/40 text-[#00f2ff]" : "bg-white/5 border-white/10 opacity-70 hover:opacity-100")}
    >
      <div className="flex items-center justify-center">{props.children}      <UpdateToast />
</div>
    </button>
  );
}

