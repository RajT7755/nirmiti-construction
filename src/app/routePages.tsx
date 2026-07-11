import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { LoginPage, SetupShell, AppLayout } from "./App";
import { useAppDataContext } from "./AppDataContext";
import { setLoggedIn } from "@/lib/session";
import { Dashboard } from "@/components/pages/dashboard/Dashboard";
import { CustomerSales } from "@/components/pages/customers/CustomerSales";
import { AddCustomer } from "@/components/pages/customers/AddCustomer";
import { ProjectsPage } from "@/components/pages/projects/Projects";
import { Sales } from "@/components/pages/sales/Sales";
import { ReceivedPayments } from "@/components/pages/sales/ReceivedPayments";
import { PaymentSlabs } from "@/components/pages/sales/PaymentSlabs";
import { Inventory } from "@/components/pages/inventory/Inventory";
import { Shareholder } from "@/components/pages/shareholder/Shareholder";
import { Settings } from "@/components/pages/settings/Settings";
import type { CustomerDetailProfile } from "@/lib/customers/customerDetailTypes";
import type { Page, ProjectData } from "@/lib/types";

export function LoginRoute() {
  const navigate = useNavigate();

  return (
    <LoginPage
      onLogin={() => {
        setLoggedIn();
        navigate("/setup");
      }}
    />
  );
}

export function SetupRoute() {
  const navigate = useNavigate();
  const { projects, addProject } = useAppDataContext();

  function handleCreate(p: ProjectData) {
    addProject(p);
  }

  return (
    <SetupShell
      projects={projects}
      onCreate={handleCreate}
      onEnterDashboard={() => navigate("/dashboard")}
    />
  );
}

function useSiteFilter() {
  const { projects } = useAppDataContext();
  const [selectedSite, setSelectedSite] = useState("All Sites");
  const filteredProjects =
    selectedSite === "All Sites" ? projects : projects.filter((p) => p.name === selectedSite);
  return { projects, filteredProjects, selectedSite, setSelectedSite };
}

export function DashboardRoute() {
  const { filteredProjects } = useSiteFilter();
  return <Dashboard projects={filteredProjects} />;
}

export function CustomersRoute() {
  const navigate = useNavigate();
  const { filteredProjects } = useSiteFilter();
  const {
    customers,
    customerProfiles,
    bookedFlatsSummary,
    checkFlatReleased,
    getDetail,
    deactivateCustomer,
  } = useAppDataContext();

  return (
    <CustomerSales
      projects={filteredProjects}
      customers={customers}
      customerProfiles={customerProfiles}
      bookedFlatsSummary={bookedFlatsSummary}
      checkFlatReleased={checkFlatReleased}
      getDetail={getDetail}
      onDeactivate={deactivateCustomer}
      onAdd={() => navigate("/add-customer")}
      onProceed={(c) => navigate("/add-customer", { state: { proceedCustomer: c } })}
    />
  );
}

export function AddCustomerRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const proceedCustomer =
    (location.state as { proceedCustomer?: CustomerDetailProfile } | null)?.proceedCustomer ?? null;
  const { projects, customerProfiles, checkFlatReleased, registerCustomer } = useAppDataContext();

  return (
    <AddCustomer
      projects={projects}
      customerProfiles={customerProfiles}
      initialData={proceedCustomer}
      proceedMode={!!proceedCustomer}
      checkFlatReleased={checkFlatReleased}
      onBack={() => navigate("/customers")}
      onRegister={registerCustomer}
    />
  );
}

const PAGE_PATHS: Record<Page, string> = {
  dashboard: "/dashboard",
  customers: "/customers",
  "add-customer": "/add-customer",
  sales: "/sales",
  "received-payment": "/received-payment",
  "payment-slabs": "/payment-slabs",
  inventory: "/inventory",
  shareholder: "/shareholder",
  projects: "/projects",
  settings: "/settings",
};

export function SalesRoute() {
  const navigate = useNavigate();
  const { filteredProjects } = useSiteFilter();
  const {
    customers,
    customerProfiles,
    slabs,
    receivedPayments,
    getActiveSlab,
    getCategoryDueFor,
    allocatePayment,
  } = useAppDataContext();

  return (
    <Sales
      projects={filteredProjects}
      customers={customers}
      customerProfiles={customerProfiles}
      slabs={slabs}
      receivedPayments={receivedPayments}
      getActiveSlab={getActiveSlab}
      getCategoryDueFor={getCategoryDueFor}
      onAllocatePayment={allocatePayment}
      onNav={(p) => navigate(PAGE_PATHS[p])}
    />
  );
}

export function ReceivedPaymentsRoute() {
  const {
    projects,
    customers,
    customerProfiles,
    receivedPayments,
    getActiveSlab,
    getCategoryDueFor,
    allocatePayment,
  } = useAppDataContext();

  return (
    <ReceivedPayments
      projects={projects}
      customers={customers}
      customerProfiles={customerProfiles}
      receivedPayments={receivedPayments}
      getActiveSlab={getActiveSlab}
      getCategoryDueFor={getCategoryDueFor}
      onAllocatePayment={allocatePayment}
    />
  );
}

export function PaymentSlabsRoute() {
  const navigate = useNavigate();
  const { projects, customers, slabs, setSlabs, sendWhatsAppBulk } = useAppDataContext();

  return (
    <PaymentSlabs
      projects={projects}
      customers={customers}
      slabs={slabs}
      setSlabs={setSlabs}
      onWhatsAppSend={sendWhatsAppBulk}
      onBack={() => navigate("/sales")}
    />
  );
}

export function ProjectsRoute() {
  const navigate = useNavigate();
  const { projects, addProject } = useAppDataContext();

  return (
    <ProjectsPage
      projects={projects}
      onCreate={(p) => addProject(p)}
      onBack={() => navigate("/sales")}
    />
  );
}

export function InventoryRoute() {
  return <Inventory />;
}

export function ShareholderRoute() {
  return <Shareholder />;
}

export function SettingsRoute() {
  return <Settings />;
}

export function AppLayoutRoute() {
  const { projects } = useAppDataContext();
  const { selectedSite, setSelectedSite } = useSiteFilter();

  return (
    <AppLayout
      projects={projects}
      selectedSite={selectedSite}
      onSiteChange={setSelectedSite}
    />
  );
}