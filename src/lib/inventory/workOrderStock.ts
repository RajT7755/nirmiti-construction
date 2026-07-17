import type { Material, WorkMaterialLine, WorkOrder } from "./inventoryTypes";

/** Deduct issued materials from catalog stock (floor at 0). */
export function applyMaterialIssues(
  materials: Material[],
  lines: WorkMaterialLine[]
): Material[] {
  if (!lines.length) return materials;
  const byId = new Map(materials.map((m) => [m.id, { ...m }]));
  for (const line of lines) {
    const qty = Math.max(0, Number(line.quantity) || 0);
    if (!qty || !line.materialId) continue;
    const m = byId.get(line.materialId);
    if (!m) continue;
    m.quantity = Math.max(0, m.quantity - qty);
    byId.set(line.materialId, m);
  }
  return materials.map((m) => byId.get(m.id) ?? m);
}

/** Add returned materials back to catalog stock. */
export function applyMaterialReturns(
  materials: Material[],
  lines: WorkMaterialLine[]
): Material[] {
  if (!lines.length) return materials;
  const byId = new Map(materials.map((m) => [m.id, { ...m }]));
  for (const line of lines) {
    const qty = Math.max(0, Number(line.quantity) || 0);
    if (!qty || !line.materialId) continue;
    const m = byId.get(line.materialId);
    if (!m) continue;
    m.quantity = m.quantity + qty;
    byId.set(line.materialId, m);
  }
  return materials.map((m) => byId.get(m.id) ?? m);
}

/** Net issued per material on a WO (issued − already returned). */
export function netIssuedByMaterial(wo: WorkOrder): Map<string, number> {
  const map = new Map<string, number>();
  for (const line of wo.materialIssues ?? []) {
    map.set(line.materialId, (map.get(line.materialId) ?? 0) + Math.max(0, line.quantity));
  }
  for (const line of wo.materialReturns ?? []) {
    map.set(
      line.materialId,
      Math.max(0, (map.get(line.materialId) ?? 0) - Math.max(0, line.quantity))
    );
  }
  return map;
}

/**
 * Clamp return lines so they cannot exceed remaining issued qty per material.
 */
export function clampReturnLines(
  wo: WorkOrder,
  returns: WorkMaterialLine[]
): WorkMaterialLine[] {
  const remaining = netIssuedByMaterial(wo);
  const out: WorkMaterialLine[] = [];
  for (const line of returns) {
    const max = remaining.get(line.materialId) ?? 0;
    const qty = Math.min(Math.max(0, Number(line.quantity) || 0), max);
    if (qty <= 0) continue;
    out.push({ ...line, quantity: qty });
    remaining.set(line.materialId, max - qty);
  }
  return out;
}

export function isWoPayable(wo: {
  amountTotal?: number;
  payable?: boolean;
}): boolean {
  if (wo.payable === false) return false;
  return (wo.amountTotal ?? 0) > 0;
}
