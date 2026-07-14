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
}

export interface SalesSettingsData {
  invoiceTemplate: InvoiceTemplateSettings;
  messengerTemplates: MessengerTemplateSettings;
}

export interface ModuleSettingsData {
  notes: string;
  enabled: boolean;
}