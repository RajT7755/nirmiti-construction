import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Plus, AlertCircle, Search } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ExportExcelButton } from "@/components/ui/ExportExcelButton";
import { CustomerDetailsPanel } from "./CustomerDetailsPanel";
import { TemporaryBookingCard } from "./TemporaryBookingCard";
import { BookedFlatsGrid } from "./BookedFlatsGrid";
import { CUSTOMER_EXPORT_HEADERS, getCustomerExportRows } from "@/lib/customers/exportCustomerRows";
import { fmt } from "@/lib/utils";
import type { CustomerDetailProfile, BookedFlatsSummary } from "@/lib/customers/customerDetailTypes";
import type { Customer, ProjectData } from "@/lib/types";

export function CustomerSales({
  projects,
  customers: _customers,
  customerProfiles,
  bookedFlatsSummary,
  checkFlatReleased,
  getDetail,
  onDeactivate,
  onAdd,
  onProceed,
}: {
  projects: ProjectData[];
  customers: Customer[];
  customerProfiles: CustomerDetailProfile[];
  bookedFlatsSummary: BookedFlatsSummary;
  checkFlatReleased?: (flatNo: string) => boolean;
  getDetail: (id: string) => CustomerDetailProfile | undefined;
  onDeactivate: (id: string, reason: string, date: string) => { savedToInactive: boolean };
  onAdd: () => void;
  onProceed?: (customer: CustomerDetailProfile) => void;
}) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [propView, setPropView] = useState<"residential" | "commercial">("residential");
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const [showFlatsGrid, setShowFlatsGrid] = useState(false);

  useEffect(() => {
    if (searchParams.get("panel") === "booked-flats") {
      setShowFlatsGrid(true);
    }
    const status = searchParams.get("status");
    if (status === "overdue") {
      setFilterStatus("overdue");
    }
  }, [searchParams]);

  const propFiltered = customerProfiles.filter((c) =>
    propView === "residential"
      ? c.unitType.toLowerCase() === "residential"
      : c.unitType.toLowerCase() === "commercial"
  );

  const detailsCustomer = detailsId ? getDetail(detailsId) : null;

  const filtered = propFiltered.filter((c) => {
    const statusMatch =
      filterStatus === "all"
        ? true
        : filterStatus === "active"
          ? c.status !== "inactive"
          : c.status === filterStatus;
    const searchMatch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.flat.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase());
    return statusMatch && searchMatch;
  });

  const activeOnly = propFiltered.filter((c) => c.status !== "inactive");

  function handleMarkInactive(customer: CustomerDetailProfile, reason: string) {
    const date = new Date().toISOString().slice(0, 10);
    const { savedToInactive } = onDeactivate(customer.id, reason, date);
    const msg = savedToInactive
      ? `${customer.name} marked inactive — Flat ${customer.flat} is now available.`
      : `Temporary hold released — ${customer.name} removed, Flat ${customer.flat} available (not saved to inactive records).`;
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }

  return (
    <div className="p-6 space-y-5 relative">
      {toast && (
        <div className="fixed top-4 right-4 z-30 bg-gray-800 text-white text-sm px-4 py-3 rounded-lg shadow-lg max-w-sm">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0f1a35]">Customer Database</h2>
          <p className="text-[11px] text-gray-400 mt-0.5">Data saved in browser — persists on refresh</p>
        </div>
        <div className="flex gap-3">
          <ExportExcelButton
            filename="customers-full"
            headers={CUSTOMER_EXPORT_HEADERS}
            rows={getCustomerExportRows(customerProfiles)}
          />
          <button
            onClick={onAdd}
            className="flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={14} /> Add Customer
          </button>
        </div>
      </div>

      <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
        {(["residential", "commercial"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setPropView(t)}
            className={`px-5 py-2 text-sm font-semibold capitalize transition-colors ${
              propView === t ? "bg-[#0f1a35] text-white" : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-1.5">Total Customers</p>
          <p className="text-2xl font-bold text-blue-600">{activeOnly.length}</p>
        </div>
        <TemporaryBookingCard
          summary={bookedFlatsSummary}
          gridOpen={showFlatsGrid}
          onOpenGrid={() => setShowFlatsGrid((v) => !v)}
          onViewTemporary={() => setFilterStatus("temporary")}
        />
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-1.5">Overdue Payments</p>
          <p className="text-2xl font-bold text-orange-500">
            {activeOnly.filter((c) => c.status === "overdue").length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-1.5">Inactive</p>
          <p className="text-2xl font-bold text-gray-500">
            {customerProfiles.filter((c) => c.status === "inactive").length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-1.5">Bank Loan</p>
          <p className="text-2xl font-bold text-purple-600">
            {activeOnly.filter((c) => c.loanStatus === "Yes").length}
          </p>
        </div>
      </div>

      {showFlatsGrid && (
        <BookedFlatsGrid
          projects={projects}
          customerProfiles={customerProfiles}
          checkFlatReleased={checkFlatReleased}
          defaultProject={projects[0]?.name}
          compact
          onViewCustomer={(id) => setDetailsId(id)}
        />
      )}

      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-orange-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 bg-orange-50 border-b border-orange-100">
            <AlertCircle size={14} className="text-orange-500" />
            <h3 className="text-sm font-semibold text-orange-700">Overdue Customers</h3>
          </div>
          <div className="divide-y divide-gray-50 max-h-56 overflow-auto">
            {activeOnly.filter((c) => c.status === "overdue").map((c) => (
              <div key={c.id} className="px-5 py-3 hover:bg-gray-50 transition-colors flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{c.name}</p>
                  <p className="text-[11px] text-gray-400">Flat {c.flat}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-orange-600">{fmt(c.amount * 0.1)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-[#0f1a35]">Recently Added</h3>
          </div>
          <div className="divide-y divide-gray-50 flex-1 overflow-auto max-h-56">
            {activeOnly.slice(0, 4).map((c) => (
              <div key={c.id} className="px-5 py-3 hover:bg-gray-50 transition-colors flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{c.name}</p>
                  <p className="text-[11px] text-gray-400">
                    {c.bookingType === "temporary" ? "Temporary hold" : `Wing ${c.wing}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-600">Flat {c.flat}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mt-4">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h3 className="text-sm font-semibold text-[#0f1a35]">Customer Status Table</h3>
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="temporary">Temporary</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="inactive">Inactive</option>
            </select>
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-xs pl-7 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 w-52"
              />
            </div>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400 border-b border-gray-100">
              <th className="px-5 py-3">Customer ID</th>
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
            {filtered.map((c) => (
              <tr
                key={c.id}
                className={`hover:bg-gray-50/80 transition-colors ${c.status === "inactive" ? "opacity-75" : ""}`}
              >
                <td className="px-5 py-3 text-xs font-mono text-gray-500">{c.id}</td>
                <td className="px-5 py-3 text-sm font-medium text-gray-800">{c.name}</td>
                <td className="px-5 py-3 text-sm font-mono text-gray-700">{c.flat}</td>
                <td className="px-5 py-3 text-sm text-gray-600">
                  {c.building} / Wing {c.wing}
                </td>
                <td className="px-5 py-3 text-sm">
                  <div className="font-bold text-[#1e3a5f]">{fmt(c.amount)}</div>
                  {c.status !== "inactive" && (
                    <div className="text-[10px] text-green-600">
                      Paid: {fmt(c.categories.find((x) => x.key === "flat")?.paid ?? 0)}
                    </div>
                  )}
                </td>
                <td className="px-5 py-3 text-sm text-gray-600">{c.currentSlabLabel}</td>
                <td className="px-5 py-3">
                  <Badge status={c.status} />
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => setDetailsId(c.id)}
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detailsCustomer && (
        <CustomerDetailsPanel
          customer={detailsCustomer}
          onClose={() => setDetailsId(null)}
          onProceed={(c) => {
            setDetailsId(null);
            onProceed?.(c);
          }}
          onMarkInactive={handleMarkInactive}
        />
      )}
    </div>
  );
}