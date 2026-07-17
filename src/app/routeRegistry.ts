export type RouteWiring = {
  path: string;
  route: string;
  page: string;
  context: string[];
  useAppData: string[];
  apiModules: string[];
};

// ---------------------------------------------------------------------------
// Auth — public routes (LoginGuard) + session exit
// Order: login → register → logout
// businessProfile.logoUrl → LoginPage / BrandMark / getLoginLogoUrl (sidebar + invoices share resolveLogoUrl)
// ---------------------------------------------------------------------------
export const AUTH_WIRING: RouteWiring[] = [
  { path: "login",
    route: "LoginRoute",
     page: "LoginPage", 
     context: ["businessProfile", "updateProfileSettings"], 
     useAppData: ["updateProfileSettings"], 
     apiModules: ["auth/registration.ts", "settings/businessProfileSettings.ts"] 
    },
  { 
    path: "register", 
    route: "RegistrationRoute", 
    page: "Registration", 
    context: ["businessProfile", "registerUser"], 
    useAppData: ["registerUser"],
     apiModules: ["auth/registration.ts", "settings/businessProfileSettings.ts"]
     },
  {
     path: "logout", 
     route: "LogoutRoute", 
     page: "Logout", 
     context: [], 
     useAppData: [], 
     apiModules: []
     },
];


// Onboarding — requires session, before first project exists on scrren
// ---------------------------------------------------------------------------
export const ONBOARDING_WIRING: RouteWiring[] = [
  { path: "setup",
     route: "SetupRoute", 
     page: "SetupShell", 
     context: ["businessProfile", "projects", "addProject", "removeProject"], 
     useAppData: ["addProject", "removeProject"],
      apiModules: ["projects/projects.ts", "settings/businessProfileSettings.ts"] 
    },
];


