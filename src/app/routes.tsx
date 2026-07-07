import { createBrowserRouter } from "react-router";
import { AppDataProvider } from "./AppDataContext";
import { LoginGuard, RedirectRoot, RequireProject, RequireSession } from "./guards";
import {
  AddCustomerRoute,
  AppLayoutRoute,
  CustomersRoute,
  DashboardRoute,
  InventoryRoute,
  LoginRoute,
  PaymentSlabsRoute,
  ProjectsRoute,
  ReceivedPaymentsRoute,
  SalesRoute,
  SettingsRoute,
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
        path: "login",
        element: <LoginGuard />,
        children: [{ index: true, Component: LoginRoute }],
      },
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
                  { path: "payment-slabs", Component: PaymentSlabsRoute },
                  { path: "projects", Component: ProjectsRoute },
                  { path: "inventory", Component: InventoryRoute },
                  { path: "shareholder", Component: ShareholderRoute },
                  { path: "settings", Component: SettingsRoute },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]);