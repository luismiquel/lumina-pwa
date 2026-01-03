import { useEffect, useMemo, useRef, useState } from "react";
import { VoiceRepo } from "../../../infra/db/repositories";
import type { VoiceIdea } from "../../../domain/models/entities";

type SR = SpeechRecognition;
type SRConstructor = new () => SR;

export default function VoiceIdeas({ senior }: { senior: boolean }) {
  const [supported, setSupported] = useState(true);
  const [list, setList] = useState<VoiceIdea[]>([]);
  const [listening, setListening] = useState(false);
  const [partial, setPartial] = useState("");
  const recRef = useRef<SR | null>(null);

  const SpeechRecognitionCtor: SRConstructor | null = useMemo(() => {
    // @ts-expect-error vendor
    const C = window.SpeechRecognition || window.webkitSpeechRecognition;
    return C ?? null;
  }, []);

  const load = async () => setList(await VoiceRepo.list());

  useEffect(() => {
    load();
    if (!SpeechRecognitionCtor) setSupported(false);
  }, [SpeechRecognitionCtor]);

  const start = () => {
    if (!SpeechRecognitionCtor) return;
    if (listening) return;

    const rec = new SpeechRecognitionCtor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "es-ES";

    rec.onresult = async (event: SpeechRecognitionEvent) => {
      let finalText = "";
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const txt = res[0]?.transcript ?? "";
        if (res.isFinal) finalText += txt;
        else interim += txt;
      }
      setPartial(interim.trim());

      if (finalText.trim()) {
        await VoiceRepo.add(finalText.trim());
        setPartial("");
        await load();
      }
    };

    rec.onerror = () => {
      setListening(false);
      setPartial("");
    };

    rec.onend = () => {
      setListening(false);
      setPartial("");
    };

    recRef.current = rec;
    setListening(true);
    rec.start();
  };

  const stop = () => {
    recRef.current?.stop();
    recRef.current = null;
    setListening(false);
    setPartial("");
  };

  const remove = async (id: string) => { await VoiceRepo.remove(id); await load(); };

  const shareWhatsApp = (text: string) => {
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="glass rounded-3xl p-6 border border-white/10">
      <h2 className={`font-black ${senior ? "text-3xl" : "text-xl"}`}>Ideas por voz</h2>

      {!supported && (
        <p className="mt-3 text-sm opacity-70">
          Este navegador no soporta SpeechRecognition. Usa Chrome/Edge.
        </p>
      )}

      <div className="mt-4 flex gap-2">
        <button
          onClick={listening ? stop : start}
          disabled={!supported}
          className={`flex-1 font-black py-3 rounded-2xl ${listening ? "bg-red-500 text-black" : "bg-cyan-400 text-black"} disabled:opacity-40`}
        >
          {listening ? "Detener" : "Empezar a dictar"}
        </button>
      </div>

      {partial && (
        <div className="mt-3 p-3 rounded-2xl border border-white/10 bg-white/5">
          <div className="text-xs opacity-60">Escuchando…</div>
          <div className="font-semibold">{partial}</div>
        </div>
      )}

      <div className="mt-5 space-y-2">
        {list.map(v => (
          <div key={v.id} className="p-4 rounded-2xl border border-white/10">
            <div className={`${senior ? "text-2xl" : "text-base"} font-semibold`}>{v.text}</div>
            <div className="mt-2 flex gap-2">
              <button onClick={() => shareWhatsApp(v.text)} className="bg-white/10 px-3 py-2 rounded-xl font-bold">
                WhatsApp
              </button>
              <button onClick={() => remove(v.id)} className="text-red-400 font-black px-3 py-2">
                Borrar
              </button>
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="opacity-50 mt-4">0 ideas</p>}
      </div>
    </div>
  );
}
