import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ClipboardList } from "lucide-react";
import { useAppDataContext } from "@/app/AppDataContext";
import { PoListTable } from "./purchaseOrders/PoListTable";
import { AddPurchaseOrderButton } from "./buttons/AddPurchaseOrderButton";
import { Button } from "@/components/ui/Button";
import { isPoPayable } from "@/lib/inventory/poTotals";

type Filter = "all" | "payable" | "not_payable";

/**
 * Full purchase order list — unique Purchase IDs only (not supplier master).
 */
export function PurchaseOrdersAll() {
  const navigate = useNavigate();
  const { purchaseOrders } = useAppDataContext();
  const [filter, setFilter] = useState<Filter>("all");

  const sorted = useMemo(() => {
    let list = [...purchaseOrders];
    if (filter === "payable") list = list.filter(isPoPayable);
    if (filter === "not_payable") list = list.filter((p) => !isPoPayable(p));
    return list.sort(
      (a, b) => b.orderDate.localeCompare(a.orderDate) || b.id.localeCompare(a.id)
    );
  }, [purchaseOrders, filter]);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
            <ClipboardList size={16} className="text-amber-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#0f1a35]">All purchase orders</h3>
            <p className="text-xs text-gray-500">
              Full list by unique Purchase ID · {sorted.length} shown
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value as Filter)}
          >
            <option value="all">All POs</option>
            <option value="payable">Payable only</option>
            <option value="not_payable">Needs amount edit</option>
          </select>
          <AddPurchaseOrderButton />
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/inventory/purchase-orders")}
          >
            Back
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <PoListTable
          orders={sorted}
          onView={(id) => navigate(`/inventory/purchase-orders/${id}`)}
          onEdit={(id) => navigate(`/inventory/purchase-orders/${id}/edit`)}
          showEdit
        />
      </div>
    </div>
  );
}
