import {
  DEFAULT_COMPANY_NAME,
  DEFAULT_LOGO_SRC,
  DEFAULT_TAGLINE,
} from "@/lib/branding/defaultBrand";
import {
  WA_OVERDUE_TEMPLATE_DEFAULT,
  WA_SLAB_TEMPLATE_DEFAULT,
} from "@/lib/messenger/messageTemplates";
import type {
  BusinessProfileData,
  InvoiceTemplateSettings,
  MessengerTemplateSettings,
  ModuleSettingsData,
  ProfileSettingsData,
  SalesSettingsData,
} from "./settingsTypes";

export const LOGIN_ABOUT_COMPANY_NAME = "Sanklap Technologies";
export const LOGIN_ABOUT_EMAIL = "rajtaware@sankalpenterprises.info";
export const LOGIN_ABOUT_CUSTOMER_CARE_EMAIL = "customercare01@sankalpenterprises.info";

export function createDefaultBusinessProfile(): BusinessProfileData {
  return {
    logoUrl: DEFAULT_LOGO_SRC,
    companyName: LOGIN_ABOUT_COMPANY_NAME,
    tagline: DEFAULT_TAGLINE,
    address: "",
    city: "",
    state: "",
    pinCode: "",
    phone: "",
    email: LOGIN_ABOUT_EMAIL,
    website: "",
    gstin: "",
    pan: "",
    bankName: "",
    accountNo: "",
    ifsc: "",
  };
}

export function createDefaultProfileSettings(
  partial?: Partial<ProfileSettingsData>
): ProfileSettingsData {
  return {
    fullName: partial?.fullName ?? "",
    userId: partial?.userId ?? "",
    email: partial?.email ?? "",
    avatarUrl: partial?.avatarUrl,
  };
}

export function createDefaultInvoiceTemplate(): InvoiceTemplateSettings {
  return {
    invoicePrefix: "INV",
    termsAndConditions:
      "1. Payment is due within 7 days of invoice date.\n2. All disputes are subject to local jurisdiction.\n3. This invoice is system-generated and valid without signature.",
    footerNote: "Thank you for your business.",
    showBankDetails: true,
  };
}

export function createDefaultMessengerTemplates(): MessengerTemplateSettings {
  return {
    slabSchedule: WA_SLAB_TEMPLATE_DEFAULT,
    overdue: WA_OVERDUE_TEMPLATE_DEFAULT,
  };
}

export function createDefaultSalesSettings(): SalesSettingsData {
  return {
    invoiceTemplate: createDefaultInvoiceTemplate(),
    messengerTemplates: createDefaultMessengerTemplates(),
  };
}

export function resolveSalesSettings(
  stored?: Partial<SalesSettingsData> | null
): SalesSettingsData {
  const defaults = createDefaultSalesSettings();
  return {
    invoiceTemplate: { ...defaults.invoiceTemplate, ...stored?.invoiceTemplate },
    messengerTemplates: { ...defaults.messengerTemplates, ...stored?.messengerTemplates },
  };
}

export function createDefaultModuleSettings(): ModuleSettingsData {
  return { notes: "", enabled: true };
}

export function resolveBusinessProfile(
  stored?: Partial<BusinessProfileData> | null
): BusinessProfileData {
  return { ...createDefaultBusinessProfile(), ...stored };
}

export function resolveLogoUrl(logoUrl?: string | null): string {
  if (logoUrl && logoUrl.trim()) return logoUrl;
  return DEFAULT_LOGO_SRC;
}

export function resolveCompanyName(profile?: Partial<BusinessProfileData> | null): string {
  return profile?.companyName?.trim() || DEFAULT_COMPANY_NAME;
}

export function resolveTagline(profile?: Partial<BusinessProfileData> | null): string {
  return profile?.tagline?.trim() || DEFAULT_TAGLINE;
}