import { useMemo } from "react";
import { useNavigate } from "react-router";
import { ClipboardList, IndianRupee } from "lucide-react";
import { BackToInventoryButton } from "./buttons/BackToInventoryButton";
import { AddPurchaseOrderButton } from "./buttons/AddPurchaseOrderButton";
import { ViewAllPurchaseOrdersButton } from "./buttons/ViewAllPurchaseOrdersButton";
import { RequestListTable } from "./purchaseOrders/RequestListTable";
import { PoListTable } from "./purchaseOrders/PoListTable";
import { useAppDataContext } from "@/app/AppDataContext";
import { isPoPayable } from "@/lib/inventory/poTotals";

const PREVIEW = 8;

export function PurchaseOrders() {
  const navigate = useNavigate();
  const {
    purchaseRequests,
    purchaseOrders,
    approvePurchaseRequest,
    rejectPurchaseRequest,
  } = useAppDataContext();

  const sortedRequests = useMemo(
    () =>
      [...purchaseRequests].sort((a, b) =>
        b.orderDate.localeCompare(a.orderDate) || b.requestNo.localeCompare(a.requestNo)
      ),
    [purchaseRequests]
  );

  const sortedPos = useMemo(
    () =>
      [...purchaseOrders].sort((a, b) =>
        b.orderDate.localeCompare(a.orderDate) || b.id.localeCompare(a.id)
      ),
    [purchaseOrders]
  );

  const payablePos = useMemo(
    () => sortedPos.filter(isPoPayable),
    [sortedPos]
  );

  function handleApprove(id: string) {
    if (
      !window.confirm(
        "Approve this request? A unique Purchase ID will be created. If grand total is 0, edit amounts on the PO before it appears in Payable."
      )
    ) {
      return;
    }
    const po = approvePurchaseRequest(id);
    if (!po) return;
    if (!isPoPayable(po)) {
      window.alert(
        `Purchase ID ${po.id} created with total 0. Edit amounts to add it to Payable.`
      );
      navigate(`/inventory/purchase-orders/${po.id}/edit`);
      return;
    }
    window.alert(`Approved. Purchase ID ${po.id} is in Purchase Orders and Payable.`);
  }

  function handleReject(id: string) {
    if (!window.confirm("Reject this purchase request?")) return;
    rejectPurchaseRequest(id);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
              <ClipboardList size={16} className="text-amber-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-[#0f1a35]">Purchase Orders</h3>
              <p className="text-xs text-gray-500">
                Request → Approve (unique Purchase ID) → edit if total 0 → Payable (per PO, not
                supplier master)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <AddPurchaseOrderButton />
            <BackToInventoryButton />
          </div>
        </div>
      </div>

      {/* 1. Requests */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-2 flex-wrap">
          <h4 className="text-sm font-semibold text-[#0f1a35]">1. Requests</h4>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{sortedRequests.length} total</span>
            <AddPurchaseOrderButton
              label="Add"
              variant="outline"
              className="!px-3 !py-1.5 text-xs"
            />
          </div>
        </div>
        <RequestListTable
          requests={sortedRequests}
          onApprove={handleApprove}
          onReject={handleReject}
          onView={(id) => navigate(`/inventory/purchase-orders/request/${id}`)}
        />
      </div>

      {/* 2. Full Purchase Orders */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-2 flex-wrap">
          <h4 className="text-sm font-semibold text-[#0f1a35]">
            2. Purchase Orders (full · unique Purchase ID)
          </h4>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{sortedPos.length} total</span>
            <ViewAllPurchaseOrdersButton />
          </div>
        </div>
        <PoListTable
          orders={sortedPos.slice(0, PREVIEW)}
          onView={(id) => navigate(`/inventory/purchase-orders/${id}`)}
          onEdit={(id) => navigate(`/inventory/purchase-orders/${id}/edit`)}
          showEdit
          emptyMessage="No purchase orders yet. Approve a request to create one."
        />
        {sortedPos.length > PREVIEW && (
          <div className="px-5 py-3 border-t border-gray-50 text-center">
            <button
              type="button"
              className="text-xs font-semibold text-blue-600 hover:underline"
              onClick={() => navigate("/inventory/purchase-orders/all")}
            >
              View all {sortedPos.length} purchase orders
            </button>
          </div>
        )}
      </div>

      {/* 3. Payable only */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <IndianRupee size={14} className="text-emerald-600" />
            <h4 className="text-sm font-semibold text-[#0f1a35]">
              3. Payable (grand total &gt; 0)
            </h4>
          </div>
          <span className="text-xs text-gray-400">{payablePos.length} payable</span>
        </div>
        <PoListTable
          orders={payablePos.slice(0, PREVIEW)}
          onView={(id) => navigate(`/inventory/purchase-orders/${id}`)}
          onEdit={(id) => navigate(`/inventory/purchase-orders/${id}/edit`)}
          showEdit
          emptyMessage="No payable POs yet. Approve a request with total, or edit a zero-total PO."
        />
        {payablePos.length > PREVIEW && (
          <div className="px-5 py-3 border-t border-gray-50 text-center">
            <button
              type="button"
              className="text-xs font-semibold text-blue-600 hover:underline"
              onClick={() => navigate("/inventory/purchase-orders/all")}
            >
              View all payable
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
