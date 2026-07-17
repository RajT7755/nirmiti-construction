import { MOCK_CUSTOMER_DETAILS_DATA } from "@/lib/customers/mockCustomerDetailsData";
import { MOCK_INACTIVE_CUSTOMERS } from "@/lib/customers/mockInactiveCustomersData";
import { MOCK_TEMPORARY_BOOKINGS, temporaryToDetailProfile } from "@/lib/customers/mockTemporaryBookingsData";
import {
  createDefaultBusinessProfile,
  createDefaultInventorySettings,
  createDefaultModuleSettings,
  createDefaultSalesSettings,
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
import type { AppStore } from "./storeTypes";
import { STORE_VERSION } from "./storeKeys";

export function createSeedStore(): AppStore {
  return {
    version: STORE_VERSION,
    customers: [
      ...MOCK_TEMPORARY_BOOKINGS.map(temporaryToDetailProfile),
      ...MOCK_CUSTOMER_DETAILS_DATA,
    ],
    inactiveCustomers: [...MOCK_INACTIVE_CUSTOMERS],
    releasedTempIds: [],
    slabs: [],
    receivedPayments: [],
    invoices: [],
    projects: [],
    whatsappOutbox: [],
    businessProfile: createDefaultBusinessProfile(),
    salesSettings: createDefaultSalesSettings(),
    inventorySettings: {
      ...createDefaultInventorySettings(),
      supplierIdNext: 5, // seed uses SUP-0001..0004
      contractorIdNext: 4, // seed uses CON-0001..0003
      requestIdNext: 3, // seed uses REQ-000001..000002
      poIdNext: 5, // seed uses PO-000001..000004
      workRequestIdNext: 2, // seed uses WOR-000001
      workOrderIdNext: 4, // seed uses WO-000001..000003
    },
    customerSettings: createDefaultModuleSettings(),
    materials: MOCK_MATERIALS.map((m) => ({ ...m, workCategories: [...m.workCategories] })),
    suppliers: MOCK_SUPPLIERS.map((s) => ({
      ...s,
      workCategories: [...s.workCategories],
      status: s.status ?? "active",
    })),
    contractors: MOCK_CONTRACTORS.map((c) => ({
      ...c,
      workCategories: [...(c.workCategories ?? [])],
      workProfile: c.workProfile ?? c.trade ?? "",
      status: c.status ?? "active",
    })),
    purchaseOrders: MOCK_PURCHASE_ORDERS.map((po) => ({ ...po })),
    purchaseRequests: MOCK_PURCHASE_REQUESTS.map((r) => ({ ...r })),
    workOrderRequests: MOCK_WORK_ORDER_REQUESTS.map((r) => ({
      ...r,
      workCategories: [...r.workCategories],
      materialIssues: r.materialIssues?.map((l) => ({ ...l })),
    })),
    workOrders: MOCK_WORK_ORDERS.map((wo) => ({
      ...wo,
      workCategories: wo.workCategories ? [...wo.workCategories] : undefined,
      materialIssues: wo.materialIssues?.map((l) => ({ ...l })),
      materialReturns: wo.materialReturns?.map((l) => ({ ...l })) ?? [],
    })),
    partyReceivedPayments: [],
  };
}