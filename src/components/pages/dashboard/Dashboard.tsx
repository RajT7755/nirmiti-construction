import { useMemo } from "react";
import { useNavigate } from "react-router";
import { Plus, AlertCircle, Building2, ChevronRight } from "lucide-react";
import { MotionShineLayer } from "@/components/ui/MotionShineLayer";
import "@/components/dashboard/dashboardMasterCard.css";
import { Badge } from "@/components/ui/Badge";
import { fmt } from "@/lib/utils";
import { PROP_TYPE_TAG } from "@/lib/constants";
import { recentBookings, recentInvestments } from "@/lib/mockData";
import { computeDashboardKpis } from "@/lib/dashboard/dashboardMetrics";
import { isPoPayable } from "@/lib/inventory/poTotals";
import { isWoPayable } from "@/lib/inventory/workOrderStock";
import type { CustomerDetailProfile } from "@/lib/customers/customerDetailTypes";
import type { ProjectData, ReceivedPayment } from "@/lib/types";
import type { PartyReceivedPayment } from "@/lib/inventory/partyPaymentTypes";
import type { PurchaseOrder, WorkOrder } from "@/lib/inventory/inventoryTypes";

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
  partyReceivedPayments = [],
  purchaseOrders = [],
  workOrders = [],
  projectNames,
  isAllSites,
}: {
  projects: ProjectData[];
  customerProfiles: CustomerDetailProfile[];
  receivedPayments: ReceivedPayment[];
  partyReceivedPayments?: PartyReceivedPayment[];
  purchaseOrders?: PurchaseOrder[];
  workOrders?: WorkOrder[];
  projectNames: string[];
  isAllSites: boolean;
}) {
  const navigate = useNavigate();

  const recentPartyPays = useMemo(
    () =>
      [...partyReceivedPayments]
        .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
        .slice(0, 8),
    [partyReceivedPayments]
  );

  /** Sum of remaining on all payable POs + WOs (same as payment log). */
  const totalPayableAmount = useMemo(() => {
    let sum = 0;
    for (const po of purchaseOrders) {
      if (!isPoPayable(po)) continue;
      const total = po.grandTotal ?? po.amountTotal ?? 0;
      const paid = po.amountPaid ?? 0;
      sum += Math.max(0, total - paid);
    }
    for (const wo of workOrders) {
      if (!isWoPayable(wo)) continue;
      const total = wo.amountTotal ?? 0;
      const paid = wo.amountPaid ?? 0;
      sum += Math.max(0, total - paid);
    }
    return sum;
  }, [purchaseOrders, workOrders]);

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
          label="Total payable amount"
          onClick={() => navigate("/dashboard/party-payments")}
          subtitle={
            totalPayableAmount > 0
              ? "Supplier + contractor remaining (payment log)"
              : "No payable amount on payment log"
          }
          value={
            <p className="text-3xl font-bold text-[#1e3a5f]">
              {totalPayableAmount > 0 ? fmt(totalPayableAmount) : "—"}
            </p>
          }
        >
          <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-400 rounded-full transition-all"
              style={{ width: totalPayableAmount > 0 ? "100%" : "0%" }}
            />
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
            <h3 className="text-sm font-semibold text-[#0f1a35]">
              Recent payment log (suppliers &amp; contractors)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/dashboard/party-payments/all")}
              className="text-xs font-semibold text-blue-600 hover:underline px-2"
            >
              View all
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard/party-payments/receive")}
              className="flex items-center gap-1.5 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={11} /> Received Payment
            </button>
          </div>
        </div>
        {recentPartyPays.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            No supplier/contractor payments yet.{" "}
            <button
              type="button"
              className="text-blue-600 font-semibold hover:underline"
              onClick={() => navigate("/dashboard/party-payments")}
            >
              Open payment log
            </button>
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-widest text-gray-400 border-b border-gray-100 bg-gray-50">
                  <th className="px-5 py-2.5 font-semibold">Receipt No</th>
                  <th className="px-3 py-2.5 font-semibold">Date</th>
                  <th className="px-3 py-2.5 font-semibold">Name</th>
                  <th className="px-3 py-2.5 font-semibold">Type</th>
                  <th className="px-3 py-2.5 font-semibold">PO / WO</th>
                  <th className="px-3 py-2.5 font-semibold text-right">Done</th>
                  <th className="px-5 py-2.5 font-semibold text-right">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {recentPartyPays.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60"
                  >
                    <td className="px-5 py-3 font-mono text-xs font-medium text-[#0f1a35]">
                      {p.id}
                    </td>
                    <td className="px-3 py-3 text-gray-500">{p.date}</td>
                    <td className="px-3 py-3 font-medium text-[#0f1a35]">
                      {p.partyName}
                    </td>
                    <td className="px-3 py-3 capitalize text-gray-600">
                      {p.partyType}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-gray-600">
                      {p.sourceId}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-emerald-600">
                      {fmt(p.received)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        className="text-xs font-semibold text-blue-600 hover:underline"
                        onClick={() =>
                          navigate(`/dashboard/party-payments/receipt/${p.id}`)
                        }
                      >
                        Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}