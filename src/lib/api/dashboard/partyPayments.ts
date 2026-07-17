import { apiRequest } from "../client";
import type {
  AddPartyReceivedPaymentInput,
  PartyReceivedPayment,
} from "@/lib/inventory/partyPaymentTypes";

/** Future backend — supplier/contractor received payments (not customer sales). */
export const PARTY_PAYMENTS_API = {
  basePath: "/api/dashboard/party-payments",
  list: () => PARTY_PAYMENTS_API.basePath,
  get: (id: string) =>
    `${PARTY_PAYMENTS_API.basePath}/${encodeURIComponent(id)}`,
  create: () => PARTY_PAYMENTS_API.basePath,
} as const;

export const partyPaymentsApi = {
  list: () => apiRequest<PartyReceivedPayment[]>(PARTY_PAYMENTS_API.list()),
  get: (id: string) =>
    apiRequest<PartyReceivedPayment>(PARTY_PAYMENTS_API.get(id)),
  create: (body: AddPartyReceivedPaymentInput) =>
    apiRequest<PartyReceivedPayment>(PARTY_PAYMENTS_API.create(), {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
