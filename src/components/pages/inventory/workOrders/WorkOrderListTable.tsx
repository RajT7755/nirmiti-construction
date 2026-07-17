import type { WorkOrder } from "@/lib/inventory/inventoryTypes";
import { fmtRupee } from "@/lib/inventory/poTotals";
import { isWoPayable } from "@/lib/inventory/workOrderStock";
import { Button } from "@/components/ui/Button";

const STATUS_STYLES: Record<WorkOrder["status"], string> = {
  open: "bg-amber-50 text-amber-700 border-amber-200",
  "in-progress": "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "on-hold": "bg-gray-100 text-gray-600 border-gray-200",
};

export function WorkOrderListTable({
  orders,
  onEdit,
  onView,
  showEdit = true,
  emptyMessage = "No work orders yet. Generate from a request.",
}: {
  orders: WorkOrder[];
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
  /** When false, hide Edit (e.g. Payable section). */
  showEdit?: boolean;
  emptyMessage?: string;
}) {
  if (orders.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[10px] uppercase tracking-widest text-gray-400 border-b border-gray-100">
            <th className="px-4 py-2.5 font-semibold">Work Order ID</th>
            <th className="px-3 py-2.5 font-semibold">Request</th>
            <th className="px-3 py-2.5 font-semibold">Contractor</th>
            <th className="px-3 py-2.5 font-semibold">Description</th>
            <th className="px-3 py-2.5 font-semibold">Commit</th>
            <th className="px-3 py-2.5 font-semibold text-right">Work amount</th>
            <th className="px-3 py-2.5 font-semibold">Status</th>
            <th className="px-4 py-2.5 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((wo) => {
            const payable = isWoPayable(wo);
            const total = wo.amountTotal ?? 0;
            return (
              <tr key={wo.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                <td className="px-4 py-3 font-mono text-xs font-medium text-[#0f1a35]">
                  {wo.id}
                  {!payable && (
                    <span className="block text-[10px] text-amber-600 font-sans font-semibold mt-0.5">
                      Set amount
                    </span>
                  )}
                </td>
                <td className="px-3 py-3 font-mono text-xs text-gray-500">
                  {wo.requestNo ?? "—"}
                </td>
                <td className="px-3 py-3 text-gray-600">{wo.contractorName}</td>
                <td className="px-3 py-3 text-gray-600 max-w-[180px] truncate">
                  {wo.title}
                </td>
                <td className="px-3 py-3 text-gray-500 text-xs">
                  {wo.commitmentDate ?? wo.startDate}
                </td>
                <td className="px-3 py-3 text-right font-medium text-[#0f1a35]">
                  {payable ? fmtRupee(total) : "—"}
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold border capitalize ${STATUS_STYLES[wo.status]}`}
                  >
                    {wo.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {onView && (
                      <Button
                        type="button"
                        variant="outline"
                        className="!px-2.5 !py-1.5 text-xs"
                        onClick={() => onView(wo.id)}
                      >
                        View
                      </Button>
                    )}
                    {showEdit && onEdit && (
                      <Button
                        type="button"
                        className="!px-2.5 !py-1.5 text-xs"
                        onClick={() => onEdit(wo.id)}
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
