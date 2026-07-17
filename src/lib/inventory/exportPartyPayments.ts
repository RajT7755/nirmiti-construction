import type { PartyReceivedPayment } from "./partyPaymentTypes";

export function partyPaymentsToExportRows(payments: PartyReceivedPayment[]): {
  headers: string[];
  rows: (string | number)[][];
} {
  return {
    headers: [
      "Receipt No",
      "Date",
      "Name",
      "Type",
      "PO / WO",
      "Description",
      "Done",
      "Remaining",
      "Method",
      "Note",
    ],
    rows: payments.map((p) => [
      p.id,
      p.date,
      p.partyName,
      p.partyType,
      p.sourceId,
      p.materialDescription || p.workDescription || "",
      p.received,
      p.remainingAfter,
      p.method,
      p.note ?? "",
    ]),
  };
}
