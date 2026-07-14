import { buildActiveInvoiceNoByPaymentId } from "./invoiceLog";
import type { Invoice, ReceivedPayment } from "@/lib/types";

export const PAYMENT_LOG_EXPORT_HEADERS = [
  "Customer",
  "Flat",
  "Category",
  "Total Due",
  "Received",
  "Method",
  "Date",
  "Status",
  "Invoice No.",
] as const;

/** @deprecated Use buildActiveInvoiceNoByPaymentId from invoiceLog */
export function buildInvoiceNoByPaymentId(invoices: Invoice[]): Map<string, string> {
  return buildActiveInvoiceNoByPaymentId(invoices);
}

export function getPaymentLogExportRows(
  payments: ReceivedPayment[],
  invoiceNoByPaymentId: Map<string, string>
): (string | number)[][] {
  return payments.map((p) => [
    p.customer,
    p.flat,
    p.category,
    p.amount,
    p.received,
    p.method,
    p.date,
    p.status,
    invoiceNoByPaymentId.get(p.id) ?? "",
  ]);
}