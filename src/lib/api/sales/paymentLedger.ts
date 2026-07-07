import { apiRequest } from "../client";
import type { SlabLedgerRow } from "@/lib/customers/customerDetailTypes";

export interface PaymentLedgerSummary {
  customerId: string;
  flatTotal: number;
  flatPaid: number;
  flatRemaining: number;
  currentSlabLabel: string;
  slabs: SlabLedgerRow[];
}

/**
 * Slab payment ledger API — shown in Customer Details panel.
 * Backend: GET /api/customers/:id/payment-ledger
 */
export const paymentLedgerApi = {
  get: (customerId: string) =>
    apiRequest<PaymentLedgerSummary>(`/api/customers/${customerId}/payment-ledger`),

  getActiveSlab: (customerId: string) =>
    apiRequest<SlabLedgerRow | null>(`/api/customers/${customerId}/active-slab`),
};