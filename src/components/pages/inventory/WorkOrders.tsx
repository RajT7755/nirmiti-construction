import { useMemo } from "react";
import { useNavigate } from "react-router";
import { IndianRupee, Wrench } from "lucide-react";
import { BackToInventoryButton } from "./buttons/BackToInventoryButton";
import { RequestWorkOrderButton } from "./buttons/RequestWorkOrderButton";
import { ViewAllWorkOrdersButton } from "./buttons/ViewAllWorkOrdersButton";
import { WorkRequestListTable } from "./workOrders/WorkRequestListTable";
import { WorkOrderListTable } from "./workOrders/WorkOrderListTable";
import { useAppDataContext } from "@/app/AppDataContext";
import { isWoPayable } from "@/lib/inventory/workOrderStock";

const PREVIEW = 8;

export function WorkOrders() {
  const navigate = useNavigate();
  const {
    workOrderRequests = [],
    workOrders = [],
    generateWorkOrder,
    rejectWorkOrderRequest,
  } = useAppDataContext();

  const sortedRequests = useMemo(
    () =>
      [...(workOrderRequests ?? [])].sort(
        (a, b) =>
          (b.createdAt ?? "").localeCompare(a.createdAt ?? "") ||
          b.requestNo.localeCompare(a.requestNo)
      ),
    [workOrderRequests]
  );

  const sortedWos = useMemo(
    () =>
      [...(workOrders ?? [])].sort(
        (a, b) =>
          (b.startDate ?? "").localeCompare(a.startDate ?? "") || b.id.localeCompare(a.id)
      ),
    [workOrders]
  );

  const payableWos = useMemo(() => sortedWos.filter(isWoPayable), [sortedWos]);

  function handleGenerate(id: string) {
    if (
      !window.confirm(
        "Generate Work Order? Issued materials will reduce stock. Set work amount after generate."
      )
    ) {
      return;
    }
    const wo = generateWorkOrder(id);
    if (!wo) {
      window.alert("Could not generate work order.");
      return;
    }
    window.alert(
      `Work Order ${wo.id} created. Stock updated for issued materials. Set work amount on Edit.`
    );
    navigate(`/inventory/work-orders/${wo.id}/edit`);
  }

  function handleReject(id: string) {
    if (!window.confirm("Reject this work request?")) return;
    rejectWorkOrderRequest(id);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
              <Wrench size={16} className="text-teal-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-[#0f1a35]">Work Orders</h3>
              <p className="text-xs text-gray-500">
                Request Order → Generate WO → set work amount / return materials · View &amp;
                print documents
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <RequestWorkOrderButton />
            <BackToInventoryButton />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-2 flex-wrap">
          <h4 className="text-sm font-semibold text-[#0f1a35]">1. Request Orders</h4>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{sortedRequests.length} total</span>
            <RequestWorkOrderButton
              label="Add"
              variant="outline"
              className="!px-3 !py-1.5 text-xs"
            />
          </div>
        </div>
        <WorkRequestListTable
          requests={sortedRequests}
          onGenerate={handleGenerate}
          onReject={handleReject}
          onView={(id) => navigate(`/inventory/work-orders/request/${id}`)}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-2 flex-wrap">
          <h4 className="text-sm font-semibold text-[#0f1a35]">
            2. Work Orders (full · unique WO id)
          </h4>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{sortedWos.length} total</span>
            <ViewAllWorkOrdersButton />
          </div>
        </div>
        <WorkOrderListTable
          orders={sortedWos.slice(0, PREVIEW)}
          onView={(id) => navigate(`/inventory/work-orders/${id}`)}
          onEdit={(id) => navigate(`/inventory/work-orders/${id}/edit`)}
          showEdit
        />
        {sortedWos.length > PREVIEW && (
          <div className="px-5 py-3 border-t border-gray-50 text-center">
            <button
              type="button"
              className="text-xs font-semibold text-blue-600 hover:underline"
              onClick={() => navigate("/inventory/work-orders/all")}
            >
              View all {sortedWos.length} work orders
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IndianRupee size={14} className="text-emerald-600" />
            <h4 className="text-sm font-semibold text-[#0f1a35]">
              3. Payable (work amount &gt; 0)
            </h4>
          </div>
          <span className="text-xs text-gray-400">{payableWos.length} payable</span>
        </div>
        <WorkOrderListTable
          orders={payableWos.slice(0, PREVIEW)}
          onView={(id) => navigate(`/inventory/work-orders/${id}`)}
          showEdit={false}
          emptyMessage="No payable WOs. Generate a request and set work amount on Edit."
        />
      </div>
    </div>
  );
}
