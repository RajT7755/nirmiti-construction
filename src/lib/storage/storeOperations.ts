import type {
  CustomerDetailProfile,
  InactiveCustomerRecord,
  PaymentCategoryKey,
  BookedFlatsSummary,
} from "@/lib/customers/customerDetailTypes";
import { applyCategoryPayment } from "@/lib/customers/categoryTotals";
import { flatKeysMatch } from "@/lib/customers/resolveFlatGridStatus";
import { allocateFlatPayment, getActiveSlabFromLedger } from "@/lib/customers/slabAllocator";
import type { Customer, Invoice, ProjectData, ReceivedPayment, SlabEntry } from "@/lib/types";
import type { AppStore } from "./storeTypes";

export function toLegacyCustomer(c: CustomerDetailProfile): Customer {
  return {
    id: c.id,
    name: c.name,
    flat: c.flat,
    floor: c.floor,
    project: c.project,
    status: c.status,
    amount: c.amount,
  };
}

export function getAllCustomerProfiles(store: AppStore): CustomerDetailProfile[] {
  const active = store.customers.filter((c) => !store.releasedTempIds.includes(c.id));
  return [...active, ...store.inactiveCustomers];
}

export function getActiveProfiles(store: AppStore): CustomerDetailProfile[] {
  return store.customers.filter((c) => !store.releasedTempIds.includes(c.id));
}

export function getCustomerById(store: AppStore, id: string): CustomerDetailProfile | undefined {
  return getAllCustomerProfiles(store).find((c) => c.id === id);
}

export function countBookedFlats(store: AppStore): BookedFlatsSummary {
  const active = getActiveProfiles(store).filter((c) => c.status !== "inactive");
  const temporary = active.filter((c) => c.bookingType === "temporary").length;
  const confirmed = active.filter((c) => c.bookingType === "payment").length;
  return { total: temporary + confirmed, temporary, confirmed };
}

export function isFlatReleased(store: AppStore, flatNo: string): boolean {
  const released = [
    ...store.inactiveCustomers.filter((c) => c.flatReleased),
    ...store.releasedTempIds.map((id) => store.customers.find((c) => c.id === id)).filter(Boolean),
  ];
  return released.some((c) => c && flatKeysMatch(c.flat, flatNo, flatNo));
}

export function proceedTemporaryBooking(
  store: AppStore,
  profile: CustomerDetailProfile,
  initialPayment?: { amount: number; method: string; date: string }
): AppStore {
  const idx = store.customers.findIndex((c) => c.id === profile.id);
  const updated: CustomerDetailProfile = {
    ...profile,
    bookingType: "payment",
    status: "active",
    holdingDueDate: undefined,
  };
  let next: AppStore;
  if (idx >= 0) {
    const customers = [...store.customers];
    customers[idx] = updated;
    next = { ...store, customers };
  } else {
    next = { ...store, customers: [...store.customers, updated] };
  }
  next.releasedTempIds = next.releasedTempIds.filter((id) => id !== profile.id);
  if (initialPayment && initialPayment.amount > 0) {
    const payment: ReceivedPayment = {
      id: `RP-${Date.now()}`,
      customer: updated.name,
      flat: updated.flat,
      category: "Flat Payment",
      amount: updated.bookingSlab10?.amount ?? Math.round(updated.amount * 0.1),
      received: initialPayment.amount,
      method: initialPayment.method,
      date: initialPayment.date,
      status: "partial",
    };
    return { ...next, receivedPayments: [...next.receivedPayments, payment] };
  }
  return next;
}

export function registerCustomer(
  store: AppStore,
  profile: CustomerDetailProfile,
  initialPayment?: { amount: number; method: string; date: string }
): AppStore {
  let next: AppStore = { ...store, customers: [...store.customers, profile] };
  if (initialPayment && initialPayment.amount > 0) {
    const payment: ReceivedPayment = {
      id: `RP-${Date.now()}`,
      customer: profile.name,
      flat: profile.flat,
      category: "Flat Payment",
      amount: profile.bookingSlab10?.amount ?? Math.round(profile.amount * 0.1),
      received: initialPayment.amount,
      method: initialPayment.method,
      date: initialPayment.date,
      status: "partial",
    };
    next = { ...next, receivedPayments: [...next.receivedPayments, payment] };
  }
  return next;
}

export interface AllocatePaymentInput {
  customerId: string;
  category: PaymentCategoryKey;
  amount: number;
  method: string;
  date: string;
}

export function allocatePayment(store: AppStore, input: AllocatePaymentInput): AppStore {
  const idx = store.customers.findIndex((c) => c.id === input.customerId);
  if (idx < 0) return store;

  const before = store.customers[idx];
  const dueBefore =
    input.category === "flat"
      ? getActiveSlabFromLedger(before.slabLedger)?.remainingAmount ??
        before.categories.find((c) => c.key === "flat")?.remaining ??
        0
      : before.categories.find((c) => c.key === input.category)?.remaining ?? 0;

  let customer = { ...before };

  if (input.category === "flat") {
    const result = allocateFlatPayment(customer, input.amount);
    customer = result.customer;
  } else {
    customer = {
      ...customer,
      categories: applyCategoryPayment(customer.categories, input.category, input.amount),
    };
  }

  const customers = [...store.customers];
  customers[idx] = customer;

  const payment: ReceivedPayment = {
    id: `RP-${Date.now()}`,
    customer: customer.name,
    flat: customer.flat,
    category:
      input.category === "flat"
        ? "Flat Payment"
        : input.category === "gst"
          ? "GST"
          : input.category === "stamp"
            ? "Stamp Duty"
            : input.category === "agreement"
              ? "Agreement"
              : input.category === "parking"
                ? "Parking"
                : "Electrical Bill",
    amount: dueBefore,
    received: input.amount,
    method: input.method,
    date: input.date,
    status: input.amount >= dueBefore ? "paid" : "partial",
  };

  return {
    ...store,
    customers,
    receivedPayments: [...store.receivedPayments, payment],
  };
}

