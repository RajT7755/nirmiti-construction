import { apiRequest } from "../client";

export interface WhatsAppTemplate {
  id: string;
  name: string;
  language: string;
  body: string;
  variables: string[];
}

export interface WhatsAppSendRequest {
  to: string;
  templateName: string;
  languageCode?: string;
  variables: Record<string, string>;
}

export interface WhatsAppSendResponse {
  messageId: string;
  status: "queued" | "sent" | "delivered" | "failed";
}

/**
 * WhatsApp Business Cloud API — single message send.
 * Backend proxies Meta Graph API: POST /api/whatsapp/send
 *
 * Env (server-side): WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN, WHATSAPP_API_VERSION
 */
export const whatsappApi = {
  getTemplates: () => apiRequest<WhatsAppTemplate[]>("/api/whatsapp/templates"),

  send: (body: WhatsAppSendRequest) =>
    apiRequest<WhatsAppSendResponse>("/api/whatsapp/send", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getMessageStatus: (messageId: string) =>
    apiRequest<WhatsAppSendResponse>(`/api/whatsapp/messages/${messageId}`),
};