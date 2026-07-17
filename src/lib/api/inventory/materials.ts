import { apiRequest } from "../client";
import type { Material } from "@/lib/inventory/inventoryTypes";

export const materialsApi = {
  list: () => apiRequest<Material[]>("/api/inventory/materials"),
};
