import QuickNotes from "@/app/components/QuickNotes";

export default function HomePage({
  onGo,
  senior,
}: {
  onGo: (v: any) => void;
  senior: boolean;
}) {
  return (
    <div>
      <section>
        <h1 className={"font-black mb-2 " + (senior ? "text-2xl" : "text-xl")}>
          Inicio
        </h1>
        <p className="opacity-60 text-sm">
          Acceso rápido a tus funciones principales
        </p>
      </section>

      {/* 🔥 NOTAS RÁPIDAS */}
      <QuickNotes senior={senior} />

      {/* Aquí sigue tu HOME normal */}
    </div>
  );
}
