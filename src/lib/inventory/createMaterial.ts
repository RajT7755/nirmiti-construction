import type { Material } from "./inventoryTypes";

export interface AddMaterialFormInput {
  name: string;
  type: string;
  /** Selected work categories (shared list with suppliers) */
  workCategories?: string[];
  /** Legacy: comma-separated categories if workCategories not provided */
  categories?: string;
  unit: string;
}

/** Parse work categories from comma / semicolon separated text. */
export function parseWorkCategories(raw: string): string[] {
  return raw
    .split(/[,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function generateMaterialId(): string {
  return `MAT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

/**
 * Build a Material for the catalog.
 * `id` is the stable key used by PurchaseOrder.materialId (PO pipeline).
 */
export function buildMaterialFromForm(input: AddMaterialFormInput): Material {
  const workCategories =
    input.workCategories && input.workCategories.length > 0
      ? [...input.workCategories]
      : parseWorkCategories(input.categories ?? "");

  return {
    id: generateMaterialId(),
    name: input.name.trim(),
    type: input.type.trim(),
    workCategories,
    unit: input.unit.trim(),
    quantity: 0,
    reorderLevel: 0,
    unitCost: 0,
  };
}
