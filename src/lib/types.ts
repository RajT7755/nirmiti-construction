/** Shared types — aligned with construction_cms main-branch server/index.js */

export type Page =
  | "dashboard"
  | "customers"
  | "add-customer"
  | "sales"
  | "received-payment"
  | "payment-slabs"
  | "messenger"
  | "inventory"
  | "shareholder"
  | "projects"
  | "settings";

export type PropType = "residential" | "commercial" | "semi";

export interface BhkEntry {
  count: number;
  area: string;
}

export interface WingConfig {
  id: string;
  name: string;
  floors: number;
  bhk: Record<string, BhkEntry>;
  shopsPerFloor: number;
  shopArea: string;
}

export interface BuildingConfig {
  id: string;
  name: string;
  numWings: number;
  wings: WingConfig[];
}

export interface Customer {
  id: string;
  name: string;
  flat: string;
  floor: number;
  project: string;
  status: string;
  amount: number;
}

export interface Booking {
  id: string;
  customer: string;
  flat: string;
  floor: number;
  amount: number;
  date: string;
  status: string;
}

export interface Investment {
  id: string;
  investor: string;
  amount: number;
  date: string;
  type: string;
  ret: string;
}

export interface PaymentRequest {
  id: string;
  customer: string;
  flat: string;
  amount: number;
  due: string;
  status: string;
}

export interface FlatUnit {
  id: string;
  number: string;
  floor: number;
  kind: "flat" | "shop";
  bhkType?: string;
  status: "available" | "booked" | "overdue";
}

export interface ProjectData {
  id: string;
  name: string;
  propType: PropType;
  totalFlats: number;
  totalShops: number;
  buildings: BuildingConfig[];
  units: FlatUnit[];
  createdAt?: string;
}

export interface SlabEntry {
  id: string;
  slabNo: number;
  stage: string;
  percentage: number;
  dateGenerated: string;
  dueDate: string;
  status: "draft" | "sent" | "received";
}

export interface ReceivedPayment {
  id: string;
  customer: string;
  flat: string;
  category: string;
  amount: number;
  received: number;
  method: string;
  date: string;
  status: string;
}

export type InvoiceLifecycle = "active" | "superseded" | "void";

export interface Invoice {
  id: string;
  invoiceNo: string;
  customerName: string;
  customerId?: string;
  flat: string;
  amount: number;
  paymentId: string;
  date: string;
  status: "draft" | "issued" | "sent";
  lifecycle: InvoiceLifecycle;
  revision: number;
  supersedesInvoiceId?: string;
  supersededAt?: string;
}

export interface DashboardSummary {
  totalBookedFlats: number;
  totalFlats: number;
  bookedPercentage: number;
  remainingFlats: number;
  remainingInvestment: number;
  totalInvestment: number;
  overduePayments: number;
  totalSalesAmount: number;
  materialCost: number;
  costTrend: { m: string; v: number }[];
}

export interface FlatRecord {
  number: number;
  status: string;
  customer: string | null;
  type: string;
}