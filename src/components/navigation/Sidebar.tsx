import {
  LayoutDashboard, Users, Package, Briefcase, FolderOpen, Settings, TrendingUp,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import nirmitiLogo from "@/imports/nirmiti_logo.jpg";
import type { Page } from "@/lib/types";

const NAV_ITEMS: { id: Page; label: string; path: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { id: "customers", label: "Customers", path: "/customers", icon: Users },
  { id: "sales", label: "Sales", path: "/sales", icon: TrendingUp },
  { id: "inventory", label: "Inventory", path: "/inventory", icon: Package },
  { id: "shareholder", label: "Shareholder", path: "/shareholder", icon: Briefcase },
  { id: "projects", label: "Projects", path: "/projects", icon: FolderOpen },
  { id: "settings", label: "Settings", path: "/settings", icon: Settings },
];

export function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <aside className="w-56 shrink-0 flex flex-col h-full" style={{ background: "#0f1a35" }}>
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img
            src={nirmitiLogo}
            alt="Nirmiti Developers"
            className="w-10 h-10 rounded-lg object-contain bg-white p-0.5"
          />
          <div>
            <div className="text-white text-sm font-semibold leading-tight">Nirmiti</div>
            <div className="text-blue-300/70 text-[10px] leading-tight">Developers</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-300/40 px-3 mb-3">Main Menu</p>
        {NAV_ITEMS.map(({ id, label, path, icon: Icon }) => {
          const isActive = pathname === path;
          return (
            <button
              key={id}
              onClick={() => navigate(path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-blue-200/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">CE</div>
          <div>
            <div className="text-white text-xs font-semibold">CEO</div>
            <div className="text-blue-300/50 text-[10px]">Nirmiti Developers</div>
          </div>
        </div>
      </div>
    </aside>
  );
}