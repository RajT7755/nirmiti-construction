import type { Supplier } from "./inventoryTypes";

export function suppliersToExportRows(suppliers: Supplier[]): {
  headers: string[];
  rows: (string | number)[][];
} {
  return {
    headers: [
      "Supplier id",
      "Name",
      "Work categories",
      "Phone",
      "Email",
      "Address",
      "Pincode",
      "Total",
      "Remaining",
      "Status",
    ],
    rows: suppliers.map((s) => [
      s.id,
      s.name,
      (s.workCategories ?? []).join("; "),
      s.phone ?? "",
      s.email ?? "",
      s.address ?? "",
      s.pinCode ?? "",
      s.paymentTotal ?? s.payment ?? 0,
      s.paymentRemaining ?? s.payment ?? 0,
      s.status ?? "active",
    ]),
  };
}
