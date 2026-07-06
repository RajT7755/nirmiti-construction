import { apiRequest } from "../client";

export const inventoryApi = {
  list: () => apiRequest<unknown[]>("/api/inventory"),
};
