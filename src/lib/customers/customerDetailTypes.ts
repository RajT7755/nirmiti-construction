/** Shared customer detail types — used by UI mock data and API stubs (Phase 2) */

export type BookingType = "payment" | "temporary";

export type CustomerStatus =
  | "active"
  | "inactive"
  | "temporary"
  | "overdue"
  | "paid";

export type PaymentCategoryKey =
  | "flat"
  | "gst"
  | "stamp"
  | "agreement"
  | "parking"
  | "electrical";

export interface SlabLedgerRow {
  slabNo: number;
  stage: string;
  percentage: number;
  slabAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: "pending" | "partial" | "received";
  autoSettled?: boolean;
}

export interface CategoryRow {
  key: PaymentCategoryKey;
  label: string;
  due: number;
  paid: number;
  remaining: number;
}

export interface CustomerPricing {
  baseAmount: number;
  gstPct: number;
  gstAmount: number;
  stampDuty: number;
  agreementPrice: number;
  electricalBill: number;
  parkingAmount: number;
  grandTotal: number;
}

export interface CustomerDetailProfile {
  id: string;
  name: string;
  flat: string;
  floor: number;
  project: string;
  status: CustomerStatus;
  inactiveReason?: string;
  inactiveDate?: string;
  flatReleased?: boolean;
  amount: number;
  phone: string;
  email: string;
  address: string;
  idProof: string;
  idNumber: string;
  unitType: string;
  flatType: string;
  building: string;
  wing: string;
  area: string;
  parking: "open" | "closed" | "no";
  loanStatus: "No" | "Yes" | "Maybe";
  bankName?: string;
  branchName?: string;
  bankAddress?: string;
  loanAmount?: number;
  bankEmail?: string;
  bookingType: BookingType | null;
  holdingDueDate?: string;
  pricing: CustomerPricing;
  bookingSlab10?: { amount: number; received: number };
  slabLedger: SlabLedgerRow[];
  categories: CategoryRow[];
  notes: string;
  currentSlabLabel: string;
}

/** @deprecated Use CustomerDetailProfile — kept for existing imports */
export type CustomerDetailMock = CustomerDetailProfile;

export interface TemporaryBookingRecord {
  id: string;
  name: string;
  flat: string;
  floor: number;
  project: string;
  building: string;
  wing: string;
  flatType: string;
  area: string;
  parking: "open" | "closed" | "no";
  phone: string;
  email: string;
  address: string;
  idProof: string;
  idNumber: string;
  holdingDueDate: string;
  amount: number;
  pricing: CustomerPricing;
  notes: string;
  status: "temporary";
  bookingType: "temporary";
}

export interface BookedFlatsSummary {
  total: number;
  temporary: number;
  confirmed: number;
}

export interface InactiveCustomerRecord extends CustomerDetailProfile {
  status: "inactive";
  inactiveReason: string;
  inactiveDate: string;
  flatReleased: true;
}

export interface ActiveSlabInfo {
  slabNo: number;
  stage: string;
  percentage: number;
  slabAmount: number;
  paidAmount: number;
  remainingAmount: number;
}