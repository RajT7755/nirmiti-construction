import { apiRequest } from "../client";
import type {
  PartyPaymentLine,
  PaymentPartyType,
} from "@/lib/inventory/paymentLedgerTypes";

/** Global payment ledger query (PO + WO + manual lines). */
export const PAYMENT_LEDGER_API = {
  basePath: "/api/inventory/payment-ledger",
  apiKeyEnv: ["VITE_INVENTORY_API_KEY", "VITE_API_KEY"] as const,
  list: (partyType?: PaymentPartyType, partyId?: string) => {
    const q = new URLSearchParams();
    if (partyType) q.set("partyType", partyType);
    if (partyId) q.set("partyId", partyId);
    const qs = q.toString();
    return qs ? `${PAYMENT_LEDGER_API.basePath}?${qs}` : PAYMENT_LEDGER_API.basePath;
  },
} as const;

export const inventoryPaymentLedgerApi = {
  list: (partyType?: PaymentPartyType, partyId?: string) =>
    apiRequest<PartyPaymentLine[]>(
      PAYMENT_LEDGER_API.list(partyType, partyId),
      {},
      "inventory"
    ),
};