// Main app — requires session + at least one project (AppLayout)
// Order matches sidebar: Dashboard → Customers → Messenger → Sales → …
// ---------------------------------------------------------------------------
export const APP_ROUTE_WIRING: RouteWiring[] = [
  // Core
  { path: "dashboard",
     route: "DashboardRoute", 
     page: "Dashboard", 
     context: ["projects", "customerProfiles", "receivedPayments", "partyReceivedPayments", "purchaseOrders", "workOrders", "selectedSite"], 
     useAppData: ["partyReceivedPayments", "purchaseOrders", "workOrders"], apiModules: ["dashboard/dashboard.ts"] 
    },
  {
    path: "dashboard/party-payments",
    route: "PartyPaymentsRoute",
    page: "PartyPaymentsPage",
    context: ["purchaseOrders", "workOrders", "partyReceivedPayments"],
    useAppData: ["purchaseOrders", "workOrders", "partyReceivedPayments", "addPartyReceivedPayment"],
    apiModules: ["dashboard/partyPayments.ts"],
  },
  {
    path: "dashboard/party-payments/receive",
    route: "ReceivePartyPaymentRoute",
    page: "ReceivePartyPayment",
    context: ["suppliers", "contractors", "purchaseOrders", "workOrders", "addPartyReceivedPayment"],
    useAppData: ["addPartyReceivedPayment"],
    apiModules: ["dashboard/partyPayments.ts"],
  },
  {
    path: "dashboard/party-payments/all",
    route: "PartyPaymentsAllRoute",
    page: "PartyPaymentsAll",
    context: ["partyReceivedPayments"],
    useAppData: ["partyReceivedPayments"],
    apiModules: ["dashboard/partyPayments.ts"],
  },
  {
    path: "dashboard/party-payments/receipt/:paymentId",
    route: "PartyPaymentReceiptRoute",
    page: "PartyPaymentReceiptPage",
    context: ["getPartyPaymentById", "businessProfile"],
    useAppData: ["getPartyPaymentById"],
    apiModules: ["dashboard/partyPayments.ts"],
  },

  // Customers
  { path: "customers", route: "CustomersRoute",
     page: "CustomerSales", 
     context: ["customers", "customerProfiles", "deactivateCustomer"], 
     useAppData: ["deactivateCustomer"],
      apiModules: ["customers/inactiveCustomers.ts", "customers/customerDetails.ts"] 
    },

  { path: "add-customer",
     route: "AddCustomerRoute", 
     page: "AddCustomer",
      context: ["registerCustomer"], 
      useAppData: ["registerCustomer"], 
      apiModules: ["customers/addCustomer.ts"]
     },

  // Messenger
  {
     path: "messenger",
     route: "MessengerRoute", 
     page: "Messenger", 
     context: [
       "customers",
       "customerProfiles",
       "slabs",
       "messengerTemplates",
       "sendWhatsAppBulk",
       "suppliers",
       "purchaseRequests",
       "contractors",
       "workOrderRequests",
       "businessProfile",
     ],
     useAppData: [
       "sendWhatsAppBulk",
       "suppliers",
       "purchaseRequests",
       "contractors",
       "workOrderRequests",
     ],
     apiModules: [
       "messenger/slabSchedule.ts",
       "messenger/overdue.ts",
       "messenger/poRequest.ts",
       "messenger/workOrderRequest.ts",
       "messenger/customerBroadcast.ts",
       "whatsapp/whatsappBulk.ts",
       "settings/messengerTemplates.ts",
     ],
  },
  {
    path: "messenger?tab=customers",
    route: "MessengerRoute",
    page: "Messenger / CustomerBroadcastTab",
    context: ["customerProfiles", "messengerTemplates.customerBroadcast"],
    useAppData: ["customerProfiles"],
    apiModules: ["messenger/customerBroadcast.ts"],
  },
  {
    path: "messenger?tab=po-request",
    route: "MessengerRoute",
    page: "Messenger / PoRequestTab",
    context: ["suppliers", "purchaseRequests", "messengerTemplates.poRequest"],
    useAppData: ["suppliers", "purchaseRequests"],
    apiModules: ["messenger/poRequest.ts"],
  },
  {
    path: "messenger?tab=wo-request",
    route: "MessengerRoute",
    page: "Messenger / WoRequestTab",
    context: ["contractors", "workOrderRequests", "messengerTemplates.workOrderRequest"],
    useAppData: ["contractors", "workOrderRequests"],
    apiModules: ["messenger/workOrderRequest.ts"],
  },
  {
    path: "messenger?tab=email",
    route: "MessengerRoute",
    page: "Messenger / EmailTab",
    context: ["customerProfiles", "businessProfile"],
    useAppData: ["customerProfiles", "businessProfile"],
    apiModules: ["email/send.ts"],
  },

  // Sales
  {
     path: "sales",
     route: "SalesRoute",
      page: "Sales", 
      context: ["receivedPayments", "invoices"],
       useAppData: [], 
       apiModules: ["sales/sales.ts"]
       },
  {
     path: "received-payment", 
     route: "ReceivedPaymentsRoute", 
     page: "ReceivedPayments", 
     context: ["getActiveSlab", "allocatePayment", "createInvoice", "updateReceivedPayment"],
      useAppData: ["createInvoice", "updateReceivedPayment"],
       apiModules: ["sales/invoices.ts", "sales/paymentAllocation.ts", "sales/receivedPayments.ts"] 
      },
  {
     path: "payment-slabs",
      route: "PaymentSlabsRoute", 
      page: "PaymentSlabs", 
      context: ["setSlabs"],
       useAppData: ["setSlabs"], 
       apiModules: ["sales/paymentSlabs.ts"] 
      },
  { 
    path: "sales/invoice/:invoiceId", 
    route: "InvoicePreviewRoute", 
    page: "InvoicePreviewPage", 
    context: ["businessProfile", "invoiceTemplate", "getInvoiceById", "getPaymentById"], 
    useAppData: ["getInvoiceById", "getPaymentById"], 
    apiModules: ["sales/invoices.ts", "settings/businessProfileSettings.ts"] 
  },

  // Other modules
  { path: "projects",
    route: "ProjectsRoute", 
    page: "ProjectsPage", 
    context: ["addProject", "removeProject"], 
    useAppData: ["addProject", "removeProject"], 
    apiModules: ["projects/projects.ts"] 
  },
  {
    path: "inventory",
    route: "InventoryLayoutRoute",
    page: "InventoryLayout",
    context: [],
    useAppData: [],
    apiModules: [
      "inventory/materials.ts",
      "inventory/suppliers.ts",
      "inventory/contractors.ts",
      "inventory/purchaseOrders.ts",
      "inventory/workOrders.ts",
    ],
  },
  {
    path: "inventory (index)",
    route: "InventoryHomeRoute",
    page: "InventoryHome",
    context: [],
    useAppData: [],
    apiModules: [],
  },
  {
    path: "inventory/materials",
    route: "MaterialsRoute",
    page: "Materials",
    context: [],
    useAppData: [],
    apiModules: ["inventory/materials.ts"],
  },
  {
    path: "inventory/materials/all",
    route: "MaterialsAllRoute",
    page: "MaterialsAll",
    context: ["materials"],
    useAppData: ["materials"],
    apiModules: ["inventory/materials.ts"],
  },
  {
    path: "inventory/materials/add",
    route: "AddMaterialRoute",
    page: "AddMaterial",
    context: [],
    useAppData: [],
    apiModules: ["inventory/materials.ts"],
  },
  {
    path: "inventory/suppliers",
    route: "SuppliersRoute",
    page: "Suppliers",
    context: ["suppliers"],
    useAppData: ["suppliers", "addSupplier", "setSuppliersStatus"],
    apiModules: ["inventory/suppliers.ts"],
  },
  {
    path: "inventory/suppliers/all",
    route: "SuppliersAllRoute",
    page: "SuppliersAll",
    context: ["suppliers"],
    useAppData: ["suppliers"],
    apiModules: ["inventory/suppliers.ts"],
  },
  {
    path: "inventory/suppliers/add",
    route: "AddSupplierRoute",
    page: "AddSupplier",
    context: ["suppliers", "inventorySettings"],
    useAppData: ["addSupplier", "inventorySettings"],
    apiModules: ["inventory/suppliers.ts"],
  },
  {
    path: "inventory/suppliers/:supplierId/payments",
    route: "SupplierPaymentsRoute",
    page: "SupplierPaymentsPage",
    context: ["suppliers", "purchaseOrders"],
    useAppData: ["suppliers", "purchaseOrders"],
    apiModules: ["inventory/supplierPayments.ts", "inventory/purchaseOrderPayments.ts"],
  },
  {
    path: "inventory/contractors",
    route: "ContractorsRoute",
    page: "Contractors",
    context: ["contractors"],
    useAppData: ["contractors", "addContractor", "setContractorsStatus"],
    apiModules: ["inventory/contractors.ts"],
  },
  {
    path: "inventory/contractors/all",
    route: "ContractorsAllRoute",
    page: "ContractorsAll",
    context: ["contractors"],
    useAppData: ["contractors"],
    apiModules: ["inventory/contractors.ts"],
  },
  {
    path: "inventory/contractors/add",
    route: "AddContractorRoute",
    page: "AddContractor",
    context: ["contractors", "inventorySettings"],
    useAppData: ["addContractor", "inventorySettings"],
    apiModules: ["inventory/contractors.ts"],
  },
  {
    path: "inventory/contractors/:contractorId/payments",
    route: "ContractorPaymentsRoute",
    page: "ContractorPaymentsPage",
    context: ["contractors"],
    useAppData: ["contractors"],
    apiModules: ["inventory/contractorPayments.ts", "inventory/workOrderPayments.ts"],
  },
  {
    path: "inventory/purchase-orders",
    route: "PurchaseOrdersRoute",
    page: "PurchaseOrders",
    context: ["purchaseRequests", "purchaseOrders", "approvePurchaseRequest"],
    useAppData: ["purchaseRequests", "purchaseOrders", "approvePurchaseRequest"],
    apiModules: ["inventory/purchaseOrders.ts"],
  },
  {
    path: "inventory/purchase-orders/add",
    route: "AddPurchaseOrderRoute",
    page: "AddPurchaseOrder",
    context: ["suppliers", "materials", "addPurchaseRequest", "businessProfile"],
    useAppData: ["suppliers", "materials", "addPurchaseRequest"],
    apiModules: ["inventory/purchaseOrders.ts"],
  },
  {
    path: "inventory/purchase-orders/all",
    route: "PurchaseOrdersAllRoute",
    page: "PurchaseOrdersAll",
    context: ["purchaseOrders"],
    useAppData: ["purchaseOrders"],
    apiModules: [],
  },
  {
    path: "inventory/purchase-orders/:poId/edit",
    route: "EditPurchaseOrderRoute",
    page: "EditPurchaseOrder",
    context: ["getPurchaseOrderById", "updatePurchaseOrderAmounts"],
    useAppData: ["getPurchaseOrderById", "updatePurchaseOrderAmounts"],
    apiModules: [],
  },
  {
    path: "inventory/purchase-orders/request/:requestId",
    route: "PurchaseRequestPreviewRoute",
    page: "PurchaseOrderPreviewPage",
    context: ["getPurchaseRequestById", "businessProfile", "suppliers"],
    useAppData: ["getPurchaseRequestById", "businessProfile", "suppliers"],
    apiModules: [],
  },
  {
    path: "inventory/purchase-orders/:poId",
    route: "PurchaseOrderPreviewRoute",
    page: "PurchaseOrderPreviewPage",
    context: ["getPurchaseOrderById", "businessProfile", "suppliers"],
    useAppData: ["getPurchaseOrderById", "businessProfile", "suppliers"],
    apiModules: ["inventory/purchaseOrders.ts"],
  },
  {
    path: "inventory/work-orders",
    route: "WorkOrdersRoute",
    page: "WorkOrders",
    context: ["workOrders", "workOrderRequests", "generateWorkOrder"],
    useAppData: ["workOrders", "workOrderRequests", "generateWorkOrder"],
    apiModules: ["inventory/workOrders.ts"],
  },
  {
    path: "inventory/work-orders/request",
    route: "AddWorkOrderRequestRoute",
    page: "AddWorkOrderRequest",
    context: ["contractors", "materials", "addWorkOrderRequest"],
    useAppData: ["contractors", "materials", "addWorkOrderRequest"],
    apiModules: [],
  },
  {
    path: "inventory/work-orders/request/:requestId",
    route: "WorkOrderRequestPreviewRoute",
    page: "WorkOrderPreviewPage",
    context: ["getWorkOrderRequestById", "businessProfile", "contractors"],
    useAppData: ["getWorkOrderRequestById", "businessProfile", "contractors"],
    apiModules: [],
  },
  {
    path: "inventory/work-orders/all",
    route: "WorkOrdersAllRoute",
    page: "WorkOrdersAll",
    context: ["workOrders"],
    useAppData: ["workOrders"],
    apiModules: [],
  },
  {
    path: "inventory/work-orders/:woId/edit",
    route: "EditWorkOrderRoute",
    page: "EditWorkOrder",
    context: ["getWorkOrderById", "updateWorkOrderAmount", "returnWorkOrderMaterials"],
    useAppData: ["getWorkOrderById", "updateWorkOrderAmount", "returnWorkOrderMaterials"],
    apiModules: [],
  },
  {
    path: "inventory/work-orders/:woId",
    route: "WorkOrderPreviewRoute",
    page: "WorkOrderPreviewPage",
    context: ["getWorkOrderById", "businessProfile", "contractors"],
    useAppData: ["getWorkOrderById", "businessProfile", "contractors"],
    apiModules: [],
  },
  {
    path: "shareholder",
    route: "ShareholderRoute",
    page: "Shareholder",
    context: [],
    useAppData: [],
    apiModules: ["shareholder/shareholder.ts"],
  },
];

