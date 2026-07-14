import { apiRequest } from "../client";
import type { BusinessProfileData } from "@/lib/settings/settingsTypes";

export const businessProfileSettingsApi = {
  get: () => apiRequest<BusinessProfileData>("/api/settings/business"),
  update: (body: Partial<BusinessProfileData>) =>
    apiRequest<BusinessProfileData>("/api/settings/business", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};