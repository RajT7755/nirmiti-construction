import { useMemo } from "react";
import { ExportExcelButton } from "@/components/ui/ExportExcelButton";
import { suppliersToExportRows } from "@/lib/inventory/exportSuppliers";
import type { Supplier } from "@/lib/inventory/inventoryTypes";

export function ExportSuppliersButton({
  suppliers,
  filename = "suppliers-catalog",
  label = "Export",
}: {
  suppliers: Supplier[];
  filename?: string;
  label?: string;
}) {
  const { headers, rows } = useMemo(() => suppliersToExportRows(suppliers), [suppliers]);

  return (
    <ExportExcelButton filename={filename} headers={headers} rows={rows} label={label} />
  );
}
