/**
 * Central app state — persisted to localStorage (default).
 * Set VITE_USE_API=true to delegate to Express API via apiRepository.
 */

import { useState, useCallback, useEffect, useMemo } from "react";
import type { CustomerDetailProfile } from "@/lib/customers/customerDetailTypes";
import type { PaymentCategoryKey } from "@/lib/customers/customerDetailTypes";
import { getActiveSlabFromLedger } from "@/lib/customers/slabAllocator";
import { getCategoryDue } from "@/lib/customers/categoryTotals";
import { loadStore, saveStore } from "@/lib/storage/localStorageRepo";
import {
  hydrateFromApi,
  refreshCustomerData,
  apiRepository,
} from "@/lib/storage/apiRepository";
import {
  toLegacyCustomer,
  getAllCustomerProfiles,
  getActiveProfiles,
  getCustomerById,
  countBookedFlats,
  isFlatReleased,
  registerCustomer as registerCustomerOp,
  proceedTemporaryBooking as proceedTemporaryOp,
  allocatePayment as allocatePaymentOp,
  deactivateCustomer as deactivateCustomerOp,
  addSlab as addSlabOp,
  setSlabs as setSlabsOp,
  addProject as addProjectOp,
  removeProject as removeProjectOp,
  createInvoice as createInvoiceOp,
  updateReceivedPayment as updateReceivedPaymentOp,
  queueWhatsApp,
  type AllocatePaymentInput,
  type CreateInvoiceInput,
} from "@/lib/storage/storeOperations";
import { STORE_VERSION } from "@/lib/storage/storeKeys";
import type { AppStore } from "@/lib/storage/storeTypes";
import type { Customer, ProjectData, ReceivedPayment, SlabEntry } from "@/lib/types";
import type {
  Contractor,
  ContractorStatus,
  Material,
  PoLineItem,
  PurchaseOrder,
  PurchaseRequest,
  Supplier,
  SupplierStatus,
  WorkMaterialLine,
  WorkOrder,
  WorkOrderRequest,
} from "@/lib/inventory/inventoryTypes";
import { summarizePoItems, sumPoLineTotals } from "@/lib/inventory/poLineItems";
import type {
  AddPartyReceivedPaymentInput,
  PartyReceivedPayment,
} from "@/lib/inventory/partyPaymentTypes";
import { nextPartyReceiptId } from "@/lib/inventory/partyPaymentTypes";
import { isPoPayable } from "@/lib/inventory/poTotals";
import { isWoPayable } from "@/lib/inventory/workOrderStock";
import {
  buildMaterialFromForm,
  type AddMaterialFormInput,
} from "@/lib/inventory/createMaterial";
import {
  buildSupplierFromForm,
  normalizeSupplier,
  type AddSupplierFormInput,
} from "@/lib/inventory/createSupplier";
import {
  buildContractorFromForm,
  normalizeContractor,
  type AddContractorFormInput,
} from "@/lib/inventory/createContractor";
import {
  buildPurchaseRequestFromForm,
  type AddPurchaseRequestFormInput,
} from "@/lib/inventory/createPurchaseRequest";
import {
  markRequestApproved,
  purchaseOrderFromApprovedRequest,
} from "@/lib/inventory/approvePurchaseRequest";
import { computePoTotals, DEFAULT_GST_RATE } from "@/lib/inventory/poTotals";
import {
  buildWorkOrderRequestFromForm,
  type AddWorkOrderRequestFormInput,
} from "@/lib/inventory/createWorkOrderRequest";
import {
  markRequestGenerated,
  workOrderFromRequest,
} from "@/lib/inventory/generateWorkOrder";
import {
  applyMaterialIssues,
  applyMaterialReturns,
  clampReturnLines,
  isWoPayable,
} from "@/lib/inventory/workOrderStock";
import type { AddCustomerFormInput } from "@/lib/customers/buildCustomerProfile";
import { buildCustomerProfile } from "@/lib/customers/buildCustomerProfile";
import { canEditBusinessProfile } from "@/lib/auth/businessProfileAccess";
import { registerLocalUser } from "@/lib/auth/registeredUsersStore";
import {
  createDefaultBusinessProfile,
  createDefaultInventorySettings,
  createDefaultModuleSettings,
  createDefaultProfileSettings,
  createDefaultSalesSettings,
  resolveBusinessProfile,
  resolveInventorySettings,
  resolveSalesSettings,
} from "@/lib/settings/defaultSettings";
import type {
  BusinessProfileData,
  InventorySettingsData,
  InvoiceTemplateSettings,
  MessengerTemplateSettings,
  ModuleSettingsData,
  ProfileSettingsData,
  SalesSettingsData,
} from "@/lib/settings/settingsTypes";

const USE_API = import.meta.env.VITE_USE_API === "true";

