import { apiRequest } from "../client";

/** Future backend: PO request WhatsApp messaging. */
export const PO_REQUEST_MESSENGER_API = {
  basePath: "/api/messenger/po-request",
  apiKeyEnv: ["VITE_API_KEY"] as const,
  send: () => `${PO_REQUEST_MESSENGER_API.basePath}/send`,
  preview: () => `${PO_REQUEST_MESSENGER_API.basePath}/preview`,
} as const;

export interface MessengerPoRequestSendBody {
  template: string;
  templateName?: string;
  recipients: {
    partyId: string;
    partyName: string;
    phone: string;
    variables: Record<string, string>;
  }[];
}

export const messengerPoRequestApi = {
  send: (body: MessengerPoRequestSendBody) =>
    apiRequest<{ ok: boolean; batchId?: string }>(
      PO_REQUEST_MESSENGER_API.send(),
      { method: "POST", body: JSON.stringify(body) }
    ),
  preview: (body: { template: string; variables: Record<string, string> }) =>
    apiRequest<{ text: string }>(PO_REQUEST_MESSENGER_API.preview(), {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
