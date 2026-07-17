import { Ban } from "lucide-react";
import { Button } from "@/components/ui/Button";

/** Edit mode only: mark selected suppliers Inactive (no Active / no hard delete). */
export function SupplierStatusButtons({
  selectedCount,
  onSetInactive,
  disabled = false,
}: {
  selectedCount: number;
  onSetInactive: () => void;
  disabled?: boolean;
}) {
  const none = disabled || selectedCount === 0;

  return (
    <Button type="button" variant="outline" className="shrink-0" disabled={none} onClick={onSetInactive}>
      <Ban size={16} />
      Inactive{selectedCount > 0 ? ` (${selectedCount})` : ""}
    </Button>
  );
}
