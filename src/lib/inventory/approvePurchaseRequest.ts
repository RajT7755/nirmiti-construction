import type { PurchaseOrder, PurchaseRequest } from "./inventoryTypes";
import { formatPurchaseOrderId } from "@/lib/settings/defaultSettings";

/**
 * Turn an approved request into a Purchase Order with unique Purchase ID.
 * Does NOT write amounts onto the supplier master record.
 * If grandTotal is 0 → payable: false until amounts are edited on the PO.
 * If grandTotal > 0 → payable: true (appears in Payable tab + rollup by PO id).
 */
export function purchaseOrderFromApprovedRequest(
  request: PurchaseRequest,
  poIdPrefix: string,
  poIdNext: number
): PurchaseOrder {
  const id = formatPurchaseOrderId(poIdPrefix, poIdNext);
  const grand = Math.max(0, request.grandTotal ?? 0);
  const isPayable = grand > 0;
  return {
    id,
    supplierId: request.supplierId,
    supplierName: request.supplierName,
    materialId: request.materialId,
    materialName: request.materialName,
    unit: request.unit,
    quantity: request.quantity,
    orderDate: new Date().toISOString().slice(0, 10),
    status: "pending",
    amountTotal: grand,
    amountPaid: 0,
    requestId: request.id,
    requestNo: request.requestNo,
    productDescription: request.productDescription,
    unitPrice: request.unitPrice,
    subTotal: request.lineTotal,
    items: request.items?.map((it) => ({ ...it })),
    gstRate: request.gstRate,
    gstAmount: request.gstAmount,
    roundOff: request.roundOff,
    grandTotal: grand,
    shipToAddress: request.shipToAddress,
    shipVia: request.shipVia,
    fob: request.fob,
    shippingTerms: request.shippingTerms,
    payable: isPayable,
  };
}

export function markRequestApproved(
  request: PurchaseRequest,
  poId: string
): PurchaseRequest {
  return {
    ...request,
    status: "approved",
    approvedPoId: poId,
  };
}
