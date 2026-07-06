import { apiRequest } from "../client";
import type { DashboardSummary } from "@/lib/types";

export const dashboardApi = {
  summary: () => apiRequest<DashboardSummary>("/api/dashboard"),
};
