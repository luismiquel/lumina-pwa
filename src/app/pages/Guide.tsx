import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, BookOpen, Shield, WifiOff, Download, Upload, Wrench, Smartphone } from "lucide-react";

type Section = {
  id: string;
  title: string;
  icon: any;
  body: React.ReactNode;
};

export default function Guide(props: { senior: boolean; onClose: () => void }) {
  const { senior, onClose } = props;

  const [open, setOpen] = useState<Record<string, boolean>>({
    what: true,
    privacy: true,
    features: true,
    offline: false,
    backup: false,
    install: false,
    repair: false,
  });

  const titleCls = senior ? "text-3xl" : "text-2xl";
  const pCls = senior ? "text-base" : "text-sm";
  const btnPad = senior ? "py-4" : "py-3";

  const sections: Section[] = useMemo(() => ([
    {
      id: "what",
      title: "¿Qué es Lumina?",
      icon: <BookOpen size={18} />,
      body: (
        <div className={"space-y-2 " + pCls}>
          <p>
            Lumina es una app de notas, compras y citas diseñada para funcionar <b>100% local</b>.
            No usa IA en la nube, no necesita cuentas y no manda datos a internet.
          </p>
          <p className="opacity-80">
            Si tienes internet, puede abrir enlaces (por ejemplo OpenStreetMap), pero tus datos siguen siendo locales.
          </p>
        </div>
      ),
    },
    {
      id: "privacy",
      title: "Privacidad",
      icon: <Shield size={18} />,
      body: (
        <div className={"space-y-2 " + pCls}>
          <p>
            Todo se guarda en el dispositivo (IndexedDB). Nadie más tiene acceso si no tiene tu dispositivo.
          </p>
          <p className="opacity-80">
            Recomendación: usa Export cifrado (.enc) para copias en USB/PC.
          </p>
        </div>
      ),
    },
    {
      id: "features",
      title: "Qué puedes hacer",
      icon: <BookOpen size={18} />,
      body: (
        <div className={pCls}>
          <ul className="list-disc pl-6 space-y-1 opacity-90">
            <li>Notas: crear, editar, borrar + CSV + export/import</li>
            <li>Compras: lista local + CSV + export/import</li>
            <li>Citas: agenda local + export ICS + import ICS (con confirmación)</li>
            <li>Dictado: usando APIs del navegador (si están disponibles)</li>
            <li>GPS emergencia: enlace OpenStreetMap + compartir</li>
          </ul>
        </div>
      ),
    },
    {
      id: "offline",
      title: "Modo sin conexión",
      icon: <WifiOff size={18} />,
      body: (
        <div className={"space-y-2 " + pCls}>
          <p>La app funciona sin internet. Si ves un aviso “Sin conexión”, es normal.</p>
          <p className="opacity-80">
            Si una extensión del navegador rompe algo, prueba en modo incógnito o usando la app instalada (PWA).
          </p>
        </div>
      ),
    },
    {
      id: "backup",
      title: "Copias de seguridad",
      icon: <Download size={18} />,
      body: (
        <div className={"space-y-2 " + pCls}>
          <p><b>Backup JSON</b>: rápido y fácil. Útil para PC/USB.</p>
          <p><b>Export ZIP</b>: paquete completo (notas/compras/citas).</p>
          <p><b>Export cifrado (.enc)</b>: recomendado. Sin contraseña no se puede recuperar.</p>
          <div className="mt-2 rounded-2xl bg-white/5 border border-white/10 p-3">
            <div className="flex items-center gap-2 font-black"><Upload size={18}/> Consejo</div>
            <div className="opacity-80 mt-1">Guarda 2 copias: una en PC y otra en USB.</div>
          </div>
        </div>
      ),
    },
    {
      id: "install",
      title: "Instalar como app (PWA)",
      icon: <Smartphone size={18} />,
      body: (
        <div className={"space-y-2 " + pCls}>
          <p>
            En Edge/Chrome: menú del navegador → <b>Instalar aplicación</b>.
          </p>
          <p className="opacity-80">
            La PWA suele ir mejor que el navegador normal (menos extensiones y menos “ruido”).
          </p>
        </div>
      ),
    },
    {
      id: "repair",
      title: "Reparar si algo falla",
      icon: <Wrench size={18} />,
      body: (
        <div className={"space-y-2 " + pCls}>
          <p>Si ves pantalla blanca o recursos 503, usa en Ajustes el botón <b>Repair App</b>.</p>
          <p className="opacity-80">
            Ese botón resetea Service Worker y cachés para recuperar una instalación dañada sin tocar tus datos.
          </p>
        </div>
      ),
    },
  ]), [pCls]);

  const jump = (id: string) => {
    const el = document.getElementById("guide-" + id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setOpen((s) => ({ ...s, [id]: true }));
  };

  return (
    <div className="space-y-4">
      <div className="glass rounded-3xl p-6 border border-white/10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className={"font-black tracking-tight " + titleCls}>Guía de Lumina</h2>
            <p className={"opacity-70 mt-2 " + pCls}>
              Instrucciones, privacidad, backups, instalación y solución de problemas.
            </p>
          </div>
          <button
            onClick={onClose}
            className={"bg-[#00f2ff] text-black font-black rounded-2xl px-5 " + btnPad}
          >
            Cerrar
          </button>
        </div>

        {/* Índice */}
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="font-black mb-2">Índice</div>
          <div className="flex flex-wrap gap-2">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => jump(s.id)}
                className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl px-3 py-2 text-sm font-black opacity-90"
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Secciones */}
      <div className="space-y-2">
        {sections.map((s) => (
          <div
            key={s.id}
            id={"guide-" + s.id}
            className="glass rounded-3xl p-5 border border-white/10"
          >
            <button
              onClick={() => setOpen((st) => ({ ...st, [s.id]: !st[s.id] }))}
              className="w-full flex items-center justify-between gap-3"
              aria-expanded={!!open[s.id]}
            >
              <div className="flex items-center gap-2 font-black">
                <span className="opacity-90">{s.icon}</span>
                <span className={senior ? "text-xl" : "text-lg"}>{s.title}</span>
              </div>
              {open[s.id] ? <ChevronUp /> : <ChevronDown />}
            </button>

            {open[s.id] && <div className="mt-3">{s.body}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
