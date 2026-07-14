import type { CreateInvoiceInput } from "@/lib/storage/storeOperations";
import type { Invoice, ReceivedPayment } from "@/lib/types";

export function normalizeInvoice(inv: Invoice): Invoice {
  return {
    ...inv,
    lifecycle: inv.lifecycle ?? "active",
    revision: inv.revision ?? 1,
  };
}

export function normalizeInvoices(invoices: Invoice[]): Invoice[] {
  return invoices.map(normalizeInvoice);
}

export function isActiveInvoice(inv: Invoice): boolean {
  return (inv.lifecycle ?? "active") === "active";
}

export function getInvoicesForPayment(invoices: Invoice[], paymentId: string): Invoice[] {
  return invoices.filter((inv) => inv.paymentId === paymentId);
}

export function getActiveInvoiceForPayment(
  invoices: Invoice[],
  paymentId: string
): Invoice | undefined {
  return invoices.find((inv) => inv.paymentId === paymentId && isActiveInvoice(inv));
}

export function hasActiveInvoice(invoices: Invoice[], paymentId: string): boolean {
  return getActiveInvoiceForPayment(invoices, paymentId) !== undefined;
}

export function hasPriorInvoice(invoices: Invoice[], paymentId: string): boolean {
  return getInvoicesForPayment(invoices, paymentId).length > 0;
}

export function getActiveInvoices(invoices: Invoice[]): Invoice[] {
  return invoices.filter(isActiveInvoice);
}

export function sortInvoicesNewestFirst(invoices: Invoice[]): Invoice[] {
  return [...invoices].sort((a, b) => {
    const dateCmp = b.date.localeCompare(a.date);
    if (dateCmp !== 0) return dateCmp;
    return b.revision - a.revision;
  });
}

export function buildActiveInvoiceNoByPaymentId(invoices: Invoice[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const inv of invoices) {
    if (isActiveInvoice(inv)) {
      map.set(inv.paymentId, inv.invoiceNo);
    }
  }
  return map;
}

export function buildInvoiceInputFromPayment(payment: ReceivedPayment): CreateInvoiceInput {
  return {
    paymentId: payment.id,
    customerName: payment.customer,
    flat: payment.flat,
    amount: payment.received > 0 ? payment.received : payment.amount,
    date: payment.date,
  };
}

export function getSupersededInvoiceLabel(inv: Invoice): string {
  if (inv.lifecycle === "superseded") return "Superseded";
  if (inv.lifecycle === "void") return "Void";
  return inv.status;
}