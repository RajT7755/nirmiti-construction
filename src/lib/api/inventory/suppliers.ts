import { apiRequest } from "../client";
import type { Supplier } from "@/lib/inventory/inventoryTypes";

export const suppliersApi = {
  list: () => apiRequest<Supplier[]>("/api/inventory/suppliers"),
};
