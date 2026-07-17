import type { PurchaseRequest } from "@/lib/inventory/inventoryTypes";
import { fmtRupee } from "@/lib/inventory/poTotals";
import { Button } from "@/components/ui/Button";

const STATUS_STYLES: Record<PurchaseRequest["status"], string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

export function RequestListTable({
  requests,
  onApprove,
  onReject,
  onView,
}: {
  requests: PurchaseRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onView: (id: string) => void;
}) {
  if (requests.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">No purchase requests yet.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[10px] uppercase tracking-widest text-gray-400 border-b border-gray-100">
            <th className="px-4 py-2.5 font-semibold">Request No</th>
            <th className="px-3 py-2.5 font-semibold">Supplier</th>
            <th className="px-3 py-2.5 font-semibold">Material</th>
            <th className="px-3 py-2.5 font-semibold text-right">Qty</th>
            <th className="px-3 py-2.5 font-semibold text-right">Total</th>
            <th className="px-3 py-2.5 font-semibold">Status</th>
            <th className="px-4 py-2.5 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
              <td className="px-4 py-3 font-medium text-[#0f1a35] font-mono text-xs">
                {r.requestNo}
              </td>
              <td className="px-3 py-3 text-gray-600">{r.supplierName}</td>
              <td className="px-3 py-3 text-gray-600">
                <span className="block">{r.materialName}</span>
                {r.productDescription && (
                  <span className="text-[11px] text-gray-400 line-clamp-1">
                    {r.productDescription}
                  </span>
                )}
              </td>
              <td className="px-3 py-3 text-right text-gray-600">
                {r.quantity} {r.unit}
              </td>
              <td className="px-3 py-3 text-right font-medium text-[#0f1a35]">
                {fmtRupee(r.grandTotal)}
              </td>
              <td className="px-3 py-3">
                <span
                  className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold border capitalize ${STATUS_STYLES[r.status]}`}
                >
                  {r.status}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex flex-wrap justify-end gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    className="!px-2.5 !py-1.5 text-xs"
                    onClick={() => onView(r.id)}
                  >
                    View
                  </Button>
                  {r.status === "pending" && (
                    <>
                      <Button
                        type="button"
                        className="!px-2.5 !py-1.5 text-xs"
                        onClick={() => onApprove(r.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="!px-2.5 !py-1.5 text-xs"
                        onClick={() => onReject(r.id)}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {r.status === "approved" && r.approvedPoId && (
                    <span className="text-[11px] text-gray-500 self-center">
                      → {r.approvedPoId}
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
