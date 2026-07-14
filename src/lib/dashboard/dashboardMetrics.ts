import type { BookedFlatsSummary } from "@/lib/customers/customerDetailTypes";
import type { CustomerDetailProfile } from "@/lib/customers/customerDetailTypes";
import type { ProjectData, ReceivedPayment } from "@/lib/types";
import { computeSalesRateAvg } from "./salesRateAvg";

export interface DashboardKpis {
  bookedFlats: BookedFlatsSummary;
  overdueCount: number;
  totalPaymentReceived: number;
  salesRateAvg: number | null;
  bookedPct: number;
  totalUnits: number;
}

function filterProfilesByProject(
  profiles: CustomerDetailProfile[],
  projectNames: string[],
  isAllSites: boolean
): CustomerDetailProfile[] {
  if (isAllSites) return profiles;
  const names = new Set(projectNames);
  return profiles.filter((p) => names.has(p.project));
}

function filterPaymentsByProject(
  payments: ReceivedPayment[],
  profiles: CustomerDetailProfile[],
  projectNames: string[],
  isAllSites: boolean
): ReceivedPayment[] {
  if (isAllSites) return payments;
  const names = new Set(projectNames);
  const keysInScope = new Set(
    profiles
      .filter((p) => names.has(p.project))
      .map((p) => `${p.name}|${p.flat}`)
  );
  return payments.filter((p) => keysInScope.has(`${p.customer}|${p.flat}`));
}

export function countBookedFlatsForProfiles(profiles: CustomerDetailProfile[]): BookedFlatsSummary {
  const active = profiles.filter((c) => c.status !== "inactive" && c.bookingType !== null);
  const temporary = active.filter((c) => c.bookingType === "temporary").length;
  const confirmed = active.filter((c) => c.bookingType === "payment").length;
  return { total: temporary + confirmed, temporary, confirmed };
}

export function computeDashboardKpis({
  projects,
  customerProfiles,
  receivedPayments,
  projectNames,
  isAllSites,
}: {
  projects: ProjectData[];
  customerProfiles: CustomerDetailProfile[];
  receivedPayments: ReceivedPayment[];
  projectNames: string[];
  isAllSites: boolean;
}): DashboardKpis {
  const scopedProfiles = filterProfilesByProject(customerProfiles, projectNames, isAllSites).filter(
    (c) => c.status !== "inactive"
  );
  const scopedPayments = filterPaymentsByProject(
    receivedPayments,
    customerProfiles,
    projectNames,
    isAllSites
  );

  const bookedFlats = countBookedFlatsForProfiles(scopedProfiles);
  const overdueCount = scopedProfiles.filter((c) => c.status === "overdue").length;
  const totalPaymentReceived = scopedPayments.reduce((sum, p) => sum + p.received, 0);

  const salesRateAvg = computeSalesRateAvg(scopedProfiles);

  const totalUnits = projects.reduce((s, p) => s + p.totalFlats + p.totalShops, 0);
  const bookedPct = totalUnits > 0 ? Math.round((bookedFlats.total / totalUnits) * 100) : 0;

  return {
    bookedFlats,
    overdueCount,
    totalPaymentReceived,
    salesRateAvg,
    bookedPct,
    totalUnits,
  };
}