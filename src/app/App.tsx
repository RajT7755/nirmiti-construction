import { useState, useRef, useEffect, type ReactNode } from "react";
import nirmitiLogo from "@/imports/nirmiti_logo.jpg";
import {
  LayoutDashboard, Users, UserPlus, Package, Briefcase, FolderOpen, Settings,
  ChevronDown, Plus, X, Building2, AlertCircle, Download,
  TrendingUp, RefreshCw, Search, Bell, Eye, EyeOff, ArrowRight, CheckCircle2,
  CreditCard, Layers, Send, Edit3, MessageSquare, IndianRupee, CalendarDays,
} from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, Tooltip, XAxis, YAxis } from "recharts";

type Page = "dashboard" | "customers" | "add-customer" | "sales" | "received-payment" | "payment-slabs" | "inventory" | "shareholder" | "projects" | "settings";
type PropType = "residential" | "commercial" | "semi";

const WING_LABELS = ["A","B","C","D","E","F","G","H"];
const defaultBhk = () => ({
  "1BHK": { count: 0, area: "" }, "2BHK": { count: 0, area: "" },
  "3BHK": { count: 0, area: "" }, "4BHK": { count: 0, area: "" },
});

interface WingConfig {
  id: string; floors: number;
  bhk: Record<string, BhkEntry>;
  shopsPerFloor: number; shopArea: string;
}
interface BuildingConfig {
  id: string; name: string; numWings: number; wings: WingConfig[];
}
function makeWing(id: string): WingConfig {
  return { id, floors: 0, bhk: defaultBhk(), shopsPerFloor: 0, shopArea: "" };
}
function makeBuilding(id: string): BuildingConfig {
  return { id, name: "", numWings: 0, wings: [] };
}

interface FlatUnit {
  id: string; number: string; floor: number;
  kind: "flat" | "shop"; bhkType?: string;
  status: "available" | "booked" | "overdue";
}
interface ProjectData {
  id: string; name: string; propType: PropType;
  totalFlats: number; totalShops: number; units: FlatUnit[];
}

function generateUnits(
  propType: PropType,
  commZones: { floors: number; shopsPerFloor: number; area: string }[],
  resFloors: number,
  bhk: Record<string, { count: number; area: string }>
): FlatUnit[] {
  const units: FlatUnit[] = [];
  if (propType === "commercial" || propType === "semi") {
    commZones.forEach((zone) => {
      for (let f = 1; f <= zone.floors; f++) {
        for (let s = 1; s <= zone.shopsPerFloor; s++) {
          units.push({ id: `S-F${f}-${s}`, number: `S${f * 100 + s}`, floor: f, kind: "shop", status: "available" });
        }
      }
    });
  }
  if (propType === "residential" || propType === "semi") {
    const bhkTypes = ["1BHK", "2BHK", "3BHK", "4BHK"];
    for (let f = 1; f <= resFloors; f++) {
      let seq = 1;
      bhkTypes.forEach(type => {
        for (let u = 0; u < bhk[type].count; u++) {
          units.push({ id: `R-F${f}-${type}-${u}`, number: `${f * 100 + seq}`, floor: f, kind: "flat", bhkType: type, status: "available" });
          seq++;
        }
      });
    }
  }
  return units;
}

function generateUnitsFromBuildings(propType: PropType, buildings: BuildingConfig[]): FlatUnit[] {
  const units: FlatUnit[] = [];
  buildings.forEach(bldg => {
    const bLabel = bldg.name.trim() || bldg.id;
    bldg.wings.forEach((wing, wi) => {
      const wLabel = WING_LABELS[wi] ?? `W${wi + 1}`;
      for (let f = 1; f <= wing.floors; f++) {
        if (propType === "commercial" || propType === "semi") {
          for (let s = 1; s <= wing.shopsPerFloor; s++) {
            units.push({
              id: `${bLabel}-W${wLabel}-F${f}-S${s}`,
              number: `${bLabel}-W${wLabel}-${f * 100 + s}`,
              floor: f, kind: "shop", status: "available",
            });
          }
        }
        if (propType === "residential" || propType === "semi") {
          let seq = 1;
          BHK_TYPES.forEach(type => {
            for (let u = 0; u < wing.bhk[type].count; u++) {
              units.push({
                id: `${bLabel}-W${wLabel}-F${f}-${type}-${u}`,
                number: `${bLabel}-W${wLabel}-${f * 100 + seq}`,
                floor: f, kind: "flat", bhkType: type, status: "available",
              });
              seq++;
            }
          });
        }
      }
    });
  });
  return units;
}

// ── Data types & empty state ───────────────────────────────────────────────

interface CustomerRecord {
  id: string; name: string; flat: string; floor: number;
  project: string; status: string; amount: number;
}
interface BookingRecord {
  id: string; customer: string; flat: string; floor: number;
  amount: number; date: string; status: string;
}
interface InvestmentRecord {
  id: string; investor: string; amount: number; date: string;
  type: string; ret: string;
}
interface PaymentRequestRecord {
  id: string; customer: string; flat: string;
  amount: number; due: string; status: string;
}
interface FlatDataRecord {
  number: number; status: string;
  customer: string | null; type: string;
}
interface ReceivedLogRecord {
  id: string; customer: string; flat: string; category: string;
  amount: number; received: number; method: string;
  date: string; status: string;
}
interface SlabEntry {
  id: string; slabNo: number; stage: string; percentage: number;
  dateGenerated: string; dueDate: string; status: "draft" | "sent" | "received";
}

const recentBookings: BookingRecord[] = [];
const recentInvestments: InvestmentRecord[] = [];
const paymentRequests: PaymentRequestRecord[] = [];
const costTrend: { m: string; v: number }[] = [];
const customersList: CustomerRecord[] = [];
const flatData: FlatDataRecord[] = [];
const mockReceivedLog: ReceivedLogRecord[] = [];
const defaultSlabs: SlabEntry[] = [];

const PROP_TYPE_TAG: Record<PropType, string> = {
  residential: "bg-blue-100 text-blue-700",
  commercial:  "bg-indigo-100 text-indigo-700",
  semi:        "bg-green-100 text-green-700",
};

// ── Helpers ────────────────────────────────────────────────────────────────

