import { apiRequest } from "../client";

/** Future backend: Work Order request WhatsApp messaging. */
export const WORK_ORDER_REQUEST_MESSENGER_API = {
  basePath: "/api/messenger/work-order-request",
  apiKeyEnv: ["VITE_API_KEY"] as const,
  send: () => `${WORK_ORDER_REQUEST_MESSENGER_API.basePath}/send`,
  preview: () => `${WORK_ORDER_REQUEST_MESSENGER_API.basePath}/preview`,
} as const;

export interface MessengerWoRequestSendBody {
  template: string;
  templateName?: string;
  recipients: {
    partyId: string;
    partyName: string;
    phone: string;
    variables: Record<string, string>;
  }[];
}

export const messengerWorkOrderRequestApi = {
  send: (body: MessengerWoRequestSendBody) =>
    apiRequest<{ ok: boolean; batchId?: string }>(
      WORK_ORDER_REQUEST_MESSENGER_API.send(),
      { method: "POST", body: JSON.stringify(body) }
    ),
  preview: (body: { template: string; variables: Record<string, string> }) =>
    apiRequest<{ text: string }>(WORK_ORDER_REQUEST_MESSENGER_API.preview(), {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
