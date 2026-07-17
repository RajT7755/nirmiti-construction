import { NavLink, Outlet, useLocation } from "react-router";
import { Package } from "lucide-react";

const HEAD_TABS = [
  { label: "Materials", to: "/inventory/materials", matchPrefix: "/inventory/materials" },
  {
    label: "Suppliers",
    to: "/inventory/suppliers",
    matchPrefix: "/inventory/suppliers",
  },
  {
    label: "Contractors",
    to: "/inventory/contractors",
    matchPrefix: "/inventory/contractors",
  },
  { label: "POs", to: "/inventory/purchase-orders", matchPrefix: "/inventory/purchase-orders" },
  { label: "Work Order", to: "/inventory/work-orders", matchPrefix: "/inventory/work-orders" },
];

/**
 * Slim inventory chrome: title + head nav only.
 * Clicking a tab opens that page in the Outlet (Materials list, etc.).
 * KPIs / Recent Orders / Overdue are not shown here.
 */
export function InventoryLayout() {
  const { pathname } = useLocation();

  return (
    <div className="p-6 space-y-5">
      {/* Hidden when printing PO / WO documents */}
      <div className="inventory-no-print flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
          <Package size={18} className="text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#0f1a35]">Inventory</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Home shows KPIs; head tabs open each section page
          </p>
        </div>
      </div>

      <nav className="inventory-no-print flex flex-wrap gap-1 border-b border-gray-200">
        {HEAD_TABS.map((tab) => {
          const active =
            pathname === tab.to || pathname.startsWith(`${tab.matchPrefix}/`);
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                active
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-500 border-transparent hover:text-[#0f1a35]"
              }`}
            >
              {tab.label}
            </NavLink>
          );
        })}
      </nav>

      <Outlet />
    </div>
  );
}
