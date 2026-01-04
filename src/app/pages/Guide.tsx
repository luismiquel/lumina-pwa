import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Printer, Shield, WifiOff, HardDrive, MapPin, FileDown, FileUp, Smartphone, Mic, NotebookPen, ShoppingCart, CalendarDays, Wrench } from "lucide-react";

type SectionId =
  | "overview"
  | "privacy"
  | "offline"
  | "pwa"
  | "backup"
  | "notes"
  | "shopping"
  | "appointments"
  | "dictation"
  | "finder"
  | "troubleshooting";

type Section = {
  id: SectionId;
  title: string;
  icon: any;
  body: React.ReactNode;
};

export default function Guide(props: { senior: boolean; onClose: () => void; initialSection?: string }) {
  const { senior, onClose, initialSection } = props;

  const [open, setOpen] = useState<Record<string, boolean>>({
    overview: true,
  });

  const sections: Section[] = useMemo(
    () => [
      {
        id: "overview",
        title: "Qué es Lumina Local",
        icon: Shield,
        body: (
          <div className="space-y-2">
            <p className="opacity-80">
              Lumina Local es una PWA (app instalable) que funciona <b>sin IA</b>, <b>sin APIs de pago</b> y <b>sin servidores</b>.
              Tus datos se guardan <b>en este dispositivo</b>.
            </p>
            <ul className="list-disc pl-5 opacity-80 space-y-1">
              <li>Notas (local) + export/import</li>
              <li>Compras (local) + export/import</li>
              <li>Citas (local) + export/import ICS</li>
              <li>Dictado (Web Speech del navegador si está disponible)</li>
              <li>GPS emergencia (enlace OpenStreetMap + compartir)</li>
              <li>Modo offline (PWA + Service Worker)</li>
            </ul>
          </div>
        ),
      },
      {
        id: "privacy",
        title: "Privacidad y seguridad",
        icon: Shield,
        body: (
          <div className="space-y-2">
            <p className="opacity-80">
              Lumina Local no envía datos a servicios externos. Los datos se guardan en el navegador (IndexedDB/LocalStorage).
            </p>
            <ul className="list-disc pl-5 opacity-80 space-y-1">
              <li>No hay cuentas, ni login, ni nube obligatoria.</li>
              <li>Backup/Restore se hace con archivos locales (JSON/CSV/ICS según módulo).</li>
              <li>Si borras caché/datos del navegador, puedes perder datos si no has exportado.</li>
            </ul>
          </div>
        ),
      },
      {
        id: "offline",
        title: "Modo offline",
        icon: WifiOff,
        body: (
          <div className="space-y-2">
            <p className="opacity-80">
              La app funciona sin internet una vez cargada e instalada como PWA. El Service Worker cachea recursos para que puedas abrirla offline.
            </p>
            <ul className="list-disc pl-5 opacity-80 space-y-1">
              <li>Si ves pantalla blanca tras una actualización, entra en <b>Ajustes → Repair App</b>.</li>
              <li>Evita abrir la app desde una pestaña vieja durante updates (mejor cerrar y abrir).</li>
            </ul>
          </div>
        ),
      },
      {
        id: "pwa",
        title: "Instalar como app (PWA)",
        icon: Smartphone,
        body: (
          <div className="space-y-2">
            <p className="opacity-80">
              En Chrome/Edge: menú (⋯) → <b>Instalar aplicación</b> / <b>Install app</b>. Se crea un icono en el escritorio/menú.
            </p>
            <ul className="list-disc pl-5 opacity-80 space-y-1">
              <li>Recomendado para modo offline estable.</li>
              <li>Si cambias de navegador, los datos no se comparten (son locales del navegador).</li>
            </ul>
          </div>
        ),
      },
      {
        id: "backup",
        title: "Backup y restore",
        icon: HardDrive,
        body: (
          <div className="space-y-2">
            <p className="opacity-80">
              En <b>Ajustes</b> puedes exportar una copia local y restaurarla cuando lo necesites.
            </p>
            <ul className="list-disc pl-5 opacity-80 space-y-1">
              <li><b>Backup</b>: genera un archivo para guardar.</li>
              <li><b>Restore</b>: carga el archivo y recupera los datos.</li>
              <li>Consejo: guarda backups por fecha (ej. una vez a la semana).</li>
            </ul>
          </div>
        ),
      },
      {
        id: "notes",
        title: "Notas",
        icon: NotebookPen,
        body: (
          <div className="space-y-2">
            <p className="opacity-80">
              Notas rápidas guardadas en local. Puedes exportar/importar CSV para moverlas entre dispositivos.
            </p>
            <ul className="list-disc pl-5 opacity-80 space-y-1">
              <li>Usa títulos claros y contenido breve.</li>
              <li>Exporta periódicamente si son importantes.</li>
            </ul>
          </div>
        ),
      },
      {
        id: "shopping",
        title: "Compras",
        icon: ShoppingCart,
        body: (
          <div className="space-y-2">
            <p className="opacity-80">
              Lista de la compra local con marcado de completado. Export/import CSV para respaldo o migración.
            </p>
            <ul className="list-disc pl-5 opacity-80 space-y-1">
              <li>Marca productos como hechos para mantener orden.</li>
              <li>Exporta antes de limpiar datos del navegador.</li>
            </ul>
          </div>
        ),
      },
      {
        id: "appointments",
        title: "Citas",
        icon: CalendarDays,
        body: (
          <div className="space-y-2">
            <p className="opacity-80">
              Citas médicas o recordatorios guardados en local. Puedes exportar a <b>ICS</b> para importar en calendarios.
            </p>
            <ul className="list-disc pl-5 opacity-80 space-y-1">
              <li>Export ICS: crea un archivo de calendario.</li>
              <li>Import ICS: añade eventos desde un archivo (con confirmación).</li>
            </ul>
          </div>
        ),
      },
      {
        id: "dictation",
        title: "Dictado",
        icon: Mic,
        body: (
          <div className="space-y-2">
            <p className="opacity-80">
              Usa funciones del navegador para convertir voz a texto. Si tu navegador/sistema no lo soporta, puede no funcionar.
            </p>
            <ul className="list-disc pl-5 opacity-80 space-y-1">
              <li>Concede permisos de micrófono.</li>
              <li>Funciona mejor en Chrome/Edge.</li>
            </ul>
          </div>
        ),
      },
      {
        id: "finder",
        title: "GPS emergencia",
        icon: MapPin,
        body: (
          <div className="space-y-2">
            <p className="opacity-80">
              Obtiene tu ubicación y genera un enlace de OpenStreetMap para compartir por WhatsApp o copiar.
            </p>
            <ul className="list-disc pl-5 opacity-80 space-y-1">
              <li>Necesita permiso de ubicación del navegador.</li>
              <li>En interiores puede tardar o ser menos exacto.</li>
            </ul>
          </div>
        ),
      },
      {
        id: "troubleshooting",
        title: "Solución de problemas",
        icon: Wrench,
        body: (
          <div className="space-y-2">
            <ul className="list-disc pl-5 opacity-80 space-y-1">
              <li><b>Pantalla blanca / 503</b>: Ajustes → <b>Repair App</b> y recarga.</li>
              <li><b>Errores raros en consola</b>: prueba en incógnito (pueden ser extensiones).</li>
              <li><b>No instala PWA</b>: usa HTTPS en producción, o `vite preview` local no siempre muestra “instalar”.</li>
              <li><b>He perdido datos</b>: restaura backup si lo tienes (por eso es clave exportar).</li>
            </ul>
            <div className="mt-3 glass rounded-2xl p-4 border border-white/10">
              <div className="font-black">Tip</div>
              <div className="text-sm opacity-80 mt-1">
                Si actualizas la app, cierra la ventana y vuelve a abrir para evitar cachés antiguos.
              </div>
            </div>
          </div>
        ),
      },
    ],
    []
  );

  useEffect(() => {
    if (!initialSection) return;
    const id = String(initialSection).toLowerCase();
    setOpen((s) => ({ ...s, [id]: true }));
    const el = document.getElementById("guide-" + id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [initialSection]);

  const markSeen = () => {
    localStorage.setItem("lumina_seen_guide_v1", "1");
    alert("Listo. No se mostrará al inicio.");
  };

  const printNow = () => window.print();

  return (
    <div className="space-y-4">
      <div className="glass rounded-3xl p-6 border border-white/10">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/15 border border-white/10 font-black rounded-2xl px-4 py-3 inline-flex items-center gap-2"
            aria-label="Volver"
          >
            <ArrowLeft /> Volver
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={printNow}
              className="bg-[#00f2ff] text-black font-black rounded-2xl px-4 py-3 inline-flex items-center gap-2"
              aria-label="Imprimir guía"
            >
              <Printer /> Imprimir
            </button>
          </div>
        </div>

        <h1 className={"mt-4 font-black tracking-tight " + (senior ? "text-3xl" : "text-2xl")}>Guía de Lumina Local</h1>
        <p className="opacity-70 mt-2">
          Manual rápido de uso. Todo funciona en local: sin IA, sin APIs de pago.
        </p>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            onClick={markSeen}
            className="bg-white/10 hover:bg-white/15 border border-white/10 font-black rounded-2xl py-3"
            aria-label="No mostrar al inicio"
          >
            No mostrar al inicio
          </button>

          <button
            onClick={() => alert("Consejo: Ajustes → Backup semanal.")}
            className="bg-white/10 hover:bg-white/15 border border-white/10 font-black rounded-2xl py-3"
            aria-label="Consejo rápido"
          >
            Consejo rápido
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {sections.map((s) => {
          const Icon = s.icon;
          const isOpen = !!open[s.id];
          return (
            <div key={s.id} id={"guide-" + s.id} className="glass rounded-3xl border border-white/10 overflow-hidden">
              <button
                onClick={() => setOpen((o) => ({ ...o, [s.id]: !o[s.id] }))}
                className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
                    <Icon size={20} />
                  </div>
                  <div className={"font-black " + (senior ? "text-xl" : "text-base")}>{s.title}</div>
                </div>
                <div className={"opacity-60 " + (senior ? "text-lg" : "text-sm")}>{isOpen ? "—" : "+"}</div>
              </button>

              {isOpen && <div className="px-5 pb-5">{s.body}</div>}
            </div>
          );
        })}
      </div>

      <div className="glass rounded-3xl p-6 border border-white/10">
        <div className="font-black flex items-center gap-2">
          <FileDown /> Exporta antes de borrar
        </div>
        <p className="opacity-80 mt-2 text-sm">
          Si limpias datos del navegador o reinstalas, puedes perder información. Haz backup/export regularmente.
        </p>
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={onClose}
            className="w-full bg-white/10 hover:bg-white/15 border border-white/10 font-black rounded-2xl py-3"
          >
            Cerrar guía
          </button>
        </div>
      </div>
    </div>
  );
}
