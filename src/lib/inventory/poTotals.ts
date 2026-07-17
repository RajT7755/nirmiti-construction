/** GST + round-up helpers for purchase requests / POs.
 * Round-off applies only at the end (final total), not per field.
 * e.g. 4.55 → 5, 1267.4 → 1268 (ceil to whole rupee).
 */

export const DEFAULT_GST_RATE = 18;

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export interface PoTotalsInput {
  /** Editable line / sub total (₹) before GST */
  subTotal: number;
  gstRate?: number;
}

export interface PoTotalsResult {
  subTotal: number;
  gstRate: number;
  gstAmount: number;
  /** subTotal + gst (may have paise) */
  rawTotal: number;
  /** Ceil to whole rupee */
  grandTotal: number;
  /** grandTotal − rawTotal */
  roundOff: number;
}

/**
 * Compute GST then round UP only the final amount to whole rupees.
 */
export function computePoTotals(input: PoTotalsInput): PoTotalsResult {
  const subTotal = Math.max(0, round2(Number(input.subTotal) || 0));
  const gstRate =
    typeof input.gstRate === "number" && !Number.isNaN(input.gstRate)
      ? Math.max(0, input.gstRate)
      : DEFAULT_GST_RATE;
  const gstAmount = round2((subTotal * gstRate) / 100);
  const rawTotal = round2(subTotal + gstAmount);
  const grandTotal = Math.ceil(rawTotal - Number.EPSILON);
  const roundOff = round2(grandTotal - rawTotal);
  return {
    subTotal,
    gstRate,
    gstAmount,
    rawTotal,
    grandTotal,
    roundOff: roundOff < 0 ? 0 : roundOff,
  };
}

/** Default line total from qty × unit price (still editable by user). */
export function defaultLineTotal(qty: number, unitPrice: number): number {
  return round2(Math.max(0, qty) * Math.max(0, unitPrice));
}

/** Format money with paise when needed (document lines). */
export function fmtRupee(n: number): string {
  const v = Number(n) || 0;
  const hasPaise = Math.abs(v % 1) > 1e-9;
  return `₹${v.toLocaleString("en-IN", {
    minimumFractionDigits: hasPaise ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

/** Payable = unique PO with total > 0 and not explicitly non-payable. */
export function isPoPayable(po: {
  grandTotal?: number;
  amountTotal?: number;
  payable?: boolean;
}): boolean {
  if (po.payable === false) return false;
  const total = po.grandTotal ?? po.amountTotal ?? 0;
  return total > 0;
}
