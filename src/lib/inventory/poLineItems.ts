import type { PoLineItem, PurchaseOrder, PurchaseRequest } from "./inventoryTypes";
import { defaultLineTotal } from "./poTotals";

/** Normalize PO/request into line items (legacy single-line → one item). */
export function resolvePoLineItems(
  doc: Pick<
    PurchaseRequest | PurchaseOrder,
    | "items"
    | "materialId"
    | "materialName"
    | "productDescription"
    | "unit"
    | "quantity"
    | "unitPrice"
  > & { lineTotal?: number; subTotal?: number }
): PoLineItem[] {
  if (doc.items && doc.items.length > 0) {
    return doc.items.map((it) => ({
      materialId: it.materialId,
      materialName: it.materialName || "—",
      productDescription: it.productDescription || "",
      unit: it.unit || "nos",
      quantity: Math.max(0, Number(it.quantity) || 0),
      unitPrice: Math.max(0, Number(it.unitPrice) || 0),
      lineTotal: Math.max(
        0,
        Number(it.lineTotal) ||
          defaultLineTotal(Number(it.quantity) || 0, Number(it.unitPrice) || 0)
      ),
    }));
  }
  const qty = Math.max(0, Number(doc.quantity) || 0);
  const price = Math.max(0, Number(doc.unitPrice) || 0);
  const lineTotal =
    typeof doc.lineTotal === "number"
      ? Math.max(0, doc.lineTotal)
      : typeof doc.subTotal === "number"
        ? Math.max(0, doc.subTotal)
        : defaultLineTotal(qty, price);
  return [
    {
      materialId: doc.materialId,
      materialName: doc.materialName || "—",
      productDescription:
        ("productDescription" in doc ? doc.productDescription : "") || "",
      unit: doc.unit || "nos",
      quantity: qty,
      unitPrice: price,
      lineTotal,
    },
  ];
}

export function sumPoLineTotals(items: PoLineItem[]): number {
  return items.reduce((s, it) => s + Math.max(0, Number(it.lineTotal) || 0), 0);
}

export function summarizePoItems(items: PoLineItem[]): {
  materialId?: string;
  materialName: string;
  productDescription: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
} {
  const clean = items.filter((it) => it.materialName.trim() || it.quantity > 0);
  const list = clean.length ? clean : items;
  const first = list[0];
  const lineTotal = sumPoLineTotals(list);
  const materialName =
    list.length <= 1
      ? first?.materialName || "—"
      : `${first?.materialName || "Item"}${list.length > 1 ? ` +${list.length - 1} more` : ""}`;
  return {
    materialId: first?.materialId,
    materialName,
    productDescription: list
      .map((it) => it.productDescription || it.materialName)
      .filter(Boolean)
      .join("; "),
    unit: first?.unit || "nos",
    quantity: list.reduce((s, it) => s + (Number(it.quantity) || 0), 0),
    unitPrice: first?.unitPrice ?? 0,
    lineTotal,
  };
}
