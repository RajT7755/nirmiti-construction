import { apiRequest } from "../client";

/**
 * Email send — separate from WhatsApp.
 * Backend: POST /api/email/send (Resend / Brevo / SMTP).
 */
export const EMAIL_API = {
  basePath: "/api/email",
  send: () => `${EMAIL_API.basePath}/send`,
  apiKeyEnv: ["VITE_API_KEY"] as const,
} as const;

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailSendBody {
  fromName: string;
  to: EmailRecipient[];
  subject: string;
  body: string;
  purpose?: "bank_loan_approval";
  customerId?: string;
}

export const emailSendApi = {
  send: (body: EmailSendBody) =>
    apiRequest<{ ok: boolean; messageId?: string }>(EMAIL_API.send(), {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
