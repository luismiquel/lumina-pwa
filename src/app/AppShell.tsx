import { useState } from "react";
import HomeScreen from "@/app/screens/HomeScreen";
import NotesScreen from "@/app/screens/NotesScreen";
import ShoppingScreen from "@/app/screens/ShoppingScreen";
import ExpensesScreen from "@/app/screens/ExpensesScreen";

type Tab = "HOME" | "NOTES" | "SHOPPING" | "EXPENSES";

export default function AppShell() {
  const [tab, setTab] = useState<Tab>("HOME");

  return (
    <div className="min-h-screen bg-[#020408] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-3 flex gap-2">
          <TabBtn active={tab === "HOME"} onClick={() => setTab("HOME")}>Home</TabBtn>
          <TabBtn active={tab === "NOTES"} onClick={() => setTab("NOTES")}>Notas</TabBtn>
          <TabBtn active={tab === "SHOPPING"} onClick={() => setTab("SHOPPING")}>Lista</TabBtn>
          <TabBtn active={tab === "EXPENSES"} onClick={() => setTab("EXPENSES")}>Gastos</TabBtn>
        </div>

        {tab === "HOME" && <HomeScreen />}
        {tab === "NOTES" && <NotesScreen />}
        {tab === "SHOPPING" && <ShoppingScreen />}
        {tab === "EXPENSES" && <ExpensesScreen />}

        <p className="mt-3 text-[11px] opacity-30 text-center">
          100% local · IndexedDB · Sin IA · Sin APIs
        </p>
      </div>
    </div>
  );
}

function TabBtn(props: { active: boolean; onClick: () => void; children: any }) {
  return (
    <button
      onClick={props.onClick}
      className={
        "flex-1 rounded-xl py-2 font-black border transition " +
        (props.active
          ? "bg-[#00f2ff] text-black border-[#00f2ff]"
          : "bg-white/5 text-white border-white/10 hover:bg-white/10")
      }
    >
      {props.children}
    </button>
  );
}
