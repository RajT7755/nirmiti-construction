import * as XLSX from "xlsx";
import {
  PAYMENT_LOG_EXPORT_HEADERS,
  buildInvoiceNoByPaymentId,
  getPaymentLogExportRows,
} from "./exportPaymentLogRows";
import type { Invoice, ReceivedPayment } from "@/lib/types";

export function downloadPaymentLogExcel(
  payments: ReceivedPayment[],
  invoices: Invoice[],
  filename?: string
) {
  const invoiceMap = buildInvoiceNoByPaymentId(invoices);
  const rows = getPaymentLogExportRows(payments, invoiceMap);
  const sheetData = [PAYMENT_LOG_EXPORT_HEADERS as unknown as string[], ...rows];

  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Payment Log");

  const dateStamp = new Date().toISOString().slice(0, 10);
  const outName = filename ?? `payment-log-${dateStamp}.xlsx`;
  XLSX.writeFile(workbook, outName.endsWith(".xlsx") ? outName : `${outName}.xlsx`);
}