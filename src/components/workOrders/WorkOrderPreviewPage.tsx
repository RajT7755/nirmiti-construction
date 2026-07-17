import { useNavigate } from "react-router";
import { ArrowLeft, Printer } from "lucide-react";
import { WorkOrderDocument, type WoDocumentSource } from "./WorkOrderDocument";
import type { BusinessProfileData } from "@/lib/settings/settingsTypes";
import type { Contractor } from "@/lib/inventory/inventoryTypes";
import { Button } from "@/components/ui/Button";

export function WorkOrderPreviewPage({
  source,
  businessProfile,
  contractor,
}: {
  source: WoDocumentSource | null;
  businessProfile: BusinessProfileData;
  contractor?: Contractor;
}) {
  const navigate = useNavigate();

  if (!source) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>Document not found.</p>
        <button
          type="button"
          onClick={() => navigate("/inventory/work-orders")}
          className="mt-4 text-sm text-blue-600 font-medium"
        >
          Back to Work Orders
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5 print:p-0 print:space-y-0">
      <div className="wo-no-print flex items-center justify-between gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => navigate("/inventory/work-orders")}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#0f1a35]"
        >
          <ArrowLeft size={16} /> Back to Work Orders
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

      <div id="wo-print-root">
        <WorkOrderDocument
          source={source}
          businessProfile={businessProfile}
          contractor={contractor}
        />
      </div>
    </div>
  );
}
