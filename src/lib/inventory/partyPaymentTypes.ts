/** Payments made against supplier POs / contractor WOs (dashboard payment log). */

export type PartyPayType = "supplier" | "contractor";
export type PartyPaySource = "purchase_order" | "work_order";

/**
 * Unique Receipt No for party payment log / print.
 * Format: PAY-S-XXXXXXXX or PAY-C-XXXXXXXX (base36 time + optional salt).
 */
export function nextPartyReceiptId(
  partyType: PartyPayType,
  existingIds: Iterable<string> = []
): string {
  const prefix = partyType === "supplier" ? "PAY-S" : "PAY-C";
  const taken = new Set(existingIds);
  let n = Date.now();
  for (let i = 0; i < 32; i++) {
    const id = `${prefix}-${(n + i).toString(36).toUpperCase()}`;
    if (!taken.has(id)) return id;
  }
  return `${prefix}-${Date.now().toString(36).toUpperCase()}${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
}

export interface PartyReceivedPayment {
  id: string;
  partyType: PartyPayType;
  partyId: string;
  partyName: string;
  sourceType: PartyPaySource;
  sourceId: string;
  /** Payable total on PO/WO at time of payment */
  amountTotal: number;
  amountRemainingBefore: number;
  /** Amount paid in this transaction */
  received: number;
  remainingAfter: number;
  method: string;
  date: string;
  note?: string;
  /** PO material + description snapshot */
  materialDescription?: string;
  /** WO work description snapshot */
  workDescription?: string;
  /** Party address snapshot for receipt To block */
  partyAddress?: string;
  /** Party GSTIN snapshot for receipt To block */
  partyGstin?: string;
  status: "recorded";
}

export interface AddPartyReceivedPaymentInput {
  partyType: PartyPayType;
  partyId: string;
  partyName: string;
  sourceType: PartyPaySource;
  sourceId: string;
  received: number;
  method: string;
  date: string;
  note?: string;
}
