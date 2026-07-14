import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import {
  Plus, X, Building2, Bell, Eye, EyeOff, ArrowRight, CheckCircle2,
} from "lucide-react";
import { LoginAboutModal, LoginCornerBranding } from "@/components/auth/LoginAboutModal";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { UserSessionBadge } from "@/components/auth/UserSessionBadge";
import { useAppDataContext } from "./AppDataContext";
import { BrandMark } from "@/components/branding/BrandMark";
import { Sidebar } from "@/components/navigation/Sidebar";
import { resolveBusinessProfile, resolveCompanyName } from "@/lib/settings/defaultSettings";
import type { BusinessProfileData } from "@/lib/settings/settingsTypes";
import { GradientDashboardButton } from "@/components/ui/GradientDashboardButton";
import { ProjectDetailCard, ProjectSetup } from "@/components/pages/projects/Projects";
import type { ProjectData } from "@/lib/types";

const PAGE_TITLE: Record<string, string> = {
  dashboard: "Dashboard",
  customers: "Customers",
  "add-customer": "Add Customer",
  sales: "Sales",
  "received-payment": "Received Payment",
  "payment-slabs": "Payment Slabs",
  messenger: "Messenger",
  inventory: "Inventory",
  shareholder: "Shareholder",
  projects: "Projects",
  settings: "Settings",
  "settings-profile": "Profile Settings",
  "settings-business": "Business Profile",
  "settings-sales": "Sales Settings",
  "settings-invoice-template": "Invoice Template",
  "settings-message-templates": "Message Templates",
  "sales-invoice": "Invoice",
};

