import { apiRequest } from "../client";

export const customersExportApi = {
  download: () => apiRequest<Blob>("/api/customers/export"),
};
