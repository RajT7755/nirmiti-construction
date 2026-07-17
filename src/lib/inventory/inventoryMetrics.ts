import type { Contractor, InventoryKpis, Material, Supplier } from "./inventoryTypes";
import { MOCK_PENDING_BILLS_TOTAL } from "./mockInventoryData";

export function computeInventoryKpis(input: {
  materials: Material[];
  suppliers: Supplier[];
  contractors: Contractor[];
  pendingBillsTotal?: number;
}): InventoryKpis {
  const { materials, suppliers, contractors, pendingBillsTotal } = input;

  const lowStockCount = materials.filter((m) => m.quantity < m.reorderLevel).length;
  const totalMaterialCost = materials.reduce((sum, m) => sum + m.quantity * m.unitCost, 0);

  return {
    lowStockCount,
    totalMaterials: materials.length,
    supplierCount: suppliers.length,
    contractorCount: contractors.length,
    pendingBillsTotal: pendingBillsTotal ?? MOCK_PENDING_BILLS_TOTAL,
    totalMaterialCost,
  };
}