export function TopBar({ page, projects = [], selectedSite = "All Sites", onSiteChange = () => {} }: { page: string, projects?: ProjectData[], selectedSite?: string, onSiteChange?: (s: string) => void }) {
  const { profileSettings } = useAppDataContext();

  return (
    <header className="h-14 shrink-0 bg-white border-b border-gray-100 flex items-center justify-between px-6">
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-sm font-semibold text-[#0f1a35]">{PAGE_TITLE[page] ?? "Dashboard"}</h1>
          <p className="text-[10px] text-gray-400">Construction Management System</p>
        </div>
        
        {page === "dashboard" && (
          <div className="flex items-center gap-2 pl-6 border-l border-gray-100">
            <span className="text-xs text-gray-500 font-medium">Site:</span>
            <select
              value={selectedSite}
              onChange={e => onSiteChange(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
            >
              <option value="All Sites">All Sites</option>
              {projects.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-orange-500 rounded-full" />
        </button>
        <UserSessionBadge profile={profileSettings} variant="topbar" />
        <LogoutButton variant="topbar" />
      </div>
    </header>
  );
}

export function LoginPage({
  businessProfile,
  onLogin,
  onGoRegister,
  registeredSuccess,
}: {
  businessProfile?: Partial<BusinessProfileData> | null;
  onLogin: (credentials: { username: string; password: string }) => Promise<void>;
  onGoRegister: () => void;
  registeredSuccess?: boolean;
}) {
  const resolvedProfile = resolveBusinessProfile(businessProfile);
  const companyName = resolveCompanyName(businessProfile);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) { setError("Please enter your credentials."); return; }
    setError("");
    setLoading(true);
    try {
      await onLogin({ username: username.trim(), password });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex relative" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="absolute top-4 right-4 z-20 lg:top-6 lg:right-6">
        <LoginCornerBranding
          businessProfile={businessProfile}
          onAboutClick={() => setShowAbout(true)}
          variant="dark"
        />
      </div>

      {showAbout && (
        <LoginAboutModal businessProfile={resolvedProfile} onClose={() => setShowAbout(false)} />
      )}

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden" style={{ background: "#0f1a35" }}>
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 30% 40%, #2563eb 0%, transparent 60%), radial-gradient(circle at 80% 80%, #1e40af 0%, transparent 50%)",
          }}
        />
        <div className="relative z-10">
          <BrandMark businessProfile={businessProfile} variant="auth" />
        </div>
        {/* Hero text */}
        <div className="relative space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Build smarter.<br />Manage better.
          </h1>
          <p className="text-blue-200/70 text-base leading-relaxed max-w-sm">
            A unified platform to manage your projects, customers, and investments — all in one place.
          </p>
          <div className="space-y-3">
            {[
              "Real-time flat availability tracking",
              "Customer booking & payment management",
              "Project-wise analytics & reports",
            ].map(f => (
              <div key={f} className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-blue-400 shrink-0" />
                <span className="text-blue-100/80 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Footer */}
        <div className="relative text-blue-300/40 text-xs">© 2026 {companyName}. All rights reserved.</div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center bg-[#f0f2f7] px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <BrandMark businessProfile={businessProfile} variant="form" />
            <div className="mb-7">
              <h2 className="text-xl font-bold text-[#0f1a35]">Welcome back</h2>
              <p className="text-sm text-gray-400 mt-1">Sign in to your CMS account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest block mb-1.5">Username / Email</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. admin01@sankalpenterprises.info"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest block mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-500 font-medium">{error}</p>
              )}

              {registeredSuccess && (
                <p className="text-xs text-green-600 font-medium bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                  Registration successful. Please sign in.
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 mt-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><span>Sign In</span><ArrowRight size={14} /></>
                )}
              </button>

              <button
                type="button"
                onClick={onGoRegister}
                className="w-full border border-gray-200 text-sm font-semibold text-[#0f1a35] py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Create account
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SetupShell({
  businessProfile,
  projects,
  onCreate,
  onDelete,
  onEnterDashboard,
}: {
  businessProfile?: Partial<BusinessProfileData> | null;
  projects: ProjectData[];
  onCreate: (p: ProjectData) => void;
  onDelete?: (project: ProjectData) => Promise<boolean>;
  onEnterDashboard?: () => void;
}) {
  const [showForm, setShowForm] = useState(projects.length === 0);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (projects.length === 0) setShowForm(true);
  }, [projects.length]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div
      className="relative min-h-screen w-full bg-gradient-to-br from-[#e8ecf4] via-[#f0f2f7] to-[#dce4f0]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {toast && (
        <div className="fixed top-6 left-1/2 z-[100] -translate-x-1/2 rounded-lg bg-green-600/95 px-4 py-2.5 text-sm font-medium text-white shadow-lg backdrop-blur-md">
          {toast}
        </div>
      )}
      {/* Top bar */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/60 bg-white/80 px-8 py-4 backdrop-blur-md">
        <BrandMark businessProfile={businessProfile} variant="compact" />
        <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">Project Setup</span>
      </header>

      <div className="mx-auto max-w-5xl px-6 pt-8 pb-16">

        {/* Intro */}
        <div className="mb-6 rounded-2xl border border-white/60 bg-white/75 p-5 shadow-sm backdrop-blur-md">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#0f1a35]">Projects & Sites</h1>
            <p className="mt-0.5 text-sm text-gray-400">Add your projects and configure buildings, wings, and units.</p>
          </div>
          <div className="flex items-center gap-2">
            {onEnterDashboard && projects.length > 0 && (
              <GradientDashboardButton onClick={onEnterDashboard} />
            )}
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                <Plus size={14} /> Add Project / Site
              </button>
            )}
          </div>
        </div>
        </div>

        {/* Saved project cards */}
        {projects.length > 0 && (
          <div className="mb-6 space-y-3">
            {projects.map(p => (
              <ProjectDetailCard
                key={p.id}
                project={p}
                onDelete={onDelete}
                onDeleted={(name) => setToast(`Project "${name}" deleted successfully`)}
              />
            ))}
          </div>
        )}

        {/* Add Project Form */}
        {showForm && (
          <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/75 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/60 bg-white/50 px-6 py-4 backdrop-blur-sm">
              <p className="text-sm font-semibold text-[#0f1a35]">New Project / Site</p>
              {projects.length > 0 && (
                <button onClick={() => setShowForm(false)} className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-200">
                  <X size={15} />
                </button>
              )}
            </div>
            <ProjectSetup onCreate={onCreate} onSubmitted={() => setShowForm(false)} />
          </div>
        )}

        {/* Empty state */}
        {!showForm && projects.length === 0 && (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
              <Building2 size={22} className="text-blue-400" />
            </div>
            <p className="text-sm font-semibold text-gray-600">No projects yet</p>
            <p className="mt-1 text-xs text-gray-400">Click &quot;Add Project / Site&quot; to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const PATH_TO_PAGE_KEY: Record<string, string> = {
  "/dashboard": "dashboard",
  "/customers": "customers",
  "/add-customer": "add-customer",
  "/sales": "sales",
  "/received-payment": "received-payment",
  "/payment-slabs": "payment-slabs",
  "/messenger": "messenger",
  "/inventory": "inventory",
  "/shareholder": "shareholder",
  "/projects": "projects",
  "/settings": "settings",
  "/settings/profile": "settings-profile",
  "/settings/business": "settings-business",
  "/settings/sales": "settings-sales",
  "/settings/sales/invoice-template": "settings-invoice-template",
  "/settings/sales/message-templates": "settings-message-templates",
  "/settings/inventory": "settings",
  "/settings/customers": "settings",
  "/sales/invoice": "sales-invoice",
};

export function AppLayout({
  projects,
  selectedSite,
  onSiteChange,
}: {
  projects: ProjectData[];
  selectedSite: string;
  onSiteChange: (s: string) => void;
}) {
  const { pathname } = useLocation();
  const pageKey =
    PATH_TO_PAGE_KEY[pathname] ??
    (pathname.startsWith("/sales/invoice/") ? "sales-invoice" : "dashboard");

  return (
    <div className="flex h-screen overflow-hidden print:block" style={{ fontFamily: "'Inter', sans-serif", background: "#f0f2f7" }}>
      <div className="print:hidden h-full shrink-0">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden print:w-full print:overflow-visible">
        <div className="print:hidden shrink-0">
          <TopBar page={pageKey} projects={projects} selectedSite={selectedSite} onSiteChange={onSiteChange} />
        </div>
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#e8ecf4] via-[#f0f2f7] to-[#dce4f0] print:overflow-visible print:bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