// Settings — get under /settings (SettingsLayoutRoute)
// Order matches settings tabs: Profile → Business → Inventory → Sales → Customers

export const SETTINGS_WIRING: RouteWiring[] = [
  {
    path: "settings/profile", 
    route: "ProfileSettingsRoute", 
    page: "ProfileSettings", 
    context: ["profileSettings", "updateProfileSettings"], 
    useAppData: ["updateProfileSettings"], 
    apiModules: ["settings/profileSettings.ts"] 
  },
  { 
    path: "settings/business", 
    route: "BusinessProfileSettingsRoute", 
    page: "BusinessProfileSettings", 
    context: ["businessProfile", "profileSettings", "updateBusinessProfile"], 
    useAppData: ["updateBusinessProfile"],
     apiModules: ["settings/businessProfileSettings.ts"] 
    },
  {
    path: "settings/inventory",
    route: "InventorySettingsRoute",
    page: "InventorySettings",
    context: [],
    useAppData: [],
    apiModules: ["settings/inventorySettings.ts"],
  },
  {
    path: "settings/inventory/materials",
    route: "InventoryMaterialsSettingsRoute",
    page: "MaterialsSettings",
    context: [],
    useAppData: [],
    apiModules: ["settings/inventorySettings.ts"],
  },
  {
    path: "settings/inventory/suppliers",
    route: "InventorySuppliersSettingsRoute",
    page: "SuppliersSettings",
    context: [],
    useAppData: [],
    apiModules: ["settings/inventorySettings.ts"],
  },
  {
    path: "settings/inventory/contractors",
    route: "InventoryContractorsSettingsRoute",
    page: "ContractorsSettings",
    context: [],
    useAppData: [],
    apiModules: ["settings/inventorySettings.ts"],
  },
  {
    path: "settings/inventory/purchase-orders",
    route: "InventoryPurchaseOrdersSettingsRoute",
    page: "PurchaseOrdersSettings",
    context: [],
    useAppData: [],
    apiModules: ["settings/inventorySettings.ts"],
  },
  {
    path: "settings/inventory/work-orders",
    route: "InventoryWorkOrdersSettingsRoute",
    page: "WorkOrdersSettings",
    context: [],
    useAppData: [],
    apiModules: ["settings/inventorySettings.ts"],
  },
  {
    path: "settings/sales",
     route: "SalesSettingsRoute", 
     page: "SalesSettingsHub",
      context: [],
       useAppData: [], 
       apiModules: ["settings/salesSettings.ts"]
  
    },
  { 
    path: "settings/sales/invoice-template",
     route: "InvoiceTemplateSettingsRoute",
      page: "InvoiceTemplateSettings", 
      context: ["invoiceTemplate", "businessProfile", "updateInvoiceTemplate"], 
      useAppData: ["updateInvoiceTemplate"],
       apiModules: ["settings/salesSettings.ts"]
  
  
    },
  { path: "settings/sales/message-templates", 
    route: "MessageTemplateSettingsRoute",
     page: "MessageTemplateSettings", 
     context: ["messengerTemplates", "updateMessengerTemplates"], 
     useAppData: ["updateMessengerTemplates"],
      apiModules: ["settings/messengerTemplates.ts", "settings/salesSettings.ts"] 
    },
  {
     path: "settings/customers",
     route: "CustomerSettingsRoute", 
     page: "CustomerSettings", 
     context: [], 
     useAppData: [], 
     apiModules: [] 
    },
];

export const ALL_ROUTE_WIRING: RouteWiring[] = [
  ...AUTH_WIRING,
  ...ONBOARDING_WIRING,
  ...APP_ROUTE_WIRING,
  ...SETTINGS_WIRING,
];