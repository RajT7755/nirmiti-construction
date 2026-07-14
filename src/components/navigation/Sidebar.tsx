import { useState, useEffect } from "react";
import {
  LayoutDashboard, Users, Package, Briefcase, FolderOpen, Settings, TrendingUp, CreditCard, MessageSquare,
  ChevronDown, ChevronRight,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { BrandMark } from "@/components/branding/BrandMark";
import { UserSessionBadge } from "@/components/auth/UserSessionBadge";
import { useAppDataContext } from "@/app/AppDataContext";
import { MotionShineLayer } from "@/components/ui/MotionShineLayer";
import { resolveCompanyName } from "@/lib/settings/defaultSettings";
import type { Page } from "@/lib/types";
import "./navyMotionShine.css";

const SALES_PATHS = ["/sales", "/received-payment"];
const SETTINGS_PATHS = [
  "/settings",
  "/settings/profile",
  "/settings/business",
  "/settings/inventory",
  "/settings/sales",
  "/settings/sales/invoice-template",
  "/settings/sales/message-templates",
  "/settings/customers",
];

const SETTINGS_CHILDREN = [
  { label: "Profile", path: "/settings/profile" },
  { label: "Business Profile", path: "/settings/business" },
  { label: "Inventory", path: "/settings/inventory" },
  { label: "Sales", path: "/settings/sales" },
  { label: "Customers", path: "/settings/customers" },
];

const SALES_CHILDREN: { id: Page; label: string; path: string }[] = [
  { id: "sales", label: "Sales Dashboard", path: "/sales" },
  { id: "received-payment", label: "Received Payment", path: "/received-payment" },
];

const NAV_ITEMS: { id: Page; label: string; path: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { id: "customers", label: "Customers", path: "/customers", icon: Users },
  { id: "inventory", label: "Inventory", path: "/inventory", icon: Package },
  { id: "shareholder", label: "Shareholder", path: "/shareholder", icon: Briefcase },
  { id: "projects", label: "Projects", path: "/projects", icon: FolderOpen },
];

export function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { businessProfile, profileSettings } = useAppDataContext();
  const companyName = resolveCompanyName(businessProfile);
  const isSalesSection = SALES_PATHS.includes(pathname);
  const isSettingsSection = SETTINGS_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  const [salesExpanded, setSalesExpanded] = useState(isSalesSection);
  const [settingsExpanded, setSettingsExpanded] = useState(isSettingsSection);

  useEffect(() => {
    if (isSalesSection) setSalesExpanded(true);
  }, [isSalesSection]);

  useEffect(() => {
    if (isSettingsSection) setSettingsExpanded(true);
  }, [isSettingsSection]);

  return (
    <aside
      className="navy-motion-shine w-56 shrink-0 flex flex-col h-full"
      style={{ background: "#0f1a35" }}
    >
      <MotionShineLayer />
      <div className="relative z-10 flex flex-col h-full">
      <div className="px-4 py-4 border-b border-white/10">
        <BrandMark businessProfile={businessProfile} variant="sidebar" />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-300/40 px-3 mb-3">Main Menu</p>

        {/* Dashboard */}
        <button
          onClick={() => navigate("/dashboard")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            pathname === "/dashboard"
              ? "bg-blue-600 text-white"
              : "text-blue-200/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <LayoutDashboard size={15} />
          Dashboard
        </button>

        {/* Customers */}
        <button
          onClick={() => navigate("/customers")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            pathname === "/customers"
              ? "bg-blue-600 text-white"
              : "text-blue-200/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <Users size={15} />
          Customers
        </button>

        {/* Messenger */}
        <button
          onClick={() => navigate("/messenger")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            pathname === "/messenger"
              ? "bg-blue-600 text-white"
              : "text-blue-200/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <MessageSquare size={15} />
          Messenger
        </button>

        {/* Sales — expandable group */}
        <div>
          <div className="flex items-center">
            <button
              onClick={() => navigate("/sales")}
              className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isSalesSection
                  ? "bg-blue-600/80 text-white"
                  : "text-blue-200/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <TrendingUp size={15} />
              Sales
            </button>
            <button
              onClick={() => setSalesExpanded((e) => !e)}
              className="p-2 rounded-lg text-blue-200/60 hover:text-white hover:bg-white/5 transition-colors"
              aria-label={salesExpanded ? "Collapse Sales menu" : "Expand Sales menu"}
            >
              {salesExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          </div>
          {salesExpanded && (
            <div className="ml-4 mt-0.5 space-y-0.5 border-l border-white/10 pl-2">
              {SALES_CHILDREN.map(({ id, label, path }) => (
                <button
                  key={id}
                  onClick={() => navigate(path)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    pathname === path
                      ? "bg-blue-600 text-white"
                      : "text-blue-200/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {id === "received-payment" ? <CreditCard size={13} /> : <TrendingUp size={13} />}
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {NAV_ITEMS.slice(2).map(({ id, label, path, icon: Icon }) => {
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

        <div>
          <div className="flex items-center">
            <button
              onClick={() => navigate("/settings/profile")}
              className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isSettingsSection
                  ? "bg-blue-600/80 text-white"
                  : "text-blue-200/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Settings size={15} />
              Settings
            </button>
            <button
              onClick={() => setSettingsExpanded((e) => !e)}
              className="p-2 rounded-lg text-blue-200/60 hover:text-white hover:bg-white/5 transition-colors"
              aria-label={settingsExpanded ? "Collapse Settings menu" : "Expand Settings menu"}
            >
              {settingsExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          </div>
          {settingsExpanded && (
            <div className="ml-4 mt-0.5 space-y-0.5 border-l border-white/10 pl-2">
              {SETTINGS_CHILDREN.map(({ label, path }) => (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    pathname === path || pathname.startsWith(`${path}/`)
                      ? "bg-blue-600 text-white"
                      : "text-blue-200/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      <div className="px-4 py-4 border-t border-white/10 space-y-1">
        <UserSessionBadge profile={profileSettings} variant="sidebar" />
        <p className="text-blue-300/40 text-[10px] truncate px-1">{companyName}</p>
      </div>
      </div>
    </aside>
  );
}