/**
 * Design-phase mock aggregator — merges active + temporary + inactive booking data.
 * Replaced by customerDetailsApi / temporaryBookingsApi / inactiveCustomersApi in Phase 2.
 */
import { MOCK_CUSTOMER_DETAILS_DATA } from "./mockCustomerDetailsData";
import { MOCK_INACTIVE_CUSTOMERS } from "./mockInactiveCustomersData";
import {
  MOCK_TEMPORARY_BOOKINGS,
  temporaryToDetailProfile,
} from "./mockTemporaryBookingsData";
import type {
  BookedFlatsSummary,
  CustomerDetailProfile,
  ActiveSlabInfo,
  PaymentCategoryKey,
  InactiveCustomerRecord,
} from "./customerDetailTypes";

export type {
  BookingType,
  SlabLedgerRow,
  CategoryRow,
  CustomerDetailMock,
  CustomerDetailProfile,
  TemporaryBookingRecord,
  PaymentCategoryKey,
  InactiveCustomerRecord,
} from "./customerDetailTypes";

let runtimeInactive: InactiveCustomerRecord[] = [];
let runtimeDeactivatedIds = new Set<string>();
/** Temporary bookings released via inactive — not stored in inactive files */
let runtimeReleasedTempIds = new Set<string>();

function buildActiveList(): CustomerDetailProfile[] {
  const active = [
    ...MOCK_TEMPORARY_BOOKINGS.filter((t) => !runtimeReleasedTempIds.has(t.id)).map(
      temporaryToDetailProfile
    ),
    ...MOCK_CUSTOMER_DETAILS_DATA,
  ].filter((c) => !runtimeDeactivatedIds.has(c.id));
  return active;
}

function buildFullList(): CustomerDetailProfile[] {
  return [
    ...buildActiveList(),
    ...MOCK_INACTIVE_CUSTOMERS,
    ...runtimeInactive.filter((c) => c.bookingType !== "temporary"),
  ];
}

export const MOCK_CUSTOMER_DETAILS = buildFullList();

export function getMockCustomerDetail(id: string): CustomerDetailProfile | undefined {
  return buildFullList().find((c) => c.id === id);
}

export function getDisplayCustomers(_customers: { id: string }[]): CustomerDetailProfile[] {
  return buildFullList();
}

export function getActiveCustomers(): CustomerDetailProfile[] {
  return buildActiveList();
}

export function countBookedFlats(): BookedFlatsSummary {
  const active = buildActiveList();
  const temporary = active.filter((c) => c.bookingType === "temporary").length;
  const confirmed = active.filter(
    (c) => c.bookingType === "payment" && c.status !== "temporary"
  ).length;
  return { total: temporary + confirmed, temporary, confirmed };
}

export interface InactiveResult {
  savedToInactiveFile: boolean;
  flatReleased: boolean;
  customer: CustomerDetailProfile;
}

export function markCustomerInactive(
  customer: CustomerDetailProfile,
  reason: string,
  date: string
): InactiveResult {
  const released = {
    ...customer,
    status: "inactive" as const,
    inactiveReason: reason,
    inactiveDate: date,
    flatReleased: true,
    notes: `${customer.notes ? customer.notes + " — " : ""}Discontinued: ${reason}`,
    currentSlabLabel: "—",
  };

  runtimeDeactivatedIds.add(customer.id);

  if (customer.bookingType === "temporary") {
    runtimeReleasedTempIds.add(customer.id);
    return { savedToInactiveFile: false, flatReleased: true, customer: released };
  }

  const inactive = released as InactiveCustomerRecord;
  runtimeInactive.push(inactive);
  return { savedToInactiveFile: true, flatReleased: true, customer: inactive };
}

export function isFlatReleased(flatNo: string): boolean {
  const norm = flatNo.replace(/[\s\-]/g, "").toUpperCase();
  const fromInactive = [...MOCK_INACTIVE_CUSTOMERS, ...runtimeInactive]
    .filter((c) => c.flatReleased)
    .map((c) => c.flat.replace(/[\s\-]/g, "").toUpperCase());
  const fromTemp = MOCK_TEMPORARY_BOOKINGS.filter((t) => runtimeReleasedTempIds.has(t.id)).map(
    (t) => t.flat.replace(/[\s\-]/g, "").toUpperCase()
  );
  return fromInactive.includes(norm) || fromTemp.includes(norm);
}

export function getMockActiveSlab(customerId: string): ActiveSlabInfo | null {
  const c = getMockCustomerDetail(customerId);
  if (!c || c.status === "inactive") return null;
  const active =
    c.slabLedger.find((s) => s.status === "partial") ??
    c.slabLedger.find((s) => s.status === "pending");
  if (!active) return null;
  return {
    slabNo: active.slabNo,
    stage: active.stage,
    percentage: active.percentage,
    slabAmount: active.slabAmount,
    paidAmount: active.paidAmount,
    remainingAmount: active.remainingAmount,
  };
}

export function getMockCategoryDue(customerId: string, category: PaymentCategoryKey): number {
  const c = getMockCustomerDetail(customerId);
  if (!c || c.status === "inactive") return 0;
  const row = c.categories.find((r) => r.key === category);
  return row?.remaining ?? 0;
}