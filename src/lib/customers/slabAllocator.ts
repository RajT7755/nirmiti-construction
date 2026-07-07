import type { CustomerDetailProfile, SlabLedgerRow } from "./customerDetailTypes";
import { applyCategoryPayment } from "./categoryTotals";

export interface AllocateFlatResult {
  customer: CustomerDetailProfile;
  autoSettledSlabNos: number[];
  skipWhatsApp: boolean;
  amountApplied: number;
}

function updateSlabLabel(ledger: SlabLedgerRow[]): string {
  const active =
    ledger.find((s) => s.status === "partial") ?? ledger.find((s) => s.status === "pending");
  if (!active) return "All slabs received";
  const suffix = active.status === "partial" ? " (partial)" : " (pending)";
  return `Slab #${active.slabNo} — ${active.stage}${suffix}`;
}

export function allocateFlatPayment(
  customer: CustomerDetailProfile,
  amount: number
): AllocateFlatResult {
  let remaining = amount;
  const autoSettledSlabNos: number[] = [];
  const ledger = customer.slabLedger.map((s) => ({ ...s }));

  for (let i = 0; i < ledger.length && remaining > 0; i++) {
    const slab = ledger[i];
    if (slab.status === "received" && slab.remainingAmount <= 0) continue;

    const due =
      slab.remainingAmount > 0 ? slab.remainingAmount : Math.max(0, slab.slabAmount - slab.paidAmount);
    if (due <= 0) continue;

    const apply = Math.min(remaining, due);
    slab.paidAmount += apply;
    slab.remainingAmount = Math.max(0, slab.slabAmount - slab.paidAmount);
    remaining -= apply;

    if (slab.remainingAmount <= 0) {
      slab.status = "received";
      if (remaining > 0) {
        slab.autoSettled = true;
        autoSettledSlabNos.push(slab.slabNo);
      }
    } else {
      slab.status = "partial";
    }
  }

  const flatPaid = ledger.reduce((s, x) => s + x.paidAmount, 0);
  let categories = applyCategoryPayment(customer.categories, "flat", amount);
  categories = categories.map((row) =>
    row.key === "flat"
      ? { ...row, paid: flatPaid, remaining: Math.max(0, row.due - flatPaid) }
      : row
  );

  return {
    customer: {
      ...customer,
      slabLedger: ledger,
      categories,
      currentSlabLabel: updateSlabLabel(ledger),
    },
    autoSettledSlabNos,
    skipWhatsApp: autoSettledSlabNos.length > 0,
    amountApplied: amount - remaining,
  };
}

export function createBookingSlabRow(grandTotal: number, received = 0): SlabLedgerRow {
  const slabAmount = Math.round(grandTotal * 0.1);
  const paidAmount = Math.min(received, slabAmount);
  return {
    slabNo: 0,
    stage: "10% Booking",
    percentage: 10,
    slabAmount,
    paidAmount,
    remainingAmount: Math.max(0, slabAmount - paidAmount),
    status: paidAmount >= slabAmount ? "received" : paidAmount > 0 ? "partial" : "pending",
  };
}

export function getActiveSlabFromLedger(ledger: SlabLedgerRow[]) {
  const active =
    ledger.find((s) => s.status === "partial") ?? ledger.find((s) => s.status === "pending");
  if (!active) return null;
  return {
    slabNo: active.slabNo,
    stage: active.stage,
    percentage: active.percentage,
    slabAmount: active.slabAmount,
    paidAmount: active.paidAmount,
    remainingAmount: active.remainingAmount,
  };
}