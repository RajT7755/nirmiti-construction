import { apiRequestBlob } from "../client";

export const customersExportApi = {
  download: () => apiRequestBlob("/api/customers/export"),
};
