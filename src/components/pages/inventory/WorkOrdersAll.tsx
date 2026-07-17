import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Wrench } from "lucide-react";
import { useAppDataContext } from "@/app/AppDataContext";
import { WorkOrderListTable } from "./workOrders/WorkOrderListTable";
import { Button } from "@/components/ui/Button";
import { isWoPayable } from "@/lib/inventory/workOrderStock";

type Filter = "all" | "payable" | "not_payable";

export function WorkOrdersAll() {
  const navigate = useNavigate();
  const { workOrders = [] } = useAppDataContext();
  const [filter, setFilter] = useState<Filter>("all");

  const sorted = useMemo(() => {
    let list = [...(workOrders ?? [])];
    if (filter === "payable") list = list.filter(isWoPayable);
    if (filter === "not_payable") list = list.filter((w) => !isWoPayable(w));
    return list.sort(
      (a, b) =>
        (b.startDate ?? "").localeCompare(a.startDate ?? "") || b.id.localeCompare(a.id)
    );
  }, [workOrders, filter]);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center">
            <Wrench size={16} className="text-teal-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#0f1a35]">All work orders</h3>
            <p className="text-xs text-gray-500">
              Full list by unique Work Order ID · {sorted.length} shown
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value as Filter)}
          >
            <option value="all">All WOs</option>
            <option value="payable">Payable only</option>
            <option value="not_payable">Needs work amount</option>
          </select>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/inventory/work-orders")}
          >
            Back
          </Button>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <WorkOrderListTable
          orders={sorted}
          onView={(id) => navigate(`/inventory/work-orders/${id}`)}
          onEdit={(id) => navigate(`/inventory/work-orders/${id}/edit`)}
          showEdit={filter !== "payable"}
        />
      </div>
    </div>
  );
}
