import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Shield,
  WifiOff,
  Download,
  Upload,
  Wrench,
  MapPin,
  FileText,
  ShoppingCart,
  CalendarDays,
  Mic,
} from "lucide-react";
import { consumeNavTarget } from "@/app/navBus";

type SectionId =
  | "privacy"
  | "offline"
  | "notes"
  | "shopping"
  | "appointments"
  | "dictation"
  | "finder"
  | "backup"
  | "repair";

type Section = {
  id: SectionId;
  title: string;
  icon: any;
  body: React.ReactNode;
};

export default function Guide(props: { senior?: boolean; onClose?: () => void }) {
  const senior = !!props.senior;
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [hideOnStart, setHideOnStart] = useState<boolean>(() => localStorage.getItem("lumina_seen_guide_v1") === "1");

  useEffect(() => {
    const t = consumeNavTarget();
    if (!t || t.kind !== "GUIDE") return;
    const section = (t.section || "") as SectionId;
    if (!section) return;

    setOpen((s) => ({ ...s, [section]: true }));
    requestAnimationFrame(() => {
      document.getElementById("guide-" + section)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const sections: Section[] = useMemo(
    () => [
      {
        id: "privacy",
        title: "Privacidad (100% local)",
        icon: Shield,
        body: (
          <div className="space-y-2 opacity-90">
            <p>Esta app funciona SIN IA y SIN servicios externos. No envía tus datos a ningún servidor.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Datos: se guardan en tu navegador (local).</li>
              <li>Backup/Export: siempre a archivos en tu equipo.</li>
              <li>Offline: funciona sin conexión.</li>
            </ul>
          </div>
        ),
      },
      {
        id: "offline",
        title: "Modo Offline y PWA",
        icon: WifiOff,
        body: (
          <div className="space-y-2 opacity-90">
            <p>Instala la app como PWA para usarla como aplicación y offline.</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Abre la app en Edge/Chrome.</li>
              <li>Menú (⋯) → <b>Instalar aplicación</b>.</li>
              <li>Ábrela desde el icono instalado.</li>
            </ol>
            <p className="text-sm opacity-70">En localhost/preview puede no aparecer “Instalar”. En producción (HTTPS) sí.</p>
          </div>
        ),
      },
      {
        id: "notes",
        title: "Notas (crear, buscar, exportar CSV)",
        icon: FileText,
        body: (
          <div className="space-y-2 opacity-90">
            <ul className="list-disc pl-5 space-y-1">
              <li>Crea notas rápidas.</li>
              <li>Usa la búsqueda global para encontrarlas.</li>
              <li>Export/Import CSV para llevarte o recuperar datos.</li>
            </ul>
          </div>
        ),
      },
      {
        id: "shopping",
        title: "Compras (lista + CSV)",
        icon: ShoppingCart,
        body: (
          <div className="space-y-2 opacity-90">
            <ul className="list-disc pl-5 space-y-1">
              <li>Añade productos.</li>
              <li>Marca como comprado.</li>
              <li>Export/Import CSV para respaldo rápido.</li>
            </ul>
          </div>
        ),
      },
      {
        id: "appointments",
        title: "Citas (ICS export/import)",
        icon: CalendarDays,
        body: (
          <div className="space-y-2 opacity-90">
            <ul className="list-disc pl-5 space-y-1">
              <li>Guarda tus citas.</li>
              <li>Exporta a ICS para calendario.</li>
              <li>Importa ICS (te pedirá confirmación).</li>
            </ul>
          </div>
        ),
      },
      {
        id: "dictation",
        title: "Dictado (voz a texto)",
        icon: Mic,
        body: (
          <div className="space-y-2 opacity-90">
            <p>Usa el dictado del navegador si está disponible.</p>
            <p className="text-sm opacity-70">Puede variar según navegador/sistema. No usa APIs de pago.</p>
          </div>
        ),
      },
      {
        id: "finder",
        title: "GPS Emergencia (compartir ubicación)",
        icon: MapPin,
        body: (
          <div className="space-y-2 opacity-90">
            <ul className="list-disc pl-5 space-y-1">
              <li>Pulsa “Localizar ahora”.</li>
              <li>Copia el enlace.</li>
              <li>Compártelo por WhatsApp.</li>
            </ul>
            <p className="text-sm opacity-70">Necesita permiso de ubicación.</p>
          </div>
        ),
      },
      {
        id: "backup",
        title: "Backup/Restore (archivo local)",
        icon: Download,
        body: (
          <div className="space-y-2 opacity-90">
            <ul className="list-disc pl-5 space-y-1">
              <li><b>Backup</b> descarga una copia en tu equipo.</li>
              <li><b>Restore</b> importa esa copia y restaura datos.</li>
              <li>Recomendado: copias por fecha.</li>
            </ul>
            <div className="flex items-center gap-2 text-sm opacity-80">
              <Download size={16}/> Backup <span className="opacity-50">·</span> <Upload size={16}/> Restore
            </div>
          </div>
        ),
      },
      {
        id: "repair",
        title: "Repair App (pantalla blanca / errores)",
        icon: Wrench,
        body: (
          <div className="space-y-2 opacity-90">
            <p>Si algo se queda raro (pantalla blanca, assets 503, etc.) usa:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Entra a Ajustes</li>
              <li>Pulsa <b>Repair App</b></li>
              <li>Limpiará caches + SW y recargará</li>
            </ol>
          </div>
        ),
      },
    ],
    []
  );

  const toggle = (id: SectionId) => setOpen((s) => ({ ...s, [id]: !s[id] }));

  const markSeen = () => {
    localStorage.setItem("lumina_seen_guide_v1", "1");
    setHideOnStart(true);
    alert("OK. Ya no se mostrará al inicio.");
  };

  const showOnStart = () => {
    localStorage.removeItem("lumina_seen_guide_v1");
    setHideOnStart(false);
    alert("OK. La guía se mostrará al inicio.");
  };

  return (
    <div className="space-y-4">
      <div className="glass rounded-3xl p-6 border border-white/10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className={"font-black " + (senior ? "text-3xl" : "text-xl")}>Guía / Instrucciones</h2>
            <p className="opacity-70 mt-2">Todo local · Offline · Sin IA · Sin APIs de pago</p>
          </div>
          {props.onClose && (
            <button onClick={props.onClose} className="bg-white/10 border border-white/10 rounded-2xl px-4 py-2 font-black">
              Cerrar
            </button>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {!hideOnStart ? (
            <button onClick={markSeen} className="bg-[#00f2ff] text-black font-black rounded-2xl py-3">
              No mostrar al inicio
            </button>
          ) : (
            <button onClick={showOnStart} className="bg-white/10 border border-white/10 font-black rounded-2xl py-3">
              Mostrar al inicio
            </button>
          )}

          <button onClick={() => window.print()} className="bg-white/10 border border-white/10 font-black rounded-2xl py-3">
            Imprimir / PDF
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {sections.map((s) => {
          const Icon = s.icon;
          const isOpen = !!open[s.id];
          return (
            <div key={s.id} id={"guide-" + s.id} className="glass rounded-3xl border border-white/10 overflow-hidden">
              <button onClick={() => toggle(s.id)} className="w-full px-5 py-4 flex items-center justify-between gap-3" aria-expanded={isOpen}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Icon size={18} />
                  </div>
                  <div className={"text-left font-black " + (senior ? "text-xl" : "text-base")}>{s.title}</div>
                </div>
                {isOpen ? <ChevronUp /> : <ChevronDown />}
              </button>

              {isOpen && (
                <div className="px-5 pb-5">
                  <div className="border-t border-white/10 pt-4">{s.body}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

