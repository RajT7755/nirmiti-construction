import { apiRequest } from "../client";

export interface WorkOrderPaymentBody {
  amountTotal?: number;
  amountPaid?: number;
}

/** Work Order payment endpoints — rolls up into contractor Total / Remaining. */
export const WORK_ORDER_PAYMENTS_API = {
  basePath: "/api/inventory/work-orders",
  apiKeyEnv: ["VITE_INVENTORY_API_KEY", "VITE_API_KEY"] as const,
  payment: (woId: string) =>
    `${WORK_ORDER_PAYMENTS_API.basePath}/${encodeURIComponent(woId)}/payment`,
} as const;

export const workOrderPaymentsApi = {
  get: (woId: string) =>
    apiRequest<WorkOrderPaymentBody>(
      WORK_ORDER_PAYMENTS_API.payment(woId),
      {},
      "inventory"
    ),
  update: (woId: string, body: WorkOrderPaymentBody) =>
    apiRequest<WorkOrderPaymentBody>(
      WORK_ORDER_PAYMENTS_API.payment(woId),
      { method: "PATCH", body: JSON.stringify(body) },
      "inventory"
    ),
};
