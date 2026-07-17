import { useState } from "react";
import { RecentPurchaseOrdersPanel } from "./RecentPurchaseOrdersPanel";
import { RecentWorkOrdersPanel } from "./RecentWorkOrdersPanel";
import { InventoryOverduePaymentsPanel } from "./InventoryOverduePaymentsPanel";
import type { OverdueBill, PurchaseOrder, WorkOrder } from "@/lib/inventory/inventoryTypes";

export type InventoryActivityTab = "recent-orders" | "work-orders" | "overdue";

export function InventoryActivityTabs({
  purchaseOrders = [],
  workOrders = [],
  overdueBills = [],
  onViewAllOrders,
  onViewAllWorkOrders,
}: {
  purchaseOrders?: PurchaseOrder[];
  workOrders?: WorkOrder[];
  overdueBills?: OverdueBill[];
  onViewAllOrders?: () => void;
  onViewAllWorkOrders?: () => void;
}) {
  const [tab, setTab] = useState<InventoryActivityTab>("recent-orders");

  const tabClass = (active: boolean, color: "blue" | "teal" | "orange") => {
    const activeMap = {
      blue: "border-blue-600 text-blue-600",
      teal: "border-teal-600 text-teal-600",
      orange: "border-orange-500 text-orange-600",
    };
    return `px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
      active
        ? activeMap[color]
        : "border-transparent text-gray-500 hover:text-gray-700"
    }`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setTab("recent-orders")}
          className={tabClass(tab === "recent-orders", "blue")}
        >
          Recent POs
        </button>
        <button
          type="button"
          onClick={() => setTab("work-orders")}
          className={tabClass(tab === "work-orders", "teal")}
        >
          Work Orders
        </button>
        <button
          type="button"
          onClick={() => setTab("overdue")}
          className={tabClass(tab === "overdue", "orange")}
        >
          Overdue Payment
        </button>
      </div>

      {tab === "recent-orders" && (
        <RecentPurchaseOrdersPanel orders={purchaseOrders} onViewAll={onViewAllOrders} />
      )}
      {tab === "work-orders" && (
        <RecentWorkOrdersPanel orders={workOrders} onViewAll={onViewAllWorkOrders} />
      )}
      {tab === "overdue" && <InventoryOverduePaymentsPanel bills={overdueBills} />}
    </div>
  );
}
