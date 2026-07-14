import { apiRequest } from "../client";
import type { ModuleSettingsData } from "@/lib/settings/settingsTypes";

export const inventorySettingsApi = {
  get: () => apiRequest<ModuleSettingsData>("/api/settings/inventory"),
  update: (body: Partial<ModuleSettingsData>) =>
    apiRequest<ModuleSettingsData>("/api/settings/inventory", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};