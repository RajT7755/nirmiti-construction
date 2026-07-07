import { apiRequest } from "../client";
import type { InactiveCustomerRecord } from "@/lib/customers/customerDetailTypes";

export interface DeactivateCustomerRequest {
  reason: string;
  date: string;
}

export interface DeactivateCustomerResponse {
  customer: InactiveCustomerRecord;
  flatReleased: boolean;
}

/**
 * Inactive customers API — discontinued bookings, flat release.
 * Backend: GET /api/customers/inactive, POST /api/customers/:id/deactivate
 */
export const inactiveCustomersApi = {
  list: () => apiRequest<InactiveCustomerRecord[]>("/api/customers/inactive"),

  deactivate: (customerId: string, body: DeactivateCustomerRequest) =>
    apiRequest<DeactivateCustomerResponse>(`/api/customers/${customerId}/deactivate`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
};