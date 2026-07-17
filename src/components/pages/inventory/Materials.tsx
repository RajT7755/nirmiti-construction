import { useMemo, useState } from "react";
import { Boxes } from "lucide-react";
import { AddMaterialButton } from "./buttons/AddMaterialButton";
import { BackToInventoryButton } from "./buttons/BackToInventoryButton";
import { DeleteMaterialsButton } from "./buttons/DeleteMaterialsButton";
import { ExportMaterialsButton } from "./buttons/ExportMaterialsButton";
import { ViewAllMaterialsButton } from "./buttons/ViewAllMaterialsButton";
import { MaterialListTable } from "./materials/MaterialListTable";
import { useAppDataContext } from "@/app/AppDataContext";
import { getLowMaterialsSorted } from "@/lib/inventory/materialHelpers";

export function Materials() {
  const { materials, deleteMaterials, purchaseOrders } = useAppDataContext();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const lowMaterials = useMemo(() => getLowMaterialsSorted(materials), [materials]);

  const poLinkCount = useMemo(() => {
    if (selectedIds.length === 0) return 0;
    const idSet = new Set(selectedIds);
    return purchaseOrders.filter((po) => po.materialId && idSet.has(po.materialId)).length;
  }, [selectedIds, purchaseOrders]);

  function toggle(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleAll(selectAll: boolean) {
    setSelectedIds(selectAll ? materials.map((m) => m.id) : []);
  }

  function handleDelete() {
    if (selectedIds.length === 0) return;
    const poNote =
      poLinkCount > 0
        ? `\n\n${poLinkCount} purchase order(s) reference selected material(s). Those POs will keep history (material name) but the catalog link may be orphaned.`
        : "";
    const ok = window.confirm(
      `Delete ${selectedIds.length} material(s) from the catalog?${poNote}`
    );
    if (!ok) return;
    deleteMaterials(selectedIds);
    setSelectedIds([]);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Boxes size={16} className="text-blue-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-[#0f1a35]">Materials</h3>
            <p className="text-sm text-gray-500">
              Catalog linked to purchase orders via material id
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <BackToInventoryButton />
          <ExportMaterialsButton materials={materials} />
          <DeleteMaterialsButton
            selectedCount={selectedIds.length}
            onDelete={handleDelete}
          />
          <AddMaterialButton />
        </div>
      </div>

      <MaterialListTable
        title="Material List"
        materials={materials}
        selectable
        selectedIds={selectedIds}
        onToggle={toggle}
        onToggleAll={toggleAll}
        headerActions={<ViewAllMaterialsButton />}
      />

      <MaterialListTable
        title="Low Materials"
        materials={lowMaterials}
        highlightLow
        emptyMessage="No low-stock materials."
      />
    </div>
  );
}
