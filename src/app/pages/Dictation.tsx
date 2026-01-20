import { useEffect, useRef, useState } from "react";
import { Mic, Square, Send, Save, MapPin } from "lucide-react";
import { NotesRepo } from "@/infra/db/repositories";
import { appendToNotes } from "@/app/components/QuickNotes";
import { getCurrentGPS, formatGPSBlock } from "@/app/utils/gps";

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

export default function Dictation({ senior }: { senior: boolean }) {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [text, setText] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);
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
        if (e.results[i].isFinal) {
          finalTxt += e.results[i][0].transcript + " ";
        }
      }
      if (finalTxt) setText((p) => (p + finalTxt).trim());
    };

    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recRef.current = rec;
  }, []);

  const start = () => {
    if (!recRef.current) return;
    setListening(true);
    recRef.current.start();
  };

  const stop = () => {
    recRef.current?.stop();
    setListening(false);
  };

  const addGPS = async () => {
    try {
      setGpsLoading(true);
      const pos = await getCurrentGPS();
      setText((t) => formatGPSBlock(pos) + t);
    } catch {
      alert("No se pudo obtener la ubicación");
    } finally {
      setGpsLoading(false);
    }
  };

  const saveNote = async () => {
    if (!text.trim()) return;
    await NotesRepo.add("Nota con GPS", text.trim(), []);
    setText("");
    alert("Nota guardada");
  };

  const saveQuick = () => {
    if (!text.trim()) return;
    appendToNotes(text.trim());
    setText("");
  };

  const shareWhatsApp = () => {
    if (!text.trim()) return;
    window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank");
  };

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className={"font-black flex gap-2 " + (senior ? "text-3xl" : "text-xl")}>
          <Mic /> Dictado con ubicación
        </h2>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="mt-4 w-full min-h-[180px] rounded-2xl bg-black/40 p-4 border border-white/10 outline-none"
          placeholder="Dicta o escribe aquí…"
        />

        <div className="grid grid-cols-2 gap-2 mt-4">
          {!listening ? (
            <button onClick={start} disabled={!supported} className="btn-primary">
              <Mic /> Empezar
            </button>
          ) : (
            <button onClick={stop} className="btn-danger">
              <Square /> Parar
            </button>
          )}

          <button onClick={addGPS} disabled={gpsLoading} className="btn-secondary">
            <MapPin /> {gpsLoading ? "Localizando…" : "Añadir ubicación"}
          </button>

          <button onClick={saveNote} className="btn-secondary col-span-2">
            <Save /> Guardar nota
          </button>

          <button onClick={saveQuick} className="btn-secondary col-span-2">
            Guardar en notas rápidas
          </button>

          <button onClick={shareWhatsApp} className="btn-whatsapp col-span-2">
            <Send /> Enviar WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
