import { apiRequest } from "../client";
import type { Contractor } from "@/lib/inventory/inventoryTypes";

export const contractorsApi = {
  list: () => apiRequest<Contractor[]>("/api/inventory/contractors"),
};
