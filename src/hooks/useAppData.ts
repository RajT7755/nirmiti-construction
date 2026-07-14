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
import type { AddCustomerFormInput } from "@/lib/customers/buildCustomerProfile";
import { buildCustomerProfile } from "@/lib/customers/buildCustomerProfile";
import { canEditBusinessProfile } from "@/lib/auth/businessProfileAccess";
import { registerLocalUser } from "@/lib/auth/registeredUsersStore";
import {
  createDefaultBusinessProfile,
  createDefaultModuleSettings,
  createDefaultProfileSettings,
  createDefaultSalesSettings,
  resolveBusinessProfile,
  resolveSalesSettings,
} from "@/lib/settings/defaultSettings";
import type {
  BusinessProfileData,
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
    inventorySettings: createDefaultModuleSettings(),
    customerSettings: createDefaultModuleSettings(),
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

  const updateModuleSettings = useCallback(
    async (
      key: "inventorySettings" | "customerSettings",
      patch: Partial<ModuleSettingsData>
    ) => {
      if (!store) return null;
      const api =
        key === "inventorySettings"
          ? apiRepository.inventorySettings
          : apiRepository.customerSettings;
      if (USE_API) {
        try {
          const updated = await api.update(patch);
          persist({ ...store, [key]: updated });
          return updated;
        } catch (err) {
          console.error(`update ${key} API error:`, err);
          return null;
        }
      }
      const current = store[key] ?? createDefaultModuleSettings();
      const updated = { ...current, ...patch };
      persist({ ...store, [key]: updated });
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

  return {
    store,
    projects,
    customers,
    customerProfiles,
    activeProfiles,
    slabs,
    receivedPayments,
    invoices,
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
    inventorySettings: store?.inventorySettings ?? createDefaultModuleSettings(),
    customerSettings: store?.customerSettings ?? createDefaultModuleSettings(),
    registerUser,
    updateBusinessProfile,
    updateProfileSettings,
    updateInvoiceTemplate,
    updateMessengerTemplates,
    updateInventorySettings: (patch: Partial<ModuleSettingsData>) =>
      updateModuleSettings("inventorySettings", patch),
    updateCustomerSettings: (patch: Partial<ModuleSettingsData>) =>
      updateModuleSettings("customerSettings", patch),
    getInvoiceById,
    getPaymentById,
    setProjects: (p: ProjectData[]) => store && persist({ ...store, projects: p }),
    setCustomers: () => {},
    setReceivedPayments: (r: ReceivedPayment[]) =>
      store && persist({ ...store, receivedPayments: r }),
  };
}