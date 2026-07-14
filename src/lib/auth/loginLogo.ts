import { resolveLogoUrl } from "@/lib/settings/defaultSettings";
import type { BusinessProfileData } from "@/lib/settings/settingsTypes";

export function getLoginLogoUrl(profile?: Partial<BusinessProfileData> | null): string {
  return resolveLogoUrl(profile?.logoUrl);
}

export function hasUserUploadedLoginLogo(profile?: Partial<BusinessProfileData> | null): boolean {
  return Boolean(profile?.logoUrl?.trim().startsWith("data:image/"));
}