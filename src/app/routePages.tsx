import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { LoginPage, SetupShell, AppLayout } from "./App";
import { useAppDataContext } from "./AppDataContext";
import { SiteFilterProvider, useSiteFilterContext } from "./SiteFilterContext";
import { verifyRegisteredUser, updateRegisteredUserProfile } from "@/lib/auth/registeredUsersStore";
import { clearSession, setLoggedIn } from "@/lib/session";

import { countBookedFlatsForProfiles } from "@/lib/dashboard/dashboardMetrics";
import { Registration } from "@/components/pages/auth/Registration";
//-------------dhashboard--------------------------
import { Dashboard } from "@/components/pages/dashboard/Dashboard";
import { PartyPaymentsPage } from "@/components/pages/dashboard/PartyPaymentsPage";
import { ReceivePartyPayment } from "@/components/pages/dashboard/ReceivePartyPayment";
import { PartyPaymentsAll } from "@/components/pages/dashboard/PartyPaymentsAll";
import { PartyPaymentReceiptPage } from "@/components/pages/dashboard/PartyPaymentReceiptPage";
import { CustomerSales } from "@/components/pages/customers/CustomerSales";
import { AddCustomer } from "@/components/pages/customers/AddCustomer";
import { ProjectsPage } from "@/components/pages/projects/Projects";

// ---------------------sales---------------------------

import { Sales } from "@/components/pages/sales/Sales";
import { ReceivedPayments } from "@/components/pages/sales/ReceivedPayments";
import { PaymentSlabs } from "@/components/pages/sales/PaymentSlabs";

import { Messenger } from "@/components/pages/messenger/Messenger";
import { InvoicePreviewPage } from "@/components/pages/sales/InvoicePreviewPage";
import { InventoryLayout } from "@/components/pages/inventory/InventoryLayout";
import { InventoryHome } from "@/components/pages/inventory/InventoryHome";
import { Materials } from "@/components/pages/inventory/Materials";
import { MaterialsAll } from "@/components/pages/inventory/MaterialsAll";
import { AddMaterial } from "@/components/pages/inventory/AddMaterial";
import { Suppliers } from "@/components/pages/inventory/Suppliers";
import { SuppliersAll } from "@/components/pages/inventory/SuppliersAll";
import { AddSupplier } from "@/components/pages/inventory/AddSupplier";
import { Contractors } from "@/components/pages/inventory/Contractors";
import { ContractorsAll } from "@/components/pages/inventory/ContractorsAll";
import { AddContractor } from "@/components/pages/inventory/AddContractor";
import { SupplierPaymentsPage } from "@/components/pages/inventory/suppliers/SupplierPaymentsPage";
import { ContractorPaymentsPage } from "@/components/pages/inventory/contractors/ContractorPaymentsPage";
import { PurchaseOrders } from "@/components/pages/inventory/PurchaseOrders";
import { AddPurchaseOrder } from "@/components/pages/inventory/AddPurchaseOrder";
import { EditPurchaseOrder } from "@/components/pages/inventory/EditPurchaseOrder";
import { PurchaseOrdersAll } from "@/components/pages/inventory/PurchaseOrdersAll";
import { PurchaseOrderPreviewPage } from "@/components/purchaseOrders/PurchaseOrderPreviewPage";
import { WorkOrders } from "@/components/pages/inventory/WorkOrders";
import { AddWorkOrderRequest } from "@/components/pages/inventory/AddWorkOrderRequest";
import { WorkOrdersAll } from "@/components/pages/inventory/WorkOrdersAll";
import { EditWorkOrder } from "@/components/pages/inventory/EditWorkOrder";
import { WorkOrderPreviewPage } from "@/components/workOrders/WorkOrderPreviewPage";
import { resolveBusinessProfile } from "@/lib/settings/defaultSettings";

// ----------------------shareholder------------------------------------------------------------

import { Shareholder } from "@/components/pages/shareholder/Shareholder";

// ------------------------settings-------------------------------------------------------

import { SettingsLayout } from "@/components/pages/settings/SettingsLayout";

//---------------------profile settiing-----------------------------------------------------
import { ProfileSettings } from "@/components/pages/settings/ProfileSettings";
import { BusinessProfileSettings } from "@/components/pages/settings/BusinessProfileSettings";