export function deactivateCustomer(
  store: AppStore,
  customerId: string,
  reason: string,
  date: string
): { store: AppStore; savedToInactive: boolean } {
  const idx = store.customers.findIndex((c) => c.id === customerId);
  if (idx < 0) return { store, savedToInactive: false };

  const customer = store.customers[idx];
  const released: CustomerDetailProfile = {
    ...customer,
    status: "inactive",
    inactiveReason: reason,
    inactiveDate: date,
    flatReleased: true,
    currentSlabLabel: "—",
    notes: `${customer.notes ? customer.notes + " — " : ""}Discontinued: ${reason}`,
  };

  const customers = store.customers.filter((c) => c.id !== customerId);

  if (customer.bookingType === "temporary") {
    return {
      store: {
        ...store,
        customers,
        releasedTempIds: [...store.releasedTempIds, customerId],
      },
      savedToInactive: false,
    };
  }

  const inactive = released as InactiveCustomerRecord;
  return {
    store: {
      ...store,
      customers,
      inactiveCustomers: [...store.inactiveCustomers, inactive],
    },
    savedToInactive: true,
  };
}

export function addSlab(store: AppStore, slab: SlabEntry): AppStore {
  return { ...store, slabs: [...store.slabs, slab] };
}

export function setSlabs(store: AppStore, slabs: SlabEntry[]): AppStore {
  return { ...store, slabs };
}

export function addProject(store: AppStore, project: ProjectData): AppStore {
  const idx = store.projects.findIndex((p) => p.id === project.id);
  const projects =
    idx >= 0 ? store.projects.map((p, i) => (i === idx ? project : p)) : [...store.projects, project];
  return { ...store, projects };
}

export function removeProject(store: AppStore, projectId: string): AppStore {
  return {
    ...store,
    projects: store.projects.filter((p) => p.id !== projectId),
  };
}

export interface CreateInvoiceInput {
  paymentId: string;
  customerName: string;
  flat: string;
  amount: number;
  date: string;
  customerId?: string;
}

function nextInvoiceNo(store: AppStore): string {
  const year = new Date().getFullYear();
  const count = store.invoices.length + 1;
  return `INV-${year}-${String(count).padStart(4, "0")}`;
}

function supersedeActiveInvoicesForPayment(store: AppStore, paymentId: string): AppStore {
  const today = new Date().toISOString().slice(0, 10);
  let changed = false;
  const invoices = store.invoices.map((inv) => {
    if (inv.paymentId === paymentId && (inv.lifecycle ?? "active") === "active") {
      changed = true;
      return { ...inv, lifecycle: "superseded" as const, supersededAt: today };
    }
    return inv;
  });
  return changed ? { ...store, invoices } : store;
}

export function updateReceivedPayment(
  store: AppStore,
  id: string,
  patch: Partial<Pick<ReceivedPayment, "received" | "method" | "date" | "status">>
): AppStore {
  const idx = store.receivedPayments.findIndex((p) => p.id === id);
  if (idx < 0) return store;
  const updated = { ...store.receivedPayments[idx], ...patch };
  const receivedPayments = [...store.receivedPayments];
  receivedPayments[idx] = updated;
  const withPayment = { ...store, receivedPayments };
  return supersedeActiveInvoicesForPayment(withPayment, id);
}

export function createInvoice(store: AppStore, input: CreateInvoiceInput): AppStore {
  if (
    store.invoices.some(
      (i) => i.paymentId === input.paymentId && (i.lifecycle ?? "active") === "active"
    )
  ) {
    return store;
  }

  const paymentInvoices = store.invoices.filter((i) => i.paymentId === input.paymentId);
  const revision =
    paymentInvoices.length > 0
      ? Math.max(...paymentInvoices.map((i) => i.revision ?? 1)) + 1
      : 1;

  const lastSuperseded = [...paymentInvoices]
    .filter((i) => i.lifecycle === "superseded")
    .sort((a, b) => (b.supersededAt ?? b.date).localeCompare(a.supersededAt ?? a.date))[0];

  const invoice: Invoice = {
    id: `INV-${Date.now()}`,
    invoiceNo: nextInvoiceNo(store),
    customerName: input.customerName,
    customerId: input.customerId,
    flat: input.flat,
    amount: input.amount,
    paymentId: input.paymentId,
    date: input.date,
    status: "issued",
    lifecycle: "active",
    revision,
    supersedesInvoiceId: lastSuperseded?.id,
  };

  return { ...store, invoices: [...store.invoices, invoice] };
}

export function queueWhatsApp(
  store: AppStore,
  entry: { templateName: string; recipientCount: number }
): AppStore {
  const item = {
    id: `WA-${Date.now()}`,
    batchId: `batch-${Date.now()}`,
    templateName: entry.templateName,
    recipientCount: entry.recipientCount,
    status: "queued" as const,
    createdAt: new Date().toISOString(),
  };
  return { ...store, whatsappOutbox: [...store.whatsappOutbox, item] };
}