import { ArrowLeft, HardHat } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/Button";
import { ExportContractorsButton } from "./buttons/ExportContractorsButton";
import { ContractorListTable } from "./contractors/ContractorListTable";
import { useAppDataContext } from "@/app/AppDataContext";
import { MOCK_WORK_ORDERS } from "@/lib/inventory/mockInventoryData";

export function ContractorsAll() {
  const navigate = useNavigate();
  const { contractors } = useAppDataContext();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
            <HardHat size={16} className="text-violet-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#0f1a35]">All contractors</h3>
            <p className="text-sm text-gray-500">Full roster with export</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={() => navigate("/inventory/contractors")}>
            <ArrowLeft size={16} />
            Back to Contractors
          </Button>
          <ExportContractorsButton contractors={contractors} />
        </div>
      </div>
      <ContractorListTable
        title="Contractor List"
        contractors={contractors}
        workOrders={MOCK_WORK_ORDERS}
      />
    </div>
  );
}
