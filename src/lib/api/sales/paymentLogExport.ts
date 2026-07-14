import { apiRequestBlob } from "../client";

/**
 * Payment log Excel export — backend may proxy external service.
 * Server env: PAYMENT_EXPORT_SERVICE_URL, PAYMENT_EXPORT_API_KEY
 */
export const paymentLogExportApi = {
  downloadExcel: () => apiRequestBlob("/api/received-payments/export/excel"),
};