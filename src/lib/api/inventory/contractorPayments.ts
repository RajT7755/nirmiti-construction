import { apiRequest } from "../client";
import type { PartyPaymentLine, PartyPaymentSummary } from "@/lib/inventory/paymentLedgerTypes";

/** API routes + key scope for contractor payment rollups (connected to Work Orders). */
export const CONTRACTOR_PAYMENTS_API = {
  basePath: "/api/inventory/contractors",
  apiKeyEnv: ["VITE_INVENTORY_API_KEY", "VITE_API_KEY"] as const,
  list: (contractorId: string) =>
    `${CONTRACTOR_PAYMENTS_API.basePath}/${encodeURIComponent(contractorId)}/payments`,
  summary: (contractorId: string) =>
    `${CONTRACTOR_PAYMENTS_API.basePath}/${encodeURIComponent(contractorId)}/payment-summary`,
} as const;

export const contractorPaymentsApi = {
  list: (contractorId: string) =>
    apiRequest<PartyPaymentLine[]>(CONTRACTOR_PAYMENTS_API.list(contractorId), {}, "inventory"),
  summary: (contractorId: string) =>
    apiRequest<PartyPaymentSummary>(
      CONTRACTOR_PAYMENTS_API.summary(contractorId),
      {},
      "inventory"
    ),
  create: (contractorId: string, body: Partial<PartyPaymentLine>) =>
    apiRequest<PartyPaymentLine>(
      CONTRACTOR_PAYMENTS_API.list(contractorId),
      { method: "POST", body: JSON.stringify(body) },
      "inventory"
    ),
};
