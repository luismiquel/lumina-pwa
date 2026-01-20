import { useEffect, useRef, useState } from "react";
import { Mic, Square, Send, Save, FileText } from "lucide-react";
import { NotesRepo } from "@/infra/db/repositories";
import { appendToNotes } from "@/app/components/QuickNotes";

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

export default function Dictation(props: { senior: boolean }) {
  const { senior } = props;
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
      if (finalTxt) {
        setText((prev) => (prev + finalTxt).trim());
      }
    };

    rec.onerror = () => {
      setListening(false);
    };

    rec.onend = () => {
      setListening(false);
    };

    recRef.current = rec;
  }, []);

  const start = () => {
    if (!recRef.current) return;
    setListening(true);
    recRef.current.start();
  };

  const stop = () => {
    if (!recRef.current) return;
    recRef.current.stop();
    setListening(false);
  };

  const saveNote = async () => {
    const content = text.trim();
    if (!content) return;
    await NotesRepo.add("Idea (dictado)", content, []);
    setText("");
    alert("Guardado en Notas (local).");
  };

  const saveQuickNote = () => {
    const content = text.trim();
    if (!content) return;
    appendToNotes(content);
    setText("");
    alert("Añadido a Notas rápidas.");
  };

  const shareWhatsApp = () => {
    const content = text.trim();
    if (!content) return;
    const url = "https://wa.me/?text=" + encodeURIComponent(content);
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-4">
      <div className="glass rounded-3xl p-6 border border-white/10">
        <h2
          className={
            "font-black flex items-center gap-2 " +
            (senior ? "text-3xl" : "text-xl")
          }
        >
          <Mic /> Dictado de ideas
        </h2>

        {!supported && (
          <p className="mt-3 opacity-70">
            Este navegador no soporta SpeechRecognition. Puedes escribir
            manualmente.
          </p>
        )}

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className={
            "mt-4 w-full min-h-[180px] bg-white/5 border border-white/10 rounded-2xl p-4 outline-none " +
            (senior ? "text-lg" : "text-sm")
          }
          placeholder="Dicta o escribe aquí…"
        />

        <div className="grid grid-cols-2 gap-2 mt-4">
          {!listening ? (
            <button
              disabled={!supported}
              onClick={start}
              className="bg-[#00f2ff] text-black font-black rounded-2xl py-4 disabled:opacity-30"
            >
              <span className="inline-flex items-center justify-center gap-2">
                <Mic /> Empezar
              </span>
            </button>
          ) : (
            <button
              onClick={stop}
              className="bg-red-400 text-black font-black rounded-2xl py-4"
            >
              <span className="inline-flex items-center justify-center gap-2">
                <Square /> Parar
              </span>
            </button>
          )}

          <button
            onClick={saveNote}
            className="bg-white/10 hover:bg-white/15 border border-white/10 font-black rounded-2xl py-4"
          >
            <span className="inline-flex items-center justify-center gap-2">
              <Save /> Guardar
            </span>
          </button>

          <button
            onClick={saveQuickNote}
            className="col-span-2 bg-white/10 hover:bg-white/15 border border-white/10 font-black rounded-2xl py-4"
          >
            <span className="inline-flex items-center justify-center gap-2">
              <FileText /> Añadir a Notas rápidas
            </span>
          </button>

          <button
            onClick={shareWhatsApp}
            className="col-span-2 bg-green-500 text-black font-black rounded-2xl py-4"
          >
            <span className="inline-flex items-center justify-center gap-2">
              <Send /> Enviar a WhatsApp
            </span>
          </button>
        </div>

        <p className="mt-3 text-xs opacity-40">
          Nota: el dictado depende del motor del navegador (sin claves, sin pagos).
          En algunos dispositivos puede variar.
        </p>
      </div>
    </div>
  );
}
