import { apiRequest } from "../client";
import type { PartyPaymentLine, PartyPaymentSummary } from "@/lib/inventory/paymentLedgerTypes";

/** API routes + key scope for supplier payment rollups (connected to POs). */
export const SUPPLIER_PAYMENTS_API = {
  basePath: "/api/inventory/suppliers",
  /** Env: VITE_INVENTORY_API_KEY or VITE_API_KEY */
  apiKeyEnv: ["VITE_INVENTORY_API_KEY", "VITE_API_KEY"] as const,
  list: (supplierId: string) =>
    `${SUPPLIER_PAYMENTS_API.basePath}/${encodeURIComponent(supplierId)}/payments`,
  summary: (supplierId: string) =>
    `${SUPPLIER_PAYMENTS_API.basePath}/${encodeURIComponent(supplierId)}/payment-summary`,
} as const;

export const supplierPaymentsApi = {
  list: (supplierId: string) =>
    apiRequest<PartyPaymentLine[]>(SUPPLIER_PAYMENTS_API.list(supplierId), {}, "inventory"),
  summary: (supplierId: string) =>
    apiRequest<PartyPaymentSummary>(
      SUPPLIER_PAYMENTS_API.summary(supplierId),
      {},
      "inventory"
    ),
  create: (supplierId: string, body: Partial<PartyPaymentLine>) =>
    apiRequest<PartyPaymentLine>(
      SUPPLIER_PAYMENTS_API.list(supplierId),
      { method: "POST", body: JSON.stringify(body) },
      "inventory"
    ),
};
