import type { PurchaseOrder } from "@/lib/inventory/inventoryTypes";
import { AddPurchaseOrderButton } from "./buttons/AddPurchaseOrderButton";

const STATUS_STYLES: Record<PurchaseOrder["status"], string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  partial: "bg-blue-50 text-blue-700 border-blue-200",
  received: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function RecentPurchaseOrdersPanel({
  orders,
  onViewAll,
}: {
  orders: PurchaseOrder[];
  onViewAll?: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 gap-2 flex-wrap">
        <h3 className="text-sm font-semibold text-[#0f1a35]">Recent Purchase Orders</h3>
        <div className="flex items-center gap-2">
          <AddPurchaseOrderButton
            label="Add"
            variant="outline"
            className="!px-3 !py-1.5 text-xs"
          />
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
      </div>
      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <p className="text-sm text-gray-400 text-center">No purchase orders yet.</p>
          <AddPurchaseOrderButton label="Add purchase request" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-gray-400 border-b border-gray-50">
                <th className="px-5 py-2.5 font-semibold">PO</th>
                <th className="px-3 py-2.5 font-semibold">Supplier</th>
                <th className="px-3 py-2.5 font-semibold">Material</th>
                <th className="px-3 py-2.5 font-semibold">Qty</th>
                <th className="px-3 py-2.5 font-semibold">Date</th>
                <th className="px-5 py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((po) => (
                <tr key={po.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                  <td className="px-5 py-3 font-medium text-[#0f1a35]">{po.id}</td>
                  <td className="px-3 py-3 text-gray-600">{po.supplierName}</td>
                  <td className="px-3 py-3 text-gray-600">{po.materialName}</td>
                  <td className="px-3 py-3 text-gray-600">
                    {po.quantity} {po.unit}
                  </td>
                  <td className="px-3 py-3 text-gray-500">{po.orderDate}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold border capitalize ${STATUS_STYLES[po.status]}`}
                    >
                      {po.status}
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
