export function Card(props: { title: string; children: any }) {
  return (
    <div className="glass border border-white/10 rounded-3xl p-6">
      <h2 className="text-xs font-black uppercase tracking-[0.25em] text-white/40 mb-4">{props.title}</h2>
      {props.children}
    </div>
  );
}
