import { createBrowserRouter } from "react-router";
import { RootLayout, Dashboard, CustomerSales, AddCustomer, Placeholder } from "./App";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "sales", Component: CustomerSales },
      { path: "add-customer", Component: AddCustomer },
      { path: "inventory", element: <Placeholder title="Inventory Management" /> },
      { path: "shareholder", element: <Placeholder title="Shareholder Overview" /> },
      { path: "settings", element: <Placeholder title="Settings" /> },
    ],
  },
]);
