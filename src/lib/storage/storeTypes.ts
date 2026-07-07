import type { CustomerDetailProfile, InactiveCustomerRecord } from "@/lib/customers/customerDetailTypes";
import type { ProjectData, ReceivedPayment, SlabEntry } from "@/lib/types";
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
  projects: ProjectData[];
  whatsappOutbox: WhatsAppOutboxEntry[];
}