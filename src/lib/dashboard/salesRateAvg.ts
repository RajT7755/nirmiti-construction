import type { CustomerDetailProfile } from "@/lib/customers/customerDetailTypes";

export function parseAreaSqFt(area: string | undefined | null): number {
  const sqFt = Number.parseFloat(String(area ?? "").trim());
  return Number.isFinite(sqFt) && sqFt > 0 ? sqFt : 0;
}

/**
 * Flat booking value = area × rate.
 * Stored as pricing.baseAmount when the customer was registered via Add Customer.
 */
export function getCustomerFlatBookingValue(profile: CustomerDetailProfile): number | null {
  const sqFt = parseAreaSqFt(profile.area);
  if (sqFt <= 0) return null;

  const baseAmount = profile.pricing?.baseAmount;
  if (typeof baseAmount === "number" && baseAmount > 0) {
    return baseAmount;
  }

  return null;
}

/** Confirmed (payment) bookings only — excludes temporary holds and inactive customers. */
export function isConfirmedBooking(profile: CustomerDetailProfile): boolean {
  return profile.status !== "inactive" && profile.bookingType === "payment";
}

/**
 * Sales Rate (Avg) = Σ (area × rate) / Σ area
 * Equivalent to Σ pricing.baseAmount / Σ area for confirmed customer flats.
 */
export function computeSalesRateAvg(profiles: CustomerDetailProfile[]): number | null {
  let totalBaseAmount = 0;
  let totalSqFt = 0;

  for (const profile of profiles) {
    if (!isConfirmedBooking(profile)) continue;

    const sqFt = parseAreaSqFt(profile.area);
    const bookingValue = getCustomerFlatBookingValue(profile);
    if (sqFt <= 0 || bookingValue === null) continue;

    totalBaseAmount += bookingValue;
    totalSqFt += sqFt;
  }

  if (totalSqFt <= 0) return null;
  return Math.round(totalBaseAmount / totalSqFt);
}