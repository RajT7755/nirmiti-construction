import { apiRequest } from "../client";
import type { ReceivedPayment } from "@/lib/types";

export const receivedPaymentsApi = {
  list: () => apiRequest<ReceivedPayment[]>("/api/received-payments"),
  create: (body: Omit<ReceivedPayment, "id">) =>
    apiRequest<ReceivedPayment>("/api/received-payments", { method: "POST", body: JSON.stringify(body) }),
  update: (id: string, body: Partial<ReceivedPayment>) =>
    apiRequest<ReceivedPayment>(`/api/received-payments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};
