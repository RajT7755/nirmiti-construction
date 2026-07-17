import type { WorkOrder } from "@/lib/inventory/inventoryTypes";
import { fmtRupee } from "@/lib/inventory/poTotals";
import { isWoPayable } from "@/lib/inventory/workOrderStock";

const STATUS_STYLES: Record<WorkOrder["status"], string> = {
  open: "bg-amber-50 text-amber-700 border-amber-200",
  "in-progress": "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "on-hold": "bg-gray-100 text-gray-600 border-gray-200",
};

export function RecentWorkOrdersPanel({
  orders,
  onViewAll,
}: {
  orders: WorkOrder[];
  onViewAll?: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-[#0f1a35]">Recent Work Orders</h3>
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            View all
          </button>
        )}
      </div>
      {orders.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No work orders yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-gray-400 border-b border-gray-50">
                <th className="px-5 py-2.5 font-semibold">WO</th>
                <th className="px-3 py-2.5 font-semibold">Contractor</th>
                <th className="px-3 py-2.5 font-semibold">Commit</th>
                <th className="px-3 py-2.5 font-semibold">Amount</th>
                <th className="px-5 py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((wo) => (
                <tr
                  key={wo.id}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60"
                >
                  <td className="px-5 py-3 font-medium text-[#0f1a35] font-mono text-xs">
                    {wo.id}
                  </td>
                  <td className="px-3 py-3 text-gray-600">{wo.contractorName}</td>
                  <td className="px-3 py-3 text-gray-500">
                    {wo.commitmentDate ?? wo.startDate}
                  </td>
                  <td className="px-3 py-3 text-gray-600">
                    {isWoPayable(wo) ? fmtRupee(wo.amountTotal ?? 0) : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold border capitalize ${STATUS_STYLES[wo.status]}`}
                    >
                      {wo.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