import { InventorySettings } from "@/components/pages/settings/InventorySettings";
import { MaterialsSettings } from "@/components/pages/settings/inventory/MaterialsSettings";
import { SuppliersSettings } from "@/components/pages/settings/inventory/SuppliersSettings";
import { ContractorsSettings } from "@/components/pages/settings/inventory/ContractorsSettings";
import { PurchaseOrdersSettings } from "@/components/pages/settings/inventory/PurchaseOrdersSettings";
import { WorkOrdersSettings } from "@/components/pages/settings/inventory/WorkOrdersSettings";

import { CustomerSettings } from "@/components/pages/settings/CustomerSettings";
import { SalesSettingsHub } from "@/components/pages/settings/SalesSettingsHub";
import { InvoiceTemplateSettings } from "@/components/pages/settings/sales/InvoiceTemplateSettings";
import { MessageTemplateSettings } from "@/components/pages/settings/sales/MessageTemplateSettings";
// ---------------------edit businessprofile --------------------------------------
import { canEditBusinessProfile } from "@/lib/auth/businessProfileAccess";
import type { CustomerDetailProfile } from "@/lib/customers/customerDetailTypes";
import type { Page, ProjectData } from "@/lib/types";
//-----------------------------------------
//----------------------LOGIN PAGE -----------------------------------------
export function LoginRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const { businessProfile, updateProfileSettings } = useAppDataContext();
  const registeredSuccess =
    (location.state as { registered?: boolean } | null)?.registered === true;

  return (
    <LoginPage
      businessProfile={businessProfile}
      registeredSuccess={registeredSuccess}
      onGoRegister={() => navigate("/register")}
      onLogin={async (credentials) => {
        const user = verifyRegisteredUser(credentials.username, credentials.password);
        if (!user) {
          throw new Error("No account found. Please register first.");
        }
        setLoggedIn(credentials, user.userId);
        await updateProfileSettings({
          fullName: user.fullName,
          userId: user.userId,
          email: user.email,
        });
        navigate("/setup");
      }}
    />
  );
}
// --------------------------REGISTRATION PAGE---------------------------------------
export function RegistrationRoute() {
  const navigate = useNavigate();
  const { businessProfile, registerUser } = useAppDataContext();

  return (
    <Registration
      businessProfile={businessProfile}
      onBackToLogin={() => navigate("/login")}
      onRegister={async (input) => {
        await registerUser(input);
        navigate("/login", { state: { registered: true } });
      }}
    />
  );
}
///-----------------------SETUP PAGE (1 st page aahe project set up ch.)-----------------------
export function SetupRoute() {
  const navigate = useNavigate();
  const { businessProfile, projects, addProject, removeProject } = useAppDataContext();

  function handleCreate(p: ProjectData) {
    addProject(p);
  }

  async function handleDelete(project: ProjectData) {
    return removeProject(project.id);
  }

  return (
    <SetupShell
      businessProfile={businessProfile}
      projects={projects}
      onCreate={handleCreate}
      onDelete={handleDelete}
      onEnterDashboard={() => navigate("/dashboard")}
    />
  );
}
// ------------- logout button (topbar cha kopryat )---------------------------
export function LogoutRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    clearSession();
    navigate("/login", { replace: true });
  }, [navigate]);

  return null;
}
// --------------- dashbord -____---------------------------
export function DashboardRoute() {
  const { filteredProjects, projectNames, isAllSites } = useSiteFilterContext();
  const {
    customerProfiles,
    receivedPayments,
    partyReceivedPayments,
    purchaseOrders,
    workOrders,
  } = useAppDataContext();
  return (
    <Dashboard
      projects={filteredProjects}
      customerProfiles={customerProfiles}
      receivedPayments={receivedPayments}
      partyReceivedPayments={partyReceivedPayments}
      purchaseOrders={purchaseOrders}
      workOrders={workOrders}
      projectNames={projectNames}
      isAllSites={isAllSites}
    />
  );
}

export function PartyPaymentsRoute() {
  return <PartyPaymentsPage />;
}

export function ReceivePartyPaymentRoute() {
  return <ReceivePartyPayment />;
}

export function PartyPaymentsAllRoute() {
  return <PartyPaymentsAll />;
}

