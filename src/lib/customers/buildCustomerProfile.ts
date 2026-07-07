import type { BookingType, CustomerDetailProfile, CustomerStatus } from "./customerDetailTypes";
import { buildCategoryRows } from "./categoryTotals";
import { createBookingSlabRow } from "./slabAllocator";

export interface AddCustomerFormInput {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  idProof: string;
  idNumber: string;
  project: string;
  unitType: string;
  flatType: string;
  building: string;
  wing: string;
  flat: string;
  floor: number;
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
  baseAmount: number;
  gstPct: number;
  gstAmount: number;
  stampDuty: number;
  agreementPrice: number;
  electricalBill: number;
  parkingAmount: number;
  grandTotal: number;
  notes: string;
  booking10Received?: number;
}

export function buildCustomerProfile(input: AddCustomerFormInput): CustomerDetailProfile {
  const pricing = {
    baseAmount: input.baseAmount,
    gstPct: input.gstPct,
    gstAmount: input.gstAmount,
    stampDuty: input.stampDuty,
    agreementPrice: input.agreementPrice,
    electricalBill: input.electricalBill,
    parkingAmount: input.parkingAmount,
    grandTotal: input.grandTotal,
  };

  const status: CustomerStatus =
    input.bookingType === "temporary" ? "temporary" : "active";

  const received = input.booking10Received ?? 0;
  const slabLedger =
    input.bookingType === "payment" && input.grandTotal > 0
      ? [createBookingSlabRow(input.grandTotal, received)]
      : [];

  const categories = buildCategoryRows(pricing);
  if (received > 0 && slabLedger.length > 0) {
    const flatPaid = slabLedger[0].paidAmount;
    categories[0] = {
      ...categories[0],
      paid: flatPaid,
      remaining: Math.max(0, categories[0].due - flatPaid),
    };
  }

  return {
    id: input.id,
    name: input.name,
    flat: input.flat,
    floor: input.floor,
    project: input.project,
    status,
    amount: input.grandTotal,
    phone: input.phone,
    email: input.email,
    address: input.address,
    idProof: input.idProof,
    idNumber: input.idNumber,
    unitType: input.unitType,
    flatType: input.flatType,
    building: input.building,
    wing: input.wing,
    area: input.area,
    parking: input.parking,
    loanStatus: input.loanStatus,
    bankName: input.bankName,
    branchName: input.branchName,
    bankAddress: input.bankAddress,
    loanAmount: input.loanAmount,
    bankEmail: input.bankEmail,
    bookingType: input.bookingType,
    holdingDueDate: input.holdingDueDate,
    pricing,
    bookingSlab10:
      received > 0 ? { amount: Math.round(input.grandTotal * 0.1), received } : undefined,
    slabLedger,
    categories,
    notes: input.notes,
    currentSlabLabel: slabLedger.length > 0 ? "Slab #0 — 10% Booking" : "—",
  };
}