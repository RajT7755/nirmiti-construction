import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function DeleteSuppliersButton({
  selectedCount,
  onDelete,
  disabled = false,
}: {
  selectedCount: number;
  onDelete: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="danger"
      className="shrink-0"
      disabled={disabled || selectedCount === 0}
      onClick={onDelete}
    >
      <Trash2 size={16} />
      Delete{selectedCount > 0 ? ` (${selectedCount})` : ""}
    </Button>
  );
}
