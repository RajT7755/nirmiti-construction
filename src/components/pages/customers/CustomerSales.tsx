import { useState } from "react";
import { Plus, AlertCircle, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ExportExcelButton } from "@/components/ui/ExportExcelButton";
import { fmt } from "@/lib/utils";
import type { Customer, ProjectData } from "@/lib/types";

export function CustomerSales({ projects, customers, onAdd }: { projects: ProjectData[]; customers: Customer[]; onAdd: () => void }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [detailsPane, setDetailsPane] = useState<Customer | null>(null);

  const filtered = customers.filter(c =>
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
          <ExportExcelButton
            filename="customers"
            headers={["Name", "Flat", "Project", "Status", "Amount"]}
            rows={customers.map(c => [c.name, c.flat, c.project, c.status, c.amount])}
          />
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
          { label: "Total Customers",  value: customers.length || "—", accent: "text-blue-600" },
          { label: "Booked Flats", value: customers.filter(c => c.status === "paid").length || "—", accent: "text-green-600" },
          { label: "Overdue Payments", value: customers.filter(c => c.status === "overdue").length || "—", accent: "text-orange-500" },
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
            {customers.filter(c => c.status === "overdue").length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">No data yet.</p>
            )}
            {customers.filter(c => c.status === "overdue").map(c => (
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
            {customers.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">No data yet.</p>
            )}
            {customers.slice(0, 4).map(c => (
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
