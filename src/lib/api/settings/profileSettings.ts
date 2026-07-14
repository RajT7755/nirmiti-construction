import { apiRequest } from "../client";
import type { ProfileSettingsData } from "@/lib/settings/settingsTypes";

export const profileSettingsApi = {
  get: () => apiRequest<ProfileSettingsData>("/api/settings/profile"),
  update: (body: Partial<ProfileSettingsData>) =>
    apiRequest<ProfileSettingsData>("/api/settings/profile", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};