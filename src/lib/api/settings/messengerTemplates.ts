import { apiRequest } from "../client";
import type { MessengerTemplateSettings } from "@/lib/settings/settingsTypes";

export const messengerTemplatesApi = {
  get: () => apiRequest<MessengerTemplateSettings>("/api/settings/sales/messenger-templates"),
  update: (body: Partial<MessengerTemplateSettings>) =>
    apiRequest<MessengerTemplateSettings>("/api/settings/sales/messenger-templates", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};