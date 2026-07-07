import { useState } from "react";
import {
  ChevronDown, Plus, X, Building2, Bell, Eye, EyeOff, ArrowRight, CheckCircle2,
} from "lucide-react";
import nirmitiLogo from "@/imports/nirmiti_logo.jpg";
import { Sidebar } from "@/components/navigation/Sidebar";
import { Dashboard } from "@/components/pages/dashboard/Dashboard";
import { CustomerSales } from "@/components/pages/customers/CustomerSales";
import { AddCustomer } from "@/components/pages/customers/AddCustomer";
import { Projects, ProjectSetup } from "@/components/pages/projects/Projects";
import { Sales } from "@/components/pages/sales/Sales";
import { ReceivedPayments } from "@/components/pages/sales/ReceivedPayments";
import { PaymentSlabs } from "@/components/pages/sales/PaymentSlabs";
import { Inventory } from "@/components/pages/inventory/Inventory";
import { Shareholder } from "@/components/pages/shareholder/Shareholder";
import { Settings } from "@/components/pages/settings/Settings";
import { useAppData } from "@/hooks/useAppData";
import type { CustomerDetailProfile } from "@/lib/customers/customerDetailTypes";
import type { Page, ProjectData, PropType } from "@/lib/types";

const PAGE_TITLE: Record<string, string> = {
  dashboard: "Dashboard",
  customers: "Customers",
  "add-customer": "Add Customer",
  sales: "Sales",
  "received-payment": "Received Payment",
  "payment-slabs": "Payment Slabs",
  inventory: "Inventory",
  shareholder: "Shareholder",
  projects: "Projects",
  settings: "Settings",
};

export function TopBar({ page, projects = [], selectedSite = "All Sites", onSiteChange = () => {} }: { page: string, projects?: ProjectData[], selectedSite?: string, onSiteChange?: (s: string) => void }) {
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
        <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-[11px] font-bold">CE</div>
          <span className="text-sm text-gray-700 font-medium">CEO</span>
          <ChevronDown size={13} className="text-gray-400" />
        </div>
      </div>
    </header>
  );
}

