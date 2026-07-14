import type { CustomerDetailProfile, InactiveCustomerRecord } from "@/lib/customers/customerDetailTypes";
import type {
  BusinessProfileData,
  ModuleSettingsData,
  ProfileSettingsData,
  SalesSettingsData,
} from "@/lib/settings/settingsTypes";
import type { Invoice, ProjectData, ReceivedPayment, SlabEntry } from "@/lib/types";
import type { STORE_VERSION } from "./storeKeys";

export interface WhatsAppOutboxEntry {
  id: string;
  batchId: string;
  templateName: string;
  recipientCount: number;
  status: "queued" | "sent" | "failed";
  createdAt: string;
}

export interface AppStore {
  version: typeof STORE_VERSION;
  customers: CustomerDetailProfile[];
  inactiveCustomers: InactiveCustomerRecord[];
  releasedTempIds: string[];
  slabs: SlabEntry[];
  receivedPayments: ReceivedPayment[];
  invoices: Invoice[];
  projects: ProjectData[];
  whatsappOutbox: WhatsAppOutboxEntry[];
  businessProfile?: BusinessProfileData;
  profileSettings?: ProfileSettingsData;
  salesSettings?: SalesSettingsData;
  inventorySettings?: ModuleSettingsData;
  customerSettings?: ModuleSettingsData;
  activeUserId?: string;
}