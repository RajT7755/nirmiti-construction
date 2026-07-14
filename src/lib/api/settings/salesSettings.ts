import { apiRequest } from "../client";
import type {
  InvoiceTemplateSettings,
  MessengerTemplateSettings,
  SalesSettingsData,
} from "@/lib/settings/settingsTypes";

export const salesSettingsApi = {
  get: () => apiRequest<SalesSettingsData>("/api/settings/sales"),
  update: (body: Partial<SalesSettingsData>) =>
    apiRequest<SalesSettingsData>("/api/settings/sales", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  getInvoiceTemplate: () =>
    apiRequest<InvoiceTemplateSettings>("/api/settings/sales/invoice-template"),
  updateInvoiceTemplate: (body: Partial<InvoiceTemplateSettings>) =>
    apiRequest<InvoiceTemplateSettings>("/api/settings/sales/invoice-template", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  getMessengerTemplates: () =>
    apiRequest<MessengerTemplateSettings>("/api/settings/sales/messenger-templates"),
  updateMessengerTemplates: (body: Partial<MessengerTemplateSettings>) =>
    apiRequest<MessengerTemplateSettings>("/api/settings/sales/messenger-templates", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};