import type { PoLineItem, PurchaseRequest } from "./inventoryTypes";
import { computePoTotals, DEFAULT_GST_RATE, defaultLineTotal } from "./poTotals";
import { formatRequestId } from "@/lib/settings/defaultSettings";
import { summarizePoItems, sumPoLineTotals } from "./poLineItems";

export interface AddPurchaseRequestFormInput {
  supplierId: string;
  supplierName: string;
  /** Preferred: multi-line items */
  items?: PoLineItem[];
  /** Legacy single-line fields (used if items omitted) */
  materialId?: string;
  materialName?: string;
  productDescription?: string;
  unit?: string;
  quantity?: number;
  unitPrice?: number;
  /** Editable total before GST; if omitted uses qty × unitPrice */
  lineTotal?: number;
  gstRate?: number;
  shipToAddress: string;
  shipVia?: string;
  fob?: string;
  shippingTerms?: string;
  requestIdPrefix: string;
  requestIdNext: number;
  orderDate?: string;
}

function normalizeItems(input: AddPurchaseRequestFormInput): PoLineItem[] {
  if (input.items && input.items.length > 0) {
    return input.items
      .map((it) => {
        const quantity = Math.max(0, Number(it.quantity) || 0);
        const unitPrice = Math.max(0, Number(it.unitPrice) || 0);
        const lineTotal =
          typeof it.lineTotal === "number" && !Number.isNaN(it.lineTotal)
            ? Math.max(0, it.lineTotal)
            : defaultLineTotal(quantity, unitPrice);
        return {
          materialId: it.materialId,
          materialName: (it.materialName || "").trim(),
          productDescription: (it.productDescription || "").trim(),
          unit: (it.unit || "nos").trim() || "nos",
          quantity,
          unitPrice,
          lineTotal,
        };
      })
      .filter((it) => it.materialName || it.quantity > 0 || it.lineTotal > 0);
  }
  const quantity = Math.max(0, Number(input.quantity) || 0);
  const unitPrice = Math.max(0, Number(input.unitPrice) || 0);
  const lineTotal =
    typeof input.lineTotal === "number" && !Number.isNaN(input.lineTotal)
      ? Math.max(0, input.lineTotal)
      : defaultLineTotal(quantity, unitPrice);
  return [
    {
      materialId: input.materialId,
      materialName: (input.materialName || "").trim(),
      productDescription: (input.productDescription || "").trim(),
      unit: (input.unit || "nos").trim() || "nos",
      quantity,
      unitPrice,
      lineTotal,
    },
  ];
}

export function buildPurchaseRequestFromForm(
  input: AddPurchaseRequestFormInput
): PurchaseRequest {
  const items = normalizeItems(input);
  const summary = summarizePoItems(items);
  const subTotal = sumPoLineTotals(items);
  const totals = computePoTotals({
    subTotal,
    gstRate: input.gstRate ?? DEFAULT_GST_RATE,
  });
  const requestNo = formatRequestId(input.requestIdPrefix, input.requestIdNext);
  const today = new Date().toISOString().slice(0, 10);

  return {
    id: requestNo,
    requestNo,
    supplierId: input.supplierId,
    supplierName: input.supplierName.trim(),
    materialId: summary.materialId,
    materialName: summary.materialName,
    productDescription: summary.productDescription,
    unit: summary.unit,
    quantity: summary.quantity,
    unitPrice: summary.unitPrice,
    lineTotal: totals.subTotal,
    items: items.length ? items : undefined,
    gstRate: totals.gstRate,
    gstAmount: totals.gstAmount,
    roundOff: totals.roundOff,
    grandTotal: totals.grandTotal,
    shipToAddress: input.shipToAddress.trim(),
    shipVia: input.shipVia?.trim() || undefined,
    fob: input.fob?.trim() || undefined,
    shippingTerms: input.shippingTerms?.trim() || undefined,
    orderDate: input.orderDate ?? today,
    status: "pending",
  };
}
