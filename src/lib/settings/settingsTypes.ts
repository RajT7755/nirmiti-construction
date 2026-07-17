export interface BusinessProfileData {
  ownerEmail?: string;
  isActivated?: boolean;
  logoUrl: string;
  companyName: string;
  tagline: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  phone: string;
  email: string;
  website: string;
  gstin: string;
  pan: string;
  bankName: string;
  accountNo: string;
  ifsc: string;
}

export interface ProfileSettingsData {
  fullName: string;
  userId: string;
  email: string;
  avatarUrl?: string;
}

export interface InvoiceTemplateSettings {
  invoicePrefix: string;
  termsAndConditions: string;
  footerNote: string;
  showBankDetails: boolean;
}

export interface MessengerTemplateSettings {
  slabSchedule: string;
  overdue: string;
  /** Purchase order request WhatsApp template */
  poRequest: string;
  /** Work order request WhatsApp template */
  workOrderRequest: string;
  /** Multi-customer broadcast from Messenger */
  customerBroadcast: string;
}

export interface SalesSettingsData {
  invoiceTemplate: InvoiceTemplateSettings;
  messengerTemplates: MessengerTemplateSettings;
}

export interface ModuleSettingsData {
  notes: string;
  enabled: boolean;
}

/** Inventory module settings (units + work categories for Materials/Suppliers). */
export interface InventorySettingsData {
  notes: string;
  enabled: boolean;
  /** Unit options e.g. bags, tons — Settings → Inventory → Materials */
  units: string[];
  /** Work categories — Settings → Inventory → Suppliers; used on Materials + Suppliers */
  workCategories: string[];
  /** Supplier id prefix e.g. SUP → SUP-0001 */
  supplierIdPrefix: string;
  /** Next sequence number for supplier id */
  supplierIdNext: number;
  /** Contractor id prefix e.g. CON → CON-0001 */
  contractorIdPrefix: string;
  /** Next sequence number for contractor id */
  contractorIdNext: number;
  /** Purchase request id prefix e.g. REQ → REQ-000001 */
  requestIdPrefix: string;
  requestIdNext: number;
  /** Purchase order id prefix e.g. PO → PO-000001 (payable) */
  poIdPrefix: string;
  poIdNext: number;
  /** Work request id prefix e.g. WOR → WOR-000001 */
  workRequestIdPrefix: string;
  workRequestIdNext: number;
  /** Work order id prefix e.g. WO → WO-000001 */
  workOrderIdPrefix: string;
  workOrderIdNext: number;
}