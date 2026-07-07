import { apiRequest } from "../client";
import type { CustomerDetailProfile } from "@/lib/customers/customerDetailTypes";

/**
 * Customer full-profile API — all fields from Add Customer form + payment ledger.
 * Backend: GET /api/customers/:id/details, GET /api/customers/details
 */
export const customerDetailsApi = {
  list: () => apiRequest<CustomerDetailProfile[]>("/api/customers/details"),

  get: (customerId: string) =>
    apiRequest<CustomerDetailProfile>(`/api/customers/${customerId}/details`),

  update: (customerId: string, body: Partial<CustomerDetailProfile>) =>
    apiRequest<CustomerDetailProfile>(`/api/customers/${customerId}/details`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};