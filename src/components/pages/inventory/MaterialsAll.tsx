import { Boxes } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import { ExportMaterialsButton } from "./buttons/ExportMaterialsButton";
import { MaterialListTable } from "./materials/MaterialListTable";
import { useAppDataContext } from "@/app/AppDataContext";

/**
 * Full materials catalog — View all + Export.
 * Route: /inventory/materials/all
 */
export function MaterialsAll() {
  const navigate = useNavigate();
  const { materials } = useAppDataContext();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Boxes size={16} className="text-blue-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-[#0f1a35]">All materials</h3>
            <p className="text-sm text-gray-500">
              Full catalog export includes material id for purchase-order linking
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/inventory/materials")}
          >
            <ArrowLeft size={16} />
            Back to Materials
          </Button>
          <ExportMaterialsButton materials={materials} label="Export" />
        </div>
      </div>

      <MaterialListTable
        title="Material List"
        materials={materials}
        emptyMessage="No materials in catalog."
        headerActions={<ExportMaterialsButton materials={materials} label="Export list" />}
      />
    </div>
  );
}
