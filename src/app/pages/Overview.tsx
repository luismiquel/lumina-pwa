import {
  Shield,
  WifiOff,
  Download,
  Upload,
  KeyRound,
  Wrench,
  ClipboardCheck,
  CalendarDays,
  ShoppingCart,
  NotebookPen,
  Mic,
  MapPin,
  Keyboard,
  CheckCircle2,
} from "lucide-react";

export default function Overview(props: { senior: boolean; onClose: () => void; onOpenGuide?: () => void }) {
  const { senior, onClose, onOpenGuide } = props;

  const title = senior ? "text-3xl" : "text-2xl";
  const p = senior ? "text-base" : "text-sm";

  return (
    <div className="space-y-4">
      <div className="glass rounded-3xl p-6 border border-white/10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className={"font-black tracking-tight " + title}>Qué incluye Lumina Local</h2>
            <p className={"opacity-70 mt-2 " + p}>
              Resumen completo de funciones. Todo funciona <b>local</b>, <b>sin IA</b> y <b>sin APIs de pago</b>.
            </p>
          </div>

          <div className="flex gap-2">
            {onOpenGuide && (
              <button
                onClick={onOpenGuide}
                className="bg-white/10 hover:bg-white/15 border border-white/10 font-black rounded-2xl px-4 py-3"
              >
                Guía
              </button>
            )}
            <button
              onClick={onClose}
              className="bg-[#00f2ff] text-black font-black rounded-2xl px-5 py-3"
            >
              Cerrar
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-2">
          <Card icon={<WifiOff />} title="Offline real" text="Funciona sin conexión. No sincroniza con servidores." />
          <Card icon={<Shield />} title="Privacidad" text="Datos locales (IndexedDB). Sin cuentas, sin tracking." />
          <Card icon={<Keyboard />} title="Accesibilidad" text="Navegación por teclado en la barra inferior (← →, Home/End)." />
        </div>
      </div>

      <Section title="Módulos principales">
        <Grid>
          <Item icon={<NotebookPen />} title="Notas" text="Crear, editar, borrar. Export/Import CSV y export bundle." />
          <Item icon={<ShoppingCart />} title="Compras" text="Lista local. CSV + bundle. (Modo solo lectura si lo tienes)." />
          <Item icon={<CalendarDays />} title="Citas" text="Agenda local. Export ICS e Import ICS (con confirmación)." />
          <Item icon={<Mic />} title="Dictado" text="Dictado local según soporte del navegador. Sin IA externa." />
          <Item icon={<MapPin />} title="GPS emergencia" text="Obtén enlace OpenStreetMap y compártelo por WhatsApp." />
        </Grid>
      </Section>

      <Section title="Copias de seguridad y exportación">
        <Grid>
          <Item icon={<Download />} title="Backup JSON" text="Backup rápido en .json (ideal para PC/USB)." />
          <Item icon={<Upload />} title="Restore JSON" text="Restaura el backup y recarga la app." />
          <Item icon={<Download />} title="Export completo (ZIP)" text="Export de notas+compras+citas en ZIP local." />
          <Item icon={<KeyRound />} title="Export cifrado (.enc)" text="Cifrado por contraseña (AES-GCM + HMAC). Sin contraseña no hay recuperación." />
        </Grid>

        <div className={"mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 " + p}>
          <div className="font-black flex items-center gap-2">
            <CheckCircle2 className="text-emerald-300" /> Recomendación
          </div>
          <div className="opacity-70 mt-1">
            Haz export cifrado y guárdalo en 2 sitios (PC + USB). Activa Persistencia en Ajustes.
          </div>
        </div>
      </Section>

      <Section title="Mantenimiento y seguridad">
        <Grid>
          <Item icon={<Wrench />} title="Repair App" text="Repara SW/cachés si ves pantalla blanca o recursos 503." />
          <Item icon={<ClipboardCheck />} title="Diagnóstico" text="Reporte de estado (SW, caché, DB, almacenamiento)." />
          <Item icon={<Shield />} title="Persistencia" text="Activa almacenamiento persistente para proteger datos." />
        </Grid>
      </Section>
    </div>
  );
}

function Section(props: { title: string; children: any }) {
  return (
    <div className="glass rounded-3xl p-6 border border-white/10 space-y-3">
      <h3 className="font-black text-lg">{props.title}</h3>
      {props.children}
    </div>
  );
}

function Grid(props: { children: any }) {
  return <div className="grid grid-cols-1 gap-2">{props.children}</div>;
}

function Card(props: { icon: any; title: string; text: string }) {
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

function Item(props: { icon: any; title: string; text: string }) {
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
