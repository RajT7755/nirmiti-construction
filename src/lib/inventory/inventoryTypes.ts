export interface Material {
  id: string;
  name: string;
  type: string;
  workCategories: string[];
  unit: string;
  quantity: number;
  reorderLevel: number;
  unitCost: number;
  currentSupplierId?: string;
  currentSupplierName?: string;
}

export type SupplierStatus = "active" | "inactive";
export type ContractorStatus = "active" | "inactive";

export interface Supplier {
  id: string;
  name: string;
  workCategories: string[];
  phone?: string;
  email?: string;
  address?: string;
  pinCode?: string;
  /** GSTIN for payment receipts */
  gstin?: string;
  /** Total billed / agreed amount (₹) */
  paymentTotal?: number;
  /** Amount still due (₹) */
  paymentRemaining?: number;
  /** @deprecated migrate to paymentTotal/paymentRemaining */
  payment?: number;
  status: SupplierStatus;
}

export interface Contractor {
  id: string;
  name: string;
  /** Free-text work profile / trade description */
  workProfile: string;
  workCategories: string[];
  phone?: string;
  email?: string;
  address?: string;
  pinCode?: string;
  /** GSTIN for payment receipts */
  gstin?: string;
  paymentTotal?: number;
  paymentRemaining?: number;
  status: ContractorStatus;
  /** legacy */
  trade?: string;
}

export type PurchaseRequestStatus = "pending" | "approved" | "rejected";

/** Material purchase request — not payable until approved → PO */
export interface PurchaseRequest {
  id: string;
  /** Display request id e.g. REQ-000001 */
  requestNo: string;
  supplierId: string;
  supplierName: string;
  materialId?: string;
  materialName: string;
  /** Product detailed description */
  productDescription: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  /** Editable line amount (default qty × unitPrice) */
  lineTotal: number;
  gstRate: number;
  gstAmount: number;
  /** Round-up amount applied only at final total */
  roundOff: number;
  grandTotal: number;
  shipToAddress: string;
  shipVia?: string;
  fob?: string;
  shippingTerms?: string;
  orderDate: string;
  status: PurchaseRequestStatus;
  /** Set when approved into a PO */
  approvedPoId?: string;
}

export interface PurchaseOrder {
  id: string;
  /** Purchase id e.g. PO-000001 — full payable document */
  supplierId: string;
  supplierName: string;
  materialId?: string;
  materialName: string;
  unit: string;
  quantity: number;
  orderDate: string;
  status: "pending" | "received" | "partial";
  /** Payment total on this PO (rolls into supplier payable Total) */
  amountTotal?: number;
  /** Amount paid against this PO */
  amountPaid?: number;
  /** Linked request (if created via approve) */
  requestId?: string;
  requestNo?: string;
  productDescription?: string;
  unitPrice?: number;
  /** Line / sub total before GST (editable source) */
  subTotal?: number;
  gstRate?: number;
  gstAmount?: number;
  /** Round-up only on final bill (e.g. 1267.4 → 1268) */
  roundOff?: number;
  grandTotal?: number;
  shipToAddress?: string;
  shipVia?: string;
  fob?: string;
  shippingTerms?: string;
  /**
   * When false, PO is not yet in Payable (e.g. approved with grand total 0).
   * Set true after amounts are edited and grandTotal > 0.
   * Default: treat as payable if grandTotal/amountTotal > 0.
   */
  payable?: boolean;
}

/** Material line for issue (to site) or return (unused back to stock). */
export interface WorkMaterialLine {
  materialId: string;
  materialName: string;
  unit: string;
  quantity: number;
}

export type WorkOrderRequestStatus = "pending" | "generated" | "rejected";

/** Work request — no work amount; amount set after Generate WO. */
export interface WorkOrderRequest {
  id: string;
  requestNo: string;
  contractorId: string;
  contractorName: string;
  workCategories: string[];
  workProfile: string;
  description: string;
  dateOfIssue: string;
  commitmentDate: string;
  materialIssues?: WorkMaterialLine[];
  status: WorkOrderRequestStatus;
  generatedWoId?: string;
  createdAt: string;
}

export interface WorkOrder {
  id: string;
  contractorId: string;
  contractorName: string;
  title: string;
  description?: string;
  workProfile?: string;
  workCategories?: string[];
  trade?: string;
  materialIds?: string[];
  dateOfIssue?: string;
  commitmentDate?: string;
  startDate: string;
  status: "open" | "in-progress" | "completed" | "on-hold";
  /** Work amount — set after generate (not on request) */
  amountTotal?: number;
  amountPaid?: number;
  requestId?: string;
  requestNo?: string;
  materialIssues?: WorkMaterialLine[];
  materialReturns?: WorkMaterialLine[];
  /** true when amountTotal > 0 */
  payable?: boolean;
}

export interface OverdueBill {
  id: string;
  partyName: string;
  partyType: "supplier" | "contractor";
  billRef: string;
  dueAmount: number;
  dueDate: string;
}

export interface InventoryKpis {
  lowStockCount: number;
  totalMaterials: number;
  supplierCount: number;
  contractorCount: number;
  pendingBillsTotal: number;
  totalMaterialCost: number;
}
