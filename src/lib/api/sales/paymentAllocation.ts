import { apiRequest } from "../client";
import type {
  CategoryRow,
  PaymentCategoryKey,
  SlabLedgerRow,
} from "@/lib/customers/customerDetailTypes";

export interface AllocatePaymentRequest {
  customerId: string;
  category: PaymentCategoryKey;
  amount: number;
  method: string;
  date: string;
}

export interface AllocatePaymentResult {
  paymentId: string;
  category: PaymentCategoryKey;
  amountReceived: number;
  categoryRemaining: number;
  /** Updated slab ledger after overpayment cascade */
  slabLedger: SlabLedgerRow[];
  /** Slabs auto-settled without WhatsApp message when overpaid */
  autoSettledSlabNos: number[];
  skipWhatsApp: boolean;
}

/**
 * Payment allocation API — slab remaining logic, overpayment cascade, category dues.
 * Backend: POST /api/payments/allocate, GET /api/customers/:id/payment-categories
 */
export const paymentAllocationApi = {
  getCategories: (customerId: string) =>
    apiRequest<CategoryRow[]>(`/api/customers/${customerId}/payment-categories`),

  getCategoryDue: (customerId: string, category: PaymentCategoryKey) =>
    apiRequest<{ remaining: number }>(
      `/api/customers/${customerId}/payment-categories/${category}/due`
    ),

  allocate: (body: AllocatePaymentRequest) =>
    apiRequest<AllocatePaymentResult>("/api/payments/allocate", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};