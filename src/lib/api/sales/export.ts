import { apiRequestBlob } from "../client";

export const salesExportApi = {
  downloadReceivedPayments: () => apiRequestBlob("/api/received-payments/export"),
};
