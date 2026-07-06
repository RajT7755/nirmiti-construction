import { Plus, AlertCircle, Building2 } from "lucide-react";
import { LineChart, Line, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/Badge";
import { fmt } from "@/lib/utils";
import { PROP_TYPE_TAG } from "@/lib/constants";
import { recentBookings, recentInvestments, paymentRequests, costTrend } from "@/lib/mockData";
import type { ProjectData } from "@/lib/types";

export function Dashboard({ projects }: { projects: ProjectData[] }) {
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
