import { apiRequest } from "../client";
import type { InventorySettingsData } from "@/lib/settings/settingsTypes";

export const inventorySettingsApi = {
  get: () => apiRequest<InventorySettingsData>("/api/settings/inventory"),
  update: (body: Partial<InventorySettingsData>) =>
    apiRequest<InventorySettingsData>("/api/settings/inventory", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};