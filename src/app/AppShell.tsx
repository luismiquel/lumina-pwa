import Overview from "@/app/pages/Overview";
import type { View } from "./nav";
import { useEffect, useState } from "react";
import {
  Home,
  CalendarDays,
  ShoppingCart,
  Mic,
  MapPin,
  Settings as SettingsIcon,
} from "lucide-react";

import { useSettings } from "@/app/hooks/useSettings";
import { useSeniorUX } from "@/app/hooks/useSeniorUX";
import HomePage from "@/app/pages/Home";
import Shopping from "@/app/pages/Shopping";
import Appointments from "@/app/pages/Appointments";
import Dictation from "@/app/pages/Dictation";
import Finder from "@/app/pages/Finder";
import Settings from "@/app/pages/Settings";
import UpdateToast from "@/app/components/UpdateToast";
import OfflineBadge from "@/app/components/OfflineBadge";
import { onNav } from "@/app/navBus";
import Guide from "@/app/pages/Guide";
export default function AppShell() {
  const { settings } = useSettings();
  const [view, setView] = useState<View>(() => ((localStorage.getItem("lumina_seen_guide_v1") ? "HOME" : "GUIDE")));
  const [guideSection, setGuideSection] = useState<string | undefined>(undefined);
      const senior = !!settings?.seniorMode;

  useEffect(() => {
    return onNav(({ view, section }: { view: import("@/app/nav").View; section?: string }) => {
      setGuideSection(section);
      setView(view);
    });
  }, []);

  const closeGuide = () => {
    localStorage.setItem("lumina_seen_guide_v1", "1");
    setView("HOME");
  };

  const openGuide = (section?: string) => { localStorage.setItem("lumina_seen_guide_v1", "1"); setView("GUIDE"); };

  
  const readOnly = !!settings?.readOnlyMode;
const { haptic } = useSeniorUX(senior);

  const go = (v: View) => {
    haptic(12);
    setView(v);
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white flex items-center justify-center p-3">
      <div className="w-full max-w-[560px] h-[92vh] rounded-[2.2rem] border border-white/10 bg-black/60 overflow-hidden relative">
        <header className="px-6 py-5 border-b border-white/10 bg-black/60 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className={"font-black tracking-tight " + (senior ? "text-2xl" : "text-xl")}>
                LUMINA LOCAL
              </div>
              <div className="text-xs opacity-50">Offline · Sin IA · Sin APIs de pago</div>
            </div>

            <button
              onClick={() => go("SETTINGS")}
              className="opacity-70 hover:opacity-100"
              aria-label="Abrir ajustes"
              title="Ajustes"
            >
              <SettingsIcon />
            </button>
          </div>
        </header>

        <main className="p-6 overflow-y-auto" style={{ height: "calc(92vh - 86px - 84px)" }}>
          {view === "HOME" && <HomePage onGo={setView} senior={senior} />}
          {view === "APPOINTMENTS" && <Appointments senior={senior} />}
          {view === "SHOPPING" && <Shopping senior={senior} readOnly={readOnly} /> }
          {view === "DICTATION" && <Dictation senior={senior} />}
          {view === "FINDER" && <Finder senior={senior} onHelp={() => openGuide("offline")} />}
          {view === "SETTINGS" && <Settings />}
        </main>

        <nav className="absolute bottom-0 left-0 right-0 p-4 bg-black/70 border-t border-white/10 backdrop-blur-xl">
          <div className="grid grid-cols-6 gap-2" role="tablist" aria-label="Navegación" data-navlist="1">
            <NavBtn ariaLabel="Inicio" senior={senior} onClick={() => go("HOME")} active={view === "HOME"}>
              <Home size={senior ? 22 : 20} />
            </NavBtn>

            <NavBtn ariaLabel="Citas" senior={senior} onClick={() => go("APPOINTMENTS")} active={view === "APPOINTMENTS"}>
              <CalendarDays size={senior ? 22 : 20} />
            </NavBtn>

            <NavBtn ariaLabel="Compras" senior={senior} onClick={() => go("SHOPPING")} active={view === "SHOPPING"}>
              <ShoppingCart size={senior ? 22 : 20} />
            </NavBtn>

            <NavBtn ariaLabel="Dictado" senior={senior} onClick={() => go("DICTATION")} active={view === "DICTATION"}>
              <Mic size={senior ? 22 : 20} />
            </NavBtn>

            <NavBtn ariaLabel="GPS emergencia" senior={senior} onClick={() => go("FINDER")} active={view === "FINDER"}>
              <MapPin size={senior ? 22 : 20} />
            </NavBtn>

            <NavBtn ariaLabel="Ajustes" senior={senior} onClick={() => go("SETTINGS")} active={view === "SETTINGS"}>
              <SettingsIcon size={senior ? 22 : 20} />
            </NavBtn>
          </div>
        </nav>

        <UpdateToast />
        <OfflineBadge />
      </div>
    </div>
  );
}

function NavBtn(props: { ariaLabel: string; senior: boolean; active: boolean; onClick: () => void; children: any }) {
  return (
    <button
      aria-label={props.ariaLabel}
      title={props.ariaLabel}
      onClick={props.onClick}
      className={
        "rounded-2xl border transition " +
        (props.senior ? "py-4 min-h-[56px] " : "py-3 ") +
        (props.active
          ? "bg-[#00f2ff]/15 border-[#00f2ff]/40 text-[#00f2ff]"
          : "bg-white/5 border-white/10 opacity-70 hover:opacity-100")
      }
    >
      <div className="flex items-center justify-center">{props.children}</div>
    </button>
  );
}





































