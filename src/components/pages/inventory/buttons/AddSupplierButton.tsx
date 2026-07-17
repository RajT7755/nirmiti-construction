import { Plus } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/Button";

export function AddSupplierButton({ className = "" }: { className?: string }) {
  const navigate = useNavigate();

  return (
    <Button
      type="button"
      variant="primary"
      className={`shrink-0 ${className}`}
      onClick={() => navigate("/inventory/suppliers/add")}
    >
      <Plus size={16} />
      Add Supplier
    </Button>
  );
}
