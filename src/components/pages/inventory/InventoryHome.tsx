import { useMemo } from "react";
import { useNavigate } from "react-router";
import { InventoryKpiGrid } from "./InventoryKpiGrid";
import { InventoryActivityTabs } from "./InventoryActivityTabs";
import { computeInventoryKpis } from "@/lib/inventory/inventoryMetrics";
import { useAppDataContext } from "@/app/AppDataContext";

/**
 * Inventory home (`/inventory`): KPI cards + Recent Orders / Overdue Payment.
 * Materials / suppliers / contractors KPIs use store catalogs.
 */
export function InventoryHome() {
  const navigate = useNavigate();
  const {
    materials = [],
    suppliers = [],
    contractors = [],
    purchaseOrders = [],
    workOrders = [],
  } = useAppDataContext();

  const kpis = useMemo(
    () =>
      computeInventoryKpis({
        materials,
        suppliers,
        contractors,
      }),
    [materials, suppliers, contractors]
  );

  const recentOrders = useMemo(
    () => (purchaseOrders ?? []).slice(0, 5),
    [purchaseOrders]
  );
  const recentWorkOrders = useMemo(
    () => (workOrders ?? []).slice(0, 5),
    [workOrders]
  );

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">
        Overview — Materials, Suppliers, Contractors, POs, Work Orders. Issue/return materials
        on WOs update stock and low-stock KPIs.
      </p>
      <InventoryKpiGrid kpis={kpis} />
      <InventoryActivityTabs
        purchaseOrders={recentOrders}
        workOrders={recentWorkOrders}
        overdueBills={[]}
        onViewAllOrders={() => navigate("/inventory/purchase-orders")}
        onViewAllWorkOrders={() => navigate("/inventory/work-orders")}
      />
    </div>
  );
}
