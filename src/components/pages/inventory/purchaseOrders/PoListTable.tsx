import type { PurchaseOrder } from "@/lib/inventory/inventoryTypes";
import { fmtRupee, isPoPayable } from "@/lib/inventory/poTotals";
import { Button } from "@/components/ui/Button";

const STATUS_STYLES: Record<PurchaseOrder["status"], string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  partial: "bg-blue-50 text-blue-700 border-blue-200",
  received: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function PoListTable({
  orders,
  onView,
  onEdit,
  showEdit = false,
  emptyMessage = "No purchase orders yet. Approve a request to create a unique Purchase ID.",
}: {
  orders: PurchaseOrder[];
  onView: (id: string) => void;
  onEdit?: (id: string) => void;
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
            <th className="px-4 py-2.5 font-semibold">Purchase ID</th>
            <th className="px-3 py-2.5 font-semibold">Request No</th>
            <th className="px-3 py-2.5 font-semibold">Supplier</th>
            <th className="px-3 py-2.5 font-semibold">Material</th>
            <th className="px-3 py-2.5 font-semibold text-right">Qty</th>
            <th className="px-3 py-2.5 font-semibold text-right">Total</th>
            <th className="px-3 py-2.5 font-semibold text-right">Remaining</th>
            <th className="px-3 py-2.5 font-semibold">Status</th>
            <th className="px-4 py-2.5 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((po) => {
            const total = po.grandTotal ?? po.amountTotal ?? 0;
            const paid = po.amountPaid ?? 0;
            const remaining = Math.max(0, total - paid);
            const payable = isPoPayable(po);
            return (
              <tr key={po.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                <td className="px-4 py-3 font-medium text-[#0f1a35] font-mono text-xs">
                  {po.id}
                  {!payable && (
                    <span className="block text-[10px] text-amber-600 font-sans font-semibold mt-0.5">
                      Needs amount
                    </span>
                  )}
                </td>
                <td className="px-3 py-3 text-gray-500 font-mono text-xs">
                  {po.requestNo ?? "—"}
                </td>
                <td className="px-3 py-3 text-gray-600">{po.supplierName}</td>
                <td className="px-3 py-3 text-gray-600">{po.materialName}</td>
                <td className="px-3 py-3 text-right text-gray-600">
                  {po.quantity} {po.unit}
                </td>
                <td className="px-3 py-3 text-right font-medium text-[#0f1a35]">
                  {fmtRupee(total)}
                </td>
                <td className="px-3 py-3 text-right text-amber-700 font-medium">
                  {payable ? fmtRupee(remaining) : "—"}
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold border capitalize ${STATUS_STYLES[po.status]}`}
                  >
                    {po.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-wrap justify-end gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      className="!px-2.5 !py-1.5 text-xs"
                      onClick={() => onView(po.id)}
                    >
                      View
                    </Button>
                    {(showEdit || !payable) && onEdit && (
                      <Button
                        type="button"
                        className="!px-2.5 !py-1.5 text-xs"
                        onClick={() => onEdit(po.id)}
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
