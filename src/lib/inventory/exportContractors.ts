import type { Contractor } from "./inventoryTypes";

export function contractorsToExportRows(contractors: Contractor[]): {
  headers: string[];
  rows: (string | number)[][];
} {
  return {
    headers: [
      "Contractor id",
      "Name",
      "Work profile",
      "Work categories",
      "Phone",
      "Email",
      "Address",
      "Pincode",
      "Total",
      "Remaining",
      "Status",
    ],
    rows: contractors.map((c) => [
      c.id,
      c.name,
      c.workProfile ?? c.trade ?? "",
      (c.workCategories ?? []).join("; "),
      c.phone ?? "",
      c.email ?? "",
      c.address ?? "",
      c.pinCode ?? "",
      c.paymentTotal ?? 0,
      c.paymentRemaining ?? 0,
      c.status ?? "active",
    ]),
  };
}
