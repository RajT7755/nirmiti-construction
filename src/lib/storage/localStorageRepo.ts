import {
  createDefaultBusinessProfile,
  createDefaultModuleSettings,
  resolveSalesSettings,
} from "@/lib/settings/defaultSettings";
import { normalizeInvoices } from "@/lib/sales/invoiceLog";
import { STORE_KEY } from "./storeKeys";
import type { AppStore } from "./storeTypes";
import { createSeedStore } from "./seedStore";

function withSettingsDefaults(parsed: AppStore): AppStore {
  return {
    ...parsed,
    invoices: normalizeInvoices(parsed.invoices ?? []),
    businessProfile: parsed.businessProfile ?? createDefaultBusinessProfile(),
    salesSettings: resolveSalesSettings(parsed.salesSettings),
    inventorySettings: parsed.inventorySettings ?? createDefaultModuleSettings(),
    customerSettings: parsed.customerSettings ?? createDefaultModuleSettings(),
  };
}

export function loadStore(): AppStore {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) {
      const seed = createSeedStore();
      saveStore(seed);
      return seed;
    }
    const parsed = JSON.parse(raw) as AppStore;
    if (parsed.version !== 1) {
      const seed = createSeedStore();
      saveStore(seed);
      return seed;
    }
    return withSettingsDefaults(parsed);
  } catch {
    const seed = createSeedStore();
    saveStore(seed);
    return seed;
  }
}

export function saveStore(store: AppStore): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

export function resetStore(): AppStore {
  const seed = createSeedStore();
  saveStore(seed);
  return seed;
}