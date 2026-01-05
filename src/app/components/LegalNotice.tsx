export default function LegalNotice() {
  return (
    <div className="glass rounded-3xl p-5 border border-white/10 space-y-3 text-sm">
      <div className="font-black text-lg">Aviso legal</div>

      <p className="opacity-80">
        © 2026 <b>Luis Miguel García de las Morenas</b><br />
        Todos los derechos reservados.
      </p>

      <p className="opacity-80">
        Uso personal permitido. El uso comercial, redistribución o modificación
        requiere autorización expresa del autor.
      </p>

      <p className="opacity-80">
        Lumina Local es una aplicación <b>100% local</b>. Todos los datos se
        almacenan únicamente en este dispositivo.
      </p>

      <p className="opacity-80">
        No se utilizan servidores, inteligencia artificial ni APIs de pago.
        No se recopila, envía ni vende información personal.
      </p>

      <p className="text-xs opacity-60">
        Esta aplicación no sustituye asesoramiento profesional médico, legal
        ni de ningún otro tipo.
      </p>
    </div>
  );
}
