import { apiRequest } from "../client";

export interface PurchaseOrderPaymentBody {
  amountTotal?: number;
  amountPaid?: number;
}

/** PO payment endpoints — rolls up into supplier Total / Remaining. */
export const PURCHASE_ORDER_PAYMENTS_API = {
  basePath: "/api/inventory/purchase-orders",
  apiKeyEnv: ["VITE_INVENTORY_API_KEY", "VITE_API_KEY"] as const,
  payment: (poId: string) =>
    `${PURCHASE_ORDER_PAYMENTS_API.basePath}/${encodeURIComponent(poId)}/payment`,
} as const;

export const purchaseOrderPaymentsApi = {
  get: (poId: string) =>
    apiRequest<PurchaseOrderPaymentBody>(
      PURCHASE_ORDER_PAYMENTS_API.payment(poId),
      {},
      "inventory"
    ),
  update: (poId: string, body: PurchaseOrderPaymentBody) =>
    apiRequest<PurchaseOrderPaymentBody>(
      PURCHASE_ORDER_PAYMENTS_API.payment(poId),
      { method: "PATCH", body: JSON.stringify(body) },
      "inventory"
    ),
};