export function PartyPaymentReceiptRoute() {
  return <PartyPaymentReceiptPage />;
}
// -------------------------CustomersRoute-------------------
export function CustomersRoute() {
  const navigate = useNavigate();
  const { filteredProjects, projectNames, isAllSites } = useSiteFilterContext();
  const {
    customers,
    customerProfiles,
    checkFlatReleased,
    getDetail,
    deactivateCustomer,
  } = useAppDataContext();

  const scopedProfiles = isAllSites
    ? customerProfiles
    : customerProfiles.filter((c) => projectNames.includes(c.project));
  const bookedFlatsSummary = countBookedFlatsForProfiles(scopedProfiles);

  return  (
    <CustomerSales
      projects={filteredProjects}
      customers={customers}
      customerProfiles={scopedProfiles}
      bookedFlatsSummary={bookedFlatsSummary}
      checkFlatReleased={checkFlatReleased}
      getDetail={getDetail}
      onDeactivate={deactivateCustomer}
      onAdd={() => navigate("/add-customer")}
      onProceed={(c) => navigate("/add-customer", { state: { proceedCustomer: c } })}
    />
  );
}
//-------------------AddCustomerRoute------------------
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
//---------------- page path with URL--------------
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
// ------------SALE-------------
export function SalesRoute() {
  const navigate = useNavigate();
  const { filteredProjects } = useSiteFilterContext();
  const {
    customers,
    customerProfiles,
    receivedPayments,
    invoices,
  } = useAppDataContext();

  return (
    <Sales
      projects={filteredProjects}
      customers={customers}
      customerProfiles={customerProfiles}
      receivedPayments={receivedPayments}
      invoices={invoices}
      onNav={(p) => navigate(PAGE_PATHS[p])}
    />
  );
}
//---------------ReceivedPayments-------------------
export function ReceivedPaymentsRoute() {
  const navigate = useNavigate();
  const {
    projects,
    customers,
    customerProfiles,
    receivedPayments,
    invoices,
    getActiveSlab,
    getCategoryDueFor,
    allocatePayment,
    createInvoice,
    updateReceivedPayment,
  } = useAppDataContext();

  return (
    <ReceivedPayments
      projects={projects}
      customers={customers}
      customerProfiles={customerProfiles}
      receivedPayments={receivedPayments}
      invoices={invoices}
      getActiveSlab={getActiveSlab}
      getCategoryDueFor={getCategoryDueFor}
      onAllocatePayment={allocatePayment}
      onCreateInvoice={createInvoice}
      onUpdatePayment={updateReceivedPayment}
      onInvoiceCreated={(invoiceId) => navigate(`/sales/invoice/${invoiceId}`)}
    />
  );
}
// ------------------InvoicePreviewRoute-----------------------
export function InvoicePreviewRoute() {
  const { invoiceId } = useParams();
  const {
    businessProfile,
    invoiceTemplate,
    getInvoiceById,
    getPaymentById,
    invoices,
  } = useAppDataContext();
  const invoice = invoiceId ? getInvoiceById(invoiceId) : undefined;
  const payment = invoice ? getPaymentById(invoice.paymentId) : undefined;
  const previousInvoice = invoice?.supersedesInvoiceId
    ? invoices.find((inv) => inv.id === invoice.supersedesInvoiceId)
    : undefined;

  return (
    <InvoicePreviewPage
      invoice={invoice}
      payment={payment}
      businessProfile={businessProfile}
      invoiceTemplate={invoiceTemplate}
      previousInvoice={previousInvoice}
    />
  );
}

//-----------------------Payment Slabs Route-----------------------

