import { apiRequest } from "../client";
import type {
  BookedFlatsSummary,
  CustomerDetailProfile,
  TemporaryBookingRecord,
} from "@/lib/customers/customerDetailTypes";

/**
 * Temporary booking API — Booked Flats card + Proceed flow.
 * Backend: GET /api/customers/temporary-bookings, GET /api/customers/booked-flats
 */
export const temporaryBookingsApi = {
  list: () => apiRequest<TemporaryBookingRecord[]>("/api/customers/temporary-bookings"),

  summary: () => apiRequest<BookedFlatsSummary>("/api/customers/booked-flats"),

  proceed: (
    customerId: string,
    body?: { initialPayment?: { amount: number; method: string; date: string } }
  ) =>
    apiRequest<CustomerDetailProfile>(`/api/customers/${customerId}/proceed`, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  release: (customerId: string) =>
    apiRequest<{ released: boolean }>(`/api/customers/${customerId}/release`, {
      method: "POST",
    }),
};