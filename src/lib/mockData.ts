import type {
  Booking,
  FlatRecord,
  Investment,
  PaymentRequest,
} from "./types";

export const recentBookings: Booking[] = [];
export const recentInvestments: Investment[] = [];
export const paymentRequests: PaymentRequest[] = [];
export const costTrend: { m: string; v: number }[] = [];
export const flatData: FlatRecord[] = [];
export const donutData: { name: string; value: number }[] = [];
