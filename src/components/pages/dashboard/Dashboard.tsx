import { useMemo } from "react";
import { useNavigate } from "react-router";
import { Plus, AlertCircle, Building2, ChevronRight } from "lucide-react";
import { MotionShineLayer } from "@/components/ui/MotionShineLayer";
import "@/components/dashboard/dashboardMasterCard.css";
import { Badge } from "@/components/ui/Badge";
import { fmt } from "@/lib/utils";
import { PROP_TYPE_TAG } from "@/lib/constants";
import { recentBookings, recentInvestments, paymentRequests } from "@/lib/mockData";
import { computeDashboardKpis } from "@/lib/dashboard/dashboardMetrics";
import type { CustomerDetailProfile } from "@/lib/customers/customerDetailTypes";
import type { ProjectData, ReceivedPayment } from "@/lib/types";

function KpiCard({
  label,
  value,
  subtitle,
  onClick,
  accent,
  borderAccent,
  children,
}: {
  label: string;
  value: React.ReactNode;
  subtitle: string;
  onClick?: () => void;
  accent?: string;
  borderAccent?: string;
  children?: React.ReactNode;
}) {
  const className = `bg-white rounded-xl p-5 border border-gray-100 shadow-sm text-left w-full transition-all ${
    onClick ? "hover:shadow-md hover:border-blue-200 cursor-pointer group" : ""
  } ${borderAccent ?? ""}`;

  const inner = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-2">{label}</p>
        {onClick && (
          <ChevronRight
            size={14}
            className="text-gray-300 group-hover:text-blue-500 shrink-0 mt-0.5 transition-colors"
          />
        )}
      </div>
      <div className="flex items-end justify-between">{value}</div>
      {children}
      <p className="text-[11px] text-gray-400 mt-1.5">{subtitle}</p>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {inner}
      </button>
    );
  }

  return <div className={className}>{inner}</div>;
}

