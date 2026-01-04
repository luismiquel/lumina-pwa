export default function Guide() {
  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-black">Guía de Lumina</h1>

      <section className="space-y-2">
        <h2 className="font-black">¿Qué es Lumina?</h2>
        <p>
          Lumina es una aplicación local diseñada para notas, citas y listas. No usa inteligencia artificial,
          no envía datos a internet y no depende de servicios de pago.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-black">Privacidad total</h2>
        <p>Toda la información se guarda únicamente en este dispositivo. Nadie más puede verla.</p>
      </section>

      <section className="space-y-2">
        <h2 className="font-black">Funciones</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Notas personales</li>
          <li>Lista de la compra</li>
          <li>Citas médicas y recordatorios</li>
          <li>Exportación e importación local</li>
          <li>Modo sin conexión</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-black">Modo sin conexión</h2>
        <p>Lumina funciona aunque no tengas internet. Si aparece un aviso de “sin conexión”, es normal.</p>
      </section>

      <section className="space-y-2">
        <h2 className="font-black">Instalar como aplicación</h2>
        <p>
          En Chrome o Edge puedes instalar Lumina como una app desde el menú del navegador:
          “Instalar aplicación”.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-black">¿Algo no funciona?</h2>
        <p>En Ajustes encontrarás un botón para reparar la aplicación sin perder tus datos.</p>
      </section>
    </div>
  );
}
