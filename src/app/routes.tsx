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
  PartyPaymentsRoute,
  ReceivePartyPaymentRoute,
  PartyPaymentsAllRoute,
  PartyPaymentReceiptRoute,
  InventoryHomeRoute,
  InventoryLayoutRoute,
  InventorySettingsRoute,
  InventoryMaterialsSettingsRoute,
  InventorySuppliersSettingsRoute,
  InventoryContractorsSettingsRoute,
  InventoryPurchaseOrdersSettingsRoute,
  InventoryWorkOrdersSettingsRoute,
  MaterialsRoute,
  MaterialsAllRoute,
  AddMaterialRoute,
  PurchaseOrdersRoute,
  AddPurchaseOrderRoute,
  PurchaseOrdersAllRoute,
  EditPurchaseOrderRoute,
  PurchaseOrderPreviewRoute,
  PurchaseRequestPreviewRoute,
  SuppliersRoute,
  SuppliersAllRoute,
  AddSupplierRoute,
  ContractorsRoute,
  ContractorsAllRoute,
  AddContractorRoute,
  SupplierPaymentsRoute,
  ContractorPaymentsRoute,
  WorkOrdersRoute,
  AddWorkOrderRequestRoute,
  WorkOrdersAllRoute,
  EditWorkOrderRoute,
  WorkOrderPreviewRoute,
  WorkOrderRequestPreviewRoute,
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
                  {
                    path: "dashboard/party-payments",
                    Component: PartyPaymentsRoute,
                  },
                  {
                    path: "dashboard/party-payments/receive",
                    Component: ReceivePartyPaymentRoute,
                  },
                  {
                    path: "dashboard/party-payments/all",
                    Component: PartyPaymentsAllRoute,
                  },
                  {
                    path: "dashboard/party-payments/receipt/:paymentId",
                    Component: PartyPaymentReceiptRoute,
                  },
                  { path: "customers", Component: CustomersRoute },
                  { path: "add-customer", Component: AddCustomerRoute },
                  { path: "sales", Component: SalesRoute },
                  { path: "received-payment", Component: ReceivedPaymentsRoute },
                  { path: "sales/invoice/:invoiceId", Component: InvoicePreviewRoute },
                  { path: "payment-slabs", Component: PaymentSlabsRoute },
                  { path: "messenger", Component: MessengerRoute },
                  { path: "projects", Component: ProjectsRoute },
                  {
                    path: "inventory",
                    element: <InventoryLayoutRoute />,
                    children: [
                      { index: true, Component: InventoryHomeRoute },
                      { path: "materials", Component: MaterialsRoute },
                      { path: "materials/all", Component: MaterialsAllRoute },
                      { path: "materials/add", Component: AddMaterialRoute },
                      { path: "suppliers", Component: SuppliersRoute },
                      { path: "suppliers/all", Component: SuppliersAllRoute },
                      { path: "suppliers/add", Component: AddSupplierRoute },
                      {
                        path: "suppliers/:supplierId/payments",
                        Component: SupplierPaymentsRoute,
                      },
                      { path: "contractors", Component: ContractorsRoute },
                      { path: "contractors/all", Component: ContractorsAllRoute },
                      { path: "contractors/add", Component: AddContractorRoute },
                      {
                        path: "contractors/:contractorId/payments",
                        Component: ContractorPaymentsRoute,
                      },
                      { path: "purchase-orders", Component: PurchaseOrdersRoute },
                      {
                        path: "purchase-orders/add",
                        Component: AddPurchaseOrderRoute,
                      },
                      {
                        path: "purchase-orders/all",
                        Component: PurchaseOrdersAllRoute,
                      },
                      {
                        path: "purchase-orders/request/:requestId",
                        Component: PurchaseRequestPreviewRoute,
                      },
                      {
                        path: "purchase-orders/:poId/edit",
                        Component: EditPurchaseOrderRoute,
                      },
                      {
                        path: "purchase-orders/:poId",
                        Component: PurchaseOrderPreviewRoute,
                      },
                      { path: "work-orders", Component: WorkOrdersRoute },
                      {
                        path: "work-orders/request",
                        Component: AddWorkOrderRequestRoute,
                      },
                      {
                        path: "work-orders/request/:requestId",
                        Component: WorkOrderRequestPreviewRoute,
                      },
                      {
                        path: "work-orders/all",
                        Component: WorkOrdersAllRoute,
                      },
                      {
                        path: "work-orders/:woId/edit",
                        Component: EditWorkOrderRoute,
                      },
                      {
                        path: "work-orders/:woId",
                        Component: WorkOrderPreviewRoute,
                      },
                    ],
                  },
                  { path: "shareholder", Component: ShareholderRoute },
                  {
                    path: "settings",
                    element: <SettingsLayoutRoute />,
                    children: [
                      { index: true, element: <Navigate to="profile" replace /> },
                      { path: "profile", Component: ProfileSettingsRoute },
                      { path: "business", Component: BusinessProfileSettingsRoute },
                      {
                        path: "inventory",
                        element: <InventorySettingsRoute />,
                        children: [
                          { index: true, element: <Navigate to="materials" replace /> },
                          { path: "materials", Component: InventoryMaterialsSettingsRoute },
                          { path: "suppliers", Component: InventorySuppliersSettingsRoute },
                          { path: "contractors", Component: InventoryContractorsSettingsRoute },
                          {
                            path: "purchase-orders",
                            Component: InventoryPurchaseOrdersSettingsRoute,
                          },
                          { path: "work-orders", Component: InventoryWorkOrdersSettingsRoute },
                        ],
                      },
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