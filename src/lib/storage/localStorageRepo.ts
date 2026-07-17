import {
  createDefaultBusinessProfile,
  createDefaultModuleSettings,
  resolveInventorySettings,
  resolveSalesSettings,
} from "@/lib/settings/defaultSettings";
import {
  MOCK_CONTRACTORS,
  MOCK_MATERIALS,
  MOCK_PURCHASE_ORDERS,
  MOCK_PURCHASE_REQUESTS,
  MOCK_SUPPLIERS,
  MOCK_WORK_ORDER_REQUESTS,
  MOCK_WORK_ORDERS,
} from "@/lib/inventory/mockInventoryData";
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
    inventorySettings: resolveInventorySettings(parsed.inventorySettings),
    customerSettings: parsed.customerSettings ?? createDefaultModuleSettings(),
    materials:
      parsed.materials ??
      MOCK_MATERIALS.map((m) => ({ ...m, workCategories: [...m.workCategories] })),
    suppliers:
      parsed.suppliers ??
      MOCK_SUPPLIERS.map((s) => ({
        ...s,
        workCategories: [...(s.workCategories ?? [])],
        status: s.status ?? "active",
      })),
    contractors:
      parsed.contractors ??
      MOCK_CONTRACTORS.map((c) => ({
        ...c,
        workCategories: [...(c.workCategories ?? [])],
        workProfile: c.workProfile ?? c.trade ?? "",
        status: c.status ?? "active",
      })),
    purchaseOrders: parsed.purchaseOrders ?? MOCK_PURCHASE_ORDERS.map((po) => ({ ...po })),
    purchaseRequests:
      parsed.purchaseRequests ?? MOCK_PURCHASE_REQUESTS.map((r) => ({ ...r })),
    workOrderRequests: Array.isArray(parsed.workOrderRequests)
      ? parsed.workOrderRequests
      : MOCK_WORK_ORDER_REQUESTS.map((r) => ({
          ...r,
          workCategories: [...r.workCategories],
          materialIssues: r.materialIssues?.map((l) => ({ ...l })),
        })),
    workOrders: Array.isArray(parsed.workOrders)
      ? parsed.workOrders
      : MOCK_WORK_ORDERS.map((wo) => ({
          ...wo,
          workCategories: wo.workCategories ? [...wo.workCategories] : undefined,
          materialIssues: wo.materialIssues?.map((l) => ({ ...l })),
          materialReturns: wo.materialReturns?.map((l) => ({ ...l })) ?? [],
        })),
    partyReceivedPayments: Array.isArray(parsed.partyReceivedPayments)
      ? parsed.partyReceivedPayments
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
    if (parsed.version !== 1) {
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

export function resetStore(): AppStore {
  const seed = createSeedStore();
  saveStore(seed);
  return seed;
}