import { useNavigate } from "react-router";
import { ArrowLeft, Printer } from "lucide-react";
import { PurchaseOrderDocument, type PoDocumentSource } from "./PurchaseOrderDocument";
import type { BusinessProfileData } from "@/lib/settings/settingsTypes";
import type { Supplier } from "@/lib/inventory/inventoryTypes";
import { Button } from "@/components/ui/Button";

export function PurchaseOrderPreviewPage({
  source,
  businessProfile,
  supplier,
}: {
  source: PoDocumentSource | null;
  businessProfile: BusinessProfileData;
  supplier?: Supplier;
}) {
  const navigate = useNavigate();

  if (!source) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>Document not found.</p>
        <button
          type="button"
          onClick={() => navigate("/inventory/purchase-orders")}
          className="mt-4 text-sm text-blue-600 font-medium"
        >
          Back to Purchase Orders
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5 print:p-0 print:space-y-0">
      <div className="po-no-print flex items-center justify-between gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => navigate("/inventory/purchase-orders")}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#0f1a35]"
        >
          <ArrowLeft size={16} /> Back to Purchase Orders
        </button>
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={() => window.print()}
        >
          <Printer size={16} /> Print
        </Button>
      </div>

      <div id="po-print-root">
        <PurchaseOrderDocument
          source={source}
          businessProfile={businessProfile}
          supplier={supplier}
        />
      </div>
    </div>
  );
}
