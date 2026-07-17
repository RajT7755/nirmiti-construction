export type PaymentPartyType = "supplier" | "contractor";
export type PaymentSourceType = "purchase_order" | "work_order" | "manual";

/** One payment line linked to a PO or Work Order (or manual). */
export interface PartyPaymentLine {
  id: string;
  partyType: PaymentPartyType;
  partyId: string;
  sourceType: PaymentSourceType;
  sourceId: string;
  amountTotal: number;
  amountPaid: number;
  note?: string;
  date: string;
}

export interface PartyPaymentSummary {
  partyId: string;
  partyType: PaymentPartyType;
  paymentTotal: number;
  paymentRemaining: number;
  paymentPaid: number;
  lines: PartyPaymentLine[];
}