export function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) { setError("Please enter your credentials."); return; }
    setError(""); setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 800);
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden" style={{ background: "#0f1a35" }}>
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 30% 40%, #2563eb 0%, transparent 60%), radial-gradient(circle at 80% 80%, #1e40af 0%, transparent 50%)",
          }}
        />
        {/* Logo */}
        <div className="relative flex items-center gap-4">
          <img src={nirmitiLogo} alt="Nirmiti Developers" className="w-14 h-14 rounded-xl object-contain bg-white p-1" />
          <div>
            <div className="text-white text-xl font-bold leading-tight">Nirmiti Developers</div>
            <div className="text-blue-300/70 text-sm">Construction Management System</div>
          </div>
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
        <div className="relative text-blue-300/40 text-xs">© 2026 Nirmiti Developers. All rights reserved.</div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center bg-[#f0f2f7] px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <img src={nirmitiLogo} alt="Nirmiti Developers" className="w-10 h-10 rounded-lg object-contain bg-white p-0.5" />
            <div>
              <div className="text-[#0f1a35] text-base font-bold leading-tight">Nirmiti Developers</div>
              <div className="text-gray-400 text-xs">Construction Management</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
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
                  placeholder="e.g. bhagwat@nirmiti.in"
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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SetupShell({ onCreate }: { onCreate: (p: ProjectData) => void }) {
  const [saved, setSaved]       = useState<ProjectData[]>([]);
  const [showForm, setShowForm] = useState(true);

  function handleCreate(p: ProjectData) {
    setSaved(prev => [...prev, p]);
    setShowForm(false);
    onCreate(p);
  }

  const propTag: Record<PropType, string> = {
    residential: "bg-blue-100 text-blue-700",
    commercial:  "bg-indigo-100 text-indigo-700",
    semi:        "bg-green-100 text-green-700",
  };

  return (
    <div className="min-h-screen bg-[#f0f2f7]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <img src={nirmitiLogo} alt="Nirmiti Developers" className="w-9 h-9 rounded-lg object-contain bg-white border border-gray-100 p-0.5" />
          <div>
            <div className="text-sm font-bold text-[#0f1a35] leading-tight">Nirmiti Developers</div>
            <div className="text-[10px] text-gray-400">Construction Management System</div>
          </div>
        </div>
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">Project Setup</span>
      </header>

      <div className="max-w-5xl mx-auto px-6 pt-8 pb-16">

        {/* Intro */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-[#0f1a35]">Projects & Sites</h1>
            <p className="text-sm text-gray-400 mt-0.5">Add your projects and configure buildings, wings, and units.</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={14} /> Add Project / Site
            </button>
          )}
        </div>

        {/* Saved project cards */}
        {saved.length > 0 && (
          <div className="space-y-3 mb-6">
            {saved.map(p => (
              <div key={p.id} className="bg-white rounded-xl border border-green-200 shadow-sm px-5 py-4 flex items-center gap-4">
                <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0f1a35]">{p.name}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {p.totalFlats > 0 && <span className="mr-2">{p.totalFlats} flats</span>}
                    {p.totalShops > 0 && <span>{p.totalShops} shops</span>}
                  </p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${propTag[p.propType]}`}>
                  {p.propType}
                </span>
                <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">Saved</span>
              </div>
            ))}
          </div>
        )}

        {/* Add Project Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
              <p className="text-sm font-semibold text-[#0f1a35]">New Project / Site</p>
              {saved.length > 0 && (
                <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-gray-200 text-gray-400 transition-colors">
                  <X size={15} />
                </button>
              )}
            </div>
            <ProjectSetup onCreate={handleCreate} />
          </div>
        )}

        {/* Empty state */}
        {!showForm && saved.length === 0 && (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
              <Building2 size={22} className="text-blue-400" />
            </div>
            <p className="text-sm font-semibold text-gray-600">No projects yet</p>
            <p className="text-xs text-gray-400 mt-1">Click "Add Project / Site" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [appState, setAppState] = useState<"login" | "setup" | "app">("login");
  const [page, setPage] = useState<Page>("dashboard");
  const [selectedSite, setSelectedSite] = useState<string>("All Sites");
  const [proceedCustomer, setProceedCustomer] = useState<CustomerDetailProfile | null>(null);

  const {
    projects,
    customers,
    customerProfiles,
    slabs,
    receivedPayments,
    addProject,
    registerCustomer,
    allocatePayment,
    deactivateCustomer,
    getDetail,
    getActiveSlab,
    getCategoryDueFor,
    bookedFlatsSummary,
    checkFlatReleased,
    setSlabs,
    sendWhatsAppBulk,
  } = useAppData();

  function handleCreateProject(p: ProjectData) {
    addProject(p);
    setAppState("app");
    setPage("dashboard");
  }

  if (appState === "login") return <LoginPage onLogin={() => setAppState("setup")} />;
  if (appState === "setup") return <SetupShell onCreate={handleCreateProject} />;

  const filteredProjects = selectedSite === "All Sites" ? projects : projects.filter(p => p.name === selectedSite);

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'Inter', sans-serif", background: "#f0f2f7" }}>
      <Sidebar active={page} onNav={setPage} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar page={page} projects={projects} selectedSite={selectedSite} onSiteChange={setSelectedSite} />
        <main className="flex-1 overflow-y-auto">
          {page === "dashboard" && <Dashboard projects={filteredProjects} />}
          {page === "customers" && (
            <CustomerSales
              projects={filteredProjects}
              customers={customers}
              customerProfiles={customerProfiles}
              bookedFlatsSummary={bookedFlatsSummary}
              checkFlatReleased={checkFlatReleased}
              getDetail={getDetail}
              onDeactivate={deactivateCustomer}
              onAdd={() => {
                setProceedCustomer(null);
                setPage("add-customer");
              }}
              onProceed={(c) => {
                setProceedCustomer(c);
                setPage("add-customer");
              }}
            />
          )}
          {page === "add-customer" && (
            <AddCustomer
              projects={projects}
              customerProfiles={customerProfiles}
              initialData={proceedCustomer}
              proceedMode={!!proceedCustomer}
              checkFlatReleased={checkFlatReleased}
              onBack={() => {
                setProceedCustomer(null);
                setPage("customers");
              }}
              onRegister={registerCustomer}
            />
          )}
          {page === "sales" && (
            <Sales
              projects={filteredProjects}
              customers={customers}
              customerProfiles={customerProfiles}
              slabs={slabs}
              receivedPayments={receivedPayments}
              getActiveSlab={getActiveSlab}
              getCategoryDueFor={getCategoryDueFor}
              onAllocatePayment={allocatePayment}
              onNav={setPage}
            />
          )}
          {page === "received-payment" && (
            <ReceivedPayments
              projects={projects}
              customers={customers}
              customerProfiles={customerProfiles}
              receivedPayments={receivedPayments}
              getActiveSlab={getActiveSlab}
              getCategoryDueFor={getCategoryDueFor}
              onAllocatePayment={allocatePayment}
            />
          )}
          {page === "payment-slabs" && (
            <PaymentSlabs
              projects={projects}
              customers={customers}
              slabs={slabs}
              setSlabs={setSlabs}
              onWhatsAppSend={sendWhatsAppBulk}
              onBack={() => setPage("sales")}
            />
          )}
          {page === "inventory" && <Inventory />}
          {page === "shareholder" && <Shareholder />}
          {page === "projects" && <Projects onCreate={handleCreateProject} onBack={() => setPage("sales")} />}
          {page === "settings" && <Settings />}
        </main>
      </div>
    </div>
  );
}
