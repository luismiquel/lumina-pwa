import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

export default function VoiceNotesView() {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [text, setText] = useState("");
  const recRef = useRef<any>(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "es-ES";

    rec.onresult = (e: any) => {
      let finalTxt = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalTxt += t + " ";
      }
      if (finalTxt) setText((prev) => (prev + " " + finalTxt).trim());
    };

    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);

    recRef.current = rec;
  }, []);

  const start = () => {
    if (!recRef.current) return;
    setListening(true);
    try { recRef.current.start(); } catch {}
  };

  const stop = () => {
    if (!recRef.current) return;
    try { recRef.current.stop(); } catch {}
    setListening(false);
  };

  return (
    <div className="glass rounded-3xl p-6 border border-white/10 space-y-4">
      <h2 className="font-black text-xl">Grabadora de Ideas (Local)</h2>

      {!supported && (
        <p className="opacity-70">
          Este navegador no soporta SpeechRecognition. Puedes escribir manualmente.
        </p>
      )}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full min-h-[180px] bg-white/5 border border-white/10 rounded-2xl p-4 outline-none"
        placeholder="Dicta o escribe aquí…"
      />

      <div className="grid grid-cols-2 gap-2">
        {!listening ? (
          <button
            disabled={!supported}
            onClick={start}
            className="bg-[#00f2ff] text-black font-black rounded-2xl py-4 disabled:opacity-30"
          >
            EMPEZAR
          </button>
        ) : (
          <button
            onClick={stop}
            className="bg-red-400 text-black font-black rounded-2xl py-4"
          >
            PARAR
          </button>
        )}

        <button
          onClick={() => navigator.clipboard?.writeText(text)}
          className="bg-white/10 hover:bg-white/15 border border-white/10 font-black rounded-2xl py-4"
        >
          COPIAR
        </button>
      </div>

      <button
        onClick={() => window.open("https://wa.me/?text=" + encodeURIComponent(text || ""), "_blank")}
        className="w-full bg-green-500 text-black font-black rounded-2xl py-4"
      >
        ENVIAR A WHATSAPP
      </button>

      <p className="text-xs opacity-40">
        Sin IA y sin APIs de pago. (El dictado lo hace el motor del navegador si existe.)
      </p>
    </div>
  );
}
