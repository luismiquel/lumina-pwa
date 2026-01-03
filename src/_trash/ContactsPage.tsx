import { useEffect, useState } from "react";
import { Card } from "@/app/components/Card";
import { ContactsRepo } from "@/infra/db/repos";
import type { Contact } from "@/domain/models/entities";

export function ContactsPage(props: { senior?: boolean }) {
  const { senior } = props;
  const [items, setItems] = useState<Contact[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");

  const refresh = async () => setItems(await ContactsRepo.list());
  useEffect(() => { refresh(); }, []);

  const add = async () => {
    if (!name.trim()) return;
    await ContactsRepo.add({ name: name.trim(), phone: phone.trim() || undefined, email: email.trim() || undefined, note: note.trim() || undefined });
    setName(""); setPhone(""); setEmail(""); setNote("");
    await refresh();
  };

  const del = async (id: string) => { await ContactsRepo.remove(id); await refresh(); };

  return (
    <div className="flex flex-col gap-6">
      <Card title="Contactos">
        <div className="grid grid-cols-1 gap-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre"
            className={["w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-purple-400",
              senior ? "text-xl" : "text-sm"].join(" ")} />
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Teléfono"
            className={["w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-purple-400",
              senior ? "text-xl" : "text-sm"].join(" ")} />
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"
            className={["w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-purple-400",
              senior ? "text-xl" : "text-sm"].join(" ")} />
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="Nota"
            className={["w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-purple-400",
              senior ? "text-xl" : "text-sm"].join(" ")} />
          <button onClick={add} className="w-full bg-purple-500 text-black font-black py-3 rounded-2xl">
            Añadir
          </button>
        </div>
      </Card>

      <div className="space-y-3">
        {items.map(c => (
          <div key={c.id} className="glass border border-white/10 rounded-3xl p-5 flex justify-between gap-4">
            <div className="min-w-0">
              <p className={["font-black truncate", senior ? "text-2xl" : "text-base"].join(" ")}>{c.name}</p>
              <p className="text-xs text-white/40">
                {c.phone ? `📞 ${c.phone}` : ""} {c.email ? ` · ✉️ ${c.email}` : ""}
              </p>
              {c.note && <p className="mt-2 text-sm text-white/60">{c.note}</p>}
            </div>
            <button onClick={() => del(c.id)} className="text-red-400/70 hover:text-red-400 font-black">X</button>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-white/30">Sin contactos</p>}
      </div>
    </div>
  );
}
