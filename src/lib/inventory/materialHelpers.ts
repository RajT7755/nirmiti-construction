import type { Material } from "./inventoryTypes";

export function isLowStock(material: Material): boolean {
  return material.quantity < material.reorderLevel;
}

/** Low-stock materials only, sorted by quantity ascending (lowest first). */
export function getLowMaterialsSorted(materials: Material[]): Material[] {
  return materials
    .filter(isLowStock)
    .slice()
    .sort((a, b) => a.quantity - b.quantity);
}
