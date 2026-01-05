export default function LegalNotice() {
  return (
    <div className="glass rounded-3xl p-5 border border-white/10 space-y-3">
      <div className="font-black text-lg">Aviso legal</div>

      <p className="text-sm opacity-80">
        © 2026 <b>Luis Miguel García de las Morenas</b><br />
        Todos los derechos reservados.
      </p>

      <p className="text-sm opacity-80">
        Uso personal permitido.<br />
        El uso comercial, redistribución o modificación requiere autorización expresa del autor.
      </p>

      <div className="border-t border-white/10 pt-3 text-sm opacity-80">
        <div className="font-black mb-1">Aviso sobre medicación</div>
        <p>
          Lumina Local permite <b>registrar y recordar medicación</b>, pero:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>No ofrece consejos médicos.</li>
          <li>No sustituye la indicación de un profesional sanitario.</li>
          <li>No realiza diagnósticos ni recomendaciones automáticas.</li>
        </ul>
      </div>

      <p className="text-xs opacity-60">
        Todos los datos se almacenan únicamente en este dispositivo.
        Lumina no utiliza inteligencia artificial ni servicios externos.
      </p>
    </div>
  );
}