export function PaymentSlabsRoute() {
  const navigate = useNavigate();
  const { projects, customers, slabs, setSlabs } = useAppDataContext();

  return (
    <PaymentSlabs
      projects={projects}
      customers={customers}
      slabs={slabs}
      setSlabs={setSlabs}
      onBack={() => navigate("/sales")}
    />
  );
}
//------------------- MessengerRoute(WHatsapp)---------------------------
export function MessengerRoute() {
  const {
    customers,
    customerProfiles,
    slabs,
    messengerTemplates,
    sendWhatsAppBulk,
    suppliers,
    purchaseRequests,
    contractors,
    workOrderRequests,
    businessProfile,
  } = useAppDataContext();

  return (
    <Messenger
      customers={customers}
      customerProfiles={customerProfiles}
      slabs={slabs}
      slabTemplate={messengerTemplates.slabSchedule}
      overdueTemplate={messengerTemplates.overdue}
      poRequestTemplate={messengerTemplates.poRequest}
      woRequestTemplate={messengerTemplates.workOrderRequest}
      customerBroadcastTemplate={messengerTemplates.customerBroadcast}
      suppliers={suppliers}
      purchaseRequests={purchaseRequests}
      contractors={contractors}
      workOrderRequests={workOrderRequests}
      companyName={businessProfile?.companyName ?? ""}
      onWhatsAppSend={sendWhatsAppBulk}
    />
  );
}
//--------------------- project------------------------------
export function ProjectsRoute() {
  const navigate = useNavigate();
  const { projects, addProject, removeProject } = useAppDataContext();

  return (
    <ProjectsPage
      projects={projects}
      onCreate={(p) => addProject(p)}
      onDelete={(project) => removeProject(project.id)}
      onBack={() => navigate("/sales")}
    />
  );
}
//-------------inventory layout + head-nav sub-pages ---------------------
export function InventoryLayoutRoute() {
  return <InventoryLayout />;
}

export function InventoryHomeRoute() {
  return <InventoryHome />;
}

export function MaterialsRoute() {
  return <Materials />;
}

export function MaterialsAllRoute() {
  return <MaterialsAll />;
}

export function AddMaterialRoute() {
  return <AddMaterial />;
}

export function SuppliersRoute() {
  return <Suppliers />;
}

export function SuppliersAllRoute() {
  return <SuppliersAll />;
}

export function AddSupplierRoute() {
  return <AddSupplier />;
}

export function ContractorsRoute() {
  return <Contractors />;
}

export function ContractorsAllRoute() {
  return <ContractorsAll />;
}

export function AddContractorRoute() {
  return <AddContractor />;
}

export function SupplierPaymentsRoute() {
  return <SupplierPaymentsPage />;
}

export function ContractorPaymentsRoute() {
  return <ContractorPaymentsPage />;
}

export function PurchaseOrdersRoute() {
  return <PurchaseOrders />;
}

export function AddPurchaseOrderRoute() {
  return <AddPurchaseOrder />;
}

export function PurchaseOrdersAllRoute() {
  return <PurchaseOrdersAll />;
}

export function EditPurchaseOrderRoute() {
  return <EditPurchaseOrder />;
}

export function PurchaseOrderPreviewRoute() {
  const { poId } = useParams();
  const { getPurchaseOrderById, suppliers, businessProfile } = useAppDataContext();
  const order = poId ? getPurchaseOrderById(poId) : undefined;
  const supplier = order
    ? suppliers.find((s) => s.id === order.supplierId)
    : undefined;
  return (
    <PurchaseOrderPreviewPage
      source={order ? { kind: "po", order } : null}
      businessProfile={resolveBusinessProfile(businessProfile)}
      supplier={supplier}
    />
  );
}

export function PurchaseRequestPreviewRoute() {
  const { requestId } = useParams();
  const { getPurchaseRequestById, suppliers, businessProfile } = useAppDataContext();
  const request = requestId ? getPurchaseRequestById(requestId) : undefined;
  const supplier = request
    ? suppliers.find((s) => s.id === request.supplierId)
    : undefined;
  return (
    <PurchaseOrderPreviewPage
      source={request ? { kind: "request", request } : null}
      businessProfile={resolveBusinessProfile(businessProfile)}
      supplier={supplier}
    />
  );
}

export function WorkOrdersRoute() {
  return <WorkOrders />;
}

export function AddWorkOrderRequestRoute() {
  return <AddWorkOrderRequest />;
}

export function WorkOrdersAllRoute() {
  return <WorkOrdersAll />;
}

export function EditWorkOrderRoute() {
  return <EditWorkOrder />;
}

export function WorkOrderPreviewRoute() {
  const { woId } = useParams();
  const { getWorkOrderById, contractors, businessProfile } = useAppDataContext();
  const order = woId ? getWorkOrderById(woId) : undefined;
  const contractor = order
    ? contractors.find((c) => c.id === order.contractorId)
    : undefined;
  return (
    <WorkOrderPreviewPage
      source={order ? { kind: "wo", order } : null}
      businessProfile={resolveBusinessProfile(businessProfile)}
      contractor={contractor}
    />
  );
}

