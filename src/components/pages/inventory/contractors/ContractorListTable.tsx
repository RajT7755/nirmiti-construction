import type { ReactNode } from "react";
import { Link } from "react-router";
import { fmt } from "@/lib/utils";
import type { Contractor, WorkOrder } from "@/lib/inventory/inventoryTypes";
import { rollupContractorPayments } from "@/lib/inventory/paymentRollup";

export function ContractorListTable({
  title,
  contractors,
  workOrders = [],
  emptyMessage = "No contractors yet.",
  selectable = false,
  selectedIds = [],
  onToggle,
  onToggleAll,
  headerActions,
}: {
  title: string;
  contractors: Contractor[];
  workOrders?: WorkOrder[];
  emptyMessage?: string;
  selectable?: boolean;
  selectedIds?: string[];
  onToggle?: (id: string) => void;
  onToggleAll?: (selectAll: boolean) => void;
  headerActions?: ReactNode;
}) {
  const allSelected =
    contractors.length > 0 && contractors.every((c) => selectedIds.includes(c.id));
  const someSelected = contractors.some((c) => selectedIds.includes(c.id));

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[#0f1a35]">{title}</h3>
        <div className="flex items-center gap-3">
          {headerActions}
          <span className="text-[11px] font-medium text-gray-400">{contractors.length} items</span>
        </div>
      </div>

      {contractors.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">{emptyMessage}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-gray-400 border-b border-gray-50">
                {selectable && (
                  <th className="px-4 py-2.5 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected && !allSelected;
                      }}
                      onChange={() => onToggleAll?.(!allSelected)}
                      aria-label="Select all contractors"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                )}
                <th className="px-5 py-2.5 font-semibold">Contractor id</th>
                <th className="px-3 py-2.5 font-semibold">Name</th>
                <th className="px-3 py-2.5 font-semibold">Work profile</th>
                <th className="px-3 py-2.5 font-semibold">Work categories</th>
                <th className="px-3 py-2.5 font-semibold">Total</th>
                <th className="px-3 py-2.5 font-semibold">Remaining</th>
                <th className="px-5 py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {contractors.map((c) => {
                const checked = selectedIds.includes(c.id);
                const cats = c.workCategories ?? [];
                const status = c.status === "inactive" ? "inactive" : "active";
                const rolled = rollupContractorPayments(c.id, workOrders);
                const total =
                  rolled.paymentTotal > 0 ? rolled.paymentTotal : c.paymentTotal ?? 0;
                const remaining =
                  rolled.paymentTotal > 0
                    ? rolled.paymentRemaining
                    : c.paymentRemaining ?? 0;
                const payHref = `/inventory/contractors/${encodeURIComponent(c.id)}/payments`;
                return (
                  <tr
                    key={c.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60"
                  >
                    {selectable && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => onToggle?.(c.id)}
                          aria-label={`Select ${c.name}`}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )}
                    <td className="px-5 py-3 font-mono text-xs text-gray-600">{c.id}</td>
                    <td className="px-3 py-3 font-medium text-[#0f1a35]">{c.name}</td>
                    <td className="px-3 py-3 text-gray-600 max-w-[10rem] truncate">
                      {c.workProfile || c.trade || "—"}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        {cats.length === 0 ? (
                          <span className="text-gray-400">—</span>
                        ) : (
                          cats.map((cat) => (
                            <span
                              key={cat}
                              className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold bg-violet-50 text-violet-700 border border-violet-100"
                            >
                              {cat}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 font-semibold text-gray-700">
                      <Link to={payHref} className="hover:text-blue-600 hover:underline">
                        {fmt(total)}
                      </Link>
                    </td>
                    <td
                      className={`px-3 py-3 font-semibold ${
                        remaining > 0 ? "text-orange-600" : "text-gray-700"
                      }`}
                    >
                      <Link to={payHref} className="hover:underline">
                        {fmt(remaining)}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold border capitalize ${
                          status === "active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-gray-100 text-gray-500 border-gray-200"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
