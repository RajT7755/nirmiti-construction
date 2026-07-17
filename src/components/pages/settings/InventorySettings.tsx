import { NavLink, Outlet } from "react-router";
import { Package } from "lucide-react";

/** Same head-nav labels/order as main Inventory module */
const HEAD_TABS = [
  { label: "Materials", to: "/settings/inventory/materials" },
  { label: "Suppliers", to: "/settings/inventory/suppliers" },
  { label: "Contractors", to: "/settings/inventory/contractors" },
  { label: "POs", to: "/settings/inventory/purchase-orders" },
  { label: "Work Order", to: "/settings/inventory/work-orders" },
];

export function InventorySettings() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
          <Package size={18} className="text-blue-600" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-[#0f1a35]">Inventory Settings</h3>
          <p className="text-sm text-gray-400 mt-0.5">
            Configure materials, suppliers, contractors, POs, and work orders
          </p>
        </div>
      </div>

      <nav className="flex flex-wrap gap-1 border-b border-gray-200">
        {HEAD_TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                isActive
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-500 border-transparent hover:text-[#0f1a35]"
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  );
}
