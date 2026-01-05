import { useMemo, useState } from "react";

export default function AboutPanel(props: { senior?: boolean }) {
  const senior = !!props.senior;

  const manifesto = useMemo(() => (
`LUMINA LOCAL
Offline · Sin IA · Sin APIs de pago

MANIFIESTO
• Privacidad real: tus datos no salen de tu dispositivo (sin cuentas, sin servidor, sin tracking).
• Sin IA, a propósito: la app no “decide” por ti. Tú mandas.
• Offline de verdad: funciona sin Internet.
• Sin APIs de pago: sin costes ocultos, sin anuncios, sin suscripciones.
• Clara y simple: menos pantallas, menos ruido.
• Para todo el mundo: el modo senior es opcional (accesibilidad), no el público objetivo.

IMPORTANTE
Los datos se guardan en este dispositivo (IndexedDB / almacenamiento local).
Si borras datos del navegador o reinstalas, puedes perder información.
Recomendación: exporta copias de seguridad periódicamente.`
  ), []);

  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(manifesto);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback muy simple
      try {
        const ta = document.createElement("textarea");
        ta.value = manifesto;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch {}
    }
  };

  return (
    <div className="glass rounded-3xl p-5 border border-white/10">
      <div className={"font-black " + (senior ? "text-2xl" : "text-lg")}>Acerca de</div>
      <div className="opacity-70 mt-1">Offline · Sin IA · Sin APIs de pago</div>

      <div className="mt-4 space-y-3 opacity-90 text-sm leading-relaxed">
        <div className="font-black">Manifiesto</div>
        <ul className="space-y-2">
          <li>• Privacidad real: datos 100% locales.</li>
          <li>• Sin IA: decisiones transparentes, sin “caja negra”.</li>
          <li>• Offline-first: usable sin conexión.</li>
          <li>• Sin APIs de pago: sin costes ocultos.</li>
          <li>• Para todo el mundo: modo senior opcional.</li>
        </ul>

        <div className="text-xs opacity-70">
          Nota: si borras datos del navegador/dispositivo o reinstalas, puedes perder información. Haz backups.
        </div>
      </div>

      <button
        onClick={copy}
        className={"mt-4 w-full rounded-2xl py-3 font-black " + (copied ? "bg-white/15 border border-white/10" : "bg-[#00f2ff] text-black")}
      >
        {copied ? "Copiado ✅" : "Copiar manifiesto"}
      </button>
    </div>
  );
}
