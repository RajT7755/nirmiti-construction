/**
 * API client stubs for connecting to the Express backend on the main branch.
 * Not wired to the UI yet — see README.md "Backend Connection Guide".
 *
 * Start backend (from main branch):
 *   git checkout main && npm run server:dev
 */

import type {
  Booking,
  Customer,
  DashboardSummary,
  FlatRecord,
  Investment,
  PaymentRequest,
  ProjectData,
  ReceivedPayment,
  SlabEntry,
} from "./types";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

/** Existing endpoints (main branch server/index.js) */
export const api = {
  health: () => request<{ status: string; service: string; timestamp: string }>("/api/health"),
  dashboard: () => request<DashboardSummary>("/api/dashboard"),
  customers: {
    list: () => request<Customer[]>("/api/customers"),
    create: (body: Omit<Customer, "id">) =>
      request<Customer>("/api/customers", { method: "POST", body: JSON.stringify(body) }),
  },
  flats: () => request<FlatRecord[]>("/api/flats"),
  bookings: () => request<Booking[]>("/api/bookings"),
  investments: () => request<Investment[]>("/api/investments"),
  payments: () => request<PaymentRequest[]>("/api/payments"),

  /** Proposed v2 endpoints — add these to server/index.js on main when ready */
  projects: {
    list: () => request<ProjectData[]>("/api/projects"),
    create: (body: ProjectData) =>
      request<ProjectData>("/api/projects", { method: "POST", body: JSON.stringify(body) }),
  },
  paymentSlabs: {
    list: () => request<SlabEntry[]>("/api/payment-slabs"),
    create: (body: Omit<SlabEntry, "id">) =>
      request<SlabEntry>("/api/payment-slabs", { method: "POST", body: JSON.stringify(body) }),
  },
  receivedPayments: {
    list: () => request<ReceivedPayment[]>("/api/received-payments"),
    create: (body: Omit<ReceivedPayment, "id">) =>
      request<ReceivedPayment>("/api/received-payments", { method: "POST", body: JSON.stringify(body) }),
  },
};

export { API_BASE };