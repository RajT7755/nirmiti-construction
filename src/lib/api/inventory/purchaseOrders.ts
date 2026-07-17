import { apiRequest } from "../client";
import type { PurchaseOrder } from "@/lib/inventory/inventoryTypes";

export const purchaseOrdersApi = {
  list: () => apiRequest<PurchaseOrder[]>("/api/inventory/purchase-orders"),
};
