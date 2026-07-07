/**
 * Temporary booking mock data — powers Booked Flats master card & Proceed flow.
 * Kept separate from payment customer details (mockCustomerDetailsData.ts).
 */
import type { CustomerDetailProfile, TemporaryBookingRecord } from "./customerDetailTypes";

export const MOCK_TEMPORARY_BOOKINGS: TemporaryBookingRecord[] = [
  {
    id: "SHTA1A105",
    name: "Amit Patel",
    flat: "A-105",
    floor: 1,
    project: "Skyrise Heights",
    building: "Tower A",
    wing: "B",
    flatType: "2BHK",
    area: "950",
    parking: "open",
    phone: "9876543210",
    email: "amit.patel@email.com",
    address: "12 MG Road, Pune, Maharashtra",
    idProof: "Aadhar ID",
    idNumber: "XXXX-XXXX-4521",
    holdingDueDate: "2026-08-15",
    amount: 5200000,
    pricing: {
      baseAmount: 4750000,
      gstPct: 5,
      gstAmount: 237500,
      stampDuty: 50000,
      agreementPrice: 4700000,
      electricalBill: 85000,
      parkingAmount: 100000,
      grandTotal: 5200000,
    },
    notes: "Temporary hold — customer visiting site again on Friday.",
    status: "temporary",
    bookingType: "temporary",
  },
];

/** Convert temporary booking record to full detail profile for Details panel & Proceed */
export function temporaryToDetailProfile(t: TemporaryBookingRecord): CustomerDetailProfile {
  return {
    ...t,
    unitType: "Residential",
    loanStatus: "No",
    slabLedger: [],
    categories: [
      { key: "flat", label: "Flat Payment", due: t.pricing.grandTotal, paid: 0, remaining: t.pricing.grandTotal },
      { key: "gst", label: "GST", due: t.pricing.gstAmount, paid: 0, remaining: t.pricing.gstAmount },
      { key: "stamp", label: "Stamp Duty", due: t.pricing.stampDuty, paid: 0, remaining: t.pricing.stampDuty },
      { key: "agreement", label: "Agreement", due: t.pricing.agreementPrice, paid: 0, remaining: t.pricing.agreementPrice },
      { key: "parking", label: "Parking", due: t.pricing.parkingAmount, paid: 0, remaining: t.pricing.parkingAmount },
      { key: "electrical", label: "Electrical Bill", due: t.pricing.electricalBill, paid: 0, remaining: t.pricing.electricalBill },
    ],
    currentSlabLabel: "—",
  };
}