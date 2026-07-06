import { apiRequest } from "../client";
import type { SlabEntry } from "@/lib/types";

export const paymentSlabsApi = {
  list: () => apiRequest<SlabEntry[]>("/api/payment-slabs"),
  create: (body: Omit<SlabEntry, "id">) =>
    apiRequest<SlabEntry>("/api/payment-slabs", { method: "POST", body: JSON.stringify(body) }),
};
