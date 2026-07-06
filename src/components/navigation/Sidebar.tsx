import {
  LayoutDashboard, Users, Package, Briefcase, FolderOpen, Settings, TrendingUp,
} from "lucide-react";
import nirmitiLogo from "@/imports/nirmiti_logo.jpg";
import type { Page } from "@/lib/types";

const NAV_ITEMS = [
  { id: "dashboard" as Page, label: "Dashboard", icon: LayoutDashboard },
  { id: "customers" as Page, label: "Customers", icon: Users },
  { id: "sales" as Page, label: "Sales", icon: TrendingUp },
  { id: "inventory" as Page, label: "Inventory", icon: Package },
  { id: "shareholder" as Page, label: "Shareholder", icon: Briefcase },
  { id: "projects" as Page, label: "Projects", icon: FolderOpen },
  { id: "settings" as Page, label: "Settings", icon: Settings },
];

export function Sidebar({ active, onNav }: { active: Page; onNav: (p: Page) => void }) {
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
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={label}
              onClick={() => onNav(id)}
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
