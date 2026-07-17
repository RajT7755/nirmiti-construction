import type { PurchaseRequest } from "./inventoryTypes";
import { computePoTotals, DEFAULT_GST_RATE, defaultLineTotal } from "./poTotals";
import { formatRequestId } from "@/lib/settings/defaultSettings";

export interface AddPurchaseRequestFormInput {
  supplierId: string;
  supplierName: string;
  materialId?: string;
  materialName: string;
  productDescription: string;
  unit: string;
  quantity: number;
  unitPrice: number;
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

export function buildPurchaseRequestFromForm(
  input: AddPurchaseRequestFormInput
): PurchaseRequest {
  const quantity = Math.max(0, Number(input.quantity) || 0);
  const unitPrice = Math.max(0, Number(input.unitPrice) || 0);
  const lineTotal =
    typeof input.lineTotal === "number" && !Number.isNaN(input.lineTotal)
      ? Math.max(0, input.lineTotal)
      : defaultLineTotal(quantity, unitPrice);
  const totals = computePoTotals({
    subTotal: lineTotal,
    gstRate: input.gstRate ?? DEFAULT_GST_RATE,
  });
  const requestNo = formatRequestId(input.requestIdPrefix, input.requestIdNext);
  const today = new Date().toISOString().slice(0, 10);

  return {
    id: requestNo,
    requestNo,
    supplierId: input.supplierId,
    supplierName: input.supplierName.trim(),
    materialId: input.materialId,
    materialName: input.materialName.trim(),
    productDescription: input.productDescription.trim(),
    unit: input.unit.trim() || "nos",
    quantity,
    unitPrice,
    lineTotal: totals.subTotal,
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