export function WorkOrderRequestPreviewRoute() {
  const { requestId } = useParams();
  const { getWorkOrderRequestById, contractors, businessProfile } = useAppDataContext();
  const request = requestId ? getWorkOrderRequestById(requestId) : undefined;
  const contractor = request
    ? contractors.find((c) => c.id === request.contractorId)
    : undefined;
  return (
    <WorkOrderPreviewPage
      source={request ? { kind: "request", request } : null}
      businessProfile={resolveBusinessProfile(businessProfile)}
      contractor={contractor}
    />
  );
}
//--------------ShareholderRoute(undercontruction)-----------------
export function ShareholderRoute() {
  return <Shareholder />;
}
//----------------under contruntion --------------------SETTING --------------
export function SettingsLayoutRoute() {
  return <SettingsLayout />;
}
//-------------Profile seting--------------------
export function ProfileSettingsRoute() {
  const { profileSettings, updateProfileSettings } = useAppDataContext();

  return (
    <ProfileSettings
      profile={profileSettings}
      onSave={async (patch) => {
        const userId = profileSettings.userId;
        if (userId && patch.password) {
          updateRegisteredUserProfile(userId, {
            fullName: patch.fullName,
            email: patch.email,
            password: patch.password,
          });
          //----------
        } else if (userId) {
          updateRegisteredUserProfile(userId, {
            fullName: patch.fullName,
            email: patch.email,
          });
        }
        const updated = await updateProfileSettings(patch);
        return !!updated;
      }}
    />
  );
}
//----------------BusinessProfileSettings----------------------
export function BusinessProfileSettingsRoute() {
  const { businessProfile, profileSettings, updateBusinessProfile } = useAppDataContext();
  const canEdit = canEditBusinessProfile(businessProfile, profileSettings.email);
  return (
    <BusinessProfileSettings
      profile={businessProfile}
      canEdit={canEdit}
      onSave={async (patch) => {
        const updated = await updateBusinessProfile(patch);
        return !!updated;
      }}
    />
  );
}
//-------------------InventorySettings (layout + head-nav sub-pages)
export function InventorySettingsRoute() {
  return <InventorySettings />;
}

export function InventoryMaterialsSettingsRoute() {
  return <MaterialsSettings />;
}

export function InventorySuppliersSettingsRoute() {
  return <SuppliersSettings />;
}

export function InventoryContractorsSettingsRoute() {
  return <ContractorsSettings />;
}

export function InventoryPurchaseOrdersSettingsRoute() {
  return <PurchaseOrdersSettings />;
}

export function InventoryWorkOrdersSettingsRoute() {
  return <WorkOrdersSettings />;
}
//--------------------- CustomerSettingsRoute--------------------

export function CustomerSettingsRoute() {
  return <CustomerSettings />;
}

//--------------- SalesSettingsRoute-----------------------
export function SalesSettingsRoute() {
  return <SalesSettingsHub />;
}
//------------------InvoiceTemplateSettingsRoute-------------

export function InvoiceTemplateSettingsRoute() {
  const { invoiceTemplate, businessProfile, updateInvoiceTemplate } = useAppDataContext();
  return (
    <InvoiceTemplateSettings
      template={invoiceTemplate}
      businessProfile={businessProfile}
      onSave={async (patch) => !!(await updateInvoiceTemplate(patch))}
    />
  );
}
//--------------- MessageTemplateSettingsRoute-------------------
export function MessageTemplateSettingsRoute() {
  const { messengerTemplates, updateMessengerTemplates } = useAppDataContext();
  return (
    <MessageTemplateSettings
      templates={messengerTemplates}
      onSave={async (patch) => !!(await updateMessengerTemplates(patch))}
    />
  );
}
//--------------- site filter (dashbord up side ch)
function AppLayoutWithSiteFilter() {
  const { projects, selectedSite, setSelectedSite } = useSiteFilterContext();
  return (
    <AppLayout
      projects={projects}
      selectedSite={selectedSite}
      onSiteChange={setSelectedSite}
    />
  );
}

export function AppLayoutRoute() {
  const { projects } = useAppDataContext();
  return (
    <SiteFilterProvider projects={projects}>
      <AppLayoutWithSiteFilter />
    </SiteFilterProvider>
  );
}