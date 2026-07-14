import { createBrowserRouter, Navigate } from "react-router";
import { AppDataProvider } from "./AppDataContext";
import { LoginGuard, RedirectRoot, RequireProject, RequireSession } from "./guards";
import {
  AddCustomerRoute,
  AppLayoutRoute,
  BusinessProfileSettingsRoute,
  CustomerSettingsRoute,
  CustomersRoute,
  DashboardRoute,
  InventoryRoute,
  InventorySettingsRoute,
  InvoicePreviewRoute,
  InvoiceTemplateSettingsRoute,
  MessageTemplateSettingsRoute,
  LoginRoute,
  LogoutRoute,
  MessengerRoute,
  PaymentSlabsRoute,
  ProfileSettingsRoute,
  ProjectsRoute,
  ReceivedPaymentsRoute,
  RegistrationRoute,
  SalesRoute,
  SalesSettingsRoute,
  SettingsLayoutRoute,
  SetupRoute,
  ShareholderRoute,
} from "./routePages";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppDataProvider />,
    children: [
      { index: true, Component: RedirectRoot },

      {
        element: <LoginGuard />,
        children: [
          { path: "login", Component: LoginRoute },
          { path: "register", Component: RegistrationRoute },
        ],
      },

      { path: "logout", Component: LogoutRoute },

      {
        element: <RequireSession />,
        children: [
          { path: "setup", Component: SetupRoute },
          {
            element: <RequireProject />,
            children: [
              {
                element: <AppLayoutRoute />,
                children: [
                  { path: "dashboard", Component: DashboardRoute },
                  { path: "customers", Component: CustomersRoute },
                  { path: "add-customer", Component: AddCustomerRoute },
                  { path: "sales", Component: SalesRoute },
                  { path: "received-payment", Component: ReceivedPaymentsRoute },
                  { path: "sales/invoice/:invoiceId", Component: InvoicePreviewRoute },
                  { path: "payment-slabs", Component: PaymentSlabsRoute },
                  { path: "messenger", Component: MessengerRoute },
                  { path: "projects", Component: ProjectsRoute },
                  { path: "inventory", Component: InventoryRoute },
                  { path: "shareholder", Component: ShareholderRoute },
                  {
                    path: "settings",
                    element: <SettingsLayoutRoute />,
                    children: [
                      { index: true, element: <Navigate to="profile" replace /> },
                      { path: "profile", Component: ProfileSettingsRoute },
                      { path: "business", Component: BusinessProfileSettingsRoute },
                      { path: "inventory", Component: InventorySettingsRoute },
                      { path: "customers", Component: CustomerSettingsRoute },
                      { path: "sales", Component: SalesSettingsRoute },
                      { path: "sales/invoice-template", Component: InvoiceTemplateSettingsRoute },
                      { path: "sales/message-templates", Component: MessageTemplateSettingsRoute },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]);