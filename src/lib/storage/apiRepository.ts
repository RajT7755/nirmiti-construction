/**
 * Backend adapter — delegates to lib/api when VITE_USE_API=true.
 * Login/auth endpoints are intentionally excluded.
 */
import {
  apiRequest,
  dashboardApi,
  customerSalesApi,
  addCustomerApi,
  customerDetailsApi,
  temporaryBookingsApi,
  inactiveCustomersApi,
  customersExportApi,
  salesApi,
  paymentSlabsApi,
  receivedPaymentsApi,
  invoicesApi,
  paymentAllocationApi,
  paymentLedgerApi,
  salesExportApi,
  paymentLogExportApi,
  whatsappApi,
  whatsappBulkApi,
  inventoryApi,
  shareholderApi,
  projectsApi,
  settingsApi,
  registrationApi,
  profileSettingsApi,
  businessProfileSettingsApi,
  inventorySettingsApi,
  customerSettingsApi,
  salesSettingsApi,
} from "@/lib/api";
import {
  createDefaultBusinessProfile,
  createDefaultInventorySettings,
  createDefaultModuleSettings,
  resolveInventorySettings,
  resolveSalesSettings,
} from "@/lib/settings/defaultSettings";
import type { CustomerDetailProfile } from "@/lib/customers/customerDetailTypes";
import { STORE_VERSION } from "./storeKeys";
import type { AppStore } from "./storeTypes";

export interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
}

export const apiRepository = {
  health: () => apiRequest<HealthResponse>("/api/health"),
  dashboard: dashboardApi,
  projects: projectsApi,
  customers: customerSalesApi,
  customerDetails: customerDetailsApi,
  addCustomer: addCustomerApi,
  temporary: temporaryBookingsApi,
  inactive: inactiveCustomersApi,
  customersExport: customersExportApi,
  sales: salesApi,
  slabs: paymentSlabsApi,
  received: receivedPaymentsApi,
  invoices: invoicesApi,
  payments: paymentAllocationApi,
  ledger: paymentLedgerApi,
  salesExport: salesExportApi,
  paymentLogExport: paymentLogExportApi,
  whatsapp: whatsappApi,
  whatsappBulk: whatsappBulkApi,
  inventory: inventoryApi,
  shareholder: shareholderApi,
  settings: settingsApi,
  registration: registrationApi,
  profileSettings: profileSettingsApi,
  businessProfile: businessProfileSettingsApi,
  inventorySettings: inventorySettingsApi,
  customerSettings: customerSettingsApi,
  salesSettings: salesSettingsApi,
};

/** Load full AppStore shape from backend on mount */
export async function hydrateFromApi(): Promise<AppStore> {
  const [
    projects,
    customerDetails,
    inactiveCustomers,
    slabs,
    receivedPayments,
    invoices,
    businessProfile,
    salesSettings,
    inventorySettings,
    customerSettings,
  ] = await Promise.all([
    projectsApi.list(),
    customerDetailsApi.list(),
    inactiveCustomersApi.list(),
    paymentSlabsApi.list(),
    receivedPaymentsApi.list(),
    invoicesApi.list(),
    businessProfileSettingsApi.get().catch(() => createDefaultBusinessProfile()),
    salesSettingsApi.get().catch(() => resolveSalesSettings()),
    inventorySettingsApi.get().catch(() => createDefaultInventorySettings()),
    customerSettingsApi.get().catch(() => createDefaultModuleSettings()),
  ]);

  const customers = customerDetails.filter(
    (c): c is CustomerDetailProfile => c.status !== "inactive"
  );

  return {
    version: STORE_VERSION,
    customers,
    inactiveCustomers,
    releasedTempIds: [],
    slabs,
    receivedPayments,
    invoices,
    projects,
    whatsappOutbox: [],
    businessProfile,
    salesSettings: resolveSalesSettings(salesSettings),
    inventorySettings: resolveInventorySettings(inventorySettings),
    customerSettings,
  };
}

/** Refresh customer + payment collections after a mutation */
export async function refreshCustomerData(): Promise<
  Pick<AppStore, "customers" | "inactiveCustomers" | "receivedPayments">
> {
  const [customerDetails, inactiveCustomers, receivedPayments] = await Promise.all([
    customerDetailsApi.list(),
    inactiveCustomersApi.list(),
    receivedPaymentsApi.list(),
  ]);

  return {
    customers: customerDetails.filter((c) => c.status !== "inactive"),
    inactiveCustomers,
    receivedPayments,
  };
}