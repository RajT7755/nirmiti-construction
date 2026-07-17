import type { CustomerDetailProfile, InactiveCustomerRecord } from "@/lib/customers/customerDetailTypes";
import type {
  Contractor,
  Material,
  PurchaseOrder,
  PurchaseRequest,
  Supplier,
  WorkOrder,
  WorkOrderRequest,
} from "@/lib/inventory/inventoryTypes";
import type { PartyReceivedPayment } from "@/lib/inventory/partyPaymentTypes";
import type {
  BusinessProfileData,
  InventorySettingsData,
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
  inventorySettings?: InventorySettingsData;
  customerSettings?: ModuleSettingsData;
  /** Inventory catalog — linked to POs via Material.id / PurchaseOrder.materialId */
  materials?: Material[];
  /** Suppliers — workCategories align with materials; supplierId on POs */
  suppliers?: Supplier[];
  /** Contractors — same shape as suppliers + workProfile text */
  contractors?: Contractor[];
  /** Purchase orders — materialId FK connects to materials; payable when approved */
  purchaseOrders?: PurchaseOrder[];
  /** Purchase requests — Request No; approve → PO + payable */
  purchaseRequests?: PurchaseRequest[];
  /** Work order requests → generate WO */
  workOrderRequests?: WorkOrderRequest[];
  /** Work orders — unique WO id; payable when amount set */
  workOrders?: WorkOrder[];
  /** Payments recorded against PO/WO (dashboard party payment log) */
  partyReceivedPayments?: PartyReceivedPayment[];
  activeUserId?: string;
}