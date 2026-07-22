import {
  createDefaultBusinessProfile,
  createDefaultModuleSettings,
  resolveInventorySettings,
  resolveSalesSettings,
} from "@/lib/settings/defaultSettings";
import { normalizeInvoices } from "@/lib/sales/invoiceLog";
import { STORE_KEY, STORE_VERSION } from "./storeKeys";
import type { AppStore } from "./storeTypes";
import { createSeedStore } from "./seedStore";

function withSettingsDefaults(parsed: AppStore): AppStore {
  return {
    ...parsed,
    invoices: normalizeInvoices(parsed.invoices ?? []),
    businessProfile: parsed.businessProfile ?? createDefaultBusinessProfile(),
    salesSettings: resolveSalesSettings(parsed.salesSettings),
    inventorySettings: resolveInventorySettings(parsed.inventorySettings),
    customerSettings: parsed.customerSettings ?? createDefaultModuleSettings(),
    materials: Array.isArray(parsed.materials) ? parsed.materials : [],
    suppliers: Array.isArray(parsed.suppliers) ? parsed.suppliers : [],
    contractors: Array.isArray(parsed.contractors) ? parsed.contractors : [],
    purchaseOrders: Array.isArray(parsed.purchaseOrders) ? parsed.purchaseOrders : [],
    purchaseRequests: Array.isArray(parsed.purchaseRequests)
      ? parsed.purchaseRequests
      : [],
    workOrderRequests: Array.isArray(parsed.workOrderRequests)
      ? parsed.workOrderRequests
      : [],
    workOrders: Array.isArray(parsed.workOrders) ? parsed.workOrders : [],
    partyReceivedPayments: Array.isArray(parsed.partyReceivedPayments)
      ? parsed.partyReceivedPayments
      : [],
    customers: Array.isArray(parsed.customers) ? parsed.customers : [],
    inactiveCustomers: Array.isArray(parsed.inactiveCustomers)
      ? parsed.inactiveCustomers
      : [],
    projects: Array.isArray(parsed.projects) ? parsed.projects : [],
    slabs: Array.isArray(parsed.slabs) ? parsed.slabs : [],
    receivedPayments: Array.isArray(parsed.receivedPayments)
      ? parsed.receivedPayments
      : [],
  };
}

export function loadStore(): AppStore {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) {
      const seed = createSeedStore();
      saveStore(seed);
      return withSettingsDefaults(seed);
    }
    const parsed = JSON.parse(raw) as AppStore;
    if (parsed.version !== STORE_VERSION) {
      const seed = createSeedStore();
      saveStore(seed);
      return withSettingsDefaults(seed);
    }
    return withSettingsDefaults(parsed);
  } catch {
    const seed = createSeedStore();
    saveStore(seed);
    return withSettingsDefaults(seed);
  }
}

export function saveStore(store: AppStore): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}
