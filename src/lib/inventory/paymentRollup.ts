import type { PurchaseOrder, WorkOrder } from "./inventoryTypes";
import type {
  PartyPaymentLine,
  PartyPaymentSummary,
  PaymentPartyType,
} from "./paymentLedgerTypes";
import { isPoPayable } from "./poTotals";
import { isWoPayable } from "./workOrderStock";

export function lineRemaining(line: PartyPaymentLine): number {
  return Math.max(0, line.amountTotal - line.amountPaid);
}

export function summarizePartyPayments(
  partyType: PaymentPartyType,
  partyId: string,
  lines: PartyPaymentLine[]
): PartyPaymentSummary {
  const partyLines = lines.filter(
    (l) => l.partyType === partyType && l.partyId === partyId
  );
  const paymentTotal = partyLines.reduce((s, l) => s + l.amountTotal, 0);
  const paymentPaid = partyLines.reduce((s, l) => s + l.amountPaid, 0);
  return {
    partyId,
    partyType,
    paymentTotal,
    paymentPaid,
    paymentRemaining: Math.max(0, paymentTotal - paymentPaid),
    lines: partyLines,
  };
}

/**
 * Build ledger lines from PO payment fields for a supplier.
 * Only payable POs (unique purchase id, grand/amount total > 0) — never supplier master fields.
 */
export function linesFromPurchaseOrders(
  supplierId: string,
  orders: PurchaseOrder[]
): PartyPaymentLine[] {
  return orders
    .filter((po) => po.supplierId === supplierId && isPoPayable(po))
    .map((po) => {
      const amountTotal = po.grandTotal ?? po.amountTotal ?? 0;
      const amountPaid = po.amountPaid ?? 0;
      return {
        id: `pay-po-${po.id}`,
        partyType: "supplier" as const,
        partyId: supplierId,
        sourceType: "purchase_order" as const,
        sourceId: po.id,
        amountTotal,
        amountPaid,
        note: `${po.id} — ${po.materialName}`,
        date: po.orderDate,
      };
    });
}

/** Build ledger lines from payable Work Orders only (unique WO id). */
export function linesFromWorkOrders(
  contractorId: string,
  orders: WorkOrder[]
): PartyPaymentLine[] {
  return orders
    .filter((wo) => wo.contractorId === contractorId && isWoPayable(wo))
    .map((wo) => {
      const amountTotal = wo.amountTotal ?? 0;
      const amountPaid = wo.amountPaid ?? 0;
      return {
        id: `pay-wo-${wo.id}`,
        partyType: "contractor" as const,
        partyId: contractorId,
        sourceType: "work_order" as const,
        sourceId: wo.id,
        amountTotal,
        amountPaid,
        note: `${wo.id} — ${wo.title}`,
        date: wo.startDate,
      };
    });
}

export function rollupSupplierPayments(
  supplierId: string,
  purchaseOrders: PurchaseOrder[],
  ledger: PartyPaymentLine[] = []
): PartyPaymentSummary {
  const fromPo = linesFromPurchaseOrders(supplierId, purchaseOrders);
  const manual = ledger.filter(
    (l) =>
      l.partyType === "supplier" &&
      l.partyId === supplierId &&
      l.sourceType === "manual"
  );
  return summarizePartyPayments("supplier", supplierId, [...fromPo, ...manual]);
}

export function rollupContractorPayments(
  contractorId: string,
  workOrders: WorkOrder[],
  ledger: PartyPaymentLine[] = []
): PartyPaymentSummary {
  const fromWo = linesFromWorkOrders(contractorId, workOrders);
  const manual = ledger.filter(
    (l) =>
      l.partyType === "contractor" &&
      l.partyId === contractorId &&
      l.sourceType === "manual"
  );
  return summarizePartyPayments("contractor", contractorId, [...fromWo, ...manual]);
}
