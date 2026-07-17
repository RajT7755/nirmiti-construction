import type { Supplier, SupplierStatus } from "./inventoryTypes";
import { formatSupplierId } from "@/lib/settings/defaultSettings";

export interface AddSupplierFormInput {
  name: string;
  workCategories: string[];
  phone?: string;
  email?: string;
  address?: string;
  pinCode?: string;
  gstin?: string;
  paymentTotal?: number;
  paymentRemaining?: number;
  status?: SupplierStatus;
  idPrefix: string;
  idNext: number;
}

export function buildSupplierFromForm(input: AddSupplierFormInput): Supplier {
  const total =
    typeof input.paymentTotal === "number" && !Number.isNaN(input.paymentTotal)
      ? Math.max(0, input.paymentTotal)
      : 0;
  let remaining =
    typeof input.paymentRemaining === "number" && !Number.isNaN(input.paymentRemaining)
      ? Math.max(0, input.paymentRemaining)
      : 0;
  if (remaining > total) remaining = total;

  return {
    id: formatSupplierId(input.idPrefix, input.idNext),
    name: input.name.trim(),
    workCategories: [...input.workCategories],
    phone: input.phone?.trim() || undefined,
    email: input.email?.trim() || undefined,
    address: input.address?.trim() || undefined,
    pinCode: input.pinCode?.trim() || undefined,
    gstin: input.gstin?.trim() || undefined,
    paymentTotal: total,
    paymentRemaining: remaining,
    status: input.status ?? "active",
  };
}

export function normalizeSupplier(s: Supplier): Supplier {
  const legacy = s.payment ?? 0;
  const total = s.paymentTotal ?? legacy;
  const remaining = s.paymentRemaining ?? legacy;
  return {
    ...s,
    workCategories: s.workCategories ?? [],
    paymentTotal: total,
    paymentRemaining: remaining > total ? total : remaining,
    status: s.status === "inactive" ? "inactive" : "active",
  };
}
