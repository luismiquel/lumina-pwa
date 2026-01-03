import { useMemo, useRef, useState, type ReactNode } from "react";
import {
  CheckCircle2,
  Shield,
  WifiOff,
  Download,
  Upload,
  KeyRound,
  Wrench,
  Keyboard,
  MapPin,
  CalendarDays,
  ShoppingCart,
  NotebookPen,
  Mic,
  Search,
  AlertTriangle,
} from "lucide-react";

type Section = {
  id: string;
  title: string;
  body: ReactNode;
  keywords: string[];
};

export default function Guide(props: { senior: boolean; onClose: () => void }) {
  const { senior, onClose } = props;
  const [q, setQ] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);

  const title = senior ? "text-3xl" : "text-2xl";
  const p = senior ? "text-base" : "text-sm";

  const sections: Section[] = useMemo(
    () => [
      {
        id: "intro",
        title: "Qué es Lumina Local",
        keywords: ["offline", "local", "privacidad", "sin ia", "sin apis"],
        body: (
          <div className={"space-y-2 " + p}>
            <p className="opacity-80">
              Lumina Local es una PWA que funciona <b>sin internet</b>, <b>sin IA</b> y <b>sin APIs de pago</b>.
              Tus datos se guardan en este dispositivo (IndexedDB).
            </p>
            <div className="grid grid-cols-1 gap-2">
              <Tip icon={<WifiOff />} title="Offline real" text="Funciona sin conexión. No sube nada a servidores." />
              <Tip icon={<Shield />} title="Privacidad" text="Los datos son locales. No hay cuentas ni tracking." />
              <Tip icon={<Keyboard />} title="Teclado" text="En la barra inferior: ← → (Home/End) para moverte." />
            </div>
          </div>
        ),
      },
      {
        id: "features",
        title: "Funciones",
        keywords: ["notas", "compras", "citas", "dictado", "gps", "emergencia"],
        body: (
          <div className="space-y-2">
            <Feature icon={<NotebookPen />} name="Notas" desc="Notas locales + export/import CSV + export bundle." />
            <Feature icon={<ShoppingCart />} name="Compras" desc="Lista local + export/import CSV + bundle." />
            <Feature icon={<CalendarDays />} name="Citas" desc="Agenda local + export ICS + import ICS (con confirmación)." />
            <Feature icon={<Mic />} name="Dictado" desc="Dictado local (si tu navegador lo soporta). Sin IA externa." />
            <Feature icon={<MapPin />} name="GPS emergencia" desc="Enlace OpenStreetMap y compartir por WhatsApp." />
          </div>
        ),
      },
      {
        id: "backup",
        title: "Backup, Restore y Export",
        keywords: ["backup", "restore", "export", "zip", "cifrado", "contraseña", "aes"],
        body: (
          <div className="space-y-3">
            <Mini icon={<Download />} title="BACKUP (JSON)" text="Crea un backup local .json (rápido). Guarda en PC/USB." />
            <Mini icon={<Upload />} title="RESTORE (JSON)" text="Restaura el .json. La app se recarga para aplicar datos." />
            <Mini icon={<Download />} title="EXPORT TODO (ZIP)" text="Export completo (notas, compras, citas) en ZIP local." />
            <Mini icon={<KeyRound />} title="EXPORT CIFRADO (.enc)" text="Export cifrado por contraseña (AES-GCM + HMAC). Sin contraseña no se recupera." />
            <Mini icon={<Upload />} title="IMPORT CIFRADO (.enc)" text="Importa el export cifrado introduciendo la contraseña." />

            <Callout
              icon={<CheckCircle2 className="text-emerald-300" />}
              title="Recomendación"
              text="Haz un export cifrado y guárdalo en 2 sitios (PC + USB). Activa Persistencia en Ajustes."
              senior={senior}
            />
          </div>
        ),
      },
      {
        id: "pwa",
        title: "Instalación PWA (paso a paso)",
        keywords: ["pwa", "instalar", "edge", "chrome", "standalone", "persistencia"],
        body: (
          <ol className={"list-decimal pl-5 space-y-2 opacity-85 " + p}>
            <li>Abre la app en Edge o Chrome (modo normal, no incógnito).</li>
            <li>Menú del navegador → <b>Instalar aplicación</b>.</li>
            <li>Abre la PWA instalada.</li>
            <li>Ve a <b>Ajustes → Persistencia</b> y actívala.</li>
            <li>Haz un <b>Export cifrado</b> y guárdalo fuera del móvil/PC (USB).</li>
          </ol>
        ),
      },
      {
        id: "maintenance",
        title: "Mantenimiento",
        keywords: ["repair", "diagnostico", "persistencia", "storage", "cache", "sw"],
        body: (
          <div className="space-y-3">
            <Mini icon={<Wrench />} title="Repair App" text="Útil si hay pantalla en blanco o recursos 503 tras updates." />
            <Mini icon={<Shield />} title="Diagnóstico" text="Comprueba SW, cachés, IndexedDB y copia reporte." />
            <Mini icon={<Shield />} title="Persistencia" text="Evita que el sistema borre datos por limpieza de espacio." />
          </div>
        ),
      },
      {
        id: "troubleshooting",
        title: "Solución de problemas",
        keywords: ["pantalla blanca", "503", "offline", "cache", "sw", "extensiones", "incognito"],
        body: (
          <div className="space-y-3">
            <Trouble
              title="Pantalla blanca después de actualizar"
              text="Ve a Ajustes → Repair App. Luego recarga. Si sigue, cierra la PWA y ábrela otra vez."
              senior={senior}
            />
            <Trouble
              title="Error 503 al cargar CSS/JS"
              text="Suele ser caché/SW desincronizado. Usa Repair App. Alternativa: desinstala la PWA y vuelve a instalar."
              senior={senior}
            />
            <Trouble
              title="En incógnito funciona y en normal no"
              text="Normalmente es una extensión del navegador inyectando scripts. Prueba desactivar extensiones o usar Repair App."
              senior={senior}
            />
            <Trouble
              title="No puedo activar Persistencia"
              text="Depende del navegador y ajustes del sistema. Aun así, haz export cifrado frecuente."
              senior={senior}
            />
            <Trouble
              title="No funciona Dictado"
              text="Depende del soporte del navegador. No usamos IA externa: si el navegador no lo soporta, no estará disponible."
              senior={senior}
            />
            <Callout
              icon={<AlertTriangle className="text-yellow-300" />}
              title="Importante"
              text="Si pierdes la contraseña del export cifrado, no hay recuperación posible."
              senior={senior}
            />
          </div>
        ),
      },
    ],
    [p, senior]
  );

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return sections;
    return sections.filter((s) => {
      const hay = (s.title + " " + s.keywords.join(" ")).toLowerCase();
      return hay.includes(qq);
    });
  }, [q, sections]);

  const scrollTo = (id: string) => {
    const el = rootRef.current?.querySelector<HTMLElement>("#" + id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-4" ref={rootRef}>
      <div className="glass rounded-3xl p-6 border border-white/10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className={"font-black tracking-tight " + title}>Guía · Lumina Local</h2>
            <p className={"opacity-70 mt-2 " + p}>
              Manual integrado: qué hace la app, cómo instalarla y cómo hacer copias.
            </p>
          </div>
          <button onClick={onClose} className="bg-[#00f2ff] text-black font-black rounded-2xl px-5 py-3">
            Cerrar
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <Search className="opacity-70" size={18} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Buscar en la guía"
            className="w-full bg-transparent outline-none text-sm"
            placeholder="Buscar (backup, PWA, 503, dictado, persistencia...)"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl px-3 py-2 text-xs font-black"
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {filtered.map((s) => (
        <div key={s.id} id={s.id} className="glass rounded-3xl p-6 border border-white/10 space-y-3">
          <h3 className="font-black text-lg">{s.title}</h3>
          {s.body}
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="glass rounded-3xl p-6 border border-white/10">
          <div className="font-black">Sin resultados</div>
          <div className="text-sm opacity-70 mt-1">Prueba con: backup, PWA, 503, pantalla blanca, persistencia…</div>
        </div>
      )}
    </div>
  );
}

function Tip(props: { icon: any; title: string; text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="opacity-90">{props.icon}</div>
      <div>
        <div className="font-black">{props.title}</div>
        <div className="text-sm opacity-70">{props.text}</div>
      </div>
    </div>
  );
}

function Feature(props: { icon: any; name: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="opacity-90">{props.icon}</div>
      <div>
        <div className="font-black">{props.name}</div>
        <div className="text-sm opacity-70">{props.desc}</div>
      </div>
    </div>
  );
}

function Mini(props: { icon: any; title: string; text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="opacity-90">{props.icon}</div>
      <div>
        <div className="font-black">{props.title}</div>
        <div className="text-sm opacity-70">{props.text}</div>
      </div>
    </div>
  );
}

function Callout(props: { icon: any; title: string; text: string; senior: boolean }) {
  const p = props.senior ? "text-base" : "text-sm";
  return (
    <div className={"rounded-2xl border border-white/10 bg-white/5 p-4 " + p}>
      <div className="font-black flex items-center gap-2">{props.icon} {props.title}</div>
      <div className="opacity-70 mt-1">{props.text}</div>
    </div>
  );
}

function Trouble(props: { title: string; text: string; senior: boolean }) {
  const p = props.senior ? "text-base" : "text-sm";
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="font-black">{props.title}</div>
      <div className={"opacity-70 mt-1 " + p}>{props.text}</div>
    </div>
  );
}

