type Tab = { key: string; label: string };

export function TabBar(props: {
  tabs: Tab[];
  active: string;
  onSelect: (key: string) => void;
  senior?: boolean;
}) {
  const { tabs, active, onSelect, senior } = props;
  return (
    <div className="fixed bottom-4 left-4 right-4 max-w-xl mx-auto">
      <nav className="glass border border-white/10 rounded-3xl px-2 py-2 flex gap-1 backdrop-blur">
        {tabs.map(t => {
          const is = t.key === active;
          return (
            <button
              key={t.key}
              onClick={() => onSelect(t.key)}
              className={[
                "flex-1 rounded-2xl py-3 transition font-black",
                senior ? "text-base" : "text-xs",
                is ? "bg-[#00f2ff] text-black" : "text-white/60 hover:bg-white/5"
              ].join(" ")}
            >
              {t.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

