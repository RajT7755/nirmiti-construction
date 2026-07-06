import { apiRequest } from "../client";
import type { DashboardSummary } from "@/lib/types";

export const salesApi = {
  summary: () => apiRequest<DashboardSummary>("/api/sales/summary"),
};