export function Dashboard({
  projects,
  customerProfiles,
  receivedPayments,
  projectNames,
  isAllSites,
}: {
  projects: ProjectData[];
  customerProfiles: CustomerDetailProfile[];
  receivedPayments: ReceivedPayment[];
  projectNames: string[];
  isAllSites: boolean;
}) {
  const navigate = useNavigate();

  const kpis = useMemo(
    () =>
      computeDashboardKpis({
        projects,
        customerProfiles,
        receivedPayments,
        projectNames,
        isAllSites,
      }),
    [projects, customerProfiles, receivedPayments, projectNames, isAllSites]
  );

  const totalFlats = projects.reduce((s, p) => s + p.totalFlats, 0);
  const totalShops = projects.reduce((s, p) => s + p.totalShops, 0);
  const totalUnits = kpis.totalUnits;
  const bookedUnits = projects.reduce(
    (s, p) => s + p.units.filter((u) => u.status === "booked" || u.status === "overdue").length,
    0
  );
  const availUnits = totalUnits - bookedUnits;
  const availPct = totalUnits > 0 ? Math.round((availUnits / totalUnits) * 100) : 0;
  const hasProjects = projects.length > 0;

  const firstProject = projects[0] ?? null;
  const fpBooked = firstProject?.units.filter((u) => u.status === "booked" || u.status === "overdue").length ?? 0;
  const fpTotal = firstProject ? firstProject.totalFlats + firstProject.totalShops : 0;
  const fpAvail = fpTotal - fpBooked;
  const fpOccPct = fpTotal > 0 ? Math.round((fpBooked / fpTotal) * 100) : 0;

  const heroBooked = isAllSites ? bookedUnits : fpBooked;
  const heroAvail = isAllSites ? availUnits : fpAvail;
  const heroOccPct = isAllSites
    ? totalUnits > 0
      ? Math.round((bookedUnits / totalUnits) * 100)
      : 0
    : fpOccPct;

  const salesRateLabel =
    kpis.salesRateAvg !== null
      ? `₹${kpis.salesRateAvg.toLocaleString("en-IN")}/sq.ft.`
      : "—";

  return (
    <div className="p-6 space-y-5">
      {hasProjects ? (
        <div className="dashboard-master-card flex items-center justify-between rounded-2xl px-6 py-5">
          <MotionShineLayer />
          <div className="relative z-10">
            <p className="master-card-eyebrow text-[10px] font-semibold uppercase tracking-widest">
              {isAllSites ? "All Sites" : "Active Project"}
            </p>
            <h2 className="master-card-title text-2xl font-bold">
              {isAllSites ? `${projects.length} Projects` : firstProject!.name}
            </h2>
            <div className="master-card-body flex items-center gap-3 mt-1 text-xs">
              {isAllSites ? (
                <>
                  <span>{totalFlats} flats</span>
                  {totalShops > 0 && <span>· {totalShops} shops</span>}
                </>
              ) : (
                <>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${PROP_TYPE_TAG[firstProject!.propType]}`}
                  >
                    {firstProject!.propType}
                  </span>
                  <span>{firstProject!.totalFlats} flats</span>
                  {firstProject!.totalShops > 0 && <span>· {firstProject!.totalShops} shops</span>}
                </>
              )}
            </div>
          </div>
          <div className="relative z-10 flex gap-8 text-center">
            {[
              { label: "Booked", value: heroBooked },
              { label: "Available", value: heroAvail },
              { label: "Occupancy", value: `${heroOccPct}%` },
            ].map((s) => (
              <div key={s.label}>
                <p className="master-card-stat text-2xl font-bold">{s.value}</p>
                <p className="master-card-label text-[10px] uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="dashboard-master-card flex items-center gap-4 rounded-2xl px-6 py-5">
          <MotionShineLayer />
          <Building2 size={22} className="master-card-icon relative z-10 shrink-0" />
          <p className="master-card-body relative z-10 text-sm">No project yet — go to Projects to create one.</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <KpiCard
          label="Total Booked Flats"
          onClick={() => navigate("/customers?panel=booked-flats")}
          subtitle={
            hasProjects
              ? `${kpis.bookedFlats.temporary} temporary · ${kpis.bookedFlats.confirmed} confirmed`
              : "No projects created yet"
          }
          value={
            <>
              <p className="text-3xl font-bold text-[#1e3a5f]">
                {hasProjects ? kpis.bookedFlats.total : "—"}
              </p>
              {hasProjects && (
                <span className="text-green-600 text-xs font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                  {kpis.bookedPct}%
                </span>
              )}
            </>
          }
        >
          <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{ width: hasProjects ? `${kpis.bookedPct}%` : "0%" }}
            />
          </div>
        </KpiCard>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-2">Remaining Flats</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold text-[#1e3a5f]">{hasProjects ? availUnits : "—"}</p>
            {hasProjects && (
              <span className="text-orange-500 text-xs font-semibold bg-orange-50 px-2 py-0.5 rounded-full">
                {availPct}%
              </span>
            )}
          </div>
          <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-400 rounded-full transition-all"
              style={{ width: hasProjects ? `${availPct}%` : "0%" }}
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5">
            {hasProjects ? "available for booking" : "No projects created yet"}
          </p>
        </div>

        <KpiCard
          label="Remaining Investment / Total"
          subtitle="No investment data yet"
          value={<p className="text-3xl font-bold text-[#1e3a5f]">—</p>}
        >
          <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: "0%" }} />
          </div>
        </KpiCard>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <KpiCard
          label="Overdue Payments"
          borderAccent="border-l-4 border-orange-400"
          onClick={() => navigate("/messenger?tab=overdue")}
          subtitle={
            kpis.overdueCount > 0
              ? `${kpis.overdueCount} overdue customer${kpis.overdueCount === 1 ? "" : "s"}`
              : "No overdue customers yet"
          }
          value={
            <p className="text-4xl font-bold text-orange-500">
              {kpis.overdueCount > 0 ? kpis.overdueCount : "—"}
            </p>
          }
        />

        <KpiCard
          label="Total Sales Amount"
          onClick={() => navigate("/received-payment")}
          subtitle={
            kpis.totalPaymentReceived > 0
              ? "Total payment received from payment log"
              : "Record payments to track sales"
          }
          value={
            <p className="text-3xl font-bold text-[#1e3a5f]">
              {kpis.totalPaymentReceived > 0 ? fmt(kpis.totalPaymentReceived) : "—"}
            </p>
          }
        />

        <KpiCard
          label="Sales Rate (Avg)"
          subtitle="Avg flat rate from confirmed bookings (₹/sq.ft.)"
          value={<p className="text-3xl font-bold text-[#1e3a5f]">{salesRateLabel}</p>}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-[#0f1a35]">
            {isAllSites ? "All Projects" : "Selected Project"}
          </h3>
        </div>
        {projects.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No projects yet.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {projects.map((p) => {
              const pTotal = p.totalFlats + p.totalShops;
              const pBooked = p.units.filter((u) => u.status === "booked" || u.status === "overdue").length;
              const pAvail = pTotal - pBooked;
              const pOcc = pTotal > 0 ? Math.round((pBooked / pTotal) * 100) : 0;
              return (
                <div key={p.id} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[#0f1a35]">{p.name}</p>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${PROP_TYPE_TAG[p.propType]}`}
                      >
                        {p.propType}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {pBooked} booked · {pAvail} available
                    </span>
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
            {recentBookings.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/80 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{b.customer}</p>
                  <p className="text-[11px] text-gray-400">
                    Flat {b.flat} · Floor {b.floor} · {b.date}
                  </p>
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
            {recentInvestments.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/80 transition-colors"
              >
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
          {paymentRequests.map((pr) => (
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
              <p className="text-lg font-bold text-[#1e3a35] mt-2">{fmt(pr.amount)}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Due: {pr.due}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}