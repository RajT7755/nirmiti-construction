import { MOCK_CUSTOMER_DETAILS_DATA } from "@/lib/customers/mockCustomerDetailsData";
import { MOCK_INACTIVE_CUSTOMERS } from "@/lib/customers/mockInactiveCustomersData";
import { MOCK_TEMPORARY_BOOKINGS, temporaryToDetailProfile } from "@/lib/customers/mockTemporaryBookingsData";
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
  };
}