function fmt(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

const BADGE: Record<string, string> = {
  paid:      "bg-green-100 text-green-700",
  partial:   "bg-blue-100 text-blue-700",
  overdue:   "bg-orange-100 text-orange-700",
  pending:   "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  equity:    "bg-indigo-100 text-indigo-700",
  debt:      "bg-slate-100 text-slate-600",
};

function Badge({ status }: { status: string }) {
  return (
    <span className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize ${BADGE[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

// ── Nav ────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "dashboard",   label: "Dashboard",   icon: LayoutDashboard },
  { id: "customers",   label: "Customers",   icon: Users            },
  { id: "sales",       label: "Sales",       icon: TrendingUp       },
  { id: "inventory",   label: "Inventory",   icon: Package          },
  { id: "shareholder", label: "Shareholder", icon: Briefcase        },
  { id: "projects",    label: "Projects",    icon: FolderOpen       },
  { id: "settings",    label: "Settings",    icon: Settings         },
];

// ── Sidebar ────────────────────────────────────────────────────────────────

function Sidebar({ active, onNav }: { active: Page; onNav: (p: Page) => void }) {
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
              onClick={() => onNav(id as Page)}
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

// ── Top bar ────────────────────────────────────────────────────────────────

const PAGE_TITLE: Record<string, string> = {
  dashboard:          "Dashboard",
  customers:          "Customers",
  "add-customer":     "Add Customer",
  sales:              "Sales",
  "received-payment": "Received Payment",
  "payment-slabs":    "Payment Slabs",
  inventory:          "Inventory",
  shareholder:        "Shareholder",
  projects:           "Projects",
  settings:           "Settings",
};

function TopBar({ page, projects = [], selectedSite = "All Sites", onSiteChange = () => {} }: { page: string, projects?: ProjectData[], selectedSite?: string, onSiteChange?: (s: string) => void }) {
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

// ── Dashboard ──────────────────────────────────────────────────────────────

function Dashboard({ projects }: { projects: ProjectData[] }) {
  const firstProject = projects[0] ?? null;
  const totalFlats  = projects.reduce((s, p) => s + p.totalFlats, 0);
  const totalShops  = projects.reduce((s, p) => s + p.totalShops, 0);
  const totalUnits  = totalFlats + totalShops;
  const bookedUnits = projects.reduce((s, p) => s + p.units.filter(u => u.status === "booked" || u.status === "overdue").length, 0);
  const availUnits  = totalUnits - bookedUnits;
  const bookedPct   = totalUnits > 0 ? Math.round((bookedUnits / totalUnits) * 100) : 0;
  const availPct    = totalUnits > 0 ? Math.round((availUnits  / totalUnits) * 100) : 0;
  const hasProjects = projects.length > 0;

  const fpBooked = firstProject?.units.filter(u => u.status === "booked" || u.status === "overdue").length ?? 0;
  const fpTotal  = firstProject ? firstProject.totalFlats + firstProject.totalShops : 0;
  const fpAvail  = fpTotal - fpBooked;
  const fpOccPct = fpTotal > 0 ? Math.round((fpBooked / fpTotal) * 100) : 0;

  return (
    <div className="p-6 space-y-5">
      {/* Active project hero */}
      {firstProject ? (
        <div className="bg-[#0f1a35] rounded-2xl px-6 py-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-blue-300/60 text-[10px] font-semibold uppercase tracking-widest">Active Project</p>
            <h2 className="text-white text-2xl font-bold">{firstProject.name}</h2>
            <div className="flex items-center gap-3 mt-1 text-white/70 text-xs">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${PROP_TYPE_TAG[firstProject.propType]}`}>
                {firstProject.propType}
              </span>
              <span>{firstProject.totalFlats} flats</span>
              {firstProject.totalShops > 0 && <span>· {firstProject.totalShops} shops</span>}
            </div>
          </div>
          <div className="flex gap-8 text-center">
            {[
              { label: "Booked", value: fpBooked },
              { label: "Available", value: fpAvail },
              { label: "Occupancy", value: `${fpOccPct}%` },
            ].map(s => (
              <div key={s.label}>
                <p className="text-white text-2xl font-bold">{s.value}</p>
                <p className="text-blue-300/50 text-[10px] uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-[#0f1a35] rounded-2xl px-6 py-5 flex items-center gap-4 shadow-sm">
          <Building2 size={22} className="text-blue-400 shrink-0" />
          <p className="text-white text-sm">No project yet — go to Projects to create one.</p>
        </div>
      )}

      {/* KPI row 1 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-2">Total Booked Flats</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold text-[#1e3a5f]">{hasProjects ? bookedUnits : "—"}</p>
            {hasProjects && <span className="text-green-600 text-xs font-semibold bg-green-50 px-2 py-0.5 rounded-full">{bookedPct}%</span>}
          </div>
          <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: hasProjects ? `${bookedPct}%` : "0%" }} />
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5">{hasProjects ? `of ${totalUnits} total units` : "No projects created yet"}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-2">Remaining Flats</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold text-[#1e3a5f]">{hasProjects ? availUnits : "—"}</p>
            {hasProjects && <span className="text-orange-500 text-xs font-semibold bg-orange-50 px-2 py-0.5 rounded-full">{availPct}%</span>}
          </div>
          <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-orange-400 rounded-full transition-all" style={{ width: hasProjects ? `${availPct}%` : "0%" }} />
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5">{hasProjects ? "available for booking" : "No projects created yet"}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-2">Remaining Investment / Total</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold text-[#1e3a5f]">—</p>
          </div>
          <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: "0%" }} />
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5">No investment data yet</p>
        </div>
      </div>

      {/* KPI row 2 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border-l-4 border-orange-400 border border-gray-100 shadow-sm">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-2">Overdue Payments</p>
          <p className="text-4xl font-bold text-orange-500">—</p>
          <p className="text-[11px] text-gray-400 mt-1">No overdue customers yet</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-2">Total Sales Amount</p>
          <p className="text-3xl font-bold text-[#1e3a5f]">—</p>
          <p className="text-[11px] text-gray-400 mt-2">Add customers to track sales</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-2">Sales Rate (Avg)</p>
          <p className="text-3xl font-bold text-[#1e3a5f]">—</p>
          <p className="text-[11px] text-gray-400 mt-1">Total Booked Value / Total Sq.Ft</p>
          {costTrend.length > 0 && (
            <div className="mt-2">
              <LineChart width={220} height={40} data={costTrend}>
                <XAxis key="rate-x" dataKey="m" hide />
                <YAxis key="rate-y" hide domain={["dataMin - 50", "dataMax + 50"]} />
                <Line key="rate-line" type="monotone" dataKey="v" stroke="#10b981" strokeWidth={1.5} dot={false} />
                <Tooltip
                  contentStyle={{ fontSize: 10, padding: "2px 6px", border: "none", borderRadius: 6, boxShadow: "0 2px 8px rgba(0,0,0,.12)" }}
                  formatter={(v: number) => [`₹${v}`, "Rate"]}
                />
              </LineChart>
            </div>
          )}
        </div>
      </div>

      {/* All projects */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-[#0f1a35]">All Projects</h3>
        </div>
        {projects.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No projects yet.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {projects.map(p => {
              const pTotal = p.totalFlats + p.totalShops;
              const pBooked = p.units.filter(u => u.status === "booked" || u.status === "overdue").length;
              const pAvail = pTotal - pBooked;
              const pOcc = pTotal > 0 ? Math.round((pBooked / pTotal) * 100) : 0;
              return (
                <div key={p.id} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[#0f1a35]">{p.name}</p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${PROP_TYPE_TAG[p.propType]}`}>{p.propType}</span>
                    </div>
                    <span className="text-xs text-gray-500">{pBooked} booked · {pAvail} available</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${pOcc}%` }} />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">{pOcc}% occupancy</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tables row */}
      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-[#0f1a35]">Recent Bookings</h3>
            <button className="text-xs text-blue-600 hover:underline">View all</button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentBookings.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">No data yet.</p>
            )}
            {recentBookings.map(b => (
              <div key={b.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/80 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-800">{b.customer}</p>
                  <p className="text-[11px] text-gray-400">Flat {b.flat} · Floor {b.floor} · {b.date}</p>
                </div>
                <div className="text-right space-y-0.5">
                  <p className="text-sm font-bold text-[#1e3a5f]">{fmt(b.amount)}</p>
                  <Badge status={b.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-[#0f1a35]">Recent Investments</h3>
            <button className="text-xs text-blue-600 hover:underline">View all</button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentInvestments.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">No data yet.</p>
            )}
            {recentInvestments.map(inv => (
              <div key={inv.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/80 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-800">{inv.investor}</p>
                  <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
                    {inv.date} · <Badge status={inv.type} />
                  </p>
                </div>
                <div className="text-right space-y-0.5">
                  <p className="text-sm font-bold text-[#1e3a5f]">{fmt(inv.amount)}</p>
                  <p className="text-[11px] text-green-600 font-semibold">{inv.ret} returns</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment requests */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className="text-orange-500" />
            <h3 className="text-sm font-semibold text-[#0f1a35]">Recent Payment Requests</h3>
          </div>
          <button className="flex items-center gap-1.5 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={11} /> New Request
          </button>
        </div>
        <div className="p-5 grid grid-cols-3 gap-4">
          {paymentRequests.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6 col-span-3">No data yet.</p>
          )}
          {paymentRequests.map(pr => (
            <div
              key={pr.id}
              className={`p-4 rounded-xl border ${
                pr.status === "overdue" ? "border-orange-200 bg-orange-50" : "border-blue-100 bg-blue-50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-gray-400 font-mono">{pr.id}</span>
                <Badge status={pr.status} />
              </div>
              <p className="text-sm font-semibold text-[#0f1a35]">{pr.customer}</p>
              <p className="text-[11px] text-gray-500">Flat {pr.flat}</p>
              <p className="text-lg font-bold text-[#1e3a5f] mt-2">{fmt(pr.amount)}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Due: {pr.due}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Customer Sales ─────────────────────────────────────────────────────────

function CustomerSales({ projects, onAdd }: { projects: ProjectData[]; onAdd: () => void }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [detailsPane, setDetailsPane] = useState<CustomerRecord | null>(null);

  const filtered = customersList.filter(c =>
    (filterStatus === "all" || c.status === filterStatus) &&
    (c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.flat.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-5 relative">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0f1a35]">Customer Database</h2>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            <Download size={14} /> Export to Excel
          </button>
          <button
            onClick={onAdd}
            className="flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={14} /> Add Customer
          </button>
        </div>
      </div>

      {/* Row 1 Metrics */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: "Total Customers",  value: customersList.length || "—", accent: "text-blue-600" },
          { label: "Booked Flats", value: customersList.filter(c => c.status === "paid").length || "—", accent: "text-green-600" },
          { label: "Overdue Payments", value: customersList.filter(c => c.status === "overdue").length || "—", accent: "text-orange-500" },
          { label: "Max Overdue Customers", value: "—", accent: "text-red-500" },
          { label: "Bank Loan", value: "—", accent: "text-purple-600" },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col justify-center">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-1.5">{k.label}</p>
            <p className={`text-2xl font-bold ${k.accent}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-orange-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 bg-orange-50 border-b border-orange-100">
            <AlertCircle size={14} className="text-orange-500" />
            <h3 className="text-sm font-semibold text-orange-700">Overdue Customers</h3>
          </div>
          <div className="divide-y divide-gray-50 max-h-56 overflow-auto">
            {customersList.filter(c => c.status === "overdue").length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">No data yet.</p>
            )}
            {customersList.filter(c => c.status === "overdue").map(c => (
              <div key={c.id} className="px-5 py-3 hover:bg-gray-50 transition-colors flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{c.name}</p>
                  <p className="text-[11px] text-gray-400">Flat {c.flat}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-orange-600">₹{Math.floor(c.amount/10)}L</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-[#0f1a35]">Recently Added</h3>
            <button className="text-[10px] text-blue-600 font-semibold uppercase tracking-widest hover:underline">View Full List</button>
          </div>
          <div className="divide-y divide-gray-50 flex-1 overflow-auto max-h-56">
            {customersList.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">No data yet.</p>
            )}
            {customersList.slice(0, 4).map(c => (
              <div key={c.id} className="px-5 py-3 hover:bg-gray-50 transition-colors flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{c.name}</p>
                  <p className="text-[11px] text-gray-400">Wing A</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-600">Flat {c.flat}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mt-4">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h3 className="text-sm font-semibold text-[#0f1a35]">Customer Status Table</h3>
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="text-xs pl-7 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 w-52"
              />
            </div>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400 border-b border-gray-100">
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Flat No.</th>
              <th className="px-5 py-3">Building/Wing</th>
              <th className="px-5 py-3">Amount & Payment</th>
              <th className="px-5 py-3">Current Slab</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center py-6 text-sm text-gray-400">No data yet.</td></tr>
            )}
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-5 py-3 text-sm font-medium text-gray-800">{c.name}</td>
                <td className="px-5 py-3 text-sm font-mono text-gray-700">{c.flat}</td>
                <td className="px-5 py-3 text-sm text-gray-600">{c.project}</td>
                <td className="px-5 py-3 text-sm">
                  <div className="font-bold text-[#1e3a5f]">{fmt(c.amount)}</div>
                  <div className="text-[10px] text-green-600">Paid: {fmt(c.amount * 0.4)}</div>
                </td>
                <td className="px-5 py-3 text-sm text-gray-600">Slab 3</td>
                <td className="px-5 py-3"><Badge status={c.status} /></td>
                <td className="px-5 py-3">
                  <button onClick={() => setDetailsPane(c)} className="text-xs text-blue-600 hover:underline">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Details Slide-in */}
      {detailsPane && (
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-white border-l border-gray-200 shadow-2xl p-6 z-10 flex flex-col transition-transform transform translate-x-0">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-[#0f1a35]">Customer Details</h3>
            <button onClick={() => setDetailsPane(null)} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] text-gray-400 font-semibold uppercase">Name</p>
              <p className="text-sm font-medium text-gray-800">{detailsPane.name}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-semibold uppercase">Flat</p>
              <p className="text-sm font-medium text-gray-800">{detailsPane.flat} ({detailsPane.project})</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-semibold uppercase">Total Amount</p>
              <p className="text-sm font-bold text-[#1e3a5f]">{fmt(detailsPane.amount)}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-semibold uppercase">Status</p>
              <Badge status={detailsPane.status} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Add Customer ───────────────────────────────────────────────────────────

function AddCustomer({ projects }: { projects: ProjectData[] }) {
  const projectNames = projects.length > 0
    ? projects.map(p => p.name)
    : ["Sunrise Heights", "Green Valley", "Blue Horizon"];

  // Grid navigation
  const [selProject, setSelProject]     = useState(projectNames[0]);
  const [selBuildingIdx, setSelBuildingIdx] = useState(0);
  const [selWingIdx, setSelWingIdx]     = useState(0);
  const [selFloor, setSelFloor]         = useState(0);

  // Unit location
  const [unitType, setUnitType]   = useState("Residential");
  const [flatType, setFlatType]   = useState("1BHK");
  const [flatNo, setFlatNo]       = useState("");
  const [area, setArea]           = useState("");
  const [floorName, setFloorName] = useState("");
  const [parking, setParking]     = useState<"open" | "closed" | "no">("no");

  // Personal info
  const [custName, setCustName]   = useState("");
  const [address, setAddress]     = useState("");
  const [phone, setPhone]         = useState("");
  const [email, setEmail]         = useState("");
  const [idProof, setIdProof]     = useState("Aadhar ID");
  const [idNumber, setIdNumber]   = useState("");
  const [loanStatus, setLoanStatus] = useState<"No" | "Yes" | "Maybe">("No");

  // Loan details (conditional)
  const [bankName, setBankName]       = useState("");
  const [branchName, setBranchName]   = useState("");
  const [bankAddress, setBankAddress] = useState("");
  const [loanAmount, setLoanAmount]   = useState("");
  const [bankEmail, setBankEmail]     = useState("");

  // Booking type
  const [bookingType, setBookingType]       = useState<"payment" | "temporary" | null>(null);
  const [holdingDueDate, setHoldingDueDate] = useState("");

  // Payment slab generator
  const [slabArea, setSlabArea]             = useState("");
  const [slabRate, setSlabRate]             = useState("");
  const [gstPct, setGstPct]                 = useState("");
  const [stampDuty, setStampDuty]           = useState("");
  const [agreementPrice, setAgreementPrice] = useState("");
  const [electricalBill, setElectricalBill] = useState("");
  const [parkingAmount, setParkingAmount]   = useState("");
  const [generatedSlab, setGeneratedSlab]   = useState<{ booking10: number; received: number } | null>(null);

  // Notes
  const [notes, setNotes]         = useState("");
  const [notesSaved, setNotesSaved] = useState(false);

  // Modal
  const [modalFlat, setModalFlat] = useState<{ number: string; type: string; status: string; floor: number; occupant?: string | null } | null>(null);

  const activePrj = projects.find(p => p.name === selProject);

  const totalCalc  = slabArea && slabRate ? Number(slabArea) * Number(slabRate) : 0;
  const gstCalc    = totalCalc && gstPct  ? (totalCalc * Number(gstPct)) / 100  : 0;
  const grandTotal = totalCalc + gstCalc
    + (Number(stampDuty) || 0)
    + (Number(electricalBill) || 0)
    + (parking !== "no" ? (Number(parkingAmount) || 0) : 0);
  const hasParking = parking === "open" || parking === "closed";
  const showLoan   = loanStatus === "Yes" || loanStatus === "Maybe";

  // Derive buildings/wings from unit numbers ("Bldg-WX-101" format)
  const getBuildings = () => {
    if (!activePrj) return ["Block A", "Block B"];
    const set = new Set(activePrj.units.map(u => {
      const idx = u.number.indexOf("-W");
      return idx >= 0 ? u.number.substring(0, idx) : u.number.split("-")[0];
    }));
    return set.size > 0 ? Array.from(set) : ["Block A"];
  };
  const getWings = (bldg: string) => {
    if (!activePrj) return ["A", "B"];
    const set = new Set(
      activePrj.units
        .filter(u => u.number.startsWith(bldg + "-W"))
        .map(u => u.number.substring(bldg.length + 2).split("-")[0])
    );
    return set.size > 0 ? Array.from(set) : ["A"];
  };
  const getMaxFloor = (bldg: string, wing: string) => {
    if (!activePrj) return 5;
    const floors = activePrj.units.filter(u => u.number.startsWith(`${bldg}-W${wing}-`)).map(u => u.floor);
    return floors.length > 0 ? Math.max(...floors) : 5;
  };

  const buildings = getBuildings();
  const selBldg   = buildings[Math.min(selBuildingIdx, buildings.length - 1)];
  const wings     = getWings(selBldg);
  const selWing   = wings[Math.min(selWingIdx, wings.length - 1)];
  const maxFloor  = getMaxFloor(selBldg, selWing);

  // Enrich units with customer occupant data
  const gridUnits = activePrj
    ? activePrj.units
        .filter(u => u.number.startsWith(`${selBldg}-W${selWing}-`) && (selFloor === 0 || u.floor === selFloor))
        .map(u => {
          const shortNum = String(u.number).split("-").pop() ?? u.number;
          const occupant = customersList.find(c => c.flat.replace(/\s/g, "") === shortNum || u.number.includes(c.flat));
          return { number: u.number, type: u.bhkType ?? "Shop", status: u.status, floor: u.floor, occupant: occupant?.name ?? null };
        })
    : flatData
        .filter(f => selFloor === 0 || Math.floor(Number(f.number) / 100) === selFloor)
        .map(f => ({ number: String(f.number), type: f.type, status: f.status, floor: Math.floor(Number(f.number) / 100), occupant: (f.customer as string | null) ?? null }));

  function flatColorClass(s: string) {
    if (s === "booked")  return "bg-green-100 text-green-700 border-green-300";
    if (s === "overdue") return "bg-red-100 text-red-600 border-red-300";
    return "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer";
  }

  function handleGenerateSlab() {
    if (!totalCalc) return;
    setGeneratedSlab({ booking10: totalCalc * 0.1, received: totalCalc * 0.1 + gstCalc });
  }

  function handleSaveNotes() {
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-5 gap-6">

        {/* ── LEFT FORM ── */}
        <div className="col-span-3 space-y-5">

          {/* Customer Unique ID */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-3">Customer Unique ID</p>
            <div className="flex gap-2">
              <input readOnly defaultValue="CMS-2026-0149"
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono text-gray-700 focus:outline-none" />
              <button className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                <RefreshCw size={12} /> Generate
              </button>
            </div>
          </div>

          {/* B. Unit Location */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-4">Unit Location</p>
            <div className="grid grid-cols-2 gap-3">
              {/* Row 1 — Project + Type */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">Project / Site</label>
                <select value={selProject}
                  onChange={e => { setSelProject(e.target.value); setSelBuildingIdx(0); setSelWingIdx(0); setSelFloor(0); }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
                  {projectNames.map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">Type</label>
                <select value={unitType} onChange={e => setUnitType(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
                  <option>Residential</option><option>Commercial</option>
                </select>
              </div>

              {/* Row 2 — Building + Wing (connected to project data & syncs the grid) */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">Building</label>
                <select
                  value={selBldg}
                  onChange={e => { setSelBuildingIdx(buildings.indexOf(e.target.value)); setSelWingIdx(0); setSelFloor(0); }}
                  className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
                  {buildings.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                {buildings.length <= 1 && !activePrj && (
                  <p className="text-[10px] text-gray-400 mt-1">Create a project to see buildings</p>
                )}
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">Wing</label>
                <select
                  value={selWing}
                  onChange={e => { setSelWingIdx(wings.indexOf(e.target.value)); setSelFloor(0); }}
                  className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
                  {wings.map(w => <option key={w} value={w}>Wing {w}</option>)}
                </select>
              </div>

              {/* Row 3 — Flat Type + Flat No */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">Flat Type</label>
                <select value={flatType} onChange={e => setFlatType(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
                  <option>1BHK</option><option>2BHK</option><option>3BHK</option><option>4BHK</option><option>Shop</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">Shop / Flat No.</label>
                <input type="text" value={flatNo} onChange={e => setFlatNo(e.target.value)} placeholder="e.g. A-204"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>

              {/* Row 4 — Area + Floor Name */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">Area (sq.ft.)</label>
                <input type="text" value={area} onChange={e => setArea(e.target.value)} placeholder="e.g. 850"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">Floor Name</label>
                <input type="text" value={floorName} onChange={e => setFloorName(e.target.value)} placeholder="e.g. 2nd Floor"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
            </div>
            <div className="mt-4">
              <label className="text-[11px] font-semibold text-gray-500 block mb-2">Parking</label>
              <div className="flex gap-5">
                {([["open","Yes – Open"],["closed","Yes – Closed"],["no","No"]] as const).map(([val, lbl]) => (
                  <label key={val} className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="parking" value={val} checked={parking === val}
                      onChange={() => setParking(val)} className="accent-blue-600" />
                    <span className="text-sm text-gray-700">{lbl}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* C. Personal Information */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-4">Personal Information</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">Name</label>
                <input type="text" value={custName} onChange={e => setCustName(e.target.value)} placeholder="Full name"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">Phone No.</label>
                <input type="tel" value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="10-digit number"
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${phone.length > 0 && phone.length !== 10 ? "border-red-300 focus:ring-red-300" : "border-gray-200 focus:ring-blue-300"}`} />
                <p className={`text-[10px] mt-1 ${phone.length > 0 && phone.length !== 10 ? "text-red-500" : "text-gray-400"}`}>Must be 10 digits</p>
              </div>
              <div className="col-span-2">
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">Address</label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Street, City, State"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div className="col-span-2">
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="user@gmail.com"
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${email.length > 0 && !email.includes("@") ? "border-red-300 focus:ring-red-300" : "border-gray-200 focus:ring-blue-300"}`} />
                <p className={`text-[10px] mt-1 ${email.length > 0 && !email.includes("@") ? "text-red-500" : "text-gray-400"}`}>Must include @gmail.com or valid domain</p>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">ID Proof</label>
                <select value={idProof} onChange={e => setIdProof(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
                  <option>Aadhar ID</option><option>PAN ID</option><option>Driving Licence</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">ID Number</label>
                <input type="text" value={idNumber} onChange={e => setIdNumber(e.target.value)} placeholder="Enter ID number"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
            </div>
            <div className="mt-4">
              <label className="text-[11px] font-semibold text-gray-500 block mb-2">
                Loan Status <span className="text-gray-300 font-normal ml-1">(optional)</span>
              </label>
              <div className="flex gap-5">
                {(["No","Yes","Maybe"] as const).map(opt => (
                  <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="loanStatus" value={opt} checked={loanStatus === opt}
                      onChange={() => setLoanStatus(opt)} className="accent-blue-600" />
                    <span className="text-sm text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* D. Loan Section — conditional */}
          {showLoan && (
            <div className="bg-blue-50 rounded-xl border border-blue-200 shadow-sm p-5">
              <p className="text-[10px] text-blue-700 font-semibold uppercase tracking-widest mb-4">Loan Details</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 block mb-1">Bank Name</label>
                  <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} placeholder="e.g. SBI"
                    className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 block mb-1">Branch Name</label>
                  <input type="text" value={branchName} onChange={e => setBranchName(e.target.value)} placeholder="Branch"
                    className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] font-semibold text-gray-500 block mb-1">Bank Address</label>
                  <input type="text" value={bankAddress} onChange={e => setBankAddress(e.target.value)} placeholder="Full bank address"
                    className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 block mb-1">Loan Amount (₹)</label>
                  <input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} placeholder="e.g. 2500000"
                    className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 block mb-1">Bank Email</label>
                  <input type="email" value={bankEmail} onChange={e => setBankEmail(e.target.value)} placeholder="bank@sbi.co.in"
                    className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
              </div>
            </div>
          )}

          {/* E. Booking Type Checklist */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-4">Booking Type</p>
            <div className="space-y-3">
              <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${bookingType === "payment" ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-blue-200"}`}>
                <input type="checkbox" checked={bookingType === "payment"}
                  onChange={() => setBookingType(bookingType === "payment" ? null : "payment")}
                  className="accent-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">Proceed for a Payment</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Customer is ready to make payment now</p>
                </div>
              </label>
              <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${bookingType === "temporary" ? "border-orange-400 bg-orange-50" : "border-gray-200 hover:border-orange-200"}`}>
                <input type="checkbox" checked={bookingType === "temporary"}
                  onChange={() => setBookingType(bookingType === "temporary" ? null : "temporary")}
                  className="accent-orange-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">Just Temporary Booking</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Hold the flat temporarily without payment</p>
                </div>
              </label>
              {bookingType === "temporary" && (
                <div className="ml-9">
                  <label className="text-[11px] font-semibold text-gray-500 block mb-1">Due Date of Holding</label>
                  <input type="date" value={holdingDueDate} onChange={e => setHoldingDueDate(e.target.value)}
                    className="w-full border border-orange-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300" />
                  <p className="text-[10px] text-orange-600 mt-1.5 flex items-center gap-1">
                    <AlertCircle size={10} className="shrink-0" />
                    Flat automatically turns into a Free Flat after Due Date.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* F. Payment Slab Generator */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-4">Payment Slab Generator</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">Area (sq.ft.)</label>
                <input type="number" value={slabArea} onChange={e => setSlabArea(e.target.value)} placeholder="e.g. 850"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">Rate per sq.ft. (₹)</label>
                <input type="number" value={slabRate} onChange={e => setSlabRate(e.target.value)} placeholder="e.g. 5500"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">
                  Total Amount (₹) <span className="text-[10px] text-blue-500 font-normal">Auto</span>
                </label>
                <input readOnly value={totalCalc > 0 ? totalCalc.toLocaleString("en-IN") : ""}
                  placeholder="Area × Rate (auto-calculated)"
                  className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">GST (%)</label>
                <input type="number" value={gstPct} onChange={e => setGstPct(e.target.value)} placeholder="e.g. 5"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">
                  GST Amount (₹) <span className="text-[10px] text-blue-500 font-normal">Auto</span>
                </label>
                <input readOnly value={gstCalc > 0 ? gstCalc.toLocaleString("en-IN") : ""}
                  placeholder="Auto-generated"
                  className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">Stamp Duty (₹)</label>
                <input type="number" value={stampDuty} onChange={e => setStampDuty(e.target.value)} placeholder="e.g. 50000"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">Agreement Price (₹)</label>
                <input type="number" value={agreementPrice} onChange={e => setAgreementPrice(e.target.value)} placeholder="e.g. 4700000"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">Total Amt + Electrical Bill (₹)</label>
                <input type="number" value={electricalBill} onChange={e => setElectricalBill(e.target.value)} placeholder="e.g. 4560000"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              {hasParking && (
                <div className="col-span-2">
                  <label className="text-[11px] font-semibold text-gray-500 block mb-1">
                    Parking Amount (₹) <span className="text-[10px] text-orange-500 font-normal">({parking === "open" ? "Open" : "Closed"} parking selected)</span>
                  </label>
                  <input type="number" value={parkingAmount} onChange={e => setParkingAmount(e.target.value)} placeholder="e.g. 100000"
                    className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
              )}

              {/* Grand Total — auto-sum of all payment components */}
              <div className="col-span-2 pt-3 border-t border-gray-200">
                <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                  Grand Total (₹) <span className="text-[10px] text-blue-500 font-normal">Auto</span>
                </label>
                <input readOnly
                  value={grandTotal > 0 ? grandTotal.toLocaleString("en-IN") : ""}
                  placeholder="Sum of Base + GST + Stamp Duty + Electrical Bill + Parking"
                  className="w-full border-2 border-blue-200 rounded-lg px-3 py-2.5 text-sm bg-blue-50 text-blue-900 font-semibold cursor-not-allowed focus:outline-none" />
                <p className="text-[10px] text-gray-400 mt-1">
                  Base Amount + GST + Stamp Duty + Electrical Bill{hasParking ? " + Parking" : ""}
                </p>
              </div>
            </div>
            <button onClick={handleGenerateSlab} disabled={!totalCalc}
              className="mt-5 w-full flex items-center justify-center gap-2 bg-[#0f1a35] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#1e3a5f] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              Generate Booking Slab (10%)
            </button>
            <p className="text-[10px] text-gray-400 mt-1.5 text-center">
              Only 10% Booking slab with Received Amount generated here. Remaining slabs are created in Sales.
            </p>
            {generatedSlab && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl space-y-2">
                <p className="text-[10px] text-green-700 font-semibold uppercase tracking-widest">Generated Booking Slab</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">10% Booking Amount</span>
                  <span className="font-bold text-[#0f1a35]">₹{generatedSlab.booking10.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-green-200 pt-2">
                  <span className="font-semibold text-gray-800">Received Amount</span>
                  <span className="text-base font-bold text-green-700">₹{generatedSlab.received.toLocaleString("en-IN")}</span>
                </div>
              </div>
            )}
          </div>

          {/* Notes / Remarks */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Notes / Remarks</p>
              <button onClick={handleSaveNotes}
                className={`text-xs font-semibold px-3 py-1 rounded-lg transition-all ${notesSaved ? "bg-green-100 text-green-700" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
                {notesSaved ? "✓ Saved" : "Save Notes"}
              </button>
            </div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Add any remarks or notes about this customer booking…"
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300" />
            <p className="text-[10px] text-gray-400 text-right mt-1">
              {notes.trim() === "" ? 0 : notes.trim().split(/\s+/).length} words
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pb-6">
            <button className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
              Register Customer
            </button>
            <button className="px-6 border border-gray-200 text-gray-500 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>

        {/* ── RIGHT: Booked Flats Grid ── */}
        <div className="col-span-2">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden sticky top-6">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-[#0f1a35]">Booked Flats Grid</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Navigate by Building → Wing → Floor</p>
            </div>

            {/* Building / Wing / Floor selectors — text field + +/− buttons */}
            <div className="px-4 pt-3 pb-3 border-b border-gray-100 space-y-2.5 bg-gray-50/60">
              {/* Building */}
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Building</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelBuildingIdx(i => Math.max(0, i - 1))}
                    disabled={selBuildingIdx === 0}
                    className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 font-bold text-base leading-none transition-colors">−</button>
                  <input
                    type="text"
                    value={selBldg}
                    onChange={e => {
                      const idx = buildings.indexOf(e.target.value);
                      if (idx >= 0) { setSelBuildingIdx(idx); setSelWingIdx(0); setSelFloor(0); }
                    }}
                    list="building-options"
                    placeholder="Type or use +/−"
                    className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center font-semibold text-[#0f1a35] bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <datalist id="building-options">
                    {buildings.map(b => <option key={b} value={b} />)}
                  </datalist>
                  <button
                    onClick={() => { setSelBuildingIdx(i => Math.min(buildings.length - 1, i + 1)); setSelWingIdx(0); setSelFloor(0); }}
                    disabled={selBuildingIdx >= buildings.length - 1}
                    className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 font-bold text-base leading-none transition-colors">+</button>
                </div>
              </div>

              {/* Wing */}
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Wing</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelWingIdx(i => Math.max(0, i - 1))}
                    disabled={selWingIdx === 0}
                    className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 font-bold text-base leading-none transition-colors">−</button>
                  <input
                    type="text"
                    value={selWing}
                    onChange={e => {
                      const idx = wings.indexOf(e.target.value);
                      if (idx >= 0) { setSelWingIdx(idx); setSelFloor(0); }
                    }}
                    list="wing-options"
                    placeholder="Type or use +/−"
                    className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center font-semibold text-[#0f1a35] bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <datalist id="wing-options">
                    {wings.map(w => <option key={w} value={w} />)}
                  </datalist>
                  <button
                    onClick={() => { setSelWingIdx(i => Math.min(wings.length - 1, i + 1)); setSelFloor(0); }}
                    disabled={selWingIdx >= wings.length - 1}
                    className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 font-bold text-base leading-none transition-colors">+</button>
                </div>
              </div>

              {/* Floor */}
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Floor</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelFloor(f => Math.max(0, f - 1))}
                    disabled={selFloor === 0}
                    className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 font-bold text-base leading-none transition-colors">−</button>
                  <input
                    type="text"
                    value={selFloor === 0 ? "" : String(selFloor)}
                    onChange={e => {
                      const val = e.target.value.trim();
                      if (val === "" || val === "0") { setSelFloor(0); return; }
                      const n = parseInt(val, 10);
                      if (!isNaN(n) && n >= 1 && n <= maxFloor) setSelFloor(n);
                    }}
                    placeholder="All floors"
                    className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center font-semibold text-[#0f1a35] bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <button
                    onClick={() => setSelFloor(f => Math.min(maxFloor, f + 1))}
                    disabled={selFloor >= maxFloor}
                    className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 font-bold text-base leading-none transition-colors">+</button>
                </div>
              </div>
            </div>

            {/* Clickable Floor Tabs */}
            {(() => {
              const availFloors: number[] = activePrj
                ? Array.from(new Set(
                    activePrj.units
                      .filter(u => u.number.startsWith(`${selBldg}-W${selWing}-`))
                      .map(u => u.floor)
                  )).sort((a, b) => a - b)
                : Array.from({ length: Math.max(maxFloor, 1) }, (_, i) => i + 1);
              return availFloors.length > 0 ? (
                <div className="flex gap-1.5 px-3 py-2 border-b border-gray-100 overflow-x-auto bg-white">
                  <button
                    onClick={() => setSelFloor(0)}
                    className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                      selFloor === 0 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                    }`}>All</button>
                  {availFloors.map(f => (
                    <button key={f}
                      onClick={() => setSelFloor(f)}
                      className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                        selFloor === f ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                      }`}>F{f}</button>
                  ))}
                </div>
              ) : null;
            })()}

            {/* Legend */}
            <div className="flex gap-3 px-4 py-2 border-b border-gray-100 bg-gray-50 flex-wrap">
              {[
                { cls: "bg-green-100 border-green-300",  label: "Fully Booked / Paid" },
                { cls: "bg-red-100 border-red-300",      label: "Hold / No Payment"   },
                { cls: "bg-white border-gray-200",       label: "Available"            },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1">
                  <div className={`w-3 h-3 rounded border ${l.cls}`} />
                  <span className="text-[9px] text-gray-500">{l.label}</span>
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="p-3 grid grid-cols-4 gap-1.5 max-h-[380px] overflow-y-auto">
              {gridUnits.length === 0 && (
                <div className="col-span-4 text-center py-10 text-sm text-gray-400">No units for this selection.</div>
              )}
              {gridUnits.map((flat, idx) => (
                <button key={`${flat.number}-${idx}`}
                  onClick={() => setModalFlat({ number: flat.number, type: flat.type, status: flat.status, floor: flat.floor, occupant: flat.occupant })}
                  title={flat.occupant ? `${flat.occupant} · ${flat.status}` : flat.status}
                  className={`aspect-square flex flex-col items-center justify-center rounded-lg border text-[10px] font-semibold transition-all ${flatColorClass(flat.status)}`}>
                  <span className="text-[8px] opacity-60">F{flat.floor}</span>
                  <span>{String(flat.number).split("-").pop()}</span>
                  {flat.occupant
                    ? <span className="text-[7px] font-normal opacity-80 truncate w-full text-center px-0.5">{flat.occupant.split(" ")[0]}</span>
                    : <span className="text-[8px] font-normal opacity-60">{flat.type}</span>
                  }
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Flat detail modal */}
      {modalFlat && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setModalFlat(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-72 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-[#0f1a35]">Unit {String(modalFlat.number).split("-").pop()}</h3>
              <button onClick={() => setModalFlat(null)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><X size={15} /></button>
            </div>
            <div className="space-y-3">
              {[
                { k: "Full No.", v: modalFlat.number },
                { k: "Type",    v: modalFlat.type    },
                { k: "Floor",   v: `Floor ${modalFlat.floor}` },
                ...(modalFlat.occupant ? [{ k: "Customer", v: modalFlat.occupant }] : []),
                { k: "Status",  v: null },
              ].map(row => (
                <div key={row.k} className="flex items-center justify-between text-sm border-b border-gray-50 pb-2 last:border-0">
                  <span className="text-gray-400">{row.k}</span>
                  {row.v ? <span className="font-semibold text-gray-800">{row.v}</span> : <Badge status={modalFlat.status} />}
                </div>
              ))}
            </div>
            <div className="mt-5 flex gap-2">
              {modalFlat.status === "available"
                ? <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">Book This Unit</button>
                : <button className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">View Details</button>
              }
              <button onClick={() => setModalFlat(null)} className="px-4 border border-gray-200 text-gray-500 py-2 rounded-lg text-sm hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Project Setup ──────────────────────────────────────────────────────────

const BHK_TYPES = ["1BHK", "2BHK", "3BHK", "4BHK"] as const;

interface CommZone { floors: number; shopsPerFloor: number; area: string }
interface BhkEntry { count: number; area: string }

function Counter({ value, onChange, min = 0 }: { value: number; onChange: (n: number) => void; min?: number }) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors font-bold text-base leading-none"
      >−</button>
      <span className="w-8 text-center text-sm font-semibold text-[#0f1a35]">{value}</span>
      <button
        onClick={() => onChange(value + 1)}
        className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors font-bold text-base leading-none"
      >+</button>
    </div>
  );
}

function LevelCard({ level, title, locked, completed, children }: {
  level: number; title: string; locked: boolean; completed: boolean; children?: ReactNode;
}) {
  return (
    <div
      className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all duration-300 ${
        completed
          ? "border-green-200 scale-[0.98] opacity-75"
          : locked
          ? "border-gray-100 opacity-40 pointer-events-none select-none"
          : "border-gray-100"
      }`}
    >
      <div className={`flex items-center justify-between px-5 py-3 border-b ${
        completed ? "bg-green-50 border-green-100" : locked ? "bg-gray-50 border-gray-100" : "bg-white border-gray-100"
      }`}>
        <div className="flex items-center gap-2">
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
            completed ? "bg-green-500 text-white" : locked ? "bg-gray-200 text-gray-400" : "bg-blue-600 text-white"
          }`}>
            {completed ? "✓" : level}
          </span>
          <h3 className="text-sm font-semibold text-[#0f1a35]">{title}</h3>
        </div>
        {completed && <span className="text-[10px] font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Completed</span>}
        {locked   && <span className="text-[10px] font-semibold text-gray-400  bg-gray-100  px-2 py-0.5 rounded-full">Locked</span>}
      </div>
      {!locked && <div className="p-5">{children}</div>}
    </div>
  );
}

function WingPanel({ wing, wi, propType, onChange }: {
  wing: WingConfig; wi: number; propType: PropType;
  onChange: (patch: Partial<WingConfig>) => void;
}) {
  const label = WING_LABELS[wi] ?? `Wing ${wi + 1}`;
  const flatsPerFloor = Object.values(wing.bhk).reduce((s, b) => s + b.count, 0);
  const totalFlats = wing.floors * flatsPerFloor;
  const totalShops = wing.floors * wing.shopsPerFloor;

  function updateBhk(type: string, patch: Partial<BhkEntry>) {
    onChange({ bhk: { ...wing.bhk, [type]: { ...wing.bhk[type], ...patch } } });
  }

  return (
    <div className="border border-gray-100 rounded-xl bg-gray-50/60 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wider">Wing {label}</span>
      </div>

      {/* Floors */}
      <div className="flex items-center gap-4">
        <div>
          <label className="text-[11px] font-semibold text-gray-500 block mb-1.5">Number of Floors</label>
          <Counter value={wing.floors} onChange={v => onChange({ floors: v })} />
        </div>
        {wing.floors > 0 && (
          <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded-full mt-4">
            {wing.floors} floor{wing.floors !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Commercial config */}
      {(propType === "commercial" || propType === "semi") && (
        <div className="flex items-end gap-4 flex-wrap">
          <div>
            <label className="text-[11px] font-semibold text-gray-500 block mb-1.5">Shops / Floor</label>
            <Counter value={wing.shopsPerFloor} onChange={v => onChange({ shopsPerFloor: v })} />
          </div>
          <div className="flex-1 min-w-32">
            <label className="text-[11px] font-semibold text-gray-500 block mb-1">Carpet Area / Shop (sq.ft.)</label>
            <input type="text" value={wing.shopArea}
              onChange={e => onChange({ shopArea: e.target.value })}
              placeholder="e.g. 450"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" />
          </div>
          {totalShops > 0 && (
            <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-full mb-0.5">
              {totalShops} shops total
            </span>
          )}
        </div>
      )}

      {/* Residential BHK config */}
      {(propType === "residential" || propType === "semi") && (
        <div>
          {propType === "semi" && <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Residential Units</p>}
          <div className="space-y-2">
            {BHK_TYPES.map(type => (
              <div key={type} className="flex items-center gap-3 px-3 py-2 bg-white rounded-lg border border-gray-100">
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full w-11 text-center shrink-0">{type}</span>
                <Counter value={wing.bhk[type].count} onChange={v => updateBhk(type, { count: v })} />
                <span className="text-[10px] text-gray-400">units</span>
                <div className="flex-1">
                  <input type="text" value={wing.bhk[type].area}
                    onChange={e => updateBhk(type, { area: e.target.value })}
                    placeholder="Area (sq.ft.)"
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
              </div>
            ))}
          </div>
          {totalFlats > 0 && (
            <span className="text-[10px] font-semibold text-green-600 bg-green-50 border border-green-100 px-2 py-1 rounded-full mt-2 inline-block">
              {flatsPerFloor} flat{flatsPerFloor !== 1 ? "s" : ""} / floor · {totalFlats} total
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function BuildingPanel({ bldg, bi, propType, onChange }: {
  bldg: BuildingConfig; bi: number; propType: PropType;
  onChange: (patch: Partial<BuildingConfig>) => void;
}) {
  function setWings(numWings: number) {
    const current = bldg.wings;
    const wings: WingConfig[] = Array.from({ length: numWings }, (_, i) =>
      current[i] ?? makeWing(`w-${bldg.id}-${i}`)
    );
    onChange({ numWings, wings });
  }
  function updateWing(i: number, patch: Partial<WingConfig>) {
    const wings = bldg.wings.map((w, j) => j === i ? { ...w, ...patch } : w);
    onChange({ wings });
  }
  const totalUnits = bldg.wings.reduce((s, w) => {
    const flats = w.floors * Object.values(w.bhk).reduce((a, b) => a + b.count, 0);
    const shops = w.floors * w.shopsPerFloor;
    return s + (propType === "commercial" ? shops : propType === "residential" ? flats : flats + shops);
  }, 0);

  return (
    <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
      {/* Building header */}
      <div className="flex items-center gap-4 px-5 py-4 bg-[#f8f9fb] border-b border-gray-100">
        <span className="text-[10px] font-bold text-[#1e3a5f] bg-blue-100 px-2 py-0.5 rounded-full uppercase tracking-widest">
          Building {bi + 1}
        </span>
        <div className="flex-1">
          <input
            type="text"
            value={bldg.name}
            onChange={e => onChange({ name: e.target.value })}
            placeholder={`e.g. Tower ${String.fromCharCode(65 + bi)}`}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-[#0f1a35] focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-[11px] font-semibold text-gray-500">Wings:</label>
          <Counter value={bldg.numWings} onChange={setWings} />
        </div>
        {totalUnits > 0 && (
          <span className="text-[10px] font-semibold text-green-600 bg-green-50 border border-green-100 px-2 py-1 rounded-full shrink-0">
            {totalUnits} units
          </span>
        )}
      </div>

      {/* Wings */}
      {bldg.wings.length > 0 && (
        <div className="p-4 grid gap-3" style={{ gridTemplateColumns: bldg.wings.length > 1 ? "1fr 1fr" : "1fr" }}>
          {bldg.wings.map((wing, wi) => (
            <WingPanel key={wing.id} wing={wing} wi={wi} propType={propType}
              onChange={patch => updateWing(wi, patch)} />
          ))}
        </div>
      )}
      {bldg.numWings === 0 && (
        <p className="text-xs text-gray-400 text-center py-5">Set the number of wings above to configure floors & units.</p>
      )}
    </div>
  );
}

function ProjectSetup({ onCreate, onBack }: { onCreate: (p: ProjectData) => void; onBack?: () => void }) {
  const [projectName, setProjectName] = useState("");
  const [propType, setPropType]       = useState<PropType | null>(null);
  const [numBuildings, setNumBuildings] = useState(0);
  const [buildings, setBuildings]      = useState<BuildingConfig[]>([]);

  // Level unlock
  const lvl2 = projectName.trim().length > 0;
  const lvl3 = lvl2 && propType !== null;
  const lvl4 = lvl3 && numBuildings > 0;

  // Animate
  const [animLvl, setAnimLvl] = useState<number | null>(null);
  const prev2 = useRef(false); const prev3 = useRef(false); const prev4 = useRef(false);
  useEffect(() => { if (lvl2 && !prev2.current) { setAnimLvl(2); setTimeout(() => setAnimLvl(null), 350); } prev2.current = lvl2; }, [lvl2]);
  useEffect(() => { if (lvl3 && !prev3.current) { setAnimLvl(3); setTimeout(() => setAnimLvl(null), 350); } prev3.current = lvl3; }, [lvl3]);
  useEffect(() => { if (lvl4 && !prev4.current) { setAnimLvl(4); setTimeout(() => setAnimLvl(null), 350); } prev4.current = lvl4; }, [lvl4]);

  function changeNumBuildings(n: number) {
    setNumBuildings(n);
    setBuildings(prev => Array.from({ length: n }, (_, i) => prev[i] ?? makeBuilding(`b-${Date.now()}-${i}`)));
  }
  function updateBuilding(i: number, patch: Partial<BuildingConfig>) {
    setBuildings(bs => bs.map((b, j) => j === i ? { ...b, ...patch } : b));
  }

  // Live total for submit badge
  const totalUnits = buildings.reduce((s, b) => {
    return s + b.wings.reduce((ws, w) => {
      const flats = w.floors * Object.values(w.bhk).reduce((a, x) => a + x.count, 0);
      const shops = w.floors * w.shopsPerFloor;
      return ws + (propType === "commercial" ? shops : propType === "residential" ? flats : flats + shops);
    }, 0);
  }, 0);

  function handleSubmit() {
    if (!projectName.trim() || !propType || buildings.length === 0) return;
    const units = generateUnitsFromBuildings(propType, buildings);
    const totalF = units.filter(u => u.kind === "flat").length;
    const totalS = units.filter(u => u.kind === "shop").length;
    onCreate({ id: `prj-${Date.now()}`, name: projectName.trim(), propType, totalFlats: totalF, totalShops: totalS, units });
  }

  const propOptions: { type: PropType; icon: string; label: string; tag: string }[] = [
    { type: "residential", icon: "🏠", label: "Residential",     tag: "bg-blue-100 text-blue-700"    },
    { type: "commercial",  icon: "🏢", label: "Commercial",      tag: "bg-indigo-100 text-indigo-700" },
    { type: "semi",        icon: "🏘️", label: "Semi (Mixed-Use)", tag: "bg-green-100 text-green-700"  },
  ];

  return (
    <>
      <style>{`
        @keyframes levelIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .level-animate { animation: levelIn 300ms cubic-bezier(0.215,0.610,0.355,1.000) both; }
      `}</style>

      <div className="p-6 space-y-4 max-w-5xl">
        {onBack && (
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            ← Back to Sales
          </button>
        )}

        {/* Level 1 — Project Name */}
        <LevelCard level={1} title="Project / Site Name" locked={false} completed={lvl2}>
          <label className="text-[11px] font-semibold text-gray-500 block mb-1">Project Name</label>
          <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)}
            placeholder="e.g., Skyrise Heights"
            className="w-full max-w-md border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
        </LevelCard>

        {/* Level 2 — Property Type */}
        <div className={animLvl === 2 ? "level-animate" : ""}>
          <LevelCard level={2} title="Property Category" locked={!lvl2} completed={lvl3}>
            <p className="text-[11px] text-gray-400 mb-4">Select the property type for this project.</p>
            <div className="grid grid-cols-3 gap-3 max-w-lg">
              {propOptions.map(opt => (
                <button key={opt.type} onClick={() => setPropType(opt.type)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${propType === opt.type ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-blue-200 hover:bg-gray-50"}`}>
                  <span className="text-2xl block mb-2">{opt.icon}</span>
                  <p className="text-sm font-semibold text-[#0f1a35]">{opt.label}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1.5 inline-block ${opt.tag}`}>{opt.label}</span>
                </button>
              ))}
            </div>
          </LevelCard>
        </div>

        {/* Level 3 — Number of Buildings */}
        <div className={animLvl === 3 ? "level-animate" : ""}>
          <LevelCard level={3} title="Buildings" locked={!lvl3} completed={lvl4}>
            <div className="flex items-center gap-4">
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1.5">Number of Buildings</label>
                <Counter value={numBuildings} onChange={changeNumBuildings} />
              </div>
              {numBuildings > 0 && (
                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded-full mt-4">
                  {numBuildings} building{numBuildings !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </LevelCard>
        </div>

        {/* Level 4 — Building Detail (Wings → Floors → Units) */}
        <div className={animLvl === 4 ? "level-animate" : ""}>
          <LevelCard level={4} title="Wings, Floors & Units" locked={!lvl4} completed={false}>
            {propType === "semi" && (
              <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-2.5 mb-4">
                <p className="text-xs text-amber-700 font-medium">Mixed-Use: configure both Commercial and Residential units per wing.</p>
              </div>
            )}
            <div className="space-y-4">
              {buildings.map((bldg, bi) => (
                <BuildingPanel key={bldg.id} bldg={bldg} bi={bi} propType={propType!}
                  onChange={patch => updateBuilding(bi, patch)} />
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-gray-100 flex items-center gap-4">
              <button
                onClick={handleSubmit}
                disabled={!projectName.trim() || !propType || buildings.length === 0}
                className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CheckCircle2 size={15} /> Submit Project
              </button>
              {totalUnits > 0 && (
                <span className="text-[11px] text-gray-400">
                  <span className="font-semibold text-[#1e3a5f]">{totalUnits}</span> total units configured
                </span>
              )}
            </div>
          </LevelCard>
        </div>

      </div>
    </>
  );
}

// ── Sales Dashboard ───────────────────────────────────────────────────────

const WA_TEMPLATE_DEFAULT = `Hello {owner_name}, this is a payment reminder from Nirmit Developer.\n\nYour flat *{flat_name}* has a payment of *{payment_value}* due on *{due_date}*.\n\nCurrent build status: {build_status}.\n\nPlease make the payment at your earliest convenience. Thank you for your cooperation! 🙏`;

const DONUT_COLORS = ["#1e3a5f", "#2563eb", "#60a5fa", "#93c5fd", "#dbeafe"];
const donutData = [
  { name: "75%+ paid",  value: 30 },
  { name: "50%+ paid",  value: 25 },
  { name: "30%+ paid",  value: 20 },
  { name: "10%+ paid",  value: 15 },
  { name: "Remaining",  value: 10 },
];

function SalesDashboard({ projects, onNav }: { projects: ProjectData[]; onNav: (p: Page) => void }) {
  const [propView, setPropView] = useState<"residential" | "commercial">("residential");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Derive project metrics
  const allUnits  = projects.flatMap(p => p.units);
  const flats     = allUnits.filter(u => u.kind === "flat");
  const shops     = allUnits.filter(u => u.kind === "shop");

  const totalFlats      = flats.length  || projects.reduce((s,p) => s + p.totalFlats, 0);
  const totalShops      = shops.length  || projects.reduce((s,p) => s + p.totalShops, 0);
  const bookedFlats     = flats.filter(u => u.status === "booked" || u.status === "overdue").length;
  const tempBookedFlats = flats.filter(u => u.status === "overdue").length;
  const remainFlats     = flats.filter(u => u.status === "available").length;
  const bookedShops     = shops.filter(u => u.status === "booked" || u.status === "overdue").length;
  const tempBookedShops = shops.filter(u => u.status === "overdue").length;
  const remainShops     = shops.filter(u => u.status === "available").length;

  const totalSales    = customersList.reduce((s, c) => s + c.amount, 0);
  const totalGst      = Math.round(totalSales * 0.05);
  const collectedGst  = Math.round(totalGst * 0.62);
  const totalStamp    = Math.round(totalSales * 0.03);
  const receivedStamp = Math.round(totalStamp * 0.50);
  const totalAgree    = Math.round(totalSales * 0.015);
  const collectedAgree = Math.round(totalAgree * 0.78);

  const latestSlab    = defaultSlabs[defaultSlabs.length - 1];
  const totalSlabAmt  = Math.round(totalSales * (latestSlab?.percentage ?? 10) / 100);
  const receivedSlabAmt = Math.round(totalSlabAmt * 0.65);
  const remainingSlabAmt = totalSlabAmt - receivedSlabAmt;

  const cards = propView === "residential"
    ? [
        { label: "Total Flats",       value: totalFlats || "—",      accent: "text-[#1e3a5f]", bg: "bg-blue-50",   border: "border-blue-200" },
        { label: "Temp. Booked Flats",value: tempBookedFlats || "—", accent: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
        { label: "Remaining Flats",   value: remainFlats || "—",     accent: "text-green-600",  bg: "bg-green-50",  border: "border-green-200" },
      ]
    : [
        { label: "Total Shops",       value: totalShops || "—",      accent: "text-[#1e3a5f]", bg: "bg-blue-50",   border: "border-blue-200" },
        { label: "Temp. Booked Shops",value: tempBookedShops || "—", accent: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
        { label: "Remaining Shops",   value: remainShops || "—",     accent: "text-green-600",  bg: "bg-green-50",  border: "border-green-200" },
      ];

  // ── Received payment modal state (inline) ──
  const [searchQ, setSearchQ]         = useState("");
  const [selCustomer, setSelCustomer] = useState<CustomerRecord | null>(null);
  const [pmtType, setPmtType]         = useState<"residential"|"commercial">("residential");
  const [pmtCat, setPmtCat]           = useState<"flat"|"gst"|"legal"|"stamp">("flat");
  const [receivedAmt, setReceivedAmt] = useState("");
  const [pmtMethod, setPmtMethod]     = useState("cash");
  const [pmtDate, setPmtDate]         = useState("");
  const [pmtSubmitted, setPmtSubmitted] = useState(false);

  const pmtSuggestions = searchQ.length >= 1
    ? customersList.filter(c => c.name.toLowerCase().includes(searchQ.toLowerCase()) || c.id.toLowerCase().includes(searchQ.toLowerCase()))
    : [];
  const catLabels: Record<string, string> = { flat:"Flat Payment", gst:"GST", legal:"Legal", stamp:"Stamp Duty" };
  const pmtTotal = selCustomer
    ? pmtCat === "flat" ? Math.round(selCustomer.amount * 0.10)
    : pmtCat === "gst"  ? Math.round(selCustomer.amount * 0.05)
    : pmtCat === "legal"? Math.round(selCustomer.amount * 0.02)
    :                     Math.round(selCustomer.amount * 0.03)
    : 0;

  function handlePmtSubmit() {
    if (!selCustomer || !receivedAmt || !pmtDate) return;
    setPmtSubmitted(true);
    setTimeout(() => { setPmtSubmitted(false); setShowPaymentModal(false); setSelCustomer(null); setSearchQ(""); setReceivedAmt(""); setPmtDate(""); }, 1800);
  }

  return (
    <div className="p-6 space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0f1a35]">Sales Dashboard</h2>
          <p className="text-sm text-gray-400 mt-0.5">Property sales overview and payment tracking</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onNav("payment-slabs")}
            className="flex items-center gap-2 border border-blue-300 text-blue-700 bg-blue-50 text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-100 transition-colors">
            <Layers size={14} /> Payment Slabs
          </button>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors">
            <CreditCard size={14} /> Add Received Payment
          </button>
        </div>
      </div>

      {/* ── Property Toggle ── */}
      <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
        {(["residential","commercial"] as const).map(t => (
          <button key={t} onClick={() => setPropView(t)}
            className={`px-5 py-2 text-sm font-semibold capitalize transition-colors ${
              propView === t ? "bg-[#0f1a35] text-white" : "bg-white text-gray-500 hover:bg-gray-50"
            }`}>{t}</button>
        ))}
      </div>

      {/* ── Top Metric Master Cards ── */}
      <div className="grid grid-cols-3 gap-4">
        {cards.map(c => (
          <div key={c.label} className={`${c.bg} ${c.border} border rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow`}>
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest mb-3">{c.label}</p>
            <p className={`text-4xl font-bold ${c.accent}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* ── Middle Section ── */}
      <div className="grid grid-cols-2 gap-5">

        {/* Left — Donut Chart */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
          <p className="text-sm font-semibold text-[#0f1a35] mb-4">Payment Distribution</p>
          <div className="flex items-center gap-6">
            <div className="shrink-0">
              <PieChart width={160} height={160}>
                <Pie data={donutData} cx={80} cy={80} innerRadius={45} outerRadius={75} dataKey="value" stroke="none">
                  {donutData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v}%`, ""]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              </PieChart>
            </div>
            <div className="space-y-2.5 flex-1">
              {[
                { label: "Total Amount Received", pct: "100%", color: DONUT_COLORS[0] },
                { label: "75% and above",         pct: "30%",  color: DONUT_COLORS[1] },
                { label: "50% and above",         pct: "25%",  color: DONUT_COLORS[2] },
                { label: "30% and above",         pct: "20%",  color: DONUT_COLORS[3] },
                { label: "10% and above",         pct: "15%",  color: DONUT_COLORS[4] },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: l.color }} />
                  <span className="text-xs text-gray-600 flex-1">{l.label}</span>
                  <span className="text-xs font-semibold text-gray-700">{l.pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Admin Dues */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
          <p className="text-sm font-semibold text-[#0f1a35] mb-4">Administrative Dues</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "GST",        total: totalGst,      collected: collectedGst,    subLabel: "Collected / Received" },
              { label: "Stamp Duty", total: totalStamp,    collected: receivedStamp,   subLabel: "Received Stamp Duty"  },
              { label: "Agreement",  total: totalAgree,    collected: collectedAgree,  subLabel: "Collected"            },
            ].map(a => (
              <div key={a.label} className="rounded-xl border border-gray-100 overflow-hidden">
                <div className="bg-[#0f1a35] px-3 py-2.5 text-center">
                  <p className="text-[10px] text-blue-200 font-semibold uppercase tracking-widest">{a.label}</p>
                  <p className="text-base font-bold text-white mt-0.5">{fmt(a.total)}</p>
                  <p className="text-[9px] text-blue-300 mt-0.5">Total Due</p>
                </div>
                <div className="bg-green-50 px-3 py-2.5 text-center border-t border-gray-100">
                  <p className="text-[9px] text-gray-400 font-semibold">{a.subLabel}</p>
                  <p className="text-sm font-bold text-green-700 mt-0.5">{fmt(a.collected)}</p>
                  <p className="text-[9px] text-gray-400">{Math.round(a.collected / a.total * 100)}% collected</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Section ── */}
      <div className="grid grid-cols-2 gap-5">

        {/* Left — Recent Payments Table */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#0f1a35]">Recent Payments</h3>
            <button className="text-[10px] text-blue-600 font-semibold hover:underline">View all</button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400 border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-2.5">#</th>
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5">Flat</th>
                <th className="px-4 py-2.5">Amount</th>
                <th className="px-4 py-2.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mockReceivedLog.length === 0 && (
                <tr><td colSpan={5} className="text-center py-6 text-sm text-gray-400">No data yet.</td></tr>
              )}
              {mockReceivedLog.slice(0, 5).map((r, i) => (
                <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-400 font-mono">{i + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{r.customer}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-600">{r.flat}</td>
                  <td className="px-4 py-3 text-sm font-bold text-green-700">{fmt(r.received > 0 ? r.received : r.amount)}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right — Payment Slab Summary */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={14} className="text-blue-600" />
              <h3 className="text-sm font-semibold text-[#0f1a35]">Payment Slab Generation</h3>
            </div>
            <button
              onClick={() => onNav("payment-slabs")}
              className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors">
              <Plus size={14} />
            </button>
          </div>
          <div className="p-5 space-y-3">
            {defaultSlabs.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No data yet.</p>
            )}
            {defaultSlabs.map(s => (
              <div key={s.id} className="flex items-start justify-between p-3 rounded-lg border border-gray-100 bg-gray-50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">#{s.slabNo}</span>
                    <span className="text-xs font-semibold text-gray-700">{s.stage}</span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Recent slab: <span className="font-bold text-[#0f1a35]">{s.percentage}%</span>
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Total payment: <span className="font-bold text-green-600">{fmt(Math.round(totalSales * s.percentage / 100))}</span>
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Remaining: <span className="font-semibold text-orange-600">
                      {fmt(Math.round(totalSales * s.percentage / 100) - Math.round(totalSales * s.percentage / 100 * 0.65))}
                    </span>
                  </p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize shrink-0 ${
                  s.status === "received" ? "bg-green-100 text-green-700"
                  : s.status === "sent"   ? "bg-blue-100 text-blue-600"
                  :                        "bg-gray-100 text-gray-500"
                }`}>{s.status}</span>
              </div>
            ))}
            <button onClick={() => onNav("payment-slabs")}
              className="w-full mt-1 py-2 border-2 border-dashed border-blue-200 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-1.5">
              <Plus size={13} /> Add New Slab
            </button>
          </div>
        </div>
      </div>

      {/* ── Inline Add Received Payment Modal ── */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="text-blue-600" />
                <h3 className="text-base font-bold text-[#0f1a35]">Add Received Payment</h3>
              </div>
              <button onClick={() => { setShowPaymentModal(false); setSelCustomer(null); setSearchQ(""); }} className="p-1 rounded-lg hover:bg-gray-200 text-gray-400"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Customer Search */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest block mb-2">Search Customer</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={searchQ} onChange={e => { setSearchQ(e.target.value); setSelCustomer(null); }}
                    placeholder="Name or Customer ID…"
                    className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                {pmtSuggestions.length > 0 && !selCustomer && (
                  <div className="mt-1 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    {pmtSuggestions.map(c => (
                      <button key={c.id} onClick={() => { setSelCustomer(c); setSearchQ(c.name); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0">
                        <p className="text-sm font-medium text-gray-800">{c.name}</p>
                        <p className="text-[11px] text-gray-400">{c.id} · Flat {c.flat} · {c.project}</p>
                      </button>
                    ))}
                  </div>
                )}
                {selCustomer && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg grid grid-cols-2 gap-2">
                    {[{ k:"Customer ID",v:selCustomer.id },{ k:"Flat No.",v:selCustomer.flat },{ k:"Project",v:selCustomer.project },{ k:"Total Amt",v:fmt(selCustomer.amount) }].map(r => (
                      <div key={r.k}>
                        <p className="text-[10px] text-blue-500 font-semibold uppercase">{r.k}</p>
                        <p className="text-sm font-semibold text-[#0f1a35]">{r.v}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Property Type */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest block mb-2">Property Type</label>
                <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                  {(["residential","commercial"] as const).map(t => (
                    <button key={t} onClick={() => setPmtType(t)}
                      className={`flex-1 py-2 text-sm font-semibold capitalize transition-colors ${pmtType === t ? "bg-blue-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}>{t}</button>
                  ))}
                </div>
              </div>
              {/* Payment Category */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest block mb-2">Payment Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["flat","gst","legal","stamp"] as const).map(cat => (
                    <button key={cat} onClick={() => setPmtCat(cat)}
                      className={`py-2 rounded-lg border text-sm font-medium transition-colors ${pmtCat === cat ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-500 hover:border-blue-300"}`}>
                      {catLabels[cat]}
                    </button>
                  ))}
                </div>
              </div>
              {/* Payment Details */}
              <div className="space-y-3">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest block">Payment Details</label>
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 block mb-1">Total Payment (from active slab) <span className="text-blue-400 font-normal">Auto</span></label>
                  <input readOnly value={pmtTotal > 0 ? `₹${pmtTotal.toLocaleString("en-IN")}` : "—"}
                    className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 block mb-1">Received Amount (₹)</label>
                  <input type="number" value={receivedAmt} onChange={e => setReceivedAmt(e.target.value)} placeholder="Enter amount received"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 block mb-1">Method</label>
                    <select value={pmtMethod} onChange={e => setPmtMethod(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
                      <option value="cash">Cash</option>
                      <option value="upi">UPI</option>
                      <option value="bank">Bank Transfer</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 block mb-1">Date Received</label>
                    <input type="date" value={pmtDate} onChange={e => setPmtDate(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                  </div>
                </div>
              </div>
              {pmtSubmitted && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-semibold">
                  <CheckCircle2 size={16} /> Payment recorded successfully!
                </div>
              )}
              <div className="flex gap-3 pt-1">
                <button onClick={handlePmtSubmit} disabled={!selCustomer || !receivedAmt || !pmtDate}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  Record Payment
                </button>
                <button onClick={() => { setShowPaymentModal(false); setSelCustomer(null); setSearchQ(""); }}
                  className="px-5 border border-gray-200 text-gray-500 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Received Payment ──────────────────────────────────────────────────────

function ReceivedPayment({ projects }: { projects: ProjectData[] }) {
  const [showForm, setShowForm] = useState(false);
  const [searchQ, setSearchQ]   = useState("");
  const [selCustomer, setSelCustomer] = useState<CustomerRecord | null>(null);
  const [propType, setPropType] = useState<"residential" | "commercial">("residential");
  const [payCategory, setPayCategory] = useState<"flat" | "gst" | "legal" | "stamp">("flat");
  const [receivedAmt, setReceivedAmt] = useState("");
  const [method, setMethod]           = useState("cash");
  const [receivedDate, setReceivedDate] = useState("");
  const [submitted, setSubmitted]     = useState(false);

  const suggestions = searchQ.length >= 1
    ? customersList.filter(c =>
        c.name.toLowerCase().includes(searchQ.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQ.toLowerCase())
      )
    : [];

  const categoryLabel: Record<string, string> = {
    flat: "Flat Payment", gst: "GST", legal: "Legal", stamp: "Stamp Duty",
  };

  const totalForCategory = selCustomer
    ? payCategory === "flat"  ? Math.round(selCustomer.amount * 0.10)
    : payCategory === "gst"   ? Math.round(selCustomer.amount * 0.05)
    : payCategory === "legal" ? Math.round(selCustomer.amount * 0.02)
    :                           Math.round(selCustomer.amount * 0.03)
    : 0;

  function handleSubmit() {
    if (!selCustomer || !receivedAmt || !receivedDate) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false); setShowForm(false);
      setSelCustomer(null); setSearchQ(""); setReceivedAmt(""); setReceivedDate("");
    }, 1800);
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0f1a35]">Received Payments</h2>
          <p className="text-sm text-gray-400 mt-0.5">Log and track all incoming payments per customer</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={14} /> Add Received Payment
        </button>
      </div>

      {/* Recent log */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h3 className="text-sm font-semibold text-[#0f1a35]">Payment Log</h3>
          <button className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <Download size={12} /> Export
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400 border-b border-gray-100 bg-gray-50">
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Flat</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Total Due</th>
              <th className="px-5 py-3">Received</th>
              <th className="px-5 py-3">Method</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {mockReceivedLog.length === 0 && (
              <tr><td colSpan={8} className="text-center py-6 text-sm text-gray-400">No data yet.</td></tr>
            )}
            {mockReceivedLog.map(r => (
              <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-5 py-3 text-sm font-medium text-gray-800">{r.customer}</td>
                <td className="px-5 py-3 text-sm font-mono text-gray-600">{r.flat}</td>
                <td className="px-5 py-3 text-sm text-gray-600">{r.category}</td>
                <td className="px-5 py-3 text-sm font-semibold text-[#1e3a5f]">{fmt(r.amount)}</td>
                <td className="px-5 py-3 text-sm font-semibold text-green-700">{r.received > 0 ? fmt(r.received) : "—"}</td>
                <td className="px-5 py-3 text-sm text-gray-500">{r.method}</td>
                <td className="px-5 py-3 text-sm text-gray-500">{r.date}</td>
                <td className="px-5 py-3"><Badge status={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="text-blue-600" />
                <h3 className="text-base font-bold text-[#0f1a35]">Add Received Payment</h3>
              </div>
              <button onClick={() => { setShowForm(false); setSelCustomer(null); setSearchQ(""); }} className="p-1 rounded-lg hover:bg-gray-200 text-gray-400"><X size={16} /></button>
            </div>

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">

              {/* Step 1+2: Customer search */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest block mb-2">
                  Step 1 — Search Customer
                </label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQ}
                    onChange={e => { setSearchQ(e.target.value); setSelCustomer(null); }}
                    placeholder="Name, Customer ID, or Phone…"
                    className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                {suggestions.length > 0 && !selCustomer && (
                  <div className="mt-1 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    {suggestions.map(c => (
                      <button key={c.id}
                        onClick={() => { setSelCustomer(c); setSearchQ(c.name); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0">
                        <p className="text-sm font-medium text-gray-800">{c.name}</p>
                        <p className="text-[11px] text-gray-400">{c.id} · Flat {c.flat} · {c.project}</p>
                      </button>
                    ))}
                  </div>
                )}
                {selCustomer && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg grid grid-cols-2 gap-2">
                    {[
                      { k: "Customer ID", v: selCustomer.id },
                      { k: "Flat No.",    v: selCustomer.flat },
                      { k: "Project",     v: selCustomer.project },
                      { k: "Total Amt",   v: fmt(selCustomer.amount) },
                    ].map(row => (
                      <div key={row.k}>
                        <p className="text-[10px] text-blue-500 font-semibold uppercase">{row.k}</p>
                        <p className="text-sm font-semibold text-[#0f1a35]">{row.v}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 3: Property type */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest block mb-2">Step 3 — Property Type</label>
                <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                  {(["residential","commercial"] as const).map(t => (
                    <button key={t}
                      onClick={() => setPropType(t)}
                      className={`flex-1 py-2 text-sm font-semibold capitalize transition-colors ${
                        propType === t ? "bg-blue-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"
                      }`}>{t}</button>
                  ))}
                </div>
              </div>

              {/* Step 4: Payment category */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest block mb-2">Step 4 — Payment Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["flat","gst","legal","stamp"] as const).map(cat => (
                    <button key={cat}
                      onClick={() => setPayCategory(cat)}
                      className={`py-2 rounded-lg border text-sm font-medium transition-colors ${
                        payCategory === cat
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 bg-white text-gray-500 hover:border-blue-300"
                      }`}>
                      {categoryLabel[cat]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 5: Payment details */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest block mb-3">Step 5 — Payment Details</label>
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 block mb-1">
                      Total Payment (from active slab) <span className="text-blue-400 font-normal">Auto</span>
                    </label>
                    <input readOnly
                      value={totalForCategory > 0 ? `₹${totalForCategory.toLocaleString("en-IN")}` : "—"}
                      className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 block mb-1">Received Amount (₹)</label>
                    <input type="number" value={receivedAmt} onChange={e => setReceivedAmt(e.target.value)}
                      placeholder="Enter amount received"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-500 block mb-1">Method</label>
                      <select value={method} onChange={e => setMethod(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
                        <option value="cash">Cash</option>
                        <option value="upi">UPI</option>
                        <option value="bank">Bank Transfer</option>
                        <option value="cheque">Cheque</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-500 block mb-1">Date Received</label>
                      <input type="date" value={receivedDate} onChange={e => setReceivedDate(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                    </div>
                  </div>
                </div>
              </div>

              {submitted && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-semibold">
                  <CheckCircle2 size={16} /> Payment recorded successfully!
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button onClick={handleSubmit}
                  disabled={!selCustomer || !receivedAmt || !receivedDate}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  Record Payment
                </button>
                <button onClick={() => { setShowForm(false); setSelCustomer(null); setSearchQ(""); }}
                  className="px-5 border border-gray-200 text-gray-500 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Payment Slabs ─────────────────────────────────────────────────────────

function PaymentSlabs({ projects, onBack }: { projects: ProjectData[]; onBack?: () => void }) {
  const [slabs, setSlabs]           = useState<SlabEntry[]>(defaultSlabs);
  const [showNew, setShowNew]       = useState(false);
  const [newStage, setNewStage]     = useState("");
  const [newPct, setNewPct]         = useState("");
  const [newDateGen, setNewDateGen] = useState("");
  const [newDue, setNewDue]         = useState("");
  const [editMsg, setEditMsg]       = useState(false);
  const [template, setTemplate]     = useState(WA_TEMPLATE_DEFAULT);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [selSlabForMsg, setSelSlabForMsg] = useState<SlabEntry | null>(null);

  const nextSlabNo = slabs.length > 0 ? Math.max(...slabs.map(s => s.slabNo)) + 1 : 1;

  const avgAmount = customersList.reduce((s, c) => s + c.amount, 0) / (customersList.length || 1);

  function addSlab() {
    if (!newStage.trim() || !newPct || !newDateGen || !newDue) return;
    const pct = Math.min(100, Math.max(0, Number(newPct)));
    setSlabs(prev => [
      ...prev,
      {
        id: `S${String(nextSlabNo).padStart(3, "0")}`,
        slabNo: nextSlabNo,
        stage: newStage,
        percentage: pct,
        dateGenerated: newDateGen,
        dueDate: newDue,
        status: "draft",
      },
    ]);
    setNewStage(""); setNewPct(""); setNewDateGen(""); setNewDue("");
    setShowNew(false);
  }

  function handleSend(slab: SlabEntry) {
    setSelSlabForMsg(slab);
    setSendSuccess(true);
    setTimeout(() => setSendSuccess(false), 2500);
  }

  const slabStatusBadge: Record<SlabEntry["status"], string> = {
    draft:    "bg-gray-100 text-gray-500",
    sent:     "bg-blue-100 text-blue-600",
    received: "bg-green-100 text-green-700",
  };

  return (
    <div className="p-6 space-y-5">
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          ← Back to Sales
        </button>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0f1a35]">Payment Slabs</h2>
          <p className="text-sm text-gray-400 mt-0.5">Define construction-stage slabs and push to customers</p>
        </div>
        <button onClick={() => setShowNew(s => !s)}
          className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={14} /> New Slab
        </button>
      </div>

      {/* New Slab Form */}
      {showNew && (
        <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-5 space-y-4">
          <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-widest">New Payment Slab</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-gray-500 block mb-1">Slab No. <span className="text-blue-400 font-normal">Auto</span></label>
              <input readOnly value={nextSlabNo}
                className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-500 block mb-1">Stage</label>
              <input type="text" value={newStage} onChange={e => setNewStage(e.target.value)}
                placeholder="e.g. Plinth, 1st Slab, Roof Slab…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-500 block mb-1">Payment Percentage (%)</label>
              <input type="number" min={1} max={100} value={newPct} onChange={e => setNewPct(e.target.value)}
                placeholder="e.g. 15"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-500 block mb-1">
                Avg. Amount per Customer <span className="text-blue-400 font-normal">Auto</span>
              </label>
              <input readOnly
                value={newPct ? `₹${Math.round(avgAmount * Number(newPct) / 100).toLocaleString("en-IN")}` : "—"}
                className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-500 block mb-1">Date of Generation</label>
              <input type="date" value={newDateGen} onChange={e => setNewDateGen(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-500 block mb-1">Due Date</label>
              <input type="date" value={newDue} onChange={e => setNewDue(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
          </div>
          {newPct && (
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-[10px] text-blue-600 font-semibold mb-1">Per-Customer Breakdown ({newPct}% of flat value, excl. GST/stamp/agreement)</p>
              {customersList.length === 0 ? (
                <p className="text-xs text-gray-400">No customers yet.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {customersList.slice(0, 3).map(c => (
                    <div key={c.id} className="bg-white rounded-lg px-2 py-1.5 border border-blue-100">
                      <p className="text-[10px] text-gray-500">{c.name.split(" ")[0]}</p>
                      <p className="text-sm font-bold text-[#0f1a35]">₹{Math.round(c.amount * Number(newPct) / 100).toLocaleString("en-IN")}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={addSlab} disabled={!newStage.trim() || !newPct || !newDateGen || !newDue}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              Create Slab
            </button>
            <button onClick={() => setShowNew(false)}
              className="px-4 border border-gray-200 text-gray-500 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Slabs Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
          <h3 className="text-sm font-semibold text-[#0f1a35]">Slab Schedule</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400 border-b border-gray-100 bg-gray-50">
              <th className="px-5 py-3">Slab No.</th>
              <th className="px-5 py-3">Stage</th>
              <th className="px-5 py-3">%</th>
              <th className="px-5 py-3">Avg. Amount</th>
              <th className="px-5 py-3">Generated</th>
              <th className="px-5 py-3">Due Date</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">WhatsApp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {slabs.length === 0 && (
              <tr><td colSpan={8} className="text-center py-6 text-sm text-gray-400">No data yet.</td></tr>
            )}
            {slabs.map(s => (
              <tr key={s.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-5 py-3 text-sm font-mono font-bold text-[#0f1a35]">#{s.slabNo}</td>
                <td className="px-5 py-3 text-sm text-gray-700">{s.stage}</td>
                <td className="px-5 py-3 text-sm font-semibold text-blue-600">{s.percentage}%</td>
                <td className="px-5 py-3 text-sm font-semibold text-[#1e3a5f]">
                  ₹{Math.round(avgAmount * s.percentage / 100).toLocaleString("en-IN")}
                </td>
                <td className="px-5 py-3 text-sm text-gray-500">{s.dateGenerated}</td>
                <td className="px-5 py-3 text-sm text-gray-500">{s.dueDate}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize ${slabStatusBadge[s.status]}`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <button onClick={() => { setSelSlabForMsg(s); setEditMsg(false); }}
                    className="flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-lg hover:bg-green-100 transition-colors">
                    <MessageSquare size={11} /> Message
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* WhatsApp Message Panel */}
      {selSlabForMsg && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-green-50">
            <div className="flex items-center gap-2">
              <MessageSquare size={15} className="text-green-600" />
              <h3 className="text-sm font-semibold text-green-800">
                WhatsApp Message — Slab #{selSlabForMsg.slabNo} ({selSlabForMsg.stage})
              </h3>
            </div>
            <button onClick={() => { setSelSlabForMsg(null); setEditMsg(false); }} className="text-gray-400 hover:text-gray-600"><X size={15} /></button>
          </div>

          <div className="p-5 space-y-4">
            {/* Template preview / editor */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
                  Message Template
                </label>
                <button onClick={() => setEditMsg(v => !v)}
                  className="flex items-center gap-1 text-xs text-blue-600 border border-blue-200 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition-colors">
                  <Edit3 size={11} /> {editMsg ? "Preview" : "Edit Message"}
                </button>
              </div>
              {editMsg ? (
                <textarea value={template} onChange={e => setTemplate(e.target.value)} rows={8}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-300" />
              ) : (
                <div className="bg-[#e9f5e1] border border-green-200 rounded-xl px-4 py-3 text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                  {template
                    .replace("{owner_name}", customersList[0]?.name ?? "Customer")
                    .replace("{flat_name}", customersList[0]?.flat ?? "Flat")
                    .replace("{payment_value}", `₹${Math.round((customersList[0]?.amount ?? 0) * selSlabForMsg.percentage / 100).toLocaleString("en-IN")}`)
                    .replace("{due_date}", selSlabForMsg.dueDate)
                    .replace("{build_status}", selSlabForMsg.stage)}
                </div>
              )}
              <p className="text-[10px] text-gray-400 mt-1.5">
                Variables: <code className="bg-gray-100 px-1 rounded">{"{owner_name}"}</code> <code className="bg-gray-100 px-1 rounded">{"{flat_name}"}</code> <code className="bg-gray-100 px-1 rounded">{"{payment_value}"}</code> <code className="bg-gray-100 px-1 rounded">{"{due_date}"}</code> <code className="bg-gray-100 px-1 rounded">{"{build_status}"}</code>
              </p>
            </div>

            {/* Target customers */}
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Recipients ({customersList.length} customers)</p>
              <div className="flex flex-wrap gap-2">
                {customersList.map(c => (
                  <div key={c.id} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1 text-xs text-gray-600">
                    <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-[8px] font-bold text-white">
                      {c.name[0]}
                    </div>
                    {c.name.split(" ")[0]}
                  </div>
                ))}
              </div>
            </div>

            {sendSuccess && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-semibold">
                <CheckCircle2 size={16} /> Messages sent to {customersList.length} customers via WhatsApp!
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => handleSend(selSlabForMsg)}
                className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">
                <Send size={14} /> Send to All Customers
              </button>
              <button onClick={() => setEditMsg(v => !v)}
                className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                <Edit3 size={14} /> {editMsg ? "Preview" : "Edit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Placeholder ────────────────────────────────────────────────────────────

function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex-1 flex items-center justify-center p-16">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
          <Building2 size={24} className="text-blue-400" />
        </div>
        <h2 className="text-base font-semibold text-gray-700">{title}</h2>
        <p className="text-sm text-gray-400 mt-1">This module is under construction.</p>
      </div>
    </div>
  );
}

// ── App root ───────────────────────────────────────────────────────────────

// ── Login Page ─────────────────────────────────────────────────────────────

function LoginPage({ onLogin }: { onLogin: () => void }) {
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

// ── Setup Shell (info page — full-screen onboarding) ───────────────────────

function SetupShell({ onCreate }: { onCreate: (p: ProjectData) => void }) {
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

// ── App root ───────────────────────────────────────────────────────────────

export default function App() {
  const [appState, setAppState] = useState<"login" | "setup" | "app">("login");
  const [page, setPage]       = useState<Page>("dashboard");
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>("All Sites");

  function handleCreateProject(p: ProjectData) {
    setProjects(prev => {
      const exists = prev.findIndex(x => x.id === p.id);
      if (exists >= 0) { const u = [...prev]; u[exists] = p; return u; }
      return [...prev, p];
    });
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
          {page === "dashboard"        && <Dashboard projects={filteredProjects} />}
          {page === "customers"        && <CustomerSales projects={filteredProjects} onAdd={() => setPage("add-customer")} />}
          {page === "add-customer"     && <AddCustomer projects={projects} />}
          {page === "sales"            && <SalesDashboard projects={filteredProjects} onNav={setPage} />}
          {page === "received-payment" && <ReceivedPayment projects={projects} />}
          {page === "payment-slabs"    && <PaymentSlabs projects={projects} onBack={() => setPage("sales")} />}
          {page === "inventory"        && <Placeholder title="Inventory Management" />}
          {page === "shareholder"      && <Placeholder title="Shareholder Overview"  />}
          {page === "projects"         && <ProjectSetup onCreate={handleCreateProject} onBack={() => setPage("sales")} />}
          {page === "settings"         && <Placeholder title="Settings"              />}
        </main>
      </div>
    </div>
  );
}
