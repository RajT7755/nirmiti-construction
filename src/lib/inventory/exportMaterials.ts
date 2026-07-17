import type { Material } from "./inventoryTypes";

export function materialsToExportRows(materials: Material[]): {
  headers: string[];
  rows: (string | number)[][];
} {
  return {
    headers: [
      "Id",
      "Name",
      "Type",
      "Work categories",
      "Quantity",
      "Unit",
      "Reorder level",
      "Unit cost",
      "Supplier id",
      "Current supplier",
    ],
    rows: materials.map((m) => [
      m.id,
      m.name,
      m.type,
      m.workCategories.join("; "),
      m.quantity,
      m.unit,
      m.reorderLevel,
      m.unitCost,
      m.currentSupplierId ?? "",
      m.currentSupplierName ?? "",
    ]),
  };
}
