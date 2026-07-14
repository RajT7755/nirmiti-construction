import { apiRequest, apiRequestBlob } from "../client";
import type { Invoice } from "@/lib/types";

export interface CreateInvoiceRequest {
  paymentId: string;
  customerName: string;
  flat: string;
  amount: number;
  date: string;
  customerId?: string;
}

/**
 * Invoice service — backend proxies external provider.
 * Server env: INVOICE_SERVICE_URL, INVOICE_API_KEY
 */
export const invoicesApi = {
  list: () => apiRequest<Invoice[]>("/api/invoices"),

  create: (body: CreateInvoiceRequest) =>
    apiRequest<Invoice>("/api/invoices", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  downloadPdf: (id: string) => apiRequestBlob(`/api/invoices/${id}/pdf`),
};