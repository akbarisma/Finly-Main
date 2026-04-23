import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  House, Receipt, ChartBar, ListBullets, Cpu, ClockCounterClockwise, SignOut, CircleDashed,
} from "@phosphor-icons/react";
import api from "../services/api";

const NAV = [
  { to: "/", label: "Beranda", icon: House, end: true, testid: "nav-dashboard" },
  { to: "/transaksi", label: "Transaksi", icon: Receipt, testid: "nav-transaksi" },
  { to: "/budgeting", label: "Anggaran", icon: ChartBar, testid: "nav-budgeting" },
  { to: "/detail", label: "Detail", icon: ListBullets, testid: "nav-detail" },
  { to: "/prediksi", label: "Prediksi ML", icon: Cpu, testid: "nav-prediksi" },
  { to: "/history", label: "Riwayat", icon: ClockCounterClockwise, testid: "nav-history" },
];

export default function Layout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user_data") || "{}"); }
    catch { return {}; }
  });
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const handleLogout = async () => {
    try { await api.logout(); } catch { /* noop */ }
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    navigate("/login");
  };

  const displayName = user?.name || user?.email || "User";
  const initials = (displayName.split(" ").map((p) => p[0]).join("").slice(0, 2) || "F").toUpperCase();

  return (
    <div className="min-h-screen flex bg-[var(--bg)]">
      {/* Sidebar */}
      <aside
        className="w-64 shrink-0 border-r hairline-strong bg-white flex flex-col sticky top-0 h-screen"
        data-testid="sidebar"
      >
        <div className="p-6 border-b hairline-strong">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--ink)] text-white flex items-center justify-center font-display font-black text-lg">F</div>
            <div>
              <div className="font-display font-black text-lg tracking-tighter leading-none">FINLY</div>
              <div className="overline mt-1">Financial · ID</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <div className="overline px-3 pb-2 pt-2">Modul</div>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              data-testid={item.testid}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-sm border-l-2 transition-colors ${
                  isActive
                    ? "bg-[var(--ink)] text-white border-[var(--ink)] font-semibold"
                    : "text-[var(--ink)] border-transparent hover:bg-black/5"
                }`
              }
            >
              <item.icon size={18} weight="regular" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t hairline-strong space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 border hairline-strong flex items-center justify-center font-mono text-sm">{initials}</div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate" data-testid="user-name">{displayName}</div>
              <div className="text-xs text-[var(--ink-soft)] truncate font-mono">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            data-testid="logout-button"
            className="w-full btn-ghost flex items-center justify-center gap-2 py-2"
          >
            <SignOut size={14} /> Keluar
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 flex flex-col">
        <div className="border-b hairline-strong bg-white">
          <div className="flex items-center justify-between px-8 py-3 text-[11px] font-mono text-[var(--ink-soft)]">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2">
                <CircleDashed size={12} className="blink-dot" weight="fill" />
                FINLY·LEDGER v1.0
              </span>
              <span>UPTIME · {clock.toLocaleDateString("id-ID")}</span>
            </div>
            <div className="flex items-center gap-6">
              <span>{clock.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB</span>
              <span>IDR · ID-ID</span>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
