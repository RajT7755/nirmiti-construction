import { useMemo } from "react";
import { ExportExcelButton } from "@/components/ui/ExportExcelButton";
import { materialsToExportRows } from "@/lib/inventory/exportMaterials";
import type { Material } from "@/lib/inventory/inventoryTypes";

/** Export materials catalog (includes id for PO materialId link). */
export function ExportMaterialsButton({
  materials,
  filename = "materials-catalog",
  label = "Export",
}: {
  materials: Material[];
  filename?: string;
  label?: string;
}) {
  const { headers, rows } = useMemo(() => materialsToExportRows(materials), [materials]);

  return (
    <ExportExcelButton
      filename={filename}
      headers={headers}
      rows={rows}
      label={label}
    />
  );
}
