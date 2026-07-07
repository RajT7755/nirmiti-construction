/**
 * Inactive / discontinued customers — separate from active customer data.
 * Flat released; no further payment slabs.
 */
import type { InactiveCustomerRecord } from "./customerDetailTypes";

export const MOCK_INACTIVE_CUSTOMERS: InactiveCustomerRecord[] = [
  {
    id: "GVTC2C102",
    name: "Suresh Mehta",
    flat: "C-102",
    floor: 2,
    project: "Green Valley",
    status: "inactive",
    amount: 4500000,
    phone: "9876501234",
    email: "suresh.m@email.com",
    address: "22 Baner Road, Pune",
    idProof: "PAN Card",
    idNumber: "ABCSM5678G",
    unitType: "Residential",
    flatType: "2BHK",
    building: "Tower C",
    wing: "A",
    area: "900",
    parking: "no",
    loanStatus: "No",
    bookingType: "payment",
    inactiveReason: "Job transfer abroad — requested flat cancellation",
    inactiveDate: "2026-06-20",
    flatReleased: true,
    pricing: {
      baseAmount: 4100000,
      gstPct: 5,
      gstAmount: 205000,
      stampDuty: 42000,
      agreementPrice: 4000000,
      electricalBill: 90000,
      parkingAmount: 0,
      grandTotal: 4500000,
    },
    bookingSlab10: { amount: 410000, received: 430500 },
    slabLedger: [
      { slabNo: 0, stage: "10% Booking", percentage: 10, slabAmount: 450000, paidAmount: 450000, remainingAmount: 0, status: "received" },
    ],
    categories: [
      { key: "flat", label: "Flat Payment", due: 4500000, paid: 450000, remaining: 4050000 },
      { key: "gst", label: "GST", due: 205000, paid: 20500, remaining: 184500 },
      { key: "stamp", label: "Stamp Duty", due: 42000, paid: 0, remaining: 42000 },
      { key: "agreement", label: "Agreement", due: 4000000, paid: 0, remaining: 4000000 },
      { key: "parking", label: "Parking", due: 0, paid: 0, remaining: 0 },
      { key: "electrical", label: "Electrical Bill", due: 90000, paid: 0, remaining: 90000 },
    ],
    notes: "Discontinued — flat C-102 released and available for re-booking.",
    currentSlabLabel: "—",
  },
];