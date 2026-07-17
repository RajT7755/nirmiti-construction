import { apiRequest } from "../client";
import type { WorkOrder } from "@/lib/inventory/inventoryTypes";

export const workOrdersApi = {
  list: () => apiRequest<WorkOrder[]>("/api/inventory/work-orders"),
};
