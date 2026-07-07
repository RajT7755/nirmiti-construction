import { getCustomerTotalPaid } from "./paymentDistribution";
import type { CustomerDetailProfile } from "./customerDetailTypes";

export const CUSTOMER_EXPORT_HEADERS = [
  "Customer ID",
  "Name",
  "Phone",
  "Email",
  "Address",
  "ID Proof",
  "ID Number",
  "Project",
  "Building",
  "Wing",
  "Flat",
  "Floor",
  "Flat Type",
  "Unit Type",
  "Area sq.ft",
  "Parking",
  "Status",
  "Booking Type",
  "Grand Total",
  "Total Paid",
  "Remaining",
  "Current Slab",
  "Flat Paid",
  "GST Due",
  "GST Paid",
  "Stamp Due",
  "Stamp Paid",
  "Agreement Due",
  "Agreement Paid",
  "Parking Due",
  "Parking Paid",
  "Electrical Due",
  "Electrical Paid",
  "Loan Status",
  "Bank Name",
  "Notes",
];

function cat(profile: CustomerDetailProfile, key: string, field: "due" | "paid") {
  return profile.categories.find((c) => c.key === key)?.[field] ?? 0;
}

export function getCustomerExportRows(profiles: CustomerDetailProfile[]): (string | number)[][] {
  return profiles.map((c) => {
    const totalPaid = getCustomerTotalPaid(c);
    const remaining = Math.max(0, c.amount - totalPaid);
    return [
      c.id,
      c.name,
      c.phone,
      c.email,
      c.address,
      c.idProof,
      c.idNumber,
      c.project,
      c.building,
      c.wing,
      c.flat,
      c.floor,
      c.flatType,
      c.unitType,
      c.area,
      c.parking,
      c.status,
      c.bookingType ?? "",
      c.amount,
      totalPaid,
      remaining,
      c.currentSlabLabel,
      cat(c, "flat", "paid"),
      cat(c, "gst", "due"),
      cat(c, "gst", "paid"),
      cat(c, "stamp", "due"),
      cat(c, "stamp", "paid"),
      cat(c, "agreement", "due"),
      cat(c, "agreement", "paid"),
      cat(c, "parking", "due"),
      cat(c, "parking", "paid"),
      cat(c, "electrical", "due"),
      cat(c, "electrical", "paid"),
      c.loanStatus,
      c.bankName ?? "",
      c.notes,
    ];
  });
}