import { apiRequest } from "../client";
import type { ModuleSettingsData } from "@/lib/settings/settingsTypes";

export const customerSettingsApi = {
  get: () => apiRequest<ModuleSettingsData>("/api/settings/customers"),
  update: (body: Partial<ModuleSettingsData>) =>
    apiRequest<ModuleSettingsData>("/api/settings/customers", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};