import {
  DEFAULT_COMPANY_NAME,
  DEFAULT_LOGO_SRC,
  DEFAULT_TAGLINE,
} from "@/lib/branding/defaultBrand";
import {
  WA_CUSTOMER_BROADCAST_TEMPLATE_DEFAULT,
  WA_OVERDUE_TEMPLATE_DEFAULT,
  WA_PO_REQUEST_TEMPLATE_DEFAULT,
  WA_SLAB_TEMPLATE_DEFAULT,
  WA_WO_REQUEST_TEMPLATE_DEFAULT,
} from "@/lib/messenger/templates";
import type {
  BusinessProfileData,
  InventorySettingsData,
  InvoiceTemplateSettings,
  MessengerTemplateSettings,
  ModuleSettingsData,
  ProfileSettingsData,
  SalesSettingsData,
} from "./settingsTypes";

export const LOGIN_ABOUT_COMPANY_NAME = "Sankalp Technologies";
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
    poRequest: WA_PO_REQUEST_TEMPLATE_DEFAULT,
    workOrderRequest: WA_WO_REQUEST_TEMPLATE_DEFAULT,
    customerBroadcast: WA_CUSTOMER_BROADCAST_TEMPLATE_DEFAULT,
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
  const mt = { ...defaults.messengerTemplates, ...stored?.messengerTemplates };
  return {
    invoiceTemplate: { ...defaults.invoiceTemplate, ...stored?.invoiceTemplate },
    messengerTemplates: {
      slabSchedule: mt.slabSchedule || defaults.messengerTemplates.slabSchedule,
      overdue: mt.overdue || defaults.messengerTemplates.overdue,
      poRequest: mt.poRequest || defaults.messengerTemplates.poRequest,
      workOrderRequest:
        mt.workOrderRequest || defaults.messengerTemplates.workOrderRequest,
      customerBroadcast:
        mt.customerBroadcast || defaults.messengerTemplates.customerBroadcast,
    },
  };
}

export function createDefaultModuleSettings(): ModuleSettingsData {
  return { notes: "", enabled: true };
}

/** Default stock units — also used as seed for Settings → Inventory units list */
export const DEFAULT_INVENTORY_UNITS = [
  "bags",
  "tons",
  "cu.ft.",
  "nos",
  "sq.ft.",
  "cu.m.",
  "kg",
  "liters",
] as const;

export const DEFAULT_WORK_CATEGORIES = [
  "Civil",
  "Structural",
  "Plastering",
  "Finishing",
  "Masonry",
  "Electrical",
] as const;

export function createDefaultInventorySettings(): InventorySettingsData {
  return {
    notes: "",
    enabled: true,
    units: [...DEFAULT_INVENTORY_UNITS],
    workCategories: [...DEFAULT_WORK_CATEGORIES],
    supplierIdPrefix: "SUP",
    supplierIdNext: 1,
    contractorIdPrefix: "CON",
    contractorIdNext: 1,
    requestIdPrefix: "REQ",
    requestIdNext: 1,
    poIdPrefix: "PO",
    poIdNext: 1,
    workRequestIdPrefix: "WOR",
    workRequestIdNext: 1,
    workOrderIdPrefix: "WO",
    workOrderIdNext: 1,
  };
}

export function formatSupplierId(prefix: string, seq: number): string {
  const p = (prefix || "SUP").trim().toUpperCase().replace(/[^A-Z0-9]/g, "") || "SUP";
  return `${p}-${String(Math.max(1, seq)).padStart(4, "0")}`;
}

export function formatContractorId(prefix: string, seq: number): string {
  const p = (prefix || "CON").trim().toUpperCase().replace(/[^A-Z0-9]/g, "") || "CON";
  return `${p}-${String(Math.max(1, seq)).padStart(4, "0")}`;
}

export function formatRequestId(prefix: string, seq: number): string {
  const p = (prefix || "REQ").trim().toUpperCase().replace(/[^A-Z0-9]/g, "") || "REQ";
  return `${p}-${String(Math.max(1, seq)).padStart(6, "0")}`;
}

