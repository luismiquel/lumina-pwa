import type { Settings } from "@/domain/models/settings";
import { Card } from "@/app/components/Card";

export function HomePage(props: { settings: Settings; onToggleSenior: () => void }) {
  const { settings, onToggleSenior } = props;

  return (
    <div className="flex flex-col gap-6">
      <Card title="Estado">
        <h1 className="text-3xl font-black tracking-tight">
          LUMINA <span className="text-[#00f2ff]">PWA</span>
        </h1>
        <p className="mt-2 text-white/60">Offline · Sin IA · Sin APIs de pago</p>

        <button
          onClick={onToggleSenior}
          className="mt-5 w-full bg-white/10 hover:bg-white/15 border border-white/10 font-black py-3 rounded-2xl transition"
        >
          Modo Senior: {settings.seniorMode ? "ON" : "OFF"}
        </button>
      </Card>

      <Card title="Siguiente">
        <p className="text-white/60 text-sm">
          Añade notas, controla gastos, guarda contactos y registra salud. Todo queda en tu dispositivo (IndexedDB).
        </p>
      </Card>
    </div>
  );
}