function createEmptyStore(): AppStore {
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

export function useAppData() {
  const [store, setStore] = useState<AppStore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!USE_API) {
      setStore(loadStore());
      setLoading(false);
      return;
    }

    let cancelled = false;
    hydrateFromApi()
      .then((data) => {
        if (!cancelled) setStore(data);
      })
      .catch((err) => {
        console.error("Failed to load from API:", err);
        if (!cancelled) setStore(createEmptyStore());
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((next: AppStore) => {
    setStore(next);
    if (!USE_API) saveStore(next);
  }, []);

  const customerProfiles = useMemo(
    () => (store ? getAllCustomerProfiles(store) : []),
    [store]
  );

  const activeProfiles = useMemo(
    () => (store ? getActiveProfiles(store) : []),
    [store]
  );

  const customers: Customer[] = useMemo(
    () => activeProfiles.filter((c) => c.status !== "inactive").map(toLegacyCustomer),
    [activeProfiles]
  );

  const projects = store?.projects ?? [];
  const slabs = store?.slabs ?? [];
  const receivedPayments = store?.receivedPayments ?? [];
  const invoices = store?.invoices ?? [];

  const businessProfile = useMemo(
    () => resolveBusinessProfile(store?.businessProfile),
    [store?.businessProfile]
  );

  const profileSettings = useMemo(
    () => store?.profileSettings ?? createDefaultProfileSettings(),
    [store?.profileSettings]
  );

  const salesSettings = useMemo(
    () => resolveSalesSettings(store?.salesSettings),
    [store?.salesSettings]
  );

  const invoiceTemplate = salesSettings.invoiceTemplate;
  const messengerTemplates = salesSettings.messengerTemplates;

  const addProject = useCallback(
    async (p: ProjectData) => {
      if (!store) return;
      if (USE_API) {
        try {
          const created = await apiRepository.projects.create(p);
          persist({ ...store, projects: [...store.projects, created] });
        } catch (err) {
          console.error("addProject API error:", err);
        }
        return;
      }
      persist(addProjectOp(store, p));
    },
    [store, persist]
  );

  const removeProject = useCallback(
    async (
      projectId: string,
      credentials?: { username: string; password: string }
    ): Promise<boolean> => {
      if (!store) return false;
      if (USE_API) {
        try {
          await apiRepository.projects.remove(projectId, credentials);
        } catch (err) {
          console.error("removeProject API error:", err);
          return false;
        }
      }
      persist(removeProjectOp(store, projectId));
      return true;
    },
    [store, persist]
  );

  const registerCustomer = useCallback(
    async (
      input: AddCustomerFormInput,
      initialPayment?: { amount: number; method: string; date: string },
      options?: { proceedExisting?: boolean }
    ) => {
      if (!store) return null;

      if (USE_API) {
        try {
          const profile = options?.proceedExisting
            ? await apiRepository.temporary.proceed(
                input.id,
                initialPayment ? { initialPayment } : undefined
              )
            : await apiRepository.addCustomer.register({ profile: input, initialPayment });

          const refreshed = await refreshCustomerData();
          persist({ ...store, ...refreshed });
          return profile;
        } catch (err) {
          console.error("registerCustomer API error:", err);
          return null;
        }
      }

      const profile = buildCustomerProfile(input);
      const next = options?.proceedExisting
        ? proceedTemporaryOp(store, profile, initialPayment)
        : registerCustomerOp(store, profile, initialPayment);
      persist(next);
      return profile;
    },
    [store, persist]
  );

  const addCustomer = useCallback(
    async (c: Customer) => {
      if (!store) return;
      const existing = getCustomerById(store, c.id);
      if (existing) return;

      if (USE_API) {
        try {
          await apiRepository.addCustomer.create(c);
          const refreshed = await refreshCustomerData();
          persist({ ...store, ...refreshed });
        } catch (err) {
          console.error("addCustomer API error:", err);
        }
        return;
      }

      const profile: CustomerDetailProfile = {
        ...c,
        phone: "",
        email: "",
        address: "",
        idProof: "",
        idNumber: "",
        unitType: "Residential",
        flatType: "2BHK",
        building: "",
        wing: "",
        area: "",
        parking: "no",
        loanStatus: "No",
        bookingType: "payment",
        pricing: {
          baseAmount: c.amount,
          gstPct: 5,
          gstAmount: 0,
          stampDuty: 0,
          agreementPrice: 0,
          electricalBill: 0,
          parkingAmount: 0,
          grandTotal: c.amount,
        },
        slabLedger: [],
        categories: [],
        notes: "",
        currentSlabLabel: "—",
        status: c.status as CustomerDetailProfile["status"],
      };
      persist(registerCustomerOp(store, profile));
    },
    [store, persist]
  );

  const allocatePayment = useCallback(
    async (input: AllocatePaymentInput) => {
      if (!store) return;

      if (USE_API) {
        try {
          await apiRepository.payments.allocate(input);
          const refreshed = await refreshCustomerData();
          persist({ ...store, ...refreshed });
        } catch (err) {
          console.error("allocatePayment API error:", err);
        }
        return;
      }

      persist(allocatePaymentOp(store, input));
    },
    [store, persist]
  );

  const deactivateCustomer = useCallback(
    async (customerId: string, reason: string, date: string) => {
      if (!store) return { savedToInactive: false };

      if (USE_API) {
        try {
          const existing = store.customers.find((c) => c.id === customerId);
          await apiRepository.inactive.deactivate(customerId, { reason, date });

          if (existing?.bookingType === "temporary") {
            persist({
              ...store,
              customers: store.customers.filter((c) => c.id !== customerId),
              releasedTempIds: [...store.releasedTempIds, customerId],
            });
            return { savedToInactive: false };
          }

          const refreshed = await refreshCustomerData();
          persist({ ...store, ...refreshed });
          return { savedToInactive: true };
        } catch (err) {
          console.error("deactivateCustomer API error:", err);
          return { savedToInactive: false };
        }
      }

      const { store: next, savedToInactive } = deactivateCustomerOp(store, customerId, reason, date);
      persist(next);
      return { savedToInactive };
    },
    [store, persist]
  );

  const setSlabs = useCallback(
    async (updater: SlabEntry[] | ((prev: SlabEntry[]) => SlabEntry[])) => {
      if (!store) return;
      const nextSlabs = typeof updater === "function" ? updater(store.slabs) : updater;

      if (USE_API) {
        try {
          const updated = await apiRepository.slabs.replaceAll(nextSlabs);
          persist({ ...store, slabs: updated });
        } catch (err) {
          console.error("setSlabs API error:", err);
        }
        return;
      }

      persist(setSlabsOp(store, nextSlabs));
    },
    [store, persist]
  );

  const addSlab = useCallback(
    async (s: SlabEntry) => {
      if (!store) return;

      if (USE_API) {
        try {
          const created = await apiRepository.slabs.create(s);
          persist({ ...store, slabs: [...store.slabs, created] });
        } catch (err) {
          console.error("addSlab API error:", err);
        }
        return;
      }

      persist(addSlabOp(store, s));
    },
    [store, persist]
  );

  const createInvoice = useCallback(
    async (input: CreateInvoiceInput) => {
      if (!store) return null;

      if (USE_API) {
        try {
          const created = await apiRepository.invoices.create(input);
          persist({ ...store, invoices: [...store.invoices, created] });
          return created;
        } catch (err) {
          console.error("createInvoice API error:", err);
          return null;
        }
      }

      const next = createInvoiceOp(store, input);
      persist(next);
      return next.invoices[next.invoices.length - 1] ?? null;
    },
    [store, persist]
  );

  const addReceivedPayment = useCallback(
    async (r: ReceivedPayment) => {
      if (!store) return;

      if (USE_API) {
        try {
          const created = await apiRepository.received.create(r);
          persist({ ...store, receivedPayments: [...store.receivedPayments, created] });
        } catch (err) {
          console.error("addReceivedPayment API error:", err);
        }
        return;
      }

      persist({ ...store, receivedPayments: [...store.receivedPayments, r] });
    },
    [store, persist]
  );

  const updateReceivedPayment = useCallback(
    async (
      id: string,
      patch: Partial<Pick<ReceivedPayment, "received" | "method" | "date" | "status">>
    ) => {
      if (!store) return null;

      if (USE_API) {
        try {
          const updated = await apiRepository.received.update(id, patch);
          const withPayment = {
            ...store,
            receivedPayments: store.receivedPayments.map((p) => (p.id === id ? updated : p)),
          };
          const next = updateReceivedPaymentOp(withPayment, id, patch);
          persist(next);
          return updated;
        } catch (err) {
          console.error("updateReceivedPayment API error:", err);
          return null;
        }
      }

      const next = updateReceivedPaymentOp(store, id, patch);
      persist(next);
      return next.receivedPayments.find((p) => p.id === id) ?? null;
    },
    [store, persist]
  );

  const sendWhatsAppBulk = useCallback(
    async (templateName: string, recipientCount: number) => {
      if (!store) return;

      if (USE_API) {
        try {
          const recipients = store.customers
            .filter((c) => c.status !== "inactive" && c.phone)
            .slice(0, recipientCount)
            .map((c) => ({
              customerId: c.id,
              phone: c.phone,
              variables: { owner_name: c.name, flat_name: c.flat },
            }));

          const response = await apiRepository.whatsappBulk.sendBulk({
            templateName,
            recipients,
          });

          persist({
            ...store,
            whatsappOutbox: [
              ...store.whatsappOutbox,
              {
                id: response.batchId,
                batchId: response.batchId,
                templateName,
                recipientCount: response.queued,
                status: "queued" as const,
                createdAt: new Date().toISOString(),
              },
            ],
          });
        } catch (err) {
          console.error("sendWhatsAppBulk API error:", err);
        }
        return;
      }

      persist(queueWhatsApp(store, { templateName, recipientCount }));
    },
    [store, persist]
  );

  const getDetail = useCallback(
    (id: string) => (store ? getCustomerById(store, id) : undefined),
    [store]
  );

  const getActiveSlab = useCallback(
    (id: string) => {
      const c = store ? getCustomerById(store, id) : undefined;
      if (!c || c.status === "inactive") return null;
      return getActiveSlabFromLedger(c.slabLedger);
    },
    [store]
  );

  const getCategoryDueFor = useCallback(
    (id: string, cat: PaymentCategoryKey) => {
      const c = store ? getCustomerById(store, id) : undefined;
      if (!c || c.status === "inactive") return 0;
      return getCategoryDue(c.categories, cat);
    },
    [store]
  );

  const bookedFlatsSummary = useMemo(
    () => (store ? countBookedFlats(store) : { total: 0, temporary: 0, confirmed: 0 }),
    [store]
  );

  const checkFlatReleased = useCallback(
    (flatNo: string) => (store ? isFlatReleased(store, flatNo) : false),
    [store]
  );

  const registerUser = useCallback(
    async (input: {
      userId: string;
      fullName: string;
      email: string;
      password: string;
    }) => {
      if (USE_API) {
        await apiRepository.registration.register(input);
        return input;
      }
      const user = registerLocalUser(input);
      if (store && !resolveBusinessProfile(store.businessProfile).ownerEmail) {
        const bp = resolveBusinessProfile(store.businessProfile);
        persist({
          ...store,
          businessProfile: {
            ...bp,
            ownerEmail: input.email.trim(),
            email: input.email.trim(),
          },
        });
      }
      return user;
    },
    [store, persist]
  );

  const updateBusinessProfile = useCallback(
    async (patch: Partial<BusinessProfileData>) => {
      if (!store) return null;
      const current = resolveBusinessProfile(store.businessProfile);
      const loggedInEmail = store.profileSettings?.email ?? "";
      if (!canEditBusinessProfile(current, loggedInEmail)) {
        console.warn("Business profile edit denied: not owner");
        return null;
      }
      const { ownerEmail: _owner, ...safePatch } = patch;
      if (USE_API) {
        try {
          const updated = await apiRepository.businessProfile.update(safePatch);
          persist({ ...store, businessProfile: { ...current, ...updated } });
          return { ...current, ...updated };
        } catch (err) {
          console.error("updateBusinessProfile API error:", err);
          return null;
        }
      }
      const updated = { ...current, ...safePatch, isActivated: true };
      persist({ ...store, businessProfile: updated });
      return updated;
    },
    [store, persist]
  );

  const updateProfileSettings = useCallback(
    async (patch: Partial<ProfileSettingsData>) => {
      if (!store) return null;
      if (USE_API) {
        try {
          const updated = await apiRepository.profileSettings.update(patch);
          persist({ ...store, profileSettings: updated });
          return updated;
        } catch (err) {
          console.error("updateProfileSettings API error:", err);
          return null;
        }
      }
      const updated = { ...createDefaultProfileSettings(store.profileSettings), ...patch };
      persist({ ...store, profileSettings: updated });
      return updated;
    },
    [store, persist]
  );

  const updateInvoiceTemplate = useCallback(
    async (patch: Partial<InvoiceTemplateSettings>) => {
      if (!store) return null;
      const current = resolveSalesSettings(store.salesSettings);
      const nextTemplate = { ...current.invoiceTemplate, ...patch };
      if (USE_API) {
        try {
          const updated = await apiRepository.salesSettings.updateInvoiceTemplate(patch);
          persist({
            ...store,
            salesSettings: { ...current, invoiceTemplate: updated },
          });
          return updated;
        } catch (err) {
          console.error("updateInvoiceTemplate API error:", err);
          return null;
        }
      }
      const next: SalesSettingsData = { ...current, invoiceTemplate: nextTemplate };
      persist({ ...store, salesSettings: next });
      return nextTemplate;
    },
    [store, persist]
  );

  const updateMessengerTemplates = useCallback(
    async (patch: Partial<MessengerTemplateSettings>) => {
      if (!store) return null;
      const current = resolveSalesSettings(store.salesSettings);
      const nextTemplates = { ...current.messengerTemplates, ...patch };
      if (USE_API) {
        try {
          const updated = await apiRepository.salesSettings.updateMessengerTemplates(patch);
          persist({
            ...store,
            salesSettings: { ...current, messengerTemplates: updated },
          });
          return updated;
        } catch (err) {
          console.error("updateMessengerTemplates API error:", err);
          return null;
        }
      }
      const next: SalesSettingsData = { ...current, messengerTemplates: nextTemplates };
      persist({ ...store, salesSettings: next });
      return nextTemplates;
    },
    [store, persist]
  );

  const updateCustomerModuleSettings = useCallback(
    async (patch: Partial<ModuleSettingsData>) => {
      if (!store) return null;
      if (USE_API) {
        try {
          const updated = await apiRepository.customerSettings.update(patch);
          persist({ ...store, customerSettings: updated });
          return updated;
        } catch (err) {
          console.error("update customerSettings API error:", err);
          return null;
        }
      }
      const current = store.customerSettings ?? createDefaultModuleSettings();
      const updated = { ...current, ...patch };
      persist({ ...store, customerSettings: updated });
      return updated;
    },
    [store, persist]
  );

  const updateInventorySettings = useCallback(
    async (patch: Partial<InventorySettingsData>) => {
      if (!store) return null;
      if (USE_API) {
        try {
          const updated = await apiRepository.inventorySettings.update(patch);
          persist({ ...store, inventorySettings: resolveInventorySettings(updated) });
          return resolveInventorySettings(updated);
        } catch (err) {
          console.error("update inventorySettings API error:", err);
          return null;
        }
      }
      const current = resolveInventorySettings(store.inventorySettings);
      const updated = resolveInventorySettings({ ...current, ...patch });
      persist({ ...store, inventorySettings: updated });
      return updated;
    },
    [store, persist]
  );

  const getInvoiceById = useCallback(
    (id: string) => invoices.find((inv) => inv.id === id),
    [invoices]
  );

  const getPaymentById = useCallback(
    (id: string) => receivedPayments.find((p) => p.id === id),
    [receivedPayments]
  );

  const materials: Material[] = useMemo(() => {
    return store?.materials ?? [];
  }, [store?.materials]);

  const purchaseOrders: PurchaseOrder[] = useMemo(() => {
    return store?.purchaseOrders ?? [];
  }, [store?.purchaseOrders]);

  const purchaseRequests: PurchaseRequest[] = useMemo(() => {
    return store?.purchaseRequests ?? [];
  }, [store?.purchaseRequests]);

  const addPurchaseRequest = useCallback(
    (input: Omit<AddPurchaseRequestFormInput, "requestIdPrefix" | "requestIdNext">) => {
      if (!store) return null;
      const inv = resolveInventorySettings(store.inventorySettings);
      const request = buildPurchaseRequestFromForm({
        ...input,
        requestIdPrefix: inv.requestIdPrefix,
        requestIdNext: inv.requestIdNext,
      });
      const next = [...(store.purchaseRequests ?? purchaseRequests), request];
      const nextSettings = resolveInventorySettings({
        ...inv,
        requestIdNext: inv.requestIdNext + 1,
      });
      persist({ ...store, purchaseRequests: next, inventorySettings: nextSettings });
      return request;
    },
    [store, purchaseRequests, persist]
  );

  /** Approve request → create payable PO (purchase id) + link. */
  const approvePurchaseRequest = useCallback(
    (requestId: string) => {
      if (!store) return null;
      const inv = resolveInventorySettings(store.inventorySettings);
      const list = store.purchaseRequests ?? purchaseRequests;
      const req = list.find((r) => r.id === requestId || r.requestNo === requestId);
      if (!req || req.status !== "pending") return null;

      const po = purchaseOrderFromApprovedRequest(req, inv.poIdPrefix, inv.poIdNext);
      const nextRequests = list.map((r) =>
        r.id === req.id ? markRequestApproved(r, po.id) : r
      );
      const nextPos = [...(store.purchaseOrders ?? purchaseOrders), po];
      const nextSettings = resolveInventorySettings({
        ...inv,
        poIdNext: inv.poIdNext + 1,
      });
      persist({
        ...store,
        purchaseRequests: nextRequests,
        purchaseOrders: nextPos,
        inventorySettings: nextSettings,
      });
      return po;
    },
    [store, purchaseRequests, purchaseOrders, persist]
  );

  const rejectPurchaseRequest = useCallback(
    (requestId: string) => {
      if (!store) return false;
      const list = store.purchaseRequests ?? purchaseRequests;
      const next = list.map((r) =>
        r.id === requestId || r.requestNo === requestId
          ? { ...r, status: "rejected" as const }
          : r
      );
      persist({ ...store, purchaseRequests: next });
      return true;
    },
    [store, purchaseRequests, persist]
  );

  const getPurchaseOrderById = useCallback(
    (poId: string) => {
      return purchaseOrders.find((p) => p.id === poId);
    },
    [purchaseOrders]
  );

  const getPurchaseRequestById = useCallback(
    (id: string) => {
      return purchaseRequests.find((r) => r.id === id || r.requestNo === id);
    },
    [purchaseRequests]
  );

  /**
   * Edit PO amounts after approve (especially when grand total was 0).
   * Does not write to supplier master — only updates the unique PO record.
   * Sets payable when grandTotal > 0.
   */
  const workOrderRequests: WorkOrderRequest[] = useMemo(() => {
    return store?.workOrderRequests ?? [];
  }, [store?.workOrderRequests]);

  const workOrders: WorkOrder[] = useMemo(() => {
    return store?.workOrders ?? [];
  }, [store?.workOrders]);

  const addWorkOrderRequest = useCallback(
    (
      input: Omit<
        AddWorkOrderRequestFormInput,
        "workRequestIdPrefix" | "workRequestIdNext"
      >
    ) => {
      if (!store) return null;
      const inv = resolveInventorySettings(store.inventorySettings);
      const request = buildWorkOrderRequestFromForm({
        ...input,
        workRequestIdPrefix: inv.workRequestIdPrefix,
        workRequestIdNext: inv.workRequestIdNext,
      });
      const next = [...(store.workOrderRequests ?? workOrderRequests), request];
      const nextSettings = resolveInventorySettings({
        ...inv,
        workRequestIdNext: inv.workRequestIdNext + 1,
      });
      persist({ ...store, workOrderRequests: next, inventorySettings: nextSettings });
      return request;
    },
    [store, workOrderRequests, persist]
  );

  /** Generate unique WO from request; deduct issued materials from stock. */
  const generateWorkOrder = useCallback(
    (requestId: string) => {
      if (!store) return null;
      const inv = resolveInventorySettings(store.inventorySettings);
      const list = store.workOrderRequests ?? workOrderRequests;
      const req = list.find((r) => r.id === requestId || r.requestNo === requestId);
      if (!req || req.status !== "pending") return null;

      const wo = workOrderFromRequest(req, inv.workOrderIdPrefix, inv.workOrderIdNext);
      const catalog = store.materials ?? materials;
      const nextMaterials = applyMaterialIssues(catalog, wo.materialIssues ?? []);
      const nextRequests = list.map((r) =>
        r.id === req.id ? markRequestGenerated(r, wo.id) : r
      );
      const nextWos = [...(store.workOrders ?? workOrders), wo];
      const nextSettings = resolveInventorySettings({
        ...inv,
        workOrderIdNext: inv.workOrderIdNext + 1,
      });
      persist({
        ...store,
        workOrderRequests: nextRequests,
        workOrders: nextWos,
        materials: nextMaterials,
        inventorySettings: nextSettings,
      });
      return wo;
    },
    [store, workOrderRequests, workOrders, materials, persist]
  );

  const rejectWorkOrderRequest = useCallback(
    (requestId: string) => {
      if (!store) return false;
      const list = store.workOrderRequests ?? workOrderRequests;
      const next = list.map((r) =>
        r.id === requestId || r.requestNo === requestId
          ? { ...r, status: "rejected" as const }
          : r
      );
      persist({ ...store, workOrderRequests: next });
      return true;
    },
    [store, workOrderRequests, persist]
  );

  const getWorkOrderById = useCallback(
    (id: string) => workOrders.find((w) => w.id === id),
    [workOrders]
  );

  const getWorkOrderRequestById = useCallback(
    (id: string) =>
      workOrderRequests.find((r) => r.id === id || r.requestNo === id),
    [workOrderRequests]
  );

  const partyReceivedPayments: PartyReceivedPayment[] = useMemo(() => {
    return store?.partyReceivedPayments ?? [];
  }, [store?.partyReceivedPayments]);

  const getPartyPaymentById = useCallback(
    (id: string) => partyReceivedPayments.find((p) => p.id === id),
    [partyReceivedPayments]
  );

  /**
   * Record payment against a payable PO or WO (no GST).
   * Updates amountPaid on the source document + appends payment log.
   */
  const addPartyReceivedPayment = useCallback(
    (input: AddPartyReceivedPaymentInput) => {
      if (!store) return null;
      const received = Math.max(0, Number(input.received) || 0);
      if (received <= 0) return null;

      if (input.sourceType === "purchase_order") {
        const pos = store.purchaseOrders ?? purchaseOrders;
        const po = pos.find((p) => p.id === input.sourceId);
        if (!po || !isPoPayable(po)) return null;
        const total = po.grandTotal ?? po.amountTotal ?? 0;
        const paid = po.amountPaid ?? 0;
        const remaining = Math.max(0, total - paid);
        if (received > remaining) return null;
        const newPaid = paid + received;
        // Use store only — suppliers memo is declared later in this hook (avoid TDZ).
        const sup = (store.suppliers ?? []).find((s) => s.id === input.partyId);
        const partyAddress = [sup?.address, sup?.pinCode].filter(Boolean).join(", ");
        const existingPayIds = (store.partyReceivedPayments ?? []).map((p) => p.id);
        const entry: PartyReceivedPayment = {
          id: nextPartyReceiptId("supplier", existingPayIds),
          partyType: "supplier",
          partyId: input.partyId,
          partyName: input.partyName,
          sourceType: "purchase_order",
          sourceId: po.id,
          amountTotal: total,
          amountRemainingBefore: remaining,
          received,
          remainingAfter: Math.max(0, total - newPaid),
          method: input.method,
          date: input.date,
          note: input.note,
          materialDescription: [po.materialName, po.productDescription]
            .filter(Boolean)
            .join(" — "),
          partyAddress: partyAddress || undefined,
          partyGstin: sup?.gstin || undefined,
          status: "recorded",
        };
        const nextPos = pos.map((p) =>
          p.id === po.id
            ? {
                ...p,
                amountPaid: newPaid,
                payable: total - newPaid > 0 || total > 0,
              }
            : p
        );
        const nextLog = [...(store.partyReceivedPayments ?? []), entry];
        persist({
          ...store,
          purchaseOrders: nextPos,
          partyReceivedPayments: nextLog,
        });
        return entry;
      }

      const wos = store.workOrders ?? workOrders;
      const wo = wos.find((w) => w.id === input.sourceId);
      if (!wo || !isWoPayable(wo)) return null;
      const total = wo.amountTotal ?? 0;
      const paid = wo.amountPaid ?? 0;
      const remaining = Math.max(0, total - paid);
      if (received > remaining) return null;
      const newPaid = paid + received;
      // Use store only — contractors memo is declared later in this hook (avoid TDZ).
      const con = (store.contractors ?? []).find((c) => c.id === input.partyId);
      const partyAddress = [con?.address, con?.pinCode].filter(Boolean).join(", ");
      const existingPayIds = (store.partyReceivedPayments ?? []).map((p) => p.id);
      const entry: PartyReceivedPayment = {
        id: nextPartyReceiptId("contractor", existingPayIds),
        partyType: "contractor",
        partyId: input.partyId,
        partyName: input.partyName,
        sourceType: "work_order",
        sourceId: wo.id,
        amountTotal: total,
        amountRemainingBefore: remaining,
        received,
        remainingAfter: Math.max(0, total - newPaid),
        method: input.method,
        date: input.date,
        note: input.note,
        workDescription: wo.description || wo.title,
        partyAddress: partyAddress || undefined,
        partyGstin: con?.gstin || undefined,
        status: "recorded",
      };
      const nextWos = wos.map((w) =>
        w.id === wo.id
          ? {
              ...w,
              amountPaid: newPaid,
              payable: total - newPaid > 0 || total > 0,
            }
          : w
      );
      const nextLog = [...(store.partyReceivedPayments ?? []), entry];
      persist({
        ...store,
        workOrders: nextWos,
        partyReceivedPayments: nextLog,
      });
      return entry;
    },
    [store, purchaseOrders, workOrders, persist]
  );

  /** Set work amount after generate — payable when > 0. No contractor master write. */
  const updateWorkOrderAmount = useCallback(
    (woId: string, amountTotal: number) => {
      if (!store) return null;
      const list = store.workOrders ?? workOrders;
      const idx = list.findIndex((w) => w.id === woId);
      if (idx < 0) return null;
      const prev = list[idx];
      const total = Math.max(0, Number(amountTotal) || 0);
      const nextWo: WorkOrder = {
        ...prev,
        amountTotal: total,
        amountPaid: Math.min(prev.amountPaid ?? 0, total),
        payable: total > 0,
      };
      const next = [...list];
      next[idx] = nextWo;
      persist({ ...store, workOrders: next });
      return nextWo;
    },
    [store, workOrders, persist]
  );

  /** Return unused materials → stock + (clamped to net issued). */
  const returnWorkOrderMaterials = useCallback(
    (woId: string, lines: WorkMaterialLine[]) => {
      if (!store) return null;
      const list = store.workOrders ?? workOrders;
      const idx = list.findIndex((w) => w.id === woId);
      if (idx < 0) return null;
      const prev = list[idx];
      const clamped = clampReturnLines(prev, lines);
      if (!clamped.length) return prev;
      const nextMaterials = applyMaterialReturns(
        store.materials ?? materials,
        clamped
      );
      const nextWo: WorkOrder = {
        ...prev,
        materialReturns: [...(prev.materialReturns ?? []), ...clamped],
      };
      const next = [...list];
      next[idx] = nextWo;
      persist({ ...store, workOrders: next, materials: nextMaterials });
      return nextWo;
    },
    [store, workOrders, materials, persist]
  );

  const updatePurchaseOrderAmounts = useCallback(
    (
      poId: string,
      patch: {
        quantity?: number;
        unitPrice?: number;
        lineTotal?: number;
        gstRate?: number;
        productDescription?: string;
        shipToAddress?: string;
        unit?: string;
        items?: PoLineItem[];
      }
    ) => {
      if (!store) return null;
      const list = store.purchaseOrders ?? purchaseOrders;
      const idx = list.findIndex((p) => p.id === poId);
      if (idx < 0) return null;
      const prev = list[idx];
      const gstRate =
        typeof patch.gstRate === "number"
          ? Math.max(0, patch.gstRate)
          : (prev.gstRate ?? DEFAULT_GST_RATE);

      let nextPo: PurchaseOrder;
      if (patch.items && patch.items.length > 0) {
        const items = patch.items.map((it) => ({
          ...it,
          materialName: it.materialName.trim(),
          productDescription: it.productDescription.trim(),
          unit: it.unit.trim() || "nos",
          quantity: Math.max(0, Number(it.quantity) || 0),
          unitPrice: Math.max(0, Number(it.unitPrice) || 0),
          lineTotal: Math.max(0, Number(it.lineTotal) || 0),
        }));
        const summary = summarizePoItems(items);
        const totals = computePoTotals({
          subTotal: sumPoLineTotals(items),
          gstRate,
        });
        nextPo = {
          ...prev,
          items,
          materialId: summary.materialId,
          materialName: summary.materialName,
          productDescription: summary.productDescription,
          unit: summary.unit,
          quantity: summary.quantity,
          unitPrice: summary.unitPrice,
          shipToAddress:
            patch.shipToAddress !== undefined
              ? patch.shipToAddress.trim()
              : prev.shipToAddress,
          subTotal: totals.subTotal,
          gstRate: totals.gstRate,
          gstAmount: totals.gstAmount,
          roundOff: totals.roundOff,
          grandTotal: totals.grandTotal,
          amountTotal: totals.grandTotal,
          amountPaid: Math.min(prev.amountPaid ?? 0, totals.grandTotal),
          payable: totals.grandTotal > 0,
        };
      } else {
        const quantity =
          typeof patch.quantity === "number" ? Math.max(0, patch.quantity) : prev.quantity;
        const unitPrice =
          typeof patch.unitPrice === "number"
            ? Math.max(0, patch.unitPrice)
            : (prev.unitPrice ?? 0);
        const lineTotal =
          typeof patch.lineTotal === "number"
            ? Math.max(0, patch.lineTotal)
            : (prev.subTotal ?? prev.amountTotal ?? 0);
        const totals = computePoTotals({ subTotal: lineTotal, gstRate });
        nextPo = {
          ...prev,
          quantity,
          unitPrice,
          unit: patch.unit?.trim() || prev.unit,
          productDescription:
            patch.productDescription !== undefined
              ? patch.productDescription.trim()
              : prev.productDescription,
          shipToAddress:
            patch.shipToAddress !== undefined
              ? patch.shipToAddress.trim()
              : prev.shipToAddress,
          subTotal: totals.subTotal,
          gstRate: totals.gstRate,
          gstAmount: totals.gstAmount,
          roundOff: totals.roundOff,
          grandTotal: totals.grandTotal,
          amountTotal: totals.grandTotal,
          amountPaid: Math.min(prev.amountPaid ?? 0, totals.grandTotal),
          payable: totals.grandTotal > 0,
        };
      }
      const next = [...list];
      next[idx] = nextPo;
      persist({ ...store, purchaseOrders: next });
      return nextPo;
    },
    [store, purchaseOrders, persist]
  );

  const addMaterial = useCallback(
    (input: AddMaterialFormInput) => {
      if (!store) return null;
      const material = buildMaterialFromForm(input);
      const next = [...(store.materials ?? materials), material];
      persist({ ...store, materials: next });
      return material;
    },
    [store, materials, persist]
  );

  /** Remove materials by id. POs keep materialId/materialName for history (orphan FK ok). */
  const deleteMaterials = useCallback(
    (ids: string[]) => {
      if (!store || ids.length === 0) return false;
      const idSet = new Set(ids);
      const next = (store.materials ?? materials).filter((m) => !idSet.has(m.id));
      persist({ ...store, materials: next });
      return true;
    },
    [store, materials, persist]
  );

  const suppliers: Supplier[] = useMemo(() => {
    if (store?.suppliers) {
      return store.suppliers.map(normalizeSupplier);
    }
    return [];
  }, [store?.suppliers]);

  const addSupplier = useCallback(
    (input: Omit<AddSupplierFormInput, "idPrefix" | "idNext">) => {
      if (!store) return null;
      const inv = resolveInventorySettings(store.inventorySettings);
      const supplier = buildSupplierFromForm({
        ...input,
        idPrefix: inv.supplierIdPrefix,
        idNext: inv.supplierIdNext,
      });
      const next = [...(store.suppliers ?? suppliers), supplier];
      const nextSettings = resolveInventorySettings({
        ...inv,
        supplierIdNext: inv.supplierIdNext + 1,
      });
      persist({ ...store, suppliers: next, inventorySettings: nextSettings });
      return supplier;
    },
    [store, suppliers, persist]
  );

  /** Soft status only — no hard delete from UI */
  const setSuppliersStatus = useCallback(
    (ids: string[], status: SupplierStatus) => {
      if (!store || ids.length === 0) return false;
      const idSet = new Set(ids);
      const next = (store.suppliers ?? suppliers).map((s) =>
        idSet.has(s.id) ? { ...normalizeSupplier(s), status } : normalizeSupplier(s)
      );
      persist({ ...store, suppliers: next });
      return true;
    },
    [store, suppliers, persist]
  );

  /** Profile fields only — payment totals stay rollup-driven from POs. */
  const updateSupplier = useCallback(
    (
      id: string,
      patch: Partial<
        Pick<
          Supplier,
          | "name"
          | "phone"
          | "email"
          | "address"
          | "pinCode"
          | "gstin"
          | "workCategories"
          | "status"
        >
      >
    ) => {
      if (!store || !id) return null;
      const list = store.suppliers ?? suppliers;
      const idx = list.findIndex((s) => s.id === id);
      if (idx < 0) return null;
      const prev = normalizeSupplier(list[idx]);
      const nextSupplier = normalizeSupplier({
        ...prev,
        name: patch.name !== undefined ? patch.name.trim() : prev.name,
        phone: patch.phone !== undefined ? patch.phone.trim() || undefined : prev.phone,
        email: patch.email !== undefined ? patch.email.trim() || undefined : prev.email,
        address:
          patch.address !== undefined ? patch.address.trim() || undefined : prev.address,
        pinCode:
          patch.pinCode !== undefined ? patch.pinCode.trim() || undefined : prev.pinCode,
        gstin: patch.gstin !== undefined ? patch.gstin.trim() || undefined : prev.gstin,
        workCategories:
          patch.workCategories !== undefined
            ? [...patch.workCategories]
            : prev.workCategories,
        status: patch.status !== undefined ? patch.status : prev.status,
      });
      if (!nextSupplier.name) return null;
      const next = [...list];
      next[idx] = nextSupplier;
      persist({ ...store, suppliers: next });
      return nextSupplier;
    },
    [store, suppliers, persist]
  );

  const contractors: Contractor[] = useMemo(() => {
    if (store?.contractors) {
      return store.contractors.map(normalizeContractor);
    }
    return [];
  }, [store?.contractors]);

  const addContractor = useCallback(
    (input: Omit<AddContractorFormInput, "idPrefix" | "idNext">) => {
      if (!store) return null;
      const inv = resolveInventorySettings(store.inventorySettings);
      const contractor = buildContractorFromForm({
        ...input,
        idPrefix: inv.contractorIdPrefix,
        idNext: inv.contractorIdNext,
      });
      const next = [...(store.contractors ?? contractors), contractor];
      const nextSettings = resolveInventorySettings({
        ...inv,
        contractorIdNext: inv.contractorIdNext + 1,
      });
      persist({ ...store, contractors: next, inventorySettings: nextSettings });
      return contractor;
    },
    [store, contractors, persist]
  );

  const setContractorsStatus = useCallback(
    (ids: string[], status: ContractorStatus) => {
      if (!store || ids.length === 0) return false;
      const idSet = new Set(ids);
      const next = (store.contractors ?? contractors).map((c) =>
        idSet.has(c.id) ? { ...normalizeContractor(c), status } : normalizeContractor(c)
      );
      persist({ ...store, contractors: next });
      return true;
    },
    [store, contractors, persist]
  );

  /** Profile fields only — payment totals stay rollup-driven from WOs. */
  const updateContractor = useCallback(
    (
      id: string,
      patch: Partial<
        Pick<
          Contractor,
          | "name"
          | "workProfile"
          | "phone"
          | "email"
          | "address"
          | "pinCode"
          | "gstin"
          | "workCategories"
          | "status"
        >
      >
    ) => {
      if (!store || !id) return null;
      const list = store.contractors ?? contractors;
      const idx = list.findIndex((c) => c.id === id);
      if (idx < 0) return null;
      const prev = normalizeContractor(list[idx]);
      const workProfile =
        patch.workProfile !== undefined ? patch.workProfile.trim() : prev.workProfile;
      const nextContractor = normalizeContractor({
        ...prev,
        name: patch.name !== undefined ? patch.name.trim() : prev.name,
        workProfile,
        trade: workProfile || undefined,
        phone: patch.phone !== undefined ? patch.phone.trim() || undefined : prev.phone,
        email: patch.email !== undefined ? patch.email.trim() || undefined : prev.email,
        address:
          patch.address !== undefined ? patch.address.trim() || undefined : prev.address,
        pinCode:
          patch.pinCode !== undefined ? patch.pinCode.trim() || undefined : prev.pinCode,
        gstin: patch.gstin !== undefined ? patch.gstin.trim() || undefined : prev.gstin,
        workCategories:
          patch.workCategories !== undefined
            ? [...patch.workCategories]
            : prev.workCategories,
        status: patch.status !== undefined ? patch.status : prev.status,
      });
      if (!nextContractor.name) return null;
      const next = [...list];
      next[idx] = nextContractor;
      persist({ ...store, contractors: next });
      return nextContractor;
    },
    [store, contractors, persist]
  );

  const deleteSuppliers = useCallback(
    (ids: string[]) => {
      if (!store || ids.length === 0) return false;
      const idSet = new Set(ids);
      const next = (store.suppliers ?? suppliers).filter((s) => !idSet.has(s.id));
      persist({ ...store, suppliers: next });
      return true;
    },
    [store, suppliers, persist]
  );

  const deleteContractors = useCallback(
    (ids: string[]) => {
      if (!store || ids.length === 0) return false;
      const idSet = new Set(ids);
      const next = (store.contractors ?? contractors).filter((c) => !idSet.has(c.id));
      persist({ ...store, contractors: next });
      return true;
    },
    [store, contractors, persist]
  );

  return {
    store,
    projects,
    customers,
    customerProfiles,
    activeProfiles,
    slabs,
    receivedPayments,
    invoices,
    materials,
    suppliers,
    contractors,
    purchaseOrders,
    purchaseRequests,
    workOrders,
    workOrderRequests,
    addPurchaseRequest,
    approvePurchaseRequest,
    rejectPurchaseRequest,
    getPurchaseOrderById,
    getPurchaseRequestById,
    updatePurchaseOrderAmounts,
    addWorkOrderRequest,
    generateWorkOrder,
    rejectWorkOrderRequest,
    getWorkOrderById,
    getWorkOrderRequestById,
    updateWorkOrderAmount,
    returnWorkOrderMaterials,
    addMaterial,
    deleteMaterials,
    addSupplier,
    setSuppliersStatus,
    updateSupplier,
    deleteSuppliers,
    addContractor,
    setContractorsStatus,
    updateContractor,
    deleteContractors,
    loading,
    addProject,
    removeProject,
    addCustomer,
    registerCustomer,
    allocatePayment,
    deactivateCustomer,
    addSlab,
    setSlabs,
    addReceivedPayment,
    updateReceivedPayment,
    createInvoice,
    sendWhatsAppBulk,
    getDetail,
    getActiveSlab,
    getCategoryDueFor,
    bookedFlatsSummary,
    checkFlatReleased,
    businessProfile,
    profileSettings,
    salesSettings,
    invoiceTemplate,
    messengerTemplates,
    inventorySettings: resolveInventorySettings(store?.inventorySettings),
    customerSettings: store?.customerSettings ?? createDefaultModuleSettings(),
    registerUser,
    updateBusinessProfile,
    updateProfileSettings,
    updateInvoiceTemplate,
    updateMessengerTemplates,
    updateInventorySettings,
    updateCustomerSettings: updateCustomerModuleSettings,
    getInvoiceById,
    getPaymentById,
    partyReceivedPayments,
    getPartyPaymentById,
    addPartyReceivedPayment,
    setProjects: (p: ProjectData[]) => store && persist({ ...store, projects: p }),
    setCustomers: () => {},
    setReceivedPayments: (r: ReceivedPayment[]) =>
      store && persist({ ...store, receivedPayments: r }),
  };
}