export function formatPurchaseOrderId(prefix: string, seq: number): string {
  const p = (prefix || "PO").trim().toUpperCase().replace(/[^A-Z0-9]/g, "") || "PO";
  return `${p}-${String(Math.max(1, seq)).padStart(6, "0")}`;
}

export function formatWorkRequestId(prefix: string, seq: number): string {
  const p = (prefix || "WOR").trim().toUpperCase().replace(/[^A-Z0-9]/g, "") || "WOR";
  return `${p}-${String(Math.max(1, seq)).padStart(6, "0")}`;
}

export function formatWorkOrderId(prefix: string, seq: number): string {
  const p = (prefix || "WO").trim().toUpperCase().replace(/[^A-Z0-9]/g, "") || "WO";
  return `${p}-${String(Math.max(1, seq)).padStart(6, "0")}`;
}

function resolvePrefix(
  stored: string | undefined,
  fallback: string
): string {
  return typeof stored === "string" && stored.trim()
    ? stored.trim().toUpperCase()
    : fallback;
}

function resolveNext(stored: number | undefined, fallback: number): number {
  return typeof stored === "number" && stored >= 1 ? Math.floor(stored) : fallback;
}

export function resolveInventorySettings(
  stored?: Partial<InventorySettingsData> | null
): InventorySettingsData {
  const defaults = createDefaultInventorySettings();
  // Allow empty arrays (user deleted all). Only fall back when field is missing.
  const units = Array.isArray(stored?.units)
    ? stored.units.map((u) => String(u).trim()).filter(Boolean)
    : [...defaults.units];
  const workCategories = Array.isArray(stored?.workCategories)
    ? stored.workCategories.map((u) => String(u).trim()).filter(Boolean)
    : [...defaults.workCategories];
  return {
    ...defaults,
    ...stored,
    units,
    workCategories,
    supplierIdPrefix: resolvePrefix(stored?.supplierIdPrefix, defaults.supplierIdPrefix),
    supplierIdNext: resolveNext(stored?.supplierIdNext, defaults.supplierIdNext),
    contractorIdPrefix: resolvePrefix(stored?.contractorIdPrefix, defaults.contractorIdPrefix),
    contractorIdNext: resolveNext(stored?.contractorIdNext, defaults.contractorIdNext),
    requestIdPrefix: resolvePrefix(stored?.requestIdPrefix, defaults.requestIdPrefix),
    requestIdNext: resolveNext(stored?.requestIdNext, defaults.requestIdNext),
    poIdPrefix: resolvePrefix(stored?.poIdPrefix, defaults.poIdPrefix),
    poIdNext: resolveNext(stored?.poIdNext, defaults.poIdNext),
    workRequestIdPrefix: resolvePrefix(
      stored?.workRequestIdPrefix,
      defaults.workRequestIdPrefix
    ),
    workRequestIdNext: resolveNext(stored?.workRequestIdNext, defaults.workRequestIdNext),
    workOrderIdPrefix: resolvePrefix(stored?.workOrderIdPrefix, defaults.workOrderIdPrefix),
    workOrderIdNext: resolveNext(stored?.workOrderIdNext, defaults.workOrderIdNext),
  };
}

export function resolveBusinessProfile(
  stored?: Partial<BusinessProfileData> | null
): BusinessProfileData {
  return { ...createDefaultBusinessProfile(), ...stored };
}

/**
 * Resolve a usable logo URL for <img src>.
 * Falls back to the bundled Sankalp logo when missing or clearly invalid.
 */
export function resolveLogoUrl(logoUrl?: string | null): string {
  const value = logoUrl?.trim();
  if (!value || value === "null" || value === "undefined") {
    return DEFAULT_LOGO_SRC;
  }
  // Accept Vite public paths, absolute URLs, and data-URL uploads only.
  if (
    value.startsWith("/") ||
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:image/") ||
    value.startsWith("blob:")
  ) {
    return value;
  }
  return DEFAULT_LOGO_SRC;
}

export function resolveCompanyName(profile?: Partial<BusinessProfileData> | null): string {
  return profile?.companyName?.trim() || DEFAULT_COMPANY_NAME;
}

export function resolveTagline(profile?: Partial<BusinessProfileData> | null): string {
  return profile?.tagline?.trim() || DEFAULT_TAGLINE;
}