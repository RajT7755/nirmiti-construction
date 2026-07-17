import { useMemo } from "react";
import { ExportExcelButton } from "@/components/ui/ExportExcelButton";
import { contractorsToExportRows } from "@/lib/inventory/exportContractors";
import type { Contractor } from "@/lib/inventory/inventoryTypes";

export function ExportContractorsButton({
  contractors,
  filename = "contractors-catalog",
  label = "Export",
}: {
  contractors: Contractor[];
  filename?: string;
  label?: string;
}) {
  const { headers, rows } = useMemo(
    () => contractorsToExportRows(contractors),
    [contractors]
  );
  return (
    <ExportExcelButton filename={filename} headers={headers} rows={rows} label={label} />
  );
}
