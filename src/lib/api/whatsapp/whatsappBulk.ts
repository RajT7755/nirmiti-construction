import { apiRequest } from "../client";

export interface WhatsAppBulkRecipient {
  customerId: string;
  phone: string;
  variables: Record<string, string>;
}

export interface WhatsAppBulkRequest {
  templateName: string;
  languageCode?: string;
  slabId?: string;
  recipients: WhatsAppBulkRecipient[];
}

export interface WhatsAppBulkResponse {
  batchId: string;
  total: number;
  queued: number;
  status: "processing" | "completed" | "partial" | "failed";
}

export interface WhatsAppBulkStatus {
  batchId: string;
  total: number;
  sent: number;
  delivered: number;
  failed: number;
  status: WhatsAppBulkResponse["status"];
  failures?: { customerId: string; error: string }[];
}

/**
 * WhatsApp Business Cloud API — bulk slab reminder send.
 * Backend: POST /api/whatsapp/bulk, GET /api/whatsapp/bulk/:batchId
 *
 * Skips customers whose slabs were auto-settled by overpayment (no message sent).
 */
export const whatsappBulkApi = {
  sendBulk: (body: WhatsAppBulkRequest) =>
    apiRequest<WhatsAppBulkResponse>("/api/whatsapp/bulk", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getStatus: (batchId: string) =>
    apiRequest<WhatsAppBulkStatus>(`/api/whatsapp/bulk/${batchId}`),

  cancel: (batchId: string) =>
    apiRequest<{ cancelled: boolean }>(`/api/whatsapp/bulk/${batchId}/cancel`, {
      method: "POST",
    }),
};