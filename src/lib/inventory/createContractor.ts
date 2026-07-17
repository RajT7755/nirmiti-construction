import type { Contractor, ContractorStatus } from "./inventoryTypes";
import { formatContractorId } from "@/lib/settings/defaultSettings";

export interface AddContractorFormInput {
  name: string;
  workProfile: string;
  workCategories: string[];
  phone?: string;
  email?: string;
  address?: string;
  pinCode?: string;
  gstin?: string;
  paymentTotal?: number;
  paymentRemaining?: number;
  status?: ContractorStatus;
  idPrefix: string;
  idNext: number;
}

export function buildContractorFromForm(input: AddContractorFormInput): Contractor {
  const workProfile = input.workProfile.trim();
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
    id: formatContractorId(input.idPrefix, input.idNext),
    name: input.name.trim(),
    workProfile,
    workCategories: [...input.workCategories],
    phone: input.phone?.trim() || undefined,
    email: input.email?.trim() || undefined,
    address: input.address?.trim() || undefined,
    pinCode: input.pinCode?.trim() || undefined,
    gstin: input.gstin?.trim() || undefined,
    paymentTotal: total,
    paymentRemaining: remaining,
    status: input.status ?? "active",
    trade: workProfile || undefined,
  };
}

export function normalizeContractor(c: Contractor): Contractor {
  const total = c.paymentTotal ?? 0;
  const remaining = c.paymentRemaining ?? 0;
  return {
    ...c,
    workProfile: c.workProfile ?? c.trade ?? "",
    workCategories: c.workCategories ?? [],
    paymentTotal: total,
    paymentRemaining: remaining > total ? total : remaining,
    status: c.status === "inactive" ? "inactive" : "active",
  };
}
