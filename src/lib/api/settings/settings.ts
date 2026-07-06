import { apiRequest } from "../client";

export const settingsApi = {
  get: () => apiRequest<Record<string, unknown>>("/api/settings"),
};
