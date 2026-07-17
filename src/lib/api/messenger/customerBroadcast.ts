import { apiRequest } from "../client";

/** Future backend: multi-customer WhatsApp broadcast. */
export const CUSTOMER_BROADCAST_MESSENGER_API = {
  basePath: "/api/messenger/customer-broadcast",
  apiKeyEnv: ["VITE_API_KEY"] as const,
  send: () => `${CUSTOMER_BROADCAST_MESSENGER_API.basePath}/send`,
} as const;

export interface MessengerCustomerBroadcastSendBody {
  template: string;
  templateName?: string;
  recipients: {
    customerId: string;
    name: string;
    phone: string;
    variables: Record<string, string>;
  }[];
}

export const messengerCustomerBroadcastApi = {
  send: (body: MessengerCustomerBroadcastSendBody) =>
    apiRequest<{ ok: boolean; batchId?: string }>(
      CUSTOMER_BROADCAST_MESSENGER_API.send(),
      { method: "POST", body: JSON.stringify(body) }
    ),
};
