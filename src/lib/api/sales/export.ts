import { apiRequest } from "../client";

export const salesExportApi = {
  downloadReceivedPayments: () => apiRequest<Blob>("/api/received-payments/export"),
};
