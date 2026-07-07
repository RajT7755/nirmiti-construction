import type { CustomerDetailProfile } from "./customerDetailTypes";

export type FlatGridStatus = "available" | "temporary" | "confirmed";

function normalizeFlat(flat: string): string {
  return flat.replace(/[\s\-]/g, "").toUpperCase();
}

/** Trailing digits from flat label: "B-204" → "204", "105" → "105" */
function extractFlatNumber(flat: string): string {
  const match = flat.trim().match(/(\d+)$/);
  return match ? match[1] : "";
}

/** Match grid unit short no. (e.g. "204") to customer flat (e.g. "B-204") — exact only. */
export function flatKeysMatch(
  customerFlat: string,
  unitShort: string,
  unitNumber?: string
): boolean {
  const normShort = normalizeFlat(unitShort);
  if (!normShort || !customerFlat.trim()) return false;

  const flatNum = extractFlatNumber(customerFlat);
  const normCustomer = normalizeFlat(customerFlat);

  // Exact numeric match (primary path)
  if (flatNum && normShort === flatNum) return true;

  // Full code match (e.g. "B204" === "B204")
  if (normCustomer === normShort) return true;

  // Full flat id in unit path, only when unit ends with same digit suffix
  if (
    flatNum &&
    flatNum.length >= 2 &&
    unitNumber &&
    normalizeFlat(unitNumber).endsWith(flatNum) &&
    normShort === flatNum
  ) {
    return true;
  }

  return false;
}

export function findCustomerForFlat(
  flatNo: string,
  unitNumber: string,
  profiles: CustomerDetailProfile[],
  project?: string
): CustomerDetailProfile | undefined {
  return profiles.find(
    (c) =>
      c.status !== "inactive" &&
      (!project || c.project === project) &&
      flatKeysMatch(c.flat, flatNo, unitNumber)
  );
}

export function resolveFlatGridStatus(
  flatNo: string,
  unitNumber: string,
  profiles: CustomerDetailProfile[],
  isReleased: boolean,
  project?: string
): { status: FlatGridStatus; occupant: string | null; customerId?: string } {
  if (isReleased) return { status: "available", occupant: null };

  const customer = findCustomerForFlat(flatNo, unitNumber, profiles, project);
  if (!customer) return { status: "available", occupant: null };

  if (customer.bookingType === "temporary") {
    return { status: "temporary", occupant: customer.name, customerId: customer.id };
  }

  return { status: "confirmed", occupant: customer.name, customerId: customer.id };
}

export function flatGridColorClass(status: FlatGridStatus): string {
  if (status === "confirmed") return "bg-green-100 text-green-700 border-green-300";
  if (status === "temporary") return "bg-orange-100 text-orange-700 border-orange-300";
  return "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer";
}

export function flatGridStatusLabel(status: FlatGridStatus): string {
  if (status === "confirmed") return "Confirmed";
  if (status === "temporary") return "Temporary";
  return "Available";
}