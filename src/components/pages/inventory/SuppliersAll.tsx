import { ArrowLeft, Truck } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/Button";
import { ExportSuppliersButton } from "./buttons/ExportSuppliersButton";
import { SupplierListTable } from "./suppliers/SupplierListTable";
import { useAppDataContext } from "@/app/AppDataContext";

/** Full suppliers catalog — View all + Export. Route: /inventory/suppliers/all */
export function SuppliersAll() {
  const navigate = useNavigate();
  const { suppliers, purchaseOrders } = useAppDataContext();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <Truck size={16} className="text-indigo-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-[#0f1a35]">All suppliers</h3>
            <p className="text-sm text-gray-500">
              Full directory — export includes supplier id for purchase orders
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/inventory/suppliers")}
          >
            <ArrowLeft size={16} />
            Back to Suppliers
          </Button>
          <ExportSuppliersButton suppliers={suppliers} label="Export" />
        </div>
      </div>

      <SupplierListTable
        title="Supplier List"
        suppliers={suppliers}
        purchaseOrders={purchaseOrders}
        emptyMessage="No suppliers in catalog."
        headerActions={<ExportSuppliersButton suppliers={suppliers} label="Export list" />}
      />
    </div>
  );
}
