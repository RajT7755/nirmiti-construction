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
     context: ["projects", "customerProfiles", "receivedPayments", "selectedSite"], 
     useAppData: [], apiModules: ["dashboard/dashboard.ts"] 
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
     context: ["customers", "customerProfiles", "slabs", "messengerTemplates", "sendWhatsAppBulk"], 
     useAppData: ["sendWhatsAppBulk"], 
     apiModules: ["messenger/slabSchedule.ts", "messenger/overdue.ts", "whatsapp/whatsappBulk.ts", "settings/messengerTemplates.ts"]
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
      route: "InventoryRoute",
       page: "Inventory", 
       context: [], useAppData: [], 
       apiModules: ["inventory/inventory.ts"] 
      },
  {
     path: "shareholder",
      route: "ShareholderRoute",
       page: "Shareholder",
        context: [], 
        useAppData: [], 
        apiModules: ["shareholder/shareholder.ts"] 
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
      apiModules: [] 
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