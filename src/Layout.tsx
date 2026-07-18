import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

const menu = [
  { to: "/", label: "Dashboard", icon: "📊" },
  { to: "/kriteria", label: "Data Kriteria", icon: "🎯" },
  { to: "/alternatif", label: "Data Alternatif", icon: "🛒" },
  { to: "/penilaian", label: "Input Penilaian", icon: "✍️" },
  { to: "/perhitungan", label: "Perhitungan SAW", icon: "🧮" },
  { to: "/riwayat", label: "Riwayat", icon: "🕘" },
];

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(
    () => localStorage.getItem("spk_dark") === "1"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("spk_dark", dark ? "1" : "0");
  }, [dark]);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100">
      <aside
        className={`${
          collapsed ? "w-16" : "w-64"
        } flex flex-col bg-blue-900 text-white transition-all duration-300`}
      >
        <div className="flex items-center justify-between px-4 py-4">
          {!collapsed && <span className="font-bold">SPK SAW</span>}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="rounded p-1 hover:bg-blue-800"
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-2">
          {menu.map((m) => (
            <NavLink
              key={m.to}
              to={m.to}
              end={m.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 transition ${
                  isActive ? "bg-blue-700" : "hover:bg-blue-800"
                }`
              }
            >
              <span>{m.icon}</span>
              {!collapsed && <span>{m.label}</span>}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={() => setDark((d) => !d)}
          className="m-2 rounded-lg px-3 py-2 text-left hover:bg-blue-800"
        >
          {dark ? "☀️" : "🌙"} {!collapsed && (dark ? "Light" : "Dark")}
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
