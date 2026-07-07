import type { CustomerDetailProfile } from "./customerDetailTypes";

export interface SlabDistributionSlice {
  name: string;
  value: number;
  slabNo?: number;
}

const SLAB_COLORS = [
  "#1e3a5f",
  "#2563eb",
  "#3b82f6",
  "#60a5fa",
  "#93c5fd",
  "#f59e0b",
  "#10b981",
  "#8b5cf6",
];

export function getSlabColors(count: number): string[] {
  return Array.from({ length: count }, (_, i) => SLAB_COLORS[i % SLAB_COLORS.length]);
}

/** Total amount paid across all categories for one customer */
export function getCustomerTotalPaid(customer: CustomerDetailProfile): number {
  return customer.categories.reduce((sum, cat) => sum + cat.paid, 0);
}

/** Flat / slab payments only (from slab ledger) */
export function getCustomerSlabPaid(customer: CustomerDetailProfile): number {
  return customer.slabLedger.reduce((sum, s) => sum + s.paidAmount, 0);
}

/**
 * Payment Distribution pie data — aggregated slab payments from active customers.
 * Each slice = one construction slab stage (10% Booking, Plinth, etc.)
 */
export function getSlabPaymentDistribution(
  customers: CustomerDetailProfile[],
  propType?: "residential" | "commercial"
): SlabDistributionSlice[] {
  const filtered = customers.filter((c) => {
    if (c.status === "inactive") return false;
    if (propType && c.unitType.toLowerCase() !== propType) return false;
    return true;
  });

  const stageMap = new Map<string, { value: number; slabNo: number }>();

  for (const c of filtered) {
    for (const s of c.slabLedger) {
      if (s.paidAmount <= 0) continue;
      const existing = stageMap.get(s.stage);
      if (existing) {
        existing.value += s.paidAmount;
      } else {
        stageMap.set(s.stage, { value: s.paidAmount, slabNo: s.slabNo });
      }
    }
  }

  return Array.from(stageMap.entries())
    .map(([name, { value, slabNo }]) => ({ name, value, slabNo }))
    .sort((a, b) => (a.slabNo ?? 0) - (b.slabNo ?? 0));
}

export function getDistributionSummary(slices: SlabDistributionSlice[]) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  return { total, count: slices.length };
}