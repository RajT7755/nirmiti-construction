import { NavLink, Outlet } from "react-router";

const TABS = [
  { label: "Profile", to: "/settings/profile" },
  { label: "Business Profile", to: "/settings/business" },
  { label: "Inventory", to: "/settings/inventory" },
  { label: "Sales", to: "/settings/sales" },
  { label: "Customers", to: "/settings/customers" },
];

export function SettingsLayout() {
  return (
    <div className="p-6 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#0f1a35]">Settings</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Profile, business branding, and module configuration
        </p>
      </div>

      <nav className="flex flex-wrap gap-1 border-b border-gray-200">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === "/settings/profile"}
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