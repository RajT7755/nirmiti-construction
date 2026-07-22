import {
  createDefaultBusinessProfile,
  createDefaultInventorySettings,
  createDefaultModuleSettings,
  createDefaultSalesSettings,
} from "@/lib/settings/defaultSettings";
import type { AppStore } from "./storeTypes";
import { STORE_VERSION } from "./storeKeys";

/** Empty production seed — no sample customers, inventory, or orders. */
export function createSeedStore(): AppStore {
  return {
    version: STORE_VERSION,
    customers: [],
    inactiveCustomers: [],
    releasedTempIds: [],
    slabs: [],
    receivedPayments: [],
    invoices: [],
    projects: [],
    whatsappOutbox: [],
    businessProfile: createDefaultBusinessProfile(),
    salesSettings: createDefaultSalesSettings(),
    inventorySettings: createDefaultInventorySettings(),
    customerSettings: createDefaultModuleSettings(),
    materials: [],
    suppliers: [],
    contractors: [],
    purchaseOrders: [],
    purchaseRequests: [],
    workOrderRequests: [],
    workOrders: [],
    partyReceivedPayments: [],
  };
}
