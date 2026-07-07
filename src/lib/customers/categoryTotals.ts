import type { CategoryRow, CustomerDetailProfile, CustomerPricing, PaymentCategoryKey } from "./customerDetailTypes";

const LABELS: Record<PaymentCategoryKey, string> = {
  flat: "Flat Payment",
  gst: "GST",
  stamp: "Stamp Duty",
  agreement: "Agreement",
  parking: "Parking",
  electrical: "Electrical Bill",
};

export function buildCategoryRows(
  pricing: CustomerPricing,
  paid: Partial<Record<PaymentCategoryKey, number>> = {}
): CategoryRow[] {
  const rows: { key: PaymentCategoryKey; due: number }[] = [
    { key: "flat", due: pricing.grandTotal },
    { key: "gst", due: pricing.gstAmount },
    { key: "stamp", due: pricing.stampDuty },
    { key: "agreement", due: pricing.agreementPrice },
    { key: "parking", due: pricing.parkingAmount },
    { key: "electrical", due: pricing.electricalBill },
  ];
  return rows.map(({ key, due }) => {
    const p = paid[key] ?? 0;
    return { key, label: LABELS[key], due, paid: p, remaining: Math.max(0, due - p) };
  });
}

export function applyCategoryPayment(
  categories: CategoryRow[],
  category: PaymentCategoryKey,
  amount: number
): CategoryRow[] {
  return categories.map((row) => {
    if (row.key !== category) return row;
    const paid = row.paid + amount;
    return { ...row, paid, remaining: Math.max(0, row.due - paid) };
  });
}

export function getCategoryDue(categories: CategoryRow[], category: PaymentCategoryKey): number {
  return categories.find((r) => r.key === category)?.remaining ?? 0;
}