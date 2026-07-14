import type { BusinessProfileData } from "@/lib/settings/settingsTypes";

export function canEditBusinessProfile(
  businessProfile: BusinessProfileData,
  loggedInEmail: string
): boolean {
  const owner = businessProfile.ownerEmail?.trim().toLowerCase();
  if (!owner) return true;
  return loggedInEmail.trim().toLowerCase() === owner;